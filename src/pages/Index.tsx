import { useState, useEffect } from "react";
import { EmployeeSurvey } from "@/components/EmployeeSurvey";
import { SurveyDashboardNew } from "@/components/SurveyDashboardNew";
import Admin from "./Admin";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { ClipboardListIcon, BarChart3Icon, ShieldCheckIcon, UsersIcon, LockIcon, ShieldIcon } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { useSurveyQuestions } from "@/hooks/useSurveyQuestions";
import { GDPRPrivacyPolicy } from "@/components/GDPRPrivacyPolicy";
import { DataRightsManager } from "@/components/DataRightsManager";
import { CookieConsentBanner } from "@/components/CookieConsentBanner";
import { SurveyTimer, type SurveyStatus } from "@/components/SurveyTimer";
const Index = () => {
  const [currentView, setCurrentView] = useState<"landing" | "survey" | "dashboard" | "admin">("landing");
  const [hasSubmitted, setHasSubmitted] = useState(false);
  const [showPrivacyPolicy, setShowPrivacyPolicy] = useState(false);
  const [showDataRights, setShowDataRights] = useState(false);
  const [surveyStatus, setSurveyStatus] = useState<SurveyStatus>("before-open");
  const {
    toast
  } = useToast();
  const {
    data: allQuestions
  } = useSurveyQuestions();

  // Debug: Log state changes
  console.log('Dialog states:', {
    showPrivacyPolicy,
    showDataRights
  });
  const totalQuestions = allQuestions?.length || 0;
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
      description: "You can now take the survey again."
    });
  };
  if (currentView === "survey") {
    return <EmployeeSurvey onViewResults={() => setCurrentView("landing")} />;
  }
  if (currentView === "admin") {
    return <Admin onBack={() => setCurrentView("landing")} />;
  }
  return <div className="min-h-screen bg-background">
      {/* Cookie Consent Banner */}
      <CookieConsentBanner />
      
      {/* Header */}
      <header className="border-b bg-card">
        <div className="max-w-6xl mx-auto px-4 py-6">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-2xl font-bold text-foreground">Bunting Employee Survey</h1>
              
            </div>
            <div className="flex items-center gap-4">
              <Button variant="outline" size="sm" onClick={() => setCurrentView("admin")} className="text-xs">
                🔑 Admin Access
              </Button>
              
            </div>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="max-w-6xl mx-auto px-4 py-12">
        <div className="grid grid-cols-1 lg:grid-cols-[350px_1fr] gap-8">
          {/* Timer Section - Left Side */}
          <div className="order-2 lg:order-1">
            <SurveyTimer onStatusChange={setSurveyStatus} />
          </div>

          {/* Survey Content - Right Side */}
          <div className="order-1 lg:order-2 space-y-8">
            {/* Action Cards */}
            <div className="max-w-2xl mx-auto lg:mx-0">
          <Card className="relative overflow-hidden group hover:shadow-lg transition-all duration-300">
            <CardHeader className="pb-4">
              <div className="flex items-center gap-3">
                <div className="p-2 bg-primary/10 rounded-lg">
                  <ClipboardListIcon className="h-6 w-6 text-primary" />
                </div>
                <CardTitle>Your Voice Matters</CardTitle>
              </div>
            </CardHeader>
            <CardContent className="space-y-4">
              <p className="text-muted-foreground">
                We value your input. This is a completely anonymous survey. Please answer all questions honestly and thoroughly. Your responses help Bunting evaluate our strengths and weaknesses and continue to strive for excellence.
              </p>
              <div className="flex flex-wrap gap-2">
                <Badge variant="secondary">~5 min</Badge>
                <Badge variant="secondary">Anonymous</Badge>
                <Badge variant="secondary">{totalQuestions} questions</Badge>
              </div>
              <div className="flex gap-2">
                <Button 
                  onClick={() => setCurrentView("survey")} 
                  disabled={hasSubmitted || surveyStatus !== "open"} 
                  className={`flex-1 ${hasSubmitted || surveyStatus !== "open" ? 'cursor-not-allowed' : 'group-hover:scale-[1.02] transition-transform'}`} 
                  variant={hasSubmitted || surveyStatus !== "open" ? "outline" : "default"}
                >
                  {hasSubmitted ? '✓ Survey Completed' : surveyStatus === "before-open" ? 'Survey Opens Nov 16' : surveyStatus === "closed" ? 'Survey Closed' : 'Start Survey'}
                </Button>
                <Button variant="destructive" size="default" onClick={resetSurveyData} className="px-4 font-medium border-2">
                  🔄 Admin Reset
                </Button>
              </div>
            </CardContent>
          </Card>
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

            {/* GDPR Links */}
            <div className="flex gap-3 justify-center mt-8">
          <Button variant="outline" size="sm" onClick={() => {
          console.log('Privacy Policy button clicked');
          setShowPrivacyPolicy(true);
        }}>
            <ShieldIcon className="h-4 w-4 mr-2" />
            Privacy Policy
          </Button>
          <Button variant="outline" size="sm" onClick={() => {
          console.log('Manage My Data button clicked');
          setShowDataRights(true);
        }}>
            <ShieldIcon className="h-4 w-4 mr-2" />
            Manage My Data
          </Button>
            </div>
          </div>
        </div>
      </main>

      {/* GDPR Dialogs */}
      <GDPRPrivacyPolicy open={showPrivacyPolicy} onOpenChange={setShowPrivacyPolicy} />
      <DataRightsManager open={showDataRights} onOpenChange={setShowDataRights} />
    </div>;
};
export default Index;