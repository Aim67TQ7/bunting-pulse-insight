import { useState } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { ShieldIcon, DownloadIcon, TrashIcon, SearchIcon, AlertTriangleIcon } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";

interface DataRightsManagerProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export function DataRightsManager({ open, onOpenChange }: DataRightsManagerProps) {
  const [sessionId, setSessionId] = useState("");
  const [loading, setLoading] = useState(false);
  const [data, setData] = useState<any>(null);
  const { toast } = useToast();

  const handleLookup = async () => {
    if (!sessionId.trim()) {
      toast({
        title: "Session ID Required",
        description: "Please enter your session ID",
        variant: "destructive",
      });
      return;
    }

    setLoading(true);
    try {
      const { data: response, error } = await supabase
        .from("employee_survey_responses")
        .select("*")
        .eq("session_id", sessionId)
        .is("deleted_at", null)
        .maybeSingle();

      if (error) throw error;

      if (!response) {
        toast({
          title: "Not Found",
          description: "No survey response found with this session ID",
          variant: "destructive",
        });
        setData(null);
        return;
      }

      setData(response);
      toast({
        title: "Data Found",
        description: "Your survey response has been located",
      });
    } catch (error) {
      console.error("Lookup error:", error);
      toast({
        title: "Error",
        description: "Failed to retrieve data",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const handleDownload = () => {
    if (!data) return;

    // Create sanitized copy for download (remove internal fields)
    const exportData = {
      session_id: data.session_id,
      submitted_at: data.submitted_at,
      continent: data.continent,
      division: data.division,
      role: data.role,
      survey_responses: {
        job_satisfaction: data.job_satisfaction,
        recommend_company: data.recommend_company,
        strategic_confidence: data.strategic_confidence,
        leadership_openness: data.leadership_openness,
        performance_awareness: data.performance_awareness,
        communication_clarity: data.communication_clarity,
        manager_alignment: data.manager_alignment,
        training_satisfaction: data.training_satisfaction,
        advancement_opportunities: data.advancement_opportunities,
        cross_functional_collaboration: data.cross_functional_collaboration,
        team_morale: data.team_morale,
        pride_in_work: data.pride_in_work,
        workplace_safety: data.workplace_safety,
        safety_reporting_comfort: data.safety_reporting_comfort,
        workload_manageability: data.workload_manageability,
        work_life_balance: data.work_life_balance,
        tools_equipment_quality: data.tools_equipment_quality,
        manual_processes_focus: data.manual_processes_focus,
        company_value_alignment: data.company_value_alignment,
        comfortable_suggesting_improvements: data.comfortable_suggesting_improvements,
      },
      preferences: {
        communication_preferences: data.communication_preferences,
        information_preferences: data.information_preferences,
        motivation_factors: data.motivation_factors,
      },
      feedback: {
        collaboration_feedback: data.collaboration_feedback,
        additional_comments: data.additional_comments,
        follow_up_responses: data.follow_up_responses,
      },
      metadata: {
        completion_time_seconds: data.completion_time_seconds,
        consent_given: data.consent_given,
        consent_timestamp: data.consent_timestamp,
        data_retention_date: data.data_retention_date,
      }
    };

    const blob = new Blob([JSON.stringify(exportData, null, 2)], { type: "application/json" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `survey-data-${sessionId}.json`;
    a.click();
    URL.revokeObjectURL(url);

    toast({
      title: "Downloaded",
      description: "Your survey data has been downloaded",
    });
  };

  const handleDelete = async () => {
    if (!data) return;

    const confirmed = window.confirm(
      "Are you sure you want to delete your survey response? This action cannot be undone."
    );

    if (!confirmed) return;

    setLoading(true);
    try {
      // Soft delete
      const { error } = await supabase
        .from("employee_survey_responses")
        .update({ deleted_at: new Date().toISOString() })
        .eq("session_id", sessionId);

      if (error) throw error;

      toast({
        title: "Data Deleted",
        description: "Your survey response has been permanently deleted",
      });

      setData(null);
      setSessionId("");
    } catch (error) {
      console.error("Delete error:", error);
      toast({
        title: "Error",
        description: "Failed to delete data",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-xl">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <ShieldIcon className="h-5 w-5 text-primary" />
            Manage Your Data (GDPR Rights)
          </DialogTitle>
          <DialogDescription>
            Access, download, or delete your survey response
          </DialogDescription>
        </DialogHeader>

        <Tabs defaultValue="access" className="w-full">
          <TabsList className="grid w-full grid-cols-2">
            <TabsTrigger value="access">Access Data</TabsTrigger>
            <TabsTrigger value="delete">Delete Data</TabsTrigger>
          </TabsList>

          <TabsContent value="access" className="space-y-4">
            <Alert>
              <SearchIcon className="h-4 w-4" />
              <AlertDescription className="text-sm">
                Enter your Session ID to access and download your survey data. 
                Your Session ID was provided after submitting the survey.
              </AlertDescription>
            </Alert>

            <div className="space-y-3">
              <div>
                <Label htmlFor="sessionId">Session ID</Label>
                <Input
                  id="sessionId"
                  placeholder="Enter your session ID"
                  value={sessionId}
                  onChange={(e) => setSessionId(e.target.value)}
                  className="mt-1"
                />
              </div>

              <Button onClick={handleLookup} disabled={loading} className="w-full">
                <SearchIcon className="h-4 w-4 mr-2" />
                {loading ? "Searching..." : "Find My Data"}
              </Button>
            </div>

            {data && (
              <div className="space-y-3 border rounded-lg p-4 bg-muted/30">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium">Survey Response Found</p>
                    <p className="text-xs text-muted-foreground">
                      Submitted: {new Date(data.submitted_at).toLocaleDateString()}
                    </p>
                    <p className="text-xs text-muted-foreground">
                      Will be deleted: {new Date(data.data_retention_date).toLocaleDateString()}
                    </p>
                  </div>
                </div>

                <Button onClick={handleDownload} variant="outline" className="w-full">
                  <DownloadIcon className="h-4 w-4 mr-2" />
                  Download My Data (JSON)
                </Button>
              </div>
            )}
          </TabsContent>

          <TabsContent value="delete" className="space-y-4">
            <Alert variant="destructive">
              <AlertTriangleIcon className="h-4 w-4" />
              <AlertDescription className="text-sm">
                <strong>Warning:</strong> Deleting your data is permanent and cannot be undone. 
                You have the right to request erasure under GDPR Article 17.
              </AlertDescription>
            </Alert>

            <div className="space-y-3">
              <div>
                <Label htmlFor="sessionIdDelete">Session ID</Label>
                <Input
                  id="sessionIdDelete"
                  placeholder="Enter your session ID"
                  value={sessionId}
                  onChange={(e) => setSessionId(e.target.value)}
                  className="mt-1"
                />
              </div>

              {!data && (
                <Button onClick={handleLookup} disabled={loading} className="w-full" variant="outline">
                  <SearchIcon className="h-4 w-4 mr-2" />
                  {loading ? "Searching..." : "Find My Data"}
                </Button>
              )}

              {data && (
                <Button 
                  onClick={handleDelete} 
                  disabled={loading} 
                  variant="destructive" 
                  className="w-full"
                >
                  <TrashIcon className="h-4 w-4 mr-2" />
                  {loading ? "Deleting..." : "Delete My Data Permanently"}
                </Button>
              )}
            </div>
          </TabsContent>
        </Tabs>

        <div className="text-xs text-muted-foreground">
          <p>
            These tools help you exercise your GDPR rights (Articles 15, 17, 20). 
            For assistance, contact the Data Protection Officer.
          </p>
        </div>
      </DialogContent>
    </Dialog>
  );
}
