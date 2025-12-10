import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { FileTextIcon, DownloadIcon, FilterIcon, Loader2Icon, CheckCircle2Icon } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import {
  Document,
  Packer,
  Paragraph,
  TextRun,
  Table,
  TableRow,
  TableCell,
  Header,
  Footer,
  AlignmentType,
  PageNumber,
  BorderStyle,
  WidthType,
  ShadingType,
  HeadingLevel,
  PageBreak,
} from "docx";
import { saveAs } from "file-saver";

// ============================================================================
// TYPE DEFINITIONS
// ============================================================================

interface SurveyResponse {
  id: string;
  continent: string | null;
  division: string | null;
  submitted_at: string;
  additional_comments: string | null;
  responses_jsonb: any;
}

interface ParsedResponses {
  [questionId: string]: {
    rating?: number;
    feedback?: string | null;
    text?: string;
    selected?: string[];
  };
}

interface QuestionStats {
  n: number;
  mean: number;
  median: number;
  dist: { [score: number]: number };
}

interface Comment {
  rating?: number | null;
  text: string;
}

interface AnalysisData {
  division: string;
  region: string;
  total_responses: number;
  question_labels: { [key: string]: string };
  overall_stats: { [key: string]: QuestionStats };
  comments_by_question: { [key: string]: Comment[] };
}

// ============================================================================
// CONFIGURATION - EXACT MATCH
// ============================================================================

const QUESTION_LABELS: { [key: string]: string } = {
  role_satisfaction: "Role Satisfaction",
  recommend_company: "Would Recommend Company",
  strategic_confidence: "Strategic Confidence",
  manager_alignment: "Manager Alignment",
  performance_awareness: "Performance Awareness",
  leadership_openness: "Leadership Openness",
  information_relay: "Information Relay",
  training_satisfaction: "Training Satisfaction",
  advancement_opportunities: "Advancement Opportunities",
  workplace_safety: "Workplace Safety",
  team_support: "Team Support",
  team_morale: "Team Morale",
  pride_in_work: "Pride in Work",
  company_pride: "Company Pride",
  workload_manageability: "Workload Manageability",
  work_life_balance: "Work-Life Balance",
  tools_equipment_quality: "Tools & Equipment Quality",
  manual_processes_focus: "Manual Processes Focus",
  communication_clarity: "Communication Clarity",
  company_value_alignment: "Company Value Alignment (Text)",
};

const QUESTION_ORDER = [
  "role_satisfaction",
  "recommend_company",
  "strategic_confidence",
  "manager_alignment",
  "performance_awareness",
  "leadership_openness",
  "information_relay",
  "training_satisfaction",
  "advancement_opportunities",
  "workplace_safety",
  "team_support",
  "team_morale",
  "pride_in_work",
  "company_pride",
  "workload_manageability",
  "work_life_balance",
  "tools_equipment_quality",
  "manual_processes_focus",
  "communication_clarity",
  "company_value_alignment",
];

// ============================================================================
// STYLING CONSTANTS - EXACT MATCH
// ============================================================================

const tableBorder = { style: BorderStyle.SINGLE, size: 1, color: "CCCCCC" };
const cellBorders = {
  top: tableBorder,
  bottom: tableBorder,
  left: tableBorder,
  right: tableBorder,
};
const headerShading = { fill: "1F4E79", type: ShadingType.CLEAR };
const altRowShading = { fill: "F2F2F2", type: ShadingType.CLEAR };

function getScoreColor(score: number): string {
  if (score >= 4.0) return "2E7D32"; // Green
  if (score >= 3.5) return "F9A825"; // Yellow/Orange
  return "C62828"; // Red
}

// ============================================================================
// DATA PROCESSING
// ============================================================================

function parseResponsesJsonb(jsonbData: any): ParsedResponses {
  if (!jsonbData) return {};

  try {
    const data = Array.isArray(jsonbData) ? jsonbData : JSON.parse(jsonbData);
    const results: ParsedResponses = {};

    for (const item of data) {
      const qid = item.question_id;
      const answer = item.answer_value || {};
      const qtype = item.question_type;

      if (qtype === "rating" && answer.rating !== undefined) {
        results[qid] = {
          rating: answer.rating,
          feedback: answer.feedback || null,
        };
      } else if (qtype === "text" && answer.text) {
        results[qid] = { text: answer.text };
      } else if (qtype === "multiselect") {
        results[qid] = { selected: answer.selected || [] };
      }
    }

    return results;
  } catch {
    return {};
  }
}

