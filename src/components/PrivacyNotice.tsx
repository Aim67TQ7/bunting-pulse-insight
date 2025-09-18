import { useState, useEffect } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { ShieldCheckIcon, CookieIcon } from "lucide-react";

export function PrivacyNotice() {
  const [showNotice, setShowNotice] = useState(false);

  useEffect(() => {
    const hasSeenNotice = localStorage.getItem("bunting-privacy-notice-seen");
    if (!hasSeenNotice) {
      setShowNotice(true);
    }
  }, []);

  const handleAccept = () => {
    localStorage.setItem("bunting-privacy-notice-seen", "true");
    setShowNotice(false);
  };

  return (
    <Dialog open={showNotice} onOpenChange={() => {}}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <ShieldCheckIcon className="h-5 w-5 text-primary" />
            Privacy Notice
          </DialogTitle>
        </DialogHeader>
        <div className="space-y-4">
          <div className="flex items-start gap-3">
            <CookieIcon className="h-5 w-5 text-warning flex-shrink-0 mt-0.5" />
            <div className="space-y-2">
              <p className="text-sm font-medium">Anonymous Survey</p>
            <p className="text-xs text-muted-foreground">
              We use cookies only to track visit count and prevent multiple submissions (one per employee).
            </p>
            </div>
          </div>
          
          <div className="bg-accent/20 border border-accent/30 rounded-lg p-3">
            <p className="text-xs text-foreground">
              <strong>Your privacy is protected:</strong>
            </p>
            <ul className="text-xs text-muted-foreground mt-1 space-y-1">
              <li>• No personal information is collected</li>
              <li>• No IP addresses are collected</li>
              <li>• All responses are completely anonymous</li>
              <li>• Cookies are used only for submission tracking</li>
            </ul>
          </div>
          
          <Button onClick={handleAccept} className="w-full">
            I Understand - Continue to Survey
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}