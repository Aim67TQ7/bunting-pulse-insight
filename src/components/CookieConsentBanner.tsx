import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { CookieIcon } from "lucide-react";
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
    <>
      {/* Backdrop overlay - blocks all interaction */}
      <div
        className={cn(
          "fixed inset-0 bg-background/80 backdrop-blur-sm z-50 transition-opacity duration-300",
          isVisible ? "opacity-100" : "opacity-0"
        )}
      />
      
      {/* Modal dialog */}
      <div
        className={cn(
          "fixed left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 z-50 w-full max-w-lg transition-all duration-300",
          isVisible ? "opacity-100 scale-100" : "opacity-0 scale-95"
        )}
      >
        <div className="mx-4 rounded-lg border-2 border-primary bg-card p-6 shadow-2xl">
          <div className="flex items-start gap-4 mb-6">
            <div className="p-3 bg-primary/10 rounded-full">
              <CookieIcon className="h-8 w-8 text-primary" />
            </div>
            <div className="flex-1">
              <h2 className="text-xl font-bold text-foreground mb-2">Cookie Consent Required</h2>
              <p className="text-sm text-muted-foreground">
                Before proceeding, please review our cookie policy.
              </p>
            </div>
          </div>
          
          <div className="bg-muted/50 rounded-md p-4 mb-6">
            <p className="text-sm text-foreground leading-relaxed">
              This survey uses local storage to track your session and prevent duplicate submissions. 
              We do not use third-party cookies or tracking technologies. Your responses remain completely anonymous.
            </p>
          </div>
          
          <div className="flex flex-col sm:flex-row gap-3">
            <Button
              onClick={handleReject}
              variant="outline"
              size="lg"
              className="flex-1"
            >
              Decline
            </Button>
            <Button
              onClick={handleAccept}
              size="lg"
              className="flex-1"
            >
              Accept & Continue
            </Button>
          </div>
          
          <p className="text-xs text-muted-foreground text-center mt-4">
            You must accept or decline to proceed with the survey
          </p>
        </div>
      </div>
    </>
  );
}