function calculateStats(
  data: { parsed: ParsedResponses }[],
  questionId: string
): QuestionStats | null {
  const ratings: number[] = [];

  for (const row of data) {
    const parsed = row.parsed;
    if (parsed && parsed[questionId]?.rating !== undefined) {
      ratings.push(parsed[questionId].rating!);
    }
  }

  if (ratings.length === 0) return null;

  const sum = ratings.reduce((a, b) => a + b, 0);
  const mean = sum / ratings.length;

  const sorted = [...ratings].sort((a, b) => a - b);
  const mid = Math.floor(sorted.length / 2);
  const median =
    sorted.length % 2 !== 0 ? sorted[mid] : (sorted[mid - 1] + sorted[mid]) / 2;

  const dist: { [score: number]: number } = { 1: 0, 2: 0, 3: 0, 4: 0, 5: 0 };
  ratings.forEach((r) => dist[r]++);

  return {
    n: ratings.length,
    mean: Math.round(mean * 100) / 100,
    median,
    dist,
  };
}

function extractComments(
  data: { parsed: ParsedResponses; additional_comments: string | null }[]
): { [key: string]: Comment[] } {
  const commentsByQuestion: { [key: string]: Comment[] } = {};

  for (const q of Object.keys(QUESTION_LABELS)) {
    commentsByQuestion[q] = [];
  }
  commentsByQuestion["additional_comments"] = [];

  for (const row of data) {
    const parsed = row.parsed || {};

    for (const [q, val] of Object.entries(parsed)) {
      if (val.feedback && val.feedback.trim()) {
        if (commentsByQuestion[q]) {
          commentsByQuestion[q].push({
            rating: val.rating,
            text: val.feedback.trim(),
          });
        }
      }
      if (val.text && val.text.trim()) {
        if (commentsByQuestion[q]) {
          commentsByQuestion[q].push({
            rating: null,
            text: val.text.trim(),
          });
        }
      }
    }

    if (row.additional_comments && row.additional_comments.trim()) {
      commentsByQuestion["additional_comments"].push({
        rating: null,
        text: row.additional_comments.trim(),
      });
    }
  }

  return commentsByQuestion;
}

function buildAnalysisData(
  data: { parsed: ParsedResponses; additional_comments: string | null }[],
  region: string,
  division: string
): AnalysisData {
  const overallStats: { [key: string]: QuestionStats } = {};

  for (const q of Object.keys(QUESTION_LABELS)) {
    const stats = calculateStats(data, q);
    if (stats) {
      overallStats[q] = stats;
    }
  }

  return {
    division,
    region,
    total_responses: data.length,
    question_labels: QUESTION_LABELS,
    overall_stats: overallStats,
    comments_by_question: extractComments(data),
  };
}

// ============================================================================
// DOCUMENT BUILDING - CELL HELPERS (EXACT MATCH)
// ============================================================================

function headerCell(text: string, width: number): TableCell {
  return new TableCell({
    borders: cellBorders,
    width: { size: width, type: WidthType.DXA },
    shading: headerShading,
    children: [
      new Paragraph({
        alignment: AlignmentType.CENTER,
        children: [new TextRun({ text, bold: true, color: "FFFFFF", size: 20 })],
      }),
    ],
  });
}

function dataCell(
  text: string | number,
  width: number,
  centered = false,
  shading: { fill: string; type: typeof ShadingType.CLEAR } | null = null,
  bold = false
): TableCell {
  return new TableCell({
    borders: cellBorders,
    width: { size: width, type: WidthType.DXA },
    shading: shading || undefined,
    children: [
      new Paragraph({
        alignment: centered ? AlignmentType.CENTER : AlignmentType.LEFT,
        children: [new TextRun({ text: String(text), size: 20, bold })],
      }),
    ],
  });
}

// ============================================================================
// DOCUMENT BUILDING - TABLES (EXACT MATCH)
// ============================================================================

