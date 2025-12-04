import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Separator } from "@/components/ui/separator";
import { FileText, DownloadIcon, SparklesIcon, FilterIcon, CheckCircle2, AlertTriangle, Lightbulb, BrainCircuitIcon } from "lucide-react";
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
  AlignmentType,
  BorderStyle,
  WidthType,
  ShadingType,
  HeadingLevel,
  PageBreak,
} from "docx";
import { saveAs } from 'file-saver';

interface WordReportResponse {
  id: string;
  continent: string;
  division: string;
  role: string;
  submitted_at: string;
  responses_jsonb: any[];
  additional_comments?: string;
}

interface AIAnalysis {
  executive_summary: string;
  key_strengths: string[];
  areas_for_improvement: string[];
  recommendations: string[];
  detailed_analysis: string;
}

interface AnalysisResult {
  analysis: AIAnalysis;
  metadata: {
    totalResponses: number;
    region: string;
    division: string;
    generatedAt: string;
    model: string;
    questionStats: any;
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

interface WordReportGeneratorProps {
  responses: WordReportResponse[];
}

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
  company_value_alignment: "Company Value Alignment",
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
];

// Styling constants
const tableBorder = { style: BorderStyle.SINGLE, size: 1, color: "CCCCCC" };
const cellBorders = { top: tableBorder, bottom: tableBorder, left: tableBorder, right: tableBorder };
const headerShading = { fill: "1F4E79", type: ShadingType.CLEAR };
const altRowShading = { fill: "F2F2F2", type: ShadingType.CLEAR };

function getScoreColor(score: number): string {
  if (score >= 4.0) return "2E7D32";
  if (score >= 3.5) return "F9A825";
  return "C62828";
}

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

export const WordReportGenerator = ({ responses }: WordReportGeneratorProps) => {
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [analysisResult, setAnalysisResult] = useState<AnalysisResult | null>(null);
  const [showDialog, setShowDialog] = useState(false);
  const [selectedRegion, setSelectedRegion] = useState<string>("All");
  const [selectedDivision, setSelectedDivision] = useState<string>("All");
  const { toast } = useToast();

  const regions = ["All", ...new Set(responses.map(r => r.continent).filter(Boolean))];
  const divisions = ["All", ...new Set(responses.map(r => r.division).filter(Boolean))];

  const getFilteredResponses = () => {
    let filtered = responses;
    if (selectedRegion !== "All") {
      filtered = filtered.filter(r => r.continent?.toLowerCase().includes(selectedRegion.toLowerCase()));
    }
    if (selectedDivision !== "All") {
      filtered = filtered.filter(r => r.division?.toLowerCase() === selectedDivision.toLowerCase());
    }
    return filtered;
  };

  const getFilteredCount = () => getFilteredResponses().length;

  // Calculate statistics from filtered responses
  const calculateQuestionStats = (filteredData: WordReportResponse[]): { [key: string]: QuestionStats } => {
    const stats: { [key: string]: QuestionStats } = {};
    
    for (const questionId of Object.keys(QUESTION_LABELS)) {
      const ratings: number[] = [];
      
      for (const response of filteredData) {
        const jsonb = response.responses_jsonb;
        if (Array.isArray(jsonb)) {
          const questionResponse = jsonb.find((item: any) => item.question_id === questionId);
          if (questionResponse?.answer_value?.rating !== undefined) {
            ratings.push(questionResponse.answer_value.rating);
          }
        }
      }
      
      if (ratings.length > 0) {
        const sum = ratings.reduce((a, b) => a + b, 0);
        const mean = sum / ratings.length;
        const sorted = [...ratings].sort((a, b) => a - b);
        const mid = Math.floor(sorted.length / 2);
        const median = sorted.length % 2 !== 0 ? sorted[mid] : (sorted[mid - 1] + sorted[mid]) / 2;
        
        const dist: { [score: number]: number } = { 1: 0, 2: 0, 3: 0, 4: 0, 5: 0 };
        ratings.forEach(r => dist[r]++);
        
        stats[questionId] = { n: ratings.length, mean: Math.round(mean * 100) / 100, median, dist };
      }
    }
    
    return stats;
  };

  // Extract comments from filtered responses
  const extractComments = (filteredData: WordReportResponse[]): { [key: string]: Comment[] } => {
    const commentsByQuestion: { [key: string]: Comment[] } = {};
    
    for (const q of Object.keys(QUESTION_LABELS)) {
      commentsByQuestion[q] = [];
    }
    commentsByQuestion["additional_comments"] = [];
    
    for (const response of filteredData) {
      const jsonb = response.responses_jsonb;
      if (Array.isArray(jsonb)) {
        for (const item of jsonb) {
          const qid = item.question_id;
          const answer = item.answer_value || {};
          
          if (answer.feedback && answer.feedback.trim() && commentsByQuestion[qid]) {
            commentsByQuestion[qid].push({ rating: answer.rating, text: answer.feedback.trim() });
          }
          if (answer.text && answer.text.trim() && commentsByQuestion[qid]) {
            commentsByQuestion[qid].push({ rating: null, text: answer.text.trim() });
          }
        }
      }
      
      if (response.additional_comments && response.additional_comments.trim()) {
        commentsByQuestion["additional_comments"].push({ rating: null, text: response.additional_comments.trim() });
      }
    }
    
    return commentsByQuestion;
  };

  const generateAnalysis = async () => {
    const filteredCount = getFilteredCount();
    
    if (filteredCount === 0) {
      toast({ title: "No Data", description: "No responses match the selected filters.", variant: "destructive" });
      return;
    }

    setIsAnalyzing(true);

    try {
      const { data, error } = await supabase.functions.invoke('generate-filtered-analysis', {
        body: { surveyData: responses, region: selectedRegion, division: selectedDivision }
      });

      if (error) throw new Error(error.message || 'Failed to generate analysis');
      if (!data.success) throw new Error(data.error || 'Analysis generation failed');

      setAnalysisResult(data);
      setShowDialog(true);
      toast({ title: "Analysis Complete", description: `Claude analysis generated for ${data.metadata.totalResponses} responses.` });
    } catch (error: any) {
      console.error('Error generating analysis:', error);
      toast({ title: "Analysis Failed", description: error.message || "Failed to generate analysis.", variant: "destructive" });
    } finally {
      setIsAnalyzing(false);
    }
  };

  const buildOverallTable = (questionStats: { [key: string]: QuestionStats }): Table => {
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

    const questions = Object.entries(questionStats).sort(([, a], [, b]) => b.mean - a.mean);

    questions.forEach(([q, s], i) => {
      const shade = i % 2 === 1 ? altRowShading : null;
      rows.push(
        new TableRow({
          children: [
            dataCell(QUESTION_LABELS[q] || q, 4000, false, shade),
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

    return new Table({ columnWidths: [4000, 900, 700, 700, 700, 700, 700, 700], rows });
  };

  const buildDistributionTable = (stats: QuestionStats): Table => {
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
  };

  const buildKeyInsights = (questionStats: { [key: string]: QuestionStats }): Paragraph[] => {
    const sorted = Object.entries(questionStats).sort(([, a], [, b]) => b.mean - a.mean);
    const top3 = sorted.slice(0, 3);
    const bottom3 = sorted.slice(-3).reverse();

    return [
      new Paragraph({ heading: HeadingLevel.HEADING_2, children: [new TextRun("Key Metrics")] }),
      new Paragraph({
        spacing: { after: 100 },
        children: [new TextRun({ text: "Highest Scoring Areas:", bold: true, size: 24, color: "2E7D32" })],
      }),
      ...top3.map(([q, s], i) =>
        new Paragraph({
          indent: { left: 360 },
          children: [
            new TextRun({ text: `${i + 1}. ${QUESTION_LABELS[q] || q}: `, size: 22 }),
            new TextRun({ text: s.mean.toFixed(2), bold: true, size: 22, color: "2E7D32" }),
          ],
        })
      ),
      new Paragraph({
        spacing: { before: 200, after: 100 },
        children: [new TextRun({ text: "Areas for Improvement:", bold: true, size: 24, color: "C62828" })],
      }),
      ...bottom3.map(([q, s], i) =>
        new Paragraph({
          indent: { left: 360 },
          children: [
            new TextRun({ text: `${i + 1}. ${QUESTION_LABELS[q] || q}: `, size: 22 }),
            new TextRun({ text: s.mean.toFixed(2), bold: true, size: 22, color: "C62828" }),
          ],
        })
      ),
    ];
  };

  const buildQuestionPage = (
    questionId: string,
    questionStats: { [key: string]: QuestionStats },
    commentsByQuestion: { [key: string]: Comment[] }
  ): (Paragraph | Table)[] => {
    const label = QUESTION_LABELS[questionId] || questionId;
    const stats = questionStats[questionId];
    const comments = commentsByQuestion[questionId] || [];
    const content: (Paragraph | Table)[] = [];

    content.push(new Paragraph({ heading: HeadingLevel.HEADING_1, children: [new TextRun(label)] }));

    if (stats) {
      content.push(
        new Paragraph({
          spacing: { after: 150 },
          children: [
            new TextRun({ text: "Average Score: ", size: 26 }),
            new TextRun({ text: stats.mean.toFixed(2), bold: true, size: 32, color: getScoreColor(stats.mean) }),
            new TextRun({ text: ` out of 5.0  (n=${stats.n} responses)`, size: 22, color: "666666" }),
          ],
        })
      );

      content.push(
        new Paragraph({
          spacing: { before: 100, after: 100 },
          children: [new TextRun({ text: "Score Distribution:", bold: true, size: 22 })],
        })
      );

      content.push(buildDistributionTable(stats));
    }

    content.push(
      new Paragraph({
        spacing: { before: 300, after: 150 },
        children: [new TextRun({ text: `Comments (${comments.length} total)`, bold: true, size: 24, color: "1F4E79" })],
      })
    );

    if (comments.length === 0) {
      content.push(
        new Paragraph({
          children: [new TextRun({ text: "No comments provided for this question.", italics: true, color: "666666" })],
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
              new TextRun({ text: ratingText, bold: true, size: 18, color: getScoreColor(c.rating || 3) }),
              new TextRun({ text: c.text, size: 18 }),
            ],
          })
        );
      });
    }

    content.push(new Paragraph({ children: [new PageBreak()] }));
    return content;
  };

  const buildAdditionalCommentsPage = (commentsByQuestion: { [key: string]: Comment[] }): (Paragraph | Table)[] => {
    const comments = commentsByQuestion["additional_comments"] || [];
    const content: (Paragraph | Table)[] = [];

    content.push(new Paragraph({ heading: HeadingLevel.HEADING_1, children: [new TextRun("Additional Comments")] }));
    content.push(
      new Paragraph({
        spacing: { after: 150 },
        children: [new TextRun({ text: `${comments.length} general comments provided by respondents.`, size: 22, color: "666666" })],
      })
    );

    if (comments.length === 0) {
      content.push(
        new Paragraph({
          children: [new TextRun({ text: "No additional comments provided.", italics: true, color: "666666" })],
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
  };

  const buildAIAnalysisSection = (analysis: AIAnalysis): (Paragraph | Table)[] => {
    const content: (Paragraph | Table)[] = [];

    // AI Analysis Header
    content.push(new Paragraph({ heading: HeadingLevel.HEADING_1, children: [new TextRun("AI-Powered Analysis (Claude)")] }));
    content.push(new Paragraph({ spacing: { after: 200 } }));

    // Executive Summary
    content.push(new Paragraph({ heading: HeadingLevel.HEADING_2, children: [new TextRun("Executive Summary")] }));
    content.push(new Paragraph({ spacing: { after: 150 }, children: [new TextRun({ text: analysis.executive_summary, size: 22 })] }));

    // Key Strengths
    content.push(new Paragraph({ spacing: { before: 200 }, heading: HeadingLevel.HEADING_2, children: [new TextRun({ text: "Key Strengths", color: "2E7D32" })] }));
    analysis.key_strengths.forEach((strength, i) => {
      content.push(
        new Paragraph({
          spacing: { after: 80 },
          indent: { left: 360 },
          children: [new TextRun({ text: `${i + 1}. ${strength}`, size: 22 })],
        })
      );
    });

    // Areas for Improvement
    content.push(new Paragraph({ spacing: { before: 200 }, heading: HeadingLevel.HEADING_2, children: [new TextRun({ text: "Areas for Improvement", color: "C62828" })] }));
    analysis.areas_for_improvement.forEach((area, i) => {
      content.push(
        new Paragraph({
          spacing: { after: 80 },
          indent: { left: 360 },
          children: [new TextRun({ text: `${i + 1}. ${area}`, size: 22 })],
        })
      );
    });

    // Recommendations
    content.push(new Paragraph({ spacing: { before: 200 }, heading: HeadingLevel.HEADING_2, children: [new TextRun({ text: "Strategic Recommendations", color: "1F4E79" })] }));
    analysis.recommendations.forEach((rec, i) => {
      content.push(
        new Paragraph({
          spacing: { after: 80 },
          indent: { left: 360 },
          children: [new TextRun({ text: `${i + 1}. ${rec}`, size: 22 })],
        })
      );
    });

    // Detailed Analysis
    content.push(new Paragraph({ children: [new PageBreak()] }));
    content.push(new Paragraph({ heading: HeadingLevel.HEADING_2, children: [new TextRun("Detailed Analysis")] }));
    content.push(new Paragraph({ spacing: { after: 150 }, children: [new TextRun({ text: analysis.detailed_analysis, size: 22 })] }));

    return content;
  };

  const exportToWord = async () => {
    if (!analysisResult) return;

    const filteredData = getFilteredResponses();
    const questionStats = calculateQuestionStats(filteredData);
    const commentsByQuestion = extractComments(filteredData);
    
    const region = analysisResult.metadata.region;
    const division = analysisResult.metadata.division;
    const divisionTitle = division !== "All" ? division.charAt(0).toUpperCase() + division.slice(1) : "All Divisions";
    const regionTitle = region !== "All" ? region : "All Regions";

    const questionPages = QUESTION_ORDER.flatMap(q => 
      questionStats[q] ? buildQuestionPage(q, questionStats, commentsByQuestion) : []
    );

    const children: (Paragraph | Table)[] = [
      // Title Page
      new Paragraph({ heading: HeadingLevel.TITLE, children: [new TextRun("Employee Survey Report")] }),
      new Paragraph({
        alignment: AlignmentType.CENTER,
        spacing: { after: 100 },
        children: [new TextRun({ text: `${regionTitle} — ${divisionTitle}`, size: 32, bold: true, color: "1F4E79" })],
      }),
      new Paragraph({
        alignment: AlignmentType.CENTER,
        spacing: { after: 100 },
        children: [new TextRun({ text: "Bunting Magnetics Company", size: 28, color: "666666" })],
      }),
      new Paragraph({
        alignment: AlignmentType.CENTER,
        spacing: { after: 400 },
        children: [new TextRun({ text: `Analysis Date: ${new Date().toLocaleDateString('en-US', { month: 'long', year: 'numeric' })} | Total Responses: ${analysisResult.metadata.totalResponses}`, size: 22, color: "666666" })],
      }),

      // AI Analysis Section
      ...buildAIAnalysisSection(analysisResult.analysis),
      new Paragraph({ children: [new PageBreak()] }),

      // Executive Summary with Key Insights
      new Paragraph({ heading: HeadingLevel.HEADING_1, children: [new TextRun("Survey Data Overview")] }),
      new Paragraph({
        spacing: { after: 150 },
        children: [
          new TextRun("This section presents the quantitative survey data from "),
          new TextRun({ text: `${analysisResult.metadata.totalResponses} employee responses`, bold: true }),
          new TextRun(". Each question is presented with score distribution and all associated comments."),
        ],
      }),
      ...buildKeyInsights(questionStats),
      new Paragraph({ children: [new PageBreak()] }),

      // Overall Results Summary
      new Paragraph({ heading: HeadingLevel.HEADING_1, children: [new TextRun("Overall Results Summary")] }),
      new Paragraph({
        spacing: { after: 150 },
        children: [new TextRun("All questions rated on a 1-5 scale. Sorted by average score (highest first).")],
      }),
      buildOverallTable(questionStats),
      new Paragraph({ children: [new PageBreak()] }),

      // Individual Question Pages
      ...questionPages,

      // Additional Comments
      ...buildAdditionalCommentsPage(commentsByQuestion),
    ];

    const doc = new Document({
      styles: {
        default: { document: { run: { font: "Arial", size: 22 } } },
        paragraphStyles: [
          { id: "Title", name: "Title", basedOn: "Normal", run: { size: 48, bold: true, color: "1F4E79", font: "Arial" }, paragraph: { alignment: AlignmentType.CENTER, spacing: { after: 400 } } },
          { id: "Heading1", name: "Heading 1", basedOn: "Normal", run: { size: 32, bold: true, color: "1F4E79", font: "Arial" }, paragraph: { spacing: { before: 200, after: 120 } } },
          { id: "Heading2", name: "Heading 2", basedOn: "Normal", run: { size: 26, bold: true, color: "1F4E79", font: "Arial" }, paragraph: { spacing: { before: 150, after: 100 } } },
        ],
      },
      sections: [{ children }],
    });

    const blob = await Packer.toBlob(doc);
    const fileName = `survey-report-${region.toLowerCase().replace(/\s+/g, '-')}-${division.toLowerCase()}-${Date.now()}.docx`;
    saveAs(blob, fileName);

    toast({ title: "Word Document Downloaded", description: "Report has been exported as .docx file." });
  };

  return (
    <Card className="border-indigo-200 bg-gradient-to-br from-indigo-50/50 to-blue-50/50">
      <CardHeader>
        <CardTitle className="flex items-center gap-2 text-indigo-900">
          <FileText className="h-5 w-5 text-indigo-600" />
          Word Report Generator (Claude)
          <Badge variant="secondary" className="ml-2 bg-indigo-100 text-indigo-700">
            .docx Export
          </Badge>
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <p className="text-sm text-muted-foreground">
          Generate comprehensive Word documents with AI analysis, question breakdowns, score distributions, and all employee comments.
        </p>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="space-y-2">
            <label className="text-sm font-medium flex items-center gap-2">
              <FilterIcon className="h-4 w-4" />
              Region
            </label>
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
            <label className="text-sm font-medium flex items-center gap-2">
              <FilterIcon className="h-4 w-4" />
              Division
            </label>
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

        <div className="flex items-center justify-between pt-2">
          <span className="text-sm text-muted-foreground">
            {getFilteredCount()} responses match filters
          </span>
          <Button
            onClick={generateAnalysis}
            disabled={isAnalyzing || getFilteredCount() === 0}
            className="bg-indigo-600 hover:bg-indigo-700"
          >
            {isAnalyzing ? (
              <>
                <BrainCircuitIcon className="h-4 w-4 mr-2 animate-pulse" />
                Analyzing...
              </>
            ) : (
              <>
                <SparklesIcon className="h-4 w-4 mr-2" />
                Generate Report
              </>
            )}
          </Button>
        </div>
      </CardContent>

      <Dialog open={showDialog} onOpenChange={setShowDialog}>
        <DialogContent className="max-w-4xl max-h-[85vh]">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <FileText className="h-5 w-5 text-indigo-600" />
              Analysis Ready
              {analysisResult && (
                <Badge variant="outline" className="ml-2">
                  {analysisResult.metadata.region} / {analysisResult.metadata.division}
                </Badge>
              )}
            </DialogTitle>
          </DialogHeader>

          <ScrollArea className="h-[65vh] pr-4">
            {analysisResult && (
              <div className="space-y-6">
                <div className="flex items-center gap-4 text-sm text-muted-foreground">
                  <span>{analysisResult.metadata.totalResponses} responses</span>
                  <span>•</span>
                  <span>Generated {new Date(analysisResult.metadata.generatedAt).toLocaleString()}</span>
                  <span>•</span>
                  <Badge variant="secondary" className="bg-indigo-100 text-indigo-700">
                    {analysisResult.metadata.model}
                  </Badge>
                </div>

                <Separator />

                <div className="space-y-3">
                  <h3 className="text-lg font-semibold flex items-center gap-2">
                    <FileText className="h-5 w-5 text-indigo-600" />
                    Executive Summary
                  </h3>
                  <p className="text-sm leading-relaxed whitespace-pre-wrap">
                    {analysisResult.analysis.executive_summary}
                  </p>
                </div>

                <Separator />

                <div className="space-y-3">
                  <h3 className="text-lg font-semibold flex items-center gap-2 text-green-700">
                    <CheckCircle2 className="h-5 w-5" />
                    Key Strengths
                  </h3>
                  <ul className="space-y-2">
                    {analysisResult.analysis.key_strengths.map((strength, i) => (
                      <li key={i} className="flex items-start gap-2 text-sm">
                        <span className="text-green-600 mt-0.5">•</span>
                        <span>{strength}</span>
                      </li>
                    ))}
                  </ul>
                </div>

                <Separator />

                <div className="space-y-3">
                  <h3 className="text-lg font-semibold flex items-center gap-2 text-amber-700">
                    <AlertTriangle className="h-5 w-5" />
                    Areas for Improvement
                  </h3>
                  <ul className="space-y-2">
                    {analysisResult.analysis.areas_for_improvement.map((area, i) => (
                      <li key={i} className="flex items-start gap-2 text-sm">
                        <span className="text-amber-600 mt-0.5">•</span>
                        <span>{area}</span>
                      </li>
                    ))}
                  </ul>
                </div>

                <Separator />

                <div className="space-y-3">
                  <h3 className="text-lg font-semibold flex items-center gap-2 text-blue-700">
                    <Lightbulb className="h-5 w-5" />
                    Strategic Recommendations
                  </h3>
                  <ol className="space-y-2 list-decimal list-inside">
                    {analysisResult.analysis.recommendations.map((rec, i) => (
                      <li key={i} className="text-sm pl-2">{rec}</li>
                    ))}
                  </ol>
                </div>
              </div>
            )}
          </ScrollArea>

          <div className="flex justify-end gap-2 pt-4 border-t">
            <Button variant="outline" onClick={() => setShowDialog(false)}>
              Close
            </Button>
            <Button onClick={exportToWord} className="bg-indigo-600 hover:bg-indigo-700">
              <DownloadIcon className="h-4 w-4 mr-2" />
              Download Word (.docx)
            </Button>
          </div>
        </DialogContent>
      </Dialog>
    </Card>
  );
};
