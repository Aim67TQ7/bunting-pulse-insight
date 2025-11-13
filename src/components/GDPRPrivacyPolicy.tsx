import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from "@/components/ui/dialog";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Button } from "@/components/ui/button";
import { ShieldCheckIcon, MailIcon, MapPinIcon, ClockIcon, DatabaseIcon, LockIcon, FileTextIcon } from "lucide-react";
import { Separator } from "@/components/ui/separator";

interface GDPRPrivacyPolicyProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export function GDPRPrivacyPolicy({ open, onOpenChange }: GDPRPrivacyPolicyProps) {
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-4xl max-h-[90vh]">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2 text-xl">
            <ShieldCheckIcon className="h-6 w-6 text-primary" />
            Privacy Policy & Data Protection Notice
          </DialogTitle>
          <DialogDescription>
            Last updated: {new Date().toLocaleDateString()}
          </DialogDescription>
        </DialogHeader>
        
        <ScrollArea className="h-[70vh] pr-4">
          <div className="space-y-6 text-sm">
            {/* Data Controller */}
            <section>
              <h3 className="font-semibold text-base mb-3 flex items-center gap-2">
                <MapPinIcon className="h-4 w-4 text-primary" />
                1. Data Controller & Contact Information
              </h3>
              <div className="space-y-2 text-muted-foreground">
                <p><strong>Data Controller:</strong> Robert Clausing</p>
                <p><strong>Address:</strong> 500 Spencer Road, Newton, KS 67114, United States</p>
                <p><strong>Data Protection Officer (DPO):</strong> Robert Clausing</p>
                <p><strong>Contact:</strong> For any questions about your data or to exercise your rights, please contact the DPO at the address above.</p>
              </div>
            </section>

            <Separator />

            {/* Purpose and Legal Basis */}
            <section>
              <h3 className="font-semibold text-base mb-3 flex items-center gap-2">
                <FileTextIcon className="h-4 w-4 text-primary" />
                2. Purpose of Data Processing & Legal Basis
              </h3>
              <div className="space-y-3 text-muted-foreground">
                <div>
                  <p className="font-medium text-foreground mb-1">Purpose:</p>
                  <p>We collect and process your survey responses to measure employee engagement, improve workplace culture, and inform business decisions.</p>
                </div>
                <div>
                  <p className="font-medium text-foreground mb-1">Legal Basis (Article 6 GDPR):</p>
                  <p><strong>Consent (Article 6(1)(a)):</strong> This survey is entirely voluntary. By providing explicit consent, you agree to participate. You may withdraw consent at any time without negative consequences.</p>
                </div>
              </div>
            </section>

            <Separator />

            {/* Data Collected */}
            <section>
              <h3 className="font-semibold text-base mb-3 flex items-center gap-2">
                <DatabaseIcon className="h-4 w-4 text-primary" />
                3. Data We Collect
              </h3>
              <div className="space-y-2 text-muted-foreground">
                <p>This survey is <strong>anonymous</strong>. We do NOT collect:</p>
                <ul className="list-disc pl-5 space-y-1">
                  <li>Your name or employee ID</li>
                  <li>Email addresses</li>
                  <li>IP addresses</li>
                  <li>Device identifiers</li>
                </ul>
                
                <p className="mt-3">We DO collect:</p>
                <ul className="list-disc pl-5 space-y-1">
                  <li><strong>Demographic information:</strong> Continent, division, role level (aggregated for analysis)</li>
                  <li><strong>Survey responses:</strong> Rating scores (1-5), text feedback, multi-select answers</li>
                  <li><strong>Session data:</strong> Random session ID (for preventing duplicate submissions), completion time</li>
                  <li><strong>Technical data:</strong> Browser language preference, timestamps</li>
                  <li><strong>Consent records:</strong> Timestamp and version of consent given</li>
                </ul>

                <div className="bg-accent/20 border border-accent/30 rounded-lg p-3 mt-3">
                  <p className="font-medium text-foreground">Cookie Usage:</p>
                  <p className="text-xs mt-1">We use browser local storage (similar to cookies) only to:</p>
                  <ul className="list-disc pl-5 text-xs mt-1 space-y-1">
                    <li>Store your session ID to prevent multiple submissions</li>
                    <li>Auto-save your draft responses (stored locally on your device)</li>
                    <li>Remember your cookie consent preference</li>
                  </ul>
                  <p className="text-xs mt-2">No third-party cookies or tracking technologies are used.</p>
                </div>
              </div>
            </section>

            <Separator />

            {/* International Transfers */}
            <section>
              <h3 className="font-semibold text-base mb-3">4. International Data Transfers</h3>
              <div className="space-y-2 text-muted-foreground">
                <p>
                  Your survey data is stored on servers operated by Supabase (PostgreSQL database) which may be located outside the European Economic Area (EEA).
                </p>
                <p>
                  <strong>Safeguards:</strong> Data transfers comply with GDPR Article 46 through:
                </p>
                <ul className="list-disc pl-5 space-y-1">
                  <li>Standard Contractual Clauses (SCCs) approved by the European Commission</li>
                  <li>Industry-standard encryption in transit (TLS) and at rest</li>
                  <li>Strict data retention and deletion policies</li>
                </ul>
              </div>
            </section>

            <Separator />

            {/* Data Retention */}
            <section>
              <h3 className="font-semibold text-base mb-3 flex items-center gap-2">
                <ClockIcon className="h-4 w-4 text-primary" />
                5. Data Retention Period
              </h3>
              <div className="space-y-2 text-muted-foreground">
                <div>
                  <p className="font-medium text-foreground">Completed Survey Responses:</p>
                  <p>Retained for <strong>12 months</strong> from submission date, then automatically deleted.</p>
                </div>
                <div>
                  <p className="font-medium text-foreground">Draft Responses:</p>
                  <p>Auto-deleted after <strong>30 days</strong> of inactivity if not submitted.</p>
                </div>
                <div>
                  <p className="font-medium text-foreground">Consent Records:</p>
                  <p>Retained for 3 years as required for legal compliance (audit trail).</p>
                </div>
              </div>
            </section>

            <Separator />

            {/* Your Rights */}
            <section>
              <h3 className="font-semibold text-base mb-3 flex items-center gap-2">
                <ShieldCheckIcon className="h-4 w-4 text-primary" />
                6. Your Data Protection Rights (GDPR Articles 15-22)
              </h3>
              <div className="space-y-3 text-muted-foreground">
                <p>Under GDPR, you have the following rights:</p>
                
                <div>
                  <p className="font-medium text-foreground">• Right to Access (Article 15)</p>
                  <p>Request a copy of your survey responses using your session ID.</p>
                </div>

                <div>
                  <p className="font-medium text-foreground">• Right to Erasure / "Right to be Forgotten" (Article 17)</p>
                  <p>Request deletion of your survey responses at any time using your session ID.</p>
                </div>

                <div>
                  <p className="font-medium text-foreground">• Right to Data Portability (Article 20)</p>
                  <p>Download your survey data in JSON format.</p>
                </div>

                <div>
                  <p className="font-medium text-foreground">• Right to Withdraw Consent (Article 7(3))</p>
                  <p>You may withdraw consent at any time. This will not affect data processing done before withdrawal.</p>
                </div>

                <div>
                  <p className="font-medium text-foreground">• Right to Object (Article 21)</p>
                  <p>Object to processing your data.</p>
                </div>

                <div>
                  <p className="font-medium text-foreground">• Right to Lodge a Complaint</p>
                  <p>You have the right to lodge a complaint with your local data protection authority if you believe your data has been mishandled.</p>
                </div>

                <div className="bg-primary/10 border border-primary/20 rounded-lg p-3 mt-3">
                  <p className="font-medium text-foreground text-sm">How to Exercise Your Rights:</p>
                  <p className="text-xs mt-1">
                    After completing the survey, you'll receive a <strong>Session ID</strong>. Save this ID to access, download, or delete your data.
                    You can also use the "Manage My Data" option at the bottom of the survey page.
                  </p>
                </div>
              </div>
            </section>

            <Separator />

            {/* Security */}
            <section>
              <h3 className="font-semibold text-base mb-3 flex items-center gap-2">
                <LockIcon className="h-4 w-4 text-primary" />
                7. Data Security Measures
              </h3>
              <div className="space-y-2 text-muted-foreground">
                <p>We implement industry-standard security measures:</p>
                <ul className="list-disc pl-5 space-y-1">
                  <li>Encryption in transit (HTTPS/TLS 1.3)</li>
                  <li>Encryption at rest (database-level encryption)</li>
                  <li>Access controls and role-based permissions</li>
                  <li>Regular security audits</li>
                  <li>Automatic data retention enforcement</li>
                  <li>No storage of IP addresses or personally identifiable information</li>
                </ul>
              </div>
            </section>

            <Separator />

            {/* Recipients */}
            <section>
              <h3 className="font-semibold text-base mb-3">8. Data Recipients & Third Parties</h3>
              <div className="space-y-2 text-muted-foreground">
                <p>Your survey data is shared only with:</p>
                <ul className="list-disc pl-5 space-y-1">
                  <li><strong>Internal use only:</strong> Management and HR for employee engagement analysis</li>
                  <li><strong>Service providers:</strong> Supabase (database hosting) - operates under data processing agreement</li>
                </ul>
                <p className="mt-2">We do NOT sell, rent, or share your data with third parties for marketing purposes.</p>
              </div>
            </section>

            <Separator />

            {/* Automated Decision Making */}
            <section>
              <h3 className="font-semibold text-base mb-3">9. Automated Decision-Making</h3>
              <div className="text-muted-foreground">
                <p>
                  There is <strong>no automated decision-making or profiling</strong> (Article 22 GDPR) performed on your survey responses. 
                  All data is used for aggregate statistical analysis only.
                </p>
              </div>
            </section>

            <Separator />

            {/* Changes to Policy */}
            <section>
              <h3 className="font-semibold text-base mb-3">10. Changes to This Policy</h3>
              <div className="text-muted-foreground">
                <p>
                  We may update this privacy policy from time to time. When we do, we'll update the "Last updated" date at the top of this policy.
                  Continued participation after changes indicates acceptance of the updated policy.
                </p>
              </div>
            </section>

            <Separator />

            {/* Contact */}
            <section className="bg-muted/50 rounded-lg p-4">
              <h3 className="font-semibold text-base mb-3 flex items-center gap-2">
                <MailIcon className="h-4 w-4 text-primary" />
                Questions or Concerns?
              </h3>
              <div className="text-muted-foreground space-y-2">
                <p>If you have any questions about this privacy policy or how we handle your data, please contact:</p>
                <div className="font-medium text-foreground">
                  <p>Robert Clausing (Data Protection Officer)</p>
                  <p>500 Spencer Road, Newton, KS 67114</p>
                </div>
              </div>
            </section>
          </div>
        </ScrollArea>

        <div className="flex justify-end pt-4 border-t">
          <Button onClick={() => onOpenChange(false)}>
            Close
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}