function buildOverallTable(data: AnalysisData): Table {
  const rows = [
    new TableRow({
      tableHeader: true,
      children: [
        headerCell("Question", 4000),
        headerCell("Avg", 900),
        headerCell("n", 700),
        headerCell("1", 700),
        headerCell("2", 700),
        headerCell("3", 700),
        headerCell("4", 700),
        headerCell("5", 700),
      ],
    }),
  ];

  const questions = Object.entries(data.overall_stats).sort(
    ([, a], [, b]) => b.mean - a.mean
  );

  questions.forEach(([q, s], i) => {
    const shade = i % 2 === 1 ? altRowShading : null;
    rows.push(
      new TableRow({
        children: [
          dataCell(data.question_labels[q], 4000, false, shade),
          dataCell(s.mean.toFixed(2), 900, true, shade, true),
          dataCell(s.n, 700, true, shade),
          dataCell(s.dist[1], 700, true, shade),
          dataCell(s.dist[2], 700, true, shade),
          dataCell(s.dist[3], 700, true, shade),
          dataCell(s.dist[4], 700, true, shade),
          dataCell(s.dist[5], 700, true, shade),
        ],
      })
    );
  });

  return new Table({
    columnWidths: [4000, 900, 700, 700, 700, 700, 700, 700],
    rows,
  });
}

function buildDistributionTable(stats: QuestionStats): Table {
  const rows = [
    new TableRow({
      tableHeader: true,
      children: [
        headerCell("Score", 1200),
        headerCell("Count", 1200),
        headerCell("Percentage", 1500),
        headerCell("Distribution", 4000),
      ],
    }),
  ];

  for (let score = 5; score >= 1; score--) {
    const count = stats.dist[score];
    const pct = ((count / stats.n) * 100).toFixed(1);
    const barLength = Math.round((count / stats.n) * 40);
    const bar = "█".repeat(barLength) + "░".repeat(40 - barLength);

    rows.push(
      new TableRow({
        children: [
          dataCell(score, 1200, true, null, true),
          dataCell(count, 1200, true),
          dataCell(`${pct}%`, 1500, true),
          dataCell(bar, 4000, false),
        ],
      })
    );
  }

  return new Table({ columnWidths: [1200, 1200, 1500, 4000], rows });
}

// ============================================================================
// DOCUMENT BUILDING - KEY INSIGHTS (EXACT MATCH)
// ============================================================================

function buildKeyInsights(data: AnalysisData): Paragraph[] {
  const sorted = Object.entries(data.overall_stats).sort(
    ([, a], [, b]) => b.mean - a.mean
  );
  const top3 = sorted.slice(0, 3);
  const bottom3 = sorted.slice(-3).reverse();

  return [
    new Paragraph({
      heading: HeadingLevel.HEADING_2,
      children: [new TextRun("Key Metrics")],
    }),

    new Paragraph({
      spacing: { after: 100 },
      children: [
        new TextRun({
          text: "Highest Scoring Areas:",
          bold: true,
          size: 24,
          color: "2E7D32",
        }),
      ],
    }),
    ...top3.map(
      ([q, s], i) =>
        new Paragraph({
          indent: { left: 360 },
          children: [
            new TextRun({
              text: `${i + 1}. ${data.question_labels[q]}: `,
              size: 22,
            }),
            new TextRun({
              text: s.mean.toFixed(2),
              bold: true,
              size: 22,
              color: "2E7D32",
            }),
          ],
        })
    ),

    new Paragraph({
      spacing: { before: 200, after: 100 },
      children: [
        new TextRun({
          text: "Areas for Improvement:",
          bold: true,
          size: 24,
          color: "C62828",
        }),
      ],
    }),
    ...bottom3.map(
      ([q, s], i) =>
        new Paragraph({
          indent: { left: 360 },
          children: [
            new TextRun({
              text: `${i + 1}. ${data.question_labels[q]}: `,
              size: 22,
            }),
            new TextRun({
              text: s.mean.toFixed(2),
              bold: true,
              size: 22,
              color: "C62828",
            }),
          ],
        })
    ),
  ];
}

// ============================================================================
// DOCUMENT BUILDING - QUESTION PAGE (EXACT MATCH)
// ============================================================================

