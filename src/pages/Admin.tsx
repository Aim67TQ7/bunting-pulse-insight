import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useToast } from "@/hooks/use-toast";
import { ArrowLeftIcon, ShieldCheckIcon } from "lucide-react";
import DynamicSurveyDashboard from "@/components/DynamicSurveyDashboard";
import { QuestionLevelAnalytics } from "@/components/QuestionLevelAnalytics";
import { AIAnalysisSectionWrapper } from "@/components/AIAnalysisSectionWrapper";
import buntingLogo from "@/assets/bunting-logo.png";
import magnetLogo from "@/assets/magnet-applications-logo.png";
interface AdminProps {
  onBack: () => void;
}
export const Admin = ({
  onBack
}: AdminProps) => {
  const [passcode, setPasscode] = useState("");
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const {
    toast
  } = useToast();
  const handleAuth = () => {
    if (passcode === "4155") {
      setIsAuthenticated(true);
      toast({
        title: "Access granted",
        description: "Welcome to the admin panel"
      });
    } else {
      toast({
        title: "Access denied",
        description: "Invalid passcode",
        variant: "destructive"
      });
      setPasscode("");
    }
  };
  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === "Enter") {
      handleAuth();
    }
  };
  if (!isAuthenticated) {
    return <div className="min-h-screen bg-background pb-safe">
        <header className="border-b bg-card pt-safe">
          <div className="max-w-6xl mx-auto px-4 sm:px-6 py-4 sm:py-6">
            <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
              <Button variant="ghost" onClick={onBack} className="flex items-center gap-2 -ml-2">
                <ArrowLeftIcon className="h-4 w-4" />
                <span className="hidden sm:inline">Back to Dashboard</span>
                <span className="sm:hidden">Back</span>
              </Button>
              <h1 className="text-xl sm:text-2xl font-bold text-foreground">Admin Access</h1>
            </div>
          </div>
        </header>

        <main className="max-w-md mx-auto px-4 sm:px-6 py-8 sm:py-12">
          <Card>
            <CardHeader className="text-center">
              <div className="p-3 bg-primary/10 rounded-full w-fit mx-auto mb-4">
                <ShieldCheckIcon className="h-8 w-8 text-primary" />
              </div>
              <CardTitle>Admin Authentication</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <Label htmlFor="passcode">Enter Passcode</Label>
                <Input 
                  id="passcode" 
                  type="password" 
                  inputMode="numeric"
                  value={passcode} 
                  onChange={e => setPasscode(e.target.value)} 
                  onKeyPress={handleKeyPress} 
                  placeholder="Enter admin passcode" 
                  className="mt-1 text-base"
                />
              </div>
              <Button onClick={handleAuth} className="w-full">
                Access Admin Panel
              </Button>
            </CardContent>
          </Card>
        </main>
      </div>;
  }
  return <div className="min-h-screen bg-background pb-safe">
      <header className="border-b bg-card pt-safe sticky top-0 z-10">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 py-3 sm:py-6">
          <div className="flex flex-col gap-3 sm:gap-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2 sm:gap-4">
                <img src={buntingLogo} alt="Bunting" className="h-8 sm:h-10" />
                <img src={magnetLogo} alt="Magnet Applications" className="h-8 sm:h-10" />
              </div>
              <h1 className="text-lg sm:text-2xl font-bold text-foreground hidden sm:block">Admin Panel</h1>
              <h1 className="text-lg font-bold text-foreground sm:hidden">Admin</h1>
            </div>
            <div className="flex items-center gap-2 overflow-x-auto pb-1 sm:pb-0 -mx-4 px-4 sm:mx-0 sm:px-0">
              <Button variant="outline" size="sm" onClick={async () => {
              const {
                jsPDF
              } = await import('jspdf');
              const QRCode = (await import('qrcode')).default;
              const doc = new jsPDF();
              const surveyUrl = 'https://survey.buntinggpt.com';

              // Add title
              doc.setFontSize(20);
              doc.setFont('helvetica', 'bold');
              doc.text('Bunting Magnetics', 105, 30, {
                align: 'center'
              });
              doc.text('Employee Survey', 105, 40, {
                align: 'center'
              });

              // Generate QR code
              const qrDataUrl = await QRCode.toDataURL(surveyUrl, {
                width: 200,
                margin: 2
              });

              // Add QR code to PDF (centered)
              doc.addImage(qrDataUrl, 'PNG', 55, 60, 100, 100);

              // Add instruction text
              doc.setFontSize(12);
              doc.setFont('helvetica', 'normal');
              doc.text('Scan to access the employee survey', 105, 175, {
                align: 'center'
              });

              // Save PDF
              doc.save('bunting-survey-qr.pdf');
            }} className="flex items-center gap-1.5 whitespace-nowrap text-sm">
                <span className="hidden sm:inline">Download QR Code</span>
                <span className="sm:hidden">QR Code</span>
              </Button>
              <Button variant="ghost" size="sm" onClick={onBack} className="flex items-center gap-1.5 whitespace-nowrap text-sm">
                <ArrowLeftIcon className="h-4 w-4" />
                <span className="hidden sm:inline">Back to Survey</span>
                <span className="sm:hidden">Back</span>
              </Button>
            </div>
          </div>
        </div>
      </header>

      <main className="max-w-7xl mx-auto px-4 sm:px-6 py-4 sm:py-8">
        <Tabs defaultValue="dashboard" className="space-y-4 sm:space-y-6">
          <TabsList className="grid w-full grid-cols-3 h-auto">
            <TabsTrigger value="dashboard" className="text-xs sm:text-sm py-2 sm:py-2.5">
              <span className="hidden sm:inline">Dashboard</span>
              <span className="sm:hidden">Data</span>
            </TabsTrigger>
            <TabsTrigger value="question-level" className="text-xs sm:text-sm py-2 sm:py-2.5">
              <span className="hidden sm:inline">Question-Level Analytics</span>
              <span className="sm:hidden">Questions</span>
            </TabsTrigger>
            <TabsTrigger value="ai-analysis" className="text-xs sm:text-sm py-2 sm:py-2.5">
              <span className="hidden sm:inline">AI Analysis</span>
              <span className="sm:hidden">AI</span>
            </TabsTrigger>
          </TabsList>

          <TabsContent value="dashboard" className="space-y-6">
            <DynamicSurveyDashboard onBack={onBack} />
          </TabsContent>

          <TabsContent value="question-level" className="space-y-6">
            <QuestionLevelAnalytics onBack={onBack} />
          </TabsContent>

          <TabsContent value="ai-analysis" className="space-y-6">
            <AIAnalysisSectionWrapper />
          </TabsContent>
        </Tabs>
      </main>
    </div>;
};
export default Admin;