import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { CookieIcon, XIcon } from "lucide-react";
import { cn } from "@/lib/utils";

export function CookieConsentBanner() {
  const [showBanner, setShowBanner] = useState(false);
  const [isVisible, setIsVisible] = useState(false);

  useEffect(() => {
    // Check if user has already made a choice
    const cookieConsent = localStorage.getItem("cookie-consent");
    if (!cookieConsent) {
      setShowBanner(true);
      // Animate in after mount
      setTimeout(() => setIsVisible(true), 100);
    }
  }, []);

  const handleAccept = () => {
    localStorage.setItem("cookie-consent", "accepted");
    setIsVisible(false);
    setTimeout(() => setShowBanner(false), 300);
  };

  const handleReject = () => {
    localStorage.setItem("cookie-consent", "rejected");
    setIsVisible(false);
    setTimeout(() => setShowBanner(false), 300);
  };

  if (!showBanner) return null;

  return (
    <div
      className={cn(
        "fixed bottom-0 left-0 right-0 z-50 p-4 bg-background border-t border-border shadow-lg transition-transform duration-300",
        isVisible ? "translate-y-0" : "translate-y-full"
      )}
    >
      <div className="container mx-auto max-w-6xl">
        <div className="flex flex-col sm:flex-row items-start sm:items-center gap-4">
          <div className="flex items-start gap-3 flex-1">
            <CookieIcon className="h-5 w-5 text-primary flex-shrink-0 mt-1" />
            <div className="space-y-1">
              <p className="text-sm font-medium">Cookie Notice</p>
              <p className="text-xs text-muted-foreground">
                This survey uses local storage to track your session and prevent duplicate submissions. 
                No third-party cookies or tracking. <a href="#privacy" className="underline">Learn more</a>
              </p>
            </div>
          </div>
          
          <div className="flex gap-2 w-full sm:w-auto">
            <Button
              onClick={handleReject}
              variant="outline"
              size="sm"
              className="flex-1 sm:flex-initial"
            >
              Decline
            </Button>
            <Button
              onClick={handleAccept}
              size="sm"
              className="flex-1 sm:flex-initial"
            >
              Accept
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
}