function buildQuestionPage(
  data: AnalysisData,
  question: string
): (Paragraph | Table)[] {
  const label = data.question_labels[question];
  const overall = data.overall_stats[question];
  const comments = data.comments_by_question[question] || [];

  const content: (Paragraph | Table)[] = [];

  // Question title - Heading 1
  content.push(
    new Paragraph({
      heading: HeadingLevel.HEADING_1,
      children: [new TextRun(label)],
    })
  );

  if (overall) {
    // Average Score line
    content.push(
      new Paragraph({
        spacing: { after: 150 },
        children: [
          new TextRun({ text: "Average Score: ", size: 26 }),
          new TextRun({
            text: overall.mean.toFixed(2),
            bold: true,
            size: 32,
            color: getScoreColor(overall.mean),
          }),
          new TextRun({
            text: ` out of 5.0  (n=${overall.n} responses)`,
            size: 22,
            color: "666666",
          }),
        ],
      })
    );

    // Score Distribution label
    content.push(
      new Paragraph({
        spacing: { before: 100, after: 100 },
        children: [new TextRun({ text: "Score Distribution:", bold: true, size: 22 })],
      })
    );

    // Distribution table
    content.push(buildDistributionTable(overall));
  }

  // Comments section header
  content.push(
    new Paragraph({
      spacing: { before: 300, after: 150 },
      children: [
        new TextRun({
          text: `Comments (${comments.length} total)`,
          bold: true,
          size: 24,
          color: "1F4E79",
        }),
      ],
    })
  );

  // Comments list
  if (comments.length === 0) {
    content.push(
      new Paragraph({
        children: [
          new TextRun({
            text: "No comments provided for this question.",
            italics: true,
            color: "666666",
          }),
        ],
      })
    );
  } else {
    comments.forEach((c, idx) => {
      const ratingText = c.rating ? `[Rating: ${c.rating}] ` : "";
      content.push(
        new Paragraph({
          spacing: { after: 100 },
          indent: { left: 360 },
          children: [
            new TextRun({ text: `${idx + 1}. `, bold: true, size: 18 }),
            new TextRun({
              text: ratingText,
              bold: true,
              size: 18,
              color: getScoreColor(c.rating || 3),
            }),
            new TextRun({ text: c.text, size: 18 }),
          ],
        })
      );
    });
  }

  // Page break
  content.push(new Paragraph({ children: [new PageBreak()] }));

  return content;
}

// ============================================================================
// DOCUMENT BUILDING - ADDITIONAL COMMENTS PAGE (EXACT MATCH)
// ============================================================================

function buildAdditionalCommentsPage(data: AnalysisData): (Paragraph | Table)[] {
  const comments = data.comments_by_question["additional_comments"] || [];
  const content: (Paragraph | Table)[] = [];

  // Title
  content.push(
    new Paragraph({
      heading: HeadingLevel.HEADING_1,
      children: [new TextRun("Additional Comments")],
    })
  );

  // Subtitle
  content.push(
    new Paragraph({
      spacing: { after: 150 },
      children: [
        new TextRun({
          text: `${comments.length} general comments provided by respondents.`,
          size: 22,
          color: "666666",
        }),
      ],
    })
  );

  // Comments
  if (comments.length === 0) {
    content.push(
      new Paragraph({
        children: [
          new TextRun({
            text: "No additional comments provided.",
            italics: true,
            color: "666666",
          }),
        ],
      })
    );
  } else {
    comments.forEach((c, idx) => {
      content.push(
        new Paragraph({
          spacing: { after: 120 },
          indent: { left: 360 },
          children: [
            new TextRun({ text: `${idx + 1}. `, bold: true, size: 18 }),
            new TextRun({ text: c.text, size: 18 }),
          ],
        })
      );
    });
  }

  return content;
}

// ============================================================================
// REPORT GENERATION (EXACT MATCH)
// ============================================================================

