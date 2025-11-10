import { useState, useEffect } from "react";
import { EmployeeSurvey } from "@/components/EmployeeSurvey";
import { SurveyDashboardNew } from "@/components/SurveyDashboardNew";
import Admin from "./Admin";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { ClipboardListIcon, BarChart3Icon, ShieldCheckIcon, UsersIcon, LockIcon } from "lucide-react";
import { useToast } from "@/hooks/use-toast";

const Index = () => {
  const [currentView, setCurrentView] = useState<"landing" | "survey" | "dashboard" | "admin">("landing");
  const [hasSubmitted, setHasSubmitted] = useState(false);
  const { toast } = useToast();

  useEffect(() => {
    const submissionCount = parseInt(localStorage.getItem("survey-submissions") || "0");
    setHasSubmitted(submissionCount > 0);
  }, [currentView]); // Re-check when returning to landing

  const resetSurveyData = () => {
    localStorage.removeItem("survey-submissions");
    localStorage.removeItem("survey-data");
    setHasSubmitted(false);
    toast({
      title: "Survey data reset",
      description: "You can now take the survey again.",
    });
  };

  if (currentView === "survey") {
    return <EmployeeSurvey onViewResults={() => setCurrentView("landing")} />;
  }

  if (currentView === "admin") {
    return <Admin onBack={() => setCurrentView("landing")} />;
  }

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <header className="border-b bg-card">
        <div className="max-w-6xl mx-auto px-4 py-6">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-2xl font-bold text-foreground">Bunting Employee Survey</h1>
              <p className="text-muted-foreground">Anonymous feedback platform</p>
            </div>
            <div className="flex items-center gap-4">
              <Button 
                variant="outline" 
                size="sm"
                onClick={() => setCurrentView("admin")}
                className="text-xs"
              >
                🔑 Admin Access
              </Button>
              <Badge variant="outline" className="text-sm">
                Confidential
              </Badge>
            </div>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="max-w-6xl mx-auto px-4 py-12">
        <div className="text-center mb-12">
          <h2 className="text-3xl font-bold mb-4">Your Voice Matters</h2>
          <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
            We value your input. This is a completely anonymous survey. Please answer all questions honestly and thoroughly. Your responses help Bunting evaluate our strengths and weaknesses and continue to strive for excellence.
          </p>
        </div>

        {/* Action Cards */}
        <div className="grid grid-cols-1 gap-8 mb-12 max-w-2xl mx-auto">
          <Card className="relative overflow-hidden group hover:shadow-lg transition-all duration-300">
            <CardHeader className="pb-4">
              <div className="flex items-center gap-3">
                <div className="p-2 bg-primary/10 rounded-lg">
                  <ClipboardListIcon className="h-6 w-6 text-primary" />
                </div>
                <CardTitle>Take Survey</CardTitle>
              </div>
            </CardHeader>
            <CardContent className="space-y-4">
              <p className="text-muted-foreground">
                Share your experience and help shape the future of our workplace. 
                Your responses are completely anonymous and secure.
              </p>
              <div className="flex flex-wrap gap-2">
                <Badge variant="secondary">~5 min</Badge>
                <Badge variant="secondary">Anonymous</Badge>
                <Badge variant="secondary">13 questions</Badge>
              </div>
              <div className="flex gap-2">
                <Button 
                  onClick={() => !hasSubmitted && setCurrentView("survey")}
                  disabled={hasSubmitted}
                  className={`flex-1 ${hasSubmitted ? 'cursor-not-allowed' : 'group-hover:scale-[1.02] transition-transform'}`}
                  variant={hasSubmitted ? "outline" : "default"}
                >
                  {hasSubmitted ? '✓ Survey Completed' : 'Start Survey'}
                </Button>
                <Button 
                  variant="destructive" 
                  size="default"
                  onClick={resetSurveyData}
                  className="px-4 font-medium border-2"
                >
                  🔄 Admin Reset
                </Button>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Features */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-12">
          <div className="text-center">
            <div className="p-3 bg-primary/10 rounded-full w-fit mx-auto mb-4">
              <ShieldCheckIcon className="h-8 w-8 text-primary" />
            </div>
            <h3 className="font-semibold mb-2">Anonymous & Secure</h3>
            <p className="text-sm text-muted-foreground">
              Your responses are completely anonymous and no information is collected. We cannot trace or identify individual responses.
            </p>
          </div>
          
          <div className="text-center">
            <div className="p-3 bg-success/10 rounded-full w-fit mx-auto mb-4">
              <UsersIcon className="h-8 w-8 text-success" />
            </div>
            <h3 className="font-semibold mb-2">For Everyone</h3>
            <p className="text-sm text-muted-foreground">
              Designed for all Bunting employees across different divisions, roles, and locations.
            </p>
          </div>
          
          <div className="text-center">
            <div className="p-3 bg-warning/10 rounded-full w-fit mx-auto mb-4">
              <BarChart3Icon className="h-8 w-8 text-warning" />
            </div>
            <h3 className="font-semibold mb-2">Actionable Insights</h3>
            <p className="text-sm text-muted-foreground">
              Your feedback drives real changes. Results are analyzed to improve workplace satisfaction.
            </p>
          </div>
        </div>

        {/* Info Box */}
        <Card className="bg-muted/50 border-dashed">
          <CardContent className="p-6 text-center">
            <h3 className="font-semibold mb-2">Survey Guidelines</h3>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-sm text-muted-foreground">
              <div>✓ One submission per employee</div>
              <div>✓ Follow-up questions for concerning responses</div>
              <div>✓ Results available to admin only</div>
            </div>
          </CardContent>
        </Card>
      </main>
    </div>
  );
};

export default Index;