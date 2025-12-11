import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Badge } from "@/components/ui/badge";
import { ScrollArea } from "@/components/ui/scroll-area";

interface RevisionHistoryProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

const REVISION_HISTORY = [
  {
    version: "2.16.0",
    date: "2025-12-11",
    changes: [
      "Reports now download as a bundled ZIP file (all 6 division reports)",
      "Added full question text to individual question pages in reports",
      "Consolidated Dashboard and Question-Level Analytics into unified view",
      "Added inline low-score feedback display under each question"
    ]
  },
  {
    version: "2.15.0",
    date: "2025-12-10",
    changes: [
      "Added comprehensive appendix with demographic breakdowns to PDF reports",
      "Enhanced PDF reports with professional enterprise-level design"
    ]
  },
  {
    version: "2.14.0",
    date: "2025-12-09",
    changes: [
      "Added Word document report generation with professional styling",
      "Created batch report generation for all divisions"
    ]
  },
  {
    version: "2.13.0",
    date: "2025-12-08",
    changes: [
      "Implemented AI analysis with GPT-4o and Claude enhancement",
      "Added PDF export for AI analysis reports"
    ]
  },
  {
    version: "2.12.0",
    date: "2025-12-07",
    changes: [
      "Added survey timer with countdown display",
      "Implemented GDPR-compliant privacy policy and data rights management"
    ]
  }
];

export const RevisionHistory = ({ open, onOpenChange }: RevisionHistoryProps) => {
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-lg max-h-[80vh]">
        <DialogHeader>
          <DialogTitle>Revision History</DialogTitle>
        </DialogHeader>
        <ScrollArea className="h-[60vh] pr-4">
          <div className="space-y-6">
            {REVISION_HISTORY.map((revision) => (
              <div key={revision.version} className="border-b pb-4 last:border-b-0">
                <div className="flex items-center gap-3 mb-2">
                  <Badge variant="secondary" className="font-mono">
                    v{revision.version}
                  </Badge>
                  <span className="text-sm text-muted-foreground">
                    {revision.date}
                  </span>
                </div>
                <ul className="list-disc list-inside space-y-1 text-sm text-foreground">
                  {revision.changes.map((change, idx) => (
                    <li key={idx}>{change}</li>
                  ))}
                </ul>
              </div>
            ))}
          </div>
        </ScrollArea>
      </DialogContent>
    </Dialog>
  );
};