async function generateReport(
  data: AnalysisData,
  companyName: string
): Promise<Blob> {
  const divisionTitle =
    data.division.charAt(0).toUpperCase() + data.division.slice(1);

  // Build all question pages
  const questionPages = QUESTION_ORDER.flatMap((q) => buildQuestionPage(data, q));

  // Assemble document children
  const children: (Paragraph | Table)[] = [
    // ===== TITLE PAGE =====
    new Paragraph({
      heading: HeadingLevel.TITLE,
      children: [new TextRun("Employee Survey Report")],
    }),
    new Paragraph({
      alignment: AlignmentType.CENTER,
      spacing: { after: 100 },
      children: [
        new TextRun({
          text: `${data.region} — ${divisionTitle} Division`,
          size: 32,
          bold: true,
          color: "1F4E79",
        }),
      ],
    }),
    new Paragraph({
      alignment: AlignmentType.CENTER,
      spacing: { after: 100 },
      children: [
        new TextRun({
          text: companyName,
          size: 28,
          color: "666666",
        }),
      ],
    }),
    new Paragraph({
      alignment: AlignmentType.CENTER,
      spacing: { after: 400 },
      children: [
        new TextRun({
          text: `Analysis Date: ${new Date().toLocaleDateString('en-US', { month: 'long', year: 'numeric' })} | Total Responses: ${data.total_responses}`,
          size: 22,
          color: "666666",
        }),
      ],
    }),

    // ===== EXECUTIVE SUMMARY =====
    new Paragraph({
      heading: HeadingLevel.HEADING_1,
      children: [new TextRun("Executive Summary")],
    }),
    new Paragraph({
      spacing: { after: 150 },
      children: [
        new TextRun("This report analyzes "),
        new TextRun({ text: `${data.total_responses} employee survey responses`, bold: true }),
        new TextRun(" from the "),
        new TextRun({ text: `${divisionTitle} Division`, bold: true }),
        new TextRun(" in "),
        new TextRun({ text: data.region, bold: true }),
        new TextRun(". Each question is presented with score distribution and all associated comments."),
      ],
    }),

    // Key Metrics
    ...buildKeyInsights(data),

    // Page break
    new Paragraph({ children: [new PageBreak()] }),

    // ===== OVERALL RESULTS SUMMARY =====
    new Paragraph({
      heading: HeadingLevel.HEADING_1,
      children: [new TextRun("Overall Results Summary")],
    }),
    new Paragraph({
      spacing: { after: 150 },
      children: [
        new TextRun("All questions rated on a 1-5 scale. Sorted by average score (highest first)."),
      ],
    }),
    buildOverallTable(data),

    // Page break
    new Paragraph({ children: [new PageBreak()] }),

    // ===== INDIVIDUAL QUESTION PAGES =====
    ...questionPages,

    // ===== ADDITIONAL COMMENTS =====
    ...buildAdditionalCommentsPage(data),
  ];

  // Create document with exact styling
  const doc = new Document({
    styles: {
      default: { document: { run: { font: "Arial", size: 22 } } },
      paragraphStyles: [
        {
          id: "Title",
          name: "Title",
          basedOn: "Normal",
          run: { size: 48, bold: true, color: "1F4E79", font: "Arial" },
          paragraph: {
            spacing: { before: 0, after: 200 },
            alignment: AlignmentType.CENTER,
          },
        },
        {
          id: "Heading1",
          name: "Heading 1",
          basedOn: "Normal",
          next: "Normal",
          quickFormat: true,
          run: { size: 32, bold: true, color: "1F4E79", font: "Arial" },
          paragraph: { spacing: { before: 0, after: 150 }, outlineLevel: 0 },
        },
        {
          id: "Heading2",
          name: "Heading 2",
          basedOn: "Normal",
          next: "Normal",
          quickFormat: true,
          run: { size: 26, bold: true, color: "2E75B6", font: "Arial" },
          paragraph: { spacing: { before: 240, after: 120 }, outlineLevel: 1 },
        },
      ],
    },
    sections: [
      {
        properties: {
          page: { margin: { top: 1080, right: 1080, bottom: 1080, left: 1080 } },
        },
        headers: {
          default: new Header({
            children: [
              new Paragraph({
                alignment: AlignmentType.RIGHT,
                children: [
                  new TextRun({
                    text: `${companyName} — ${data.region} ${divisionTitle} Division Survey Report`,
                    italics: true,
                    size: 18,
                    color: "666666",
                  }),
                ],
              }),
            ],
          }),
        },
        footers: {
          default: new Footer({
            children: [
              new Paragraph({
                alignment: AlignmentType.CENTER,
                children: [
                  new TextRun({ text: "Page ", size: 18 }),
                  new TextRun({ children: [PageNumber.CURRENT], size: 18 }),
                  new TextRun({ text: " of ", size: 18 }),
                  new TextRun({ children: [PageNumber.TOTAL_PAGES], size: 18 }),
                ],
              }),
            ],
          }),
        },
        children: children as Paragraph[],
      },
    ],
  });

  return await Packer.toBlob(doc);
}

// ============================================================================
// COMPONENT
// ============================================================================

