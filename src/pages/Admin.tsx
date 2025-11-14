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
import { CommentsSection } from "@/components/CommentsSection";
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
    return <div className="min-h-screen bg-background">
        <header className="border-b bg-card">
          <div className="max-w-6xl mx-auto px-4 py-6">
            <div className="flex items-center justify-between">
              <Button variant="ghost" onClick={onBack} className="flex items-center gap-2">
                <ArrowLeftIcon className="h-4 w-4" />
                Back to Dashboard
              </Button>
              <h1 className="text-2xl font-bold text-foreground">Admin Access</h1>
            </div>
          </div>
        </header>

        <main className="max-w-md mx-auto px-4 py-12">
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
                <Input id="passcode" type="password" value={passcode} onChange={e => setPasscode(e.target.value)} onKeyPress={handleKeyPress} placeholder="Enter admin passcode" className="mt-1" />
              </div>
              <Button onClick={handleAuth} className="w-full">
                Access Admin Panel
              </Button>
            </CardContent>
          </Card>
        </main>
      </div>;
  }
  return <div className="min-h-screen bg-background">
      <header className="border-b bg-card">
        <div className="max-w-7xl mx-auto px-4 py-6">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <img src={buntingLogo} alt="Bunting" className="h-10" />
              <img src={magnetLogo} alt="Magnet Applications" className="h-10" />
            </div>
            <h1 className="text-2xl font-bold text-foreground">Admin Panel</h1>
            <div className="flex items-center gap-2">
              <Button variant="outline" onClick={async () => {
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
            }} className="flex items-center gap-2">
                Download QR Code
              </Button>
              <Button variant="ghost" onClick={onBack} className="flex items-center gap-2">
                <ArrowLeftIcon className="h-4 w-4" />
                Back to Survey
              </Button>
            </div>
          </div>
        </div>
      </header>

      <main className="max-w-7xl mx-auto px-4 py-8">
        <Tabs defaultValue="dashboard" className="space-y-6">
          <TabsList className="grid w-full grid-cols-4">
            <TabsTrigger value="dashboard">Dashboard</TabsTrigger>
            <TabsTrigger value="question-level">Question-Level Analytics</TabsTrigger>
            <TabsTrigger value="ai-analysis">AI Analysis</TabsTrigger>
            <TabsTrigger value="comments">All Comments</TabsTrigger>
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

          <TabsContent value="comments" className="space-y-6">
            <CommentsSection configurationId="default" />
          </TabsContent>
        </Tabs>
      </main>
    </div>;
};
export default Admin;