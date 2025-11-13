import { useState } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import { Label } from "@/components/ui/label";
import { ShieldCheckIcon, InfoIcon, FileTextIcon } from "lucide-react";
import { Alert, AlertDescription } from "@/components/ui/alert";

interface SurveyConsentDialogProps {
  open: boolean;
  onConsent: () => void;
  onDecline: () => void;
  onViewPrivacyPolicy: () => void;
}

export function SurveyConsentDialog({ 
  open, 
  onConsent, 
  onDecline,
  onViewPrivacyPolicy 
}: SurveyConsentDialogProps) {
  const [consentGiven, setConsentGiven] = useState(false);
  const [acknowledgedVoluntary, setAcknowledgedVoluntary] = useState(false);
  const [acknowledgedAnonymous, setAcknowledgedAnonymous] = useState(false);

  const canProceed = consentGiven && acknowledgedVoluntary && acknowledgedAnonymous;

  return (
    <Dialog open={open} onOpenChange={() => {}}>
      <DialogContent className="sm:max-w-lg" onPointerDownOutside={(e) => e.preventDefault()}>
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2 text-xl">
            <ShieldCheckIcon className="h-6 w-6 text-primary" />
            Survey Participation Consent
          </DialogTitle>
          <DialogDescription>
            Please read and confirm before proceeding
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4">
          <Alert>
            <InfoIcon className="h-4 w-4" />
            <AlertDescription className="text-sm">
              This survey is <strong>completely voluntary and anonymous</strong>. 
              Your participation helps us improve our workplace.
            </AlertDescription>
          </Alert>

          <div className="space-y-4 border rounded-lg p-4 bg-muted/30">
            <div className="space-y-3">
              {/* Main Consent */}
              <div className="flex items-start space-x-3">
                <Checkbox 
                  id="consent" 
                  checked={consentGiven}
                  onCheckedChange={(checked) => setConsentGiven(checked as boolean)}
                  className="mt-1"
                />
                <div className="space-y-1">
                  <Label 
                    htmlFor="consent" 
                    className="text-sm font-medium leading-none cursor-pointer"
                  >
                    I consent to participate in this survey
                  </Label>
                  <p className="text-xs text-muted-foreground">
                    I understand my responses will be collected and processed as described in the privacy policy
                  </p>
                </div>
              </div>

              {/* Voluntary Acknowledgment */}
              <div className="flex items-start space-x-3">
                <Checkbox 
                  id="voluntary" 
                  checked={acknowledgedVoluntary}
                  onCheckedChange={(checked) => setAcknowledgedVoluntary(checked as boolean)}
                  className="mt-1"
                />
                <div className="space-y-1">
                  <Label 
                    htmlFor="voluntary" 
                    className="text-sm font-medium leading-none cursor-pointer"
                  >
                    I understand participation is voluntary
                  </Label>
                  <p className="text-xs text-muted-foreground">
                    I can withdraw my consent at any time without consequences
                  </p>
                </div>
              </div>

              {/* Anonymous Acknowledgment */}
              <div className="flex items-start space-x-3">
                <Checkbox 
                  id="anonymous" 
                  checked={acknowledgedAnonymous}
                  onCheckedChange={(checked) => setAcknowledgedAnonymous(checked as boolean)}
                  className="mt-1"
                />
                <div className="space-y-1">
                  <Label 
                    htmlFor="anonymous" 
                    className="text-sm font-medium leading-none cursor-pointer"
                  >
                    I understand this survey is anonymous
                  </Label>
                  <p className="text-xs text-muted-foreground">
                    No names, emails, or personally identifiable information will be collected
                  </p>
                </div>
              </div>
            </div>
          </div>

          <div className="bg-accent/20 border border-accent/30 rounded-lg p-3">
            <p className="text-xs text-muted-foreground">
              <strong>Your Rights (GDPR):</strong> You have the right to access, download, or delete your responses at any time.
              After submission, you'll receive a Session ID to manage your data.
            </p>
          </div>

          <div className="flex flex-col gap-2">
            <Button
              onClick={onConsent}
              disabled={!canProceed}
              className="w-full"
              size="lg"
            >
              I Consent - Start Survey
            </Button>
            
            <div className="flex gap-2">
              <Button
                onClick={onViewPrivacyPolicy}
                variant="outline"
                size="sm"
                className="flex-1"
              >
                <FileTextIcon className="h-4 w-4 mr-2" />
                View Privacy Policy
              </Button>
              <Button
                onClick={onDecline}
                variant="ghost"
                size="sm"
                className="flex-1"
              >
                Decline
              </Button>
            </div>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