export const SurveyReportGenerator = () => {
  const [responses, setResponses] = useState<SurveyResponse[]>([]);
  const [loading, setLoading] = useState(true);
  const [generating, setGenerating] = useState(false);
  const [generatingAll, setGeneratingAll] = useState(false);
  const [selectedRegion, setSelectedRegion] = useState<string>("All");
  const [selectedDivision, setSelectedDivision] = useState<string>("All");
  const [companyName, setCompanyName] = useState("Bunting Magnetics Company");
  const [generatedReports, setGeneratedReports] = useState<string[]>([]);
  const { toast } = useToast();

  // Load data from Supabase
  useEffect(() => {
    loadResponses();
  }, []);

  const loadResponses = async () => {
    setLoading(true);
    try {
      const { data, error } = await supabase
        .from('employee_survey_responses')
        .select('id, continent, division, submitted_at, additional_comments, responses_jsonb')
        .eq('is_draft', false)
        .order('submitted_at', { ascending: false });

      if (error) throw error;
      setResponses(data || []);
    } catch (error: any) {
      toast({ title: "Error loading data", description: error.message, variant: "destructive" });
    } finally {
      setLoading(false);
    }
  };

  // Get unique regions and divisions
  const regions = ["All", ...new Set(responses.map(r => r.continent).filter(Boolean) as string[])];
  const divisions = ["All", ...new Set(responses.map(r => r.division).filter(Boolean) as string[])];

  // Filter responses
  const getFilteredResponses = (region: string, division: string) => {
    let filtered = responses;
    
    if (region !== "All") {
      filtered = filtered.filter(r => 
        r.continent?.toLowerCase().includes(region.toLowerCase())
      );
    }
    
    if (division !== "All") {
      filtered = filtered.filter(r => 
        r.division?.toLowerCase() === division.toLowerCase()
      );
    }
    
    return filtered.map(r => ({
      parsed: parseResponsesJsonb(r.responses_jsonb),
      additional_comments: r.additional_comments
    }));
  };

  const getFilteredCount = () => {
    return getFilteredResponses(selectedRegion, selectedDivision).length;
  };

  // Generate single report
  const generateSingleReport = async () => {
    const filtered = getFilteredResponses(selectedRegion, selectedDivision);
    
    if (filtered.length === 0) {
      toast({ title: "No data", description: "No responses match the selected filters.", variant: "destructive" });
      return;
    }

    setGenerating(true);
    
    try {
      const regionLabel = selectedRegion === "All" ? "All Regions" : selectedRegion;
      const divisionLabel = selectedDivision === "All" ? "All Divisions" : selectedDivision;
      
      const analysisData = buildAnalysisData(filtered, regionLabel, divisionLabel);
      const blob = await generateReport(analysisData, companyName);
      
      // Build filename
      let regionPrefix = regionLabel;
      if (regionLabel.toLowerCase().includes("north america")) regionPrefix = "US";
      else if (regionLabel.toLowerCase().includes("europe")) regionPrefix = "Europe";
      
      const safeDivision = divisionLabel.charAt(0).toUpperCase() + divisionLabel.slice(1).replace(/\s+/g, '_');
      const fileName = `${regionPrefix}_${safeDivision}_Survey_Report.docx`;
      
      saveAs(blob, fileName);
      
      toast({ title: "Report Generated", description: `Downloaded ${fileName}` });
    } catch (error: any) {
      console.error('Error generating report:', error);
      toast({ title: "Error", description: error.message, variant: "destructive" });
    } finally {
      setGenerating(false);
    }
  };

  // Generate all 6 reports
  const generateAllReports = async () => {
    const configs = [
      { region: "North America", division: "Equipment" },
      { region: "North America", division: "Magnets" },
      { region: "North America", division: "Both" },
      { region: "Europe", division: "Equipment" },
      { region: "Europe", division: "Magnets" },
      { region: "Europe", division: "Both" },
    ];

    setGeneratingAll(true);
    setGeneratedReports([]);

    try {
      for (const cfg of configs) {
        const filtered = getFilteredResponses(cfg.region, cfg.division);
        
        if (filtered.length === 0) {
          console.log(`Skipping ${cfg.region} - ${cfg.division}: No data`);
          continue;
        }

        const analysisData = buildAnalysisData(filtered, cfg.region, cfg.division);
        const blob = await generateReport(analysisData, companyName);

        let regionPrefix = cfg.region;
        if (cfg.region.toLowerCase().includes("north america")) regionPrefix = "US";
        else if (cfg.region.toLowerCase().includes("europe")) regionPrefix = "Europe";

        const safeDivision = cfg.division.charAt(0).toUpperCase() + cfg.division.slice(1);
        const fileName = `${regionPrefix}_${safeDivision}_Survey_Report.docx`;

        saveAs(blob, fileName);
        setGeneratedReports(prev => [...prev, fileName]);
        
        // Small delay between downloads
        await new Promise(resolve => setTimeout(resolve, 500));
      }

      toast({ title: "All Reports Generated", description: "6 division reports have been downloaded." });
    } catch (error: any) {
      console.error('Error generating reports:', error);
      toast({ title: "Error", description: error.message, variant: "destructive" });
    } finally {
      setGeneratingAll(false);
    }
  };

  if (loading) {
    return (
      <Card>
        <CardContent className="p-8 text-center">
          <Loader2Icon className="h-8 w-8 animate-spin mx-auto text-muted-foreground" />
          <p className="mt-2 text-muted-foreground">Loading survey data...</p>
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="space-y-6">
      {/* Configuration Card */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <FileTextIcon className="h-5 w-5 text-primary" />
            Survey Report Generator
            <Badge variant="secondary" className="ml-2">
              {responses.length} responses
            </Badge>
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-6">
          {/* Company Name */}
          <div className="space-y-2">
            <Label>Company Name</Label>
            <Input
              value={companyName}
              onChange={(e) => setCompanyName(e.target.value)}
              placeholder="Enter company name"
            />
            <p className="text-xs text-muted-foreground">
              This appears in the report header and title page.
            </p>
          </div>

          {/* Filters */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label className="flex items-center gap-2">
                <FilterIcon className="h-4 w-4" />
                Region
              </Label>
              <Select value={selectedRegion} onValueChange={setSelectedRegion}>
                <SelectTrigger>
                  <SelectValue placeholder="Select region" />
                </SelectTrigger>
                <SelectContent>
                  {regions.map(region => (
                    <SelectItem key={region} value={region}>{region}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label className="flex items-center gap-2">
                <FilterIcon className="h-4 w-4" />
                Division
              </Label>
              <Select value={selectedDivision} onValueChange={setSelectedDivision}>
                <SelectTrigger>
                  <SelectValue placeholder="Select division" />
                </SelectTrigger>
                <SelectContent>
                  {divisions.map(division => (
                    <SelectItem key={division} value={division}>{division}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>

          {/* Actions */}
          <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 pt-4 border-t">
            <span className="text-sm text-muted-foreground">
              {getFilteredCount()} responses match filters
            </span>
            <div className="flex gap-2">
              <Button
                onClick={generateSingleReport}
                disabled={generating || generatingAll || getFilteredCount() === 0}
              >
                {generating ? (
                  <>
                    <Loader2Icon className="h-4 w-4 mr-2 animate-spin" />
                    Generating...
                  </>
                ) : (
                  <>
                    <DownloadIcon className="h-4 w-4 mr-2" />
                    Generate Report
                  </>
                )}
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Batch Generation Card */}
      <Card className="border-primary/20 bg-primary/5">
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-lg">
            <FileTextIcon className="h-5 w-5" />
            Generate All Division Reports
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <p className="text-sm text-muted-foreground">
            Generate all 6 standard division reports at once (US & Europe × Equipment, Magnets, Both).
          </p>
          
          <Button
            onClick={generateAllReports}
            disabled={generating || generatingAll}
            className="w-full sm:w-auto"
            variant="default"
          >
            {generatingAll ? (
              <>
                <Loader2Icon className="h-4 w-4 mr-2 animate-spin" />
                Generating Reports...
              </>
            ) : (
              <>
                <DownloadIcon className="h-4 w-4 mr-2" />
                Generate All 6 Reports
              </>
            )}
          </Button>

          {/* Progress indicator */}
          {generatedReports.length > 0 && (
            <div className="space-y-2 pt-4 border-t">
              <p className="text-sm font-medium">Generated Reports:</p>
              <ul className="space-y-1">
                {generatedReports.map((report) => (
                  <li key={report} className="flex items-center gap-2 text-sm text-muted-foreground">
                    <CheckCircle2Icon className="h-4 w-4 text-green-600" />
                    {report}
                  </li>
                ))}
              </ul>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
};

export default SurveyReportGenerator;
