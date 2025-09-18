import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useToast } from "@/hooks/use-toast";
import { ArrowLeftIcon, ShieldCheckIcon } from "lucide-react";

interface AdminProps {
  onBack: () => void;
}

export const Admin = ({ onBack }: AdminProps) => {
  const [passcode, setPasscode] = useState("");
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const { toast } = useToast();

  const handleAuth = () => {
    if (passcode === "4155") {
      setIsAuthenticated(true);
      toast({
        title: "Access granted",
        description: "Welcome to the admin panel",
      });
    } else {
      toast({
        title: "Access denied",
        description: "Invalid passcode",
        variant: "destructive",
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
    return (
      <div className="min-h-screen bg-background">
        <header className="border-b bg-card">
          <div className="max-w-6xl mx-auto px-4 py-6">
            <div className="flex items-center justify-between">
              <Button 
                variant="ghost" 
                onClick={onBack}
                className="flex items-center gap-2"
              >
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
                <Input
                  id="passcode"
                  type="password"
                  value={passcode}
                  onChange={(e) => setPasscode(e.target.value)}
                  onKeyPress={handleKeyPress}
                  placeholder="Enter admin passcode"
                  className="mt-1"
                />
              </div>
              <Button onClick={handleAuth} className="w-full">
                Access Admin Panel
              </Button>
            </CardContent>
          </Card>
        </main>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      <header className="border-b bg-card">
        <div className="max-w-6xl mx-auto px-4 py-6">
          <div className="flex items-center justify-between">
            <Button 
              variant="ghost" 
              onClick={onBack}
              className="flex items-center gap-2"
            >
              <ArrowLeftIcon className="h-4 w-4" />
              Back to Dashboard
            </Button>
            <h1 className="text-2xl font-bold text-foreground">Admin Panel</h1>
          </div>
        </div>
      </header>

      <main className="max-w-6xl mx-auto px-4 py-12">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          <Card>
            <CardHeader>
              <CardTitle>Survey Management</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-muted-foreground mb-4">
                Manage survey responses and data
              </p>
              <Button variant="outline" className="w-full">
                View All Responses
              </Button>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Data Export</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-muted-foreground mb-4">
                Export survey data for analysis
              </p>
              <Button variant="outline" className="w-full">
                Export Data
              </Button>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>System Settings</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-muted-foreground mb-4">
                Configure system settings
              </p>
              <Button variant="outline" className="w-full">
                Settings
              </Button>
            </CardContent>
          </Card>
        </div>
      </main>
    </div>
  );
};

export default Admin;