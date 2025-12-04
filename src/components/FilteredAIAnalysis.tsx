import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Separator } from "@/components/ui/separator";
import { BrainCircuitIcon, DownloadIcon, SparklesIcon, FilterIcon, CheckCircle2, AlertTriangle, Lightbulb, FileText } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import jsPDF from 'jspdf';

interface FilteredAnalysisResponse {
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

interface FilteredAIAnalysisProps {
  responses: FilteredAnalysisResponse[];
}

export const FilteredAIAnalysis = ({ responses }: FilteredAIAnalysisProps) => {
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [analysisResult, setAnalysisResult] = useState<AnalysisResult | null>(null);
  const [showDialog, setShowDialog] = useState(false);
  const [selectedRegion, setSelectedRegion] = useState<string>("All");
  const [selectedDivision, setSelectedDivision] = useState<string>("All");
  const { toast } = useToast();

  // Get unique regions and divisions from responses
  const regions = ["All", ...new Set(responses.map(r => r.continent).filter(Boolean))];
  const divisions = ["All", ...new Set(responses.map(r => r.division).filter(Boolean))];

  // Calculate filtered response count
  const getFilteredCount = () => {
    let filtered = responses;
    if (selectedRegion !== "All") {
      filtered = filtered.filter(r => r.continent?.toLowerCase().includes(selectedRegion.toLowerCase()));
    }
    if (selectedDivision !== "All") {
      filtered = filtered.filter(r => r.division?.toLowerCase() === selectedDivision.toLowerCase());
    }
    return filtered.length;
  };

  const generateAnalysis = async () => {
    const filteredCount = getFilteredCount();
    
    if (filteredCount === 0) {
      toast({
        title: "No Data",
        description: "No responses match the selected filters.",
        variant: "destructive"
      });
      return;
    }

    setIsAnalyzing(true);
    console.log(`Generating filtered analysis: Region=${selectedRegion}, Division=${selectedDivision}`);

    try {
      const { data, error } = await supabase.functions.invoke('generate-filtered-analysis', {
        body: {
          surveyData: responses,
          region: selectedRegion,
          division: selectedDivision
        }
      });

      if (error) {
        console.error('Edge function error:', error);
        throw new Error(error.message || 'Failed to generate analysis');
      }

      if (!data.success) {
        throw new Error(data.error || 'Analysis generation failed');
      }

      setAnalysisResult(data);
      setShowDialog(true);

      toast({
        title: "Analysis Complete",
        description: `Claude analysis generated for ${data.metadata.totalResponses} responses.`
      });

    } catch (error: any) {
      console.error('Error generating analysis:', error);
      toast({
        title: "Analysis Failed",
        description: error.message || "Failed to generate analysis.",
        variant: "destructive"
      });
    } finally {
      setIsAnalyzing(false);
    }
  };

  const exportToPDF = async () => {
    if (!analysisResult) return;

    const pdf = new jsPDF('p', 'pt', 'a4');
    const pageWidth = pdf.internal.pageSize.width;
    const pageHeight = pdf.internal.pageSize.height;
    const margin = 50;
    const lineHeight = 18;
    let yPosition = margin;

    const colors = {
      primary: [31, 78, 121] as [number, number, number],
      green: [46, 125, 50] as [number, number, number],
      red: [198, 40, 40] as [number, number, number],
      text: [51, 65, 85] as [number, number, number],
      lightGray: [241, 245, 249] as [number, number, number]
    };

    const checkPageBreak = (neededSpace: number) => {
      if (yPosition + neededSpace > pageHeight - margin) {
        pdf.addPage();
        yPosition = margin;
      }
    };

    // Title
    pdf.setFontSize(24);
    pdf.setFont('helvetica', 'bold');
    pdf.setTextColor(...colors.primary);
    pdf.text('Survey Analysis Report', margin, yPosition);
    yPosition += 35;

    // Filter info
    pdf.setFontSize(12);
    pdf.setFont('helvetica', 'normal');
    pdf.setTextColor(...colors.text);
    const filterText = `Region: ${analysisResult.metadata.region} | Division: ${analysisResult.metadata.division}`;
    pdf.text(filterText, margin, yPosition);
    yPosition += 20;
    pdf.text(`Responses: ${analysisResult.metadata.totalResponses} | Generated: ${new Date(analysisResult.metadata.generatedAt).toLocaleDateString()}`, margin, yPosition);
    yPosition += 30;

    // Powered by Claude badge
    pdf.setFillColor(...colors.lightGray);
    pdf.roundedRect(margin, yPosition - 5, 180, 22, 3, 3, 'F');
    pdf.setFontSize(10);
    pdf.text('Powered by Claude (Anthropic)', margin + 10, yPosition + 10);
    yPosition += 40;

    // Executive Summary
    pdf.setFontSize(16);
    pdf.setFont('helvetica', 'bold');
    pdf.setTextColor(...colors.primary);
    pdf.text('Executive Summary', margin, yPosition);
    yPosition += 25;

    pdf.setFontSize(11);
    pdf.setFont('helvetica', 'normal');
    pdf.setTextColor(...colors.text);
    const summaryLines = pdf.splitTextToSize(analysisResult.analysis.executive_summary, pageWidth - 2 * margin);
    for (const line of summaryLines) {
      checkPageBreak(lineHeight);
      pdf.text(line, margin, yPosition);
      yPosition += lineHeight;
    }
    yPosition += 20;

    // Key Strengths
    checkPageBreak(100);
    pdf.setFontSize(14);
    pdf.setFont('helvetica', 'bold');
    pdf.setTextColor(...colors.green);
    pdf.text('Key Strengths', margin, yPosition);
    yPosition += 20;

    pdf.setFontSize(11);
    pdf.setFont('helvetica', 'normal');
    pdf.setTextColor(...colors.text);
    for (const strength of analysisResult.analysis.key_strengths) {
      checkPageBreak(lineHeight * 2);
      const strengthLines = pdf.splitTextToSize(`• ${strength}`, pageWidth - 2 * margin - 20);
      for (const line of strengthLines) {
        pdf.text(line, margin + 10, yPosition);
        yPosition += lineHeight;
      }
    }
    yPosition += 15;

    // Areas for Improvement
    checkPageBreak(100);
    pdf.setFontSize(14);
    pdf.setFont('helvetica', 'bold');
    pdf.setTextColor(...colors.red);
    pdf.text('Areas for Improvement', margin, yPosition);
    yPosition += 20;

    pdf.setFontSize(11);
    pdf.setFont('helvetica', 'normal');
    pdf.setTextColor(...colors.text);
    for (const area of analysisResult.analysis.areas_for_improvement) {
      checkPageBreak(lineHeight * 2);
      const areaLines = pdf.splitTextToSize(`• ${area}`, pageWidth - 2 * margin - 20);
      for (const line of areaLines) {
        pdf.text(line, margin + 10, yPosition);
        yPosition += lineHeight;
      }
    }
    yPosition += 15;

    // Recommendations
    checkPageBreak(100);
    pdf.setFontSize(14);
    pdf.setFont('helvetica', 'bold');
    pdf.setTextColor(...colors.primary);
    pdf.text('Strategic Recommendations', margin, yPosition);
    yPosition += 20;

    pdf.setFontSize(11);
    pdf.setFont('helvetica', 'normal');
    pdf.setTextColor(...colors.text);
    analysisResult.analysis.recommendations.forEach((rec, i) => {
      checkPageBreak(lineHeight * 2);
      const recLines = pdf.splitTextToSize(`${i + 1}. ${rec}`, pageWidth - 2 * margin - 20);
      for (const line of recLines) {
        pdf.text(line, margin + 10, yPosition);
        yPosition += lineHeight;
      }
      yPosition += 5;
    });
    yPosition += 15;

    // Detailed Analysis
    pdf.addPage();
    yPosition = margin;
    
    pdf.setFontSize(16);
    pdf.setFont('helvetica', 'bold');
    pdf.setTextColor(...colors.primary);
    pdf.text('Detailed Analysis', margin, yPosition);
    yPosition += 25;

    pdf.setFontSize(11);
    pdf.setFont('helvetica', 'normal');
    pdf.setTextColor(...colors.text);
    const detailLines = pdf.splitTextToSize(analysisResult.analysis.detailed_analysis, pageWidth - 2 * margin);
    for (const line of detailLines) {
      checkPageBreak(lineHeight);
      pdf.text(line, margin, yPosition);
      yPosition += lineHeight;
    }

    // Save PDF
    const fileName = `survey-analysis-${selectedRegion.toLowerCase().replace(/\s+/g, '-')}-${selectedDivision.toLowerCase()}-${Date.now()}.pdf`;
    pdf.save(fileName);

    toast({
      title: "PDF Downloaded",
      description: "Analysis report has been exported."
    });
  };

  return (
    <Card className="border-purple-200 bg-gradient-to-br from-purple-50/50 to-violet-50/50">
      <CardHeader>
        <CardTitle className="flex items-center gap-2 text-purple-900">
          <SparklesIcon className="h-5 w-5 text-purple-600" />
          Filtered Analysis (Claude)
          <Badge variant="secondary" className="ml-2 bg-purple-100 text-purple-700">
            Anthropic
          </Badge>
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <p className="text-sm text-muted-foreground">
          Generate a targeted analysis using Claude AI. Filter by region and/or division to get specific insights.
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
            className="bg-purple-600 hover:bg-purple-700"
          >
            {isAnalyzing ? (
              <>
                <BrainCircuitIcon className="h-4 w-4 mr-2 animate-pulse" />
                Analyzing...
              </>
            ) : (
              <>
                <SparklesIcon className="h-4 w-4 mr-2" />
                Generate Analysis
              </>
            )}
          </Button>
        </div>
      </CardContent>

      {/* Analysis Results Dialog */}
      <Dialog open={showDialog} onOpenChange={setShowDialog}>
        <DialogContent className="max-w-4xl max-h-[85vh]">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <SparklesIcon className="h-5 w-5 text-purple-600" />
              Claude Analysis Results
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
                {/* Metadata */}
                <div className="flex items-center gap-4 text-sm text-muted-foreground">
                  <span>{analysisResult.metadata.totalResponses} responses</span>
                  <span>•</span>
                  <span>Generated {new Date(analysisResult.metadata.generatedAt).toLocaleString()}</span>
                  <span>•</span>
                  <Badge variant="secondary" className="bg-purple-100 text-purple-700">
                    {analysisResult.metadata.model}
                  </Badge>
                </div>

                <Separator />

                {/* Executive Summary */}
                <div className="space-y-3">
                  <h3 className="text-lg font-semibold flex items-center gap-2">
                    <FileText className="h-5 w-5 text-purple-600" />
                    Executive Summary
                  </h3>
                  <p className="text-sm leading-relaxed whitespace-pre-wrap">
                    {analysisResult.analysis.executive_summary}
                  </p>
                </div>

                <Separator />

                {/* Key Strengths */}
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

                {/* Areas for Improvement */}
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

                {/* Recommendations */}
                <div className="space-y-3">
                  <h3 className="text-lg font-semibold flex items-center gap-2 text-blue-700">
                    <Lightbulb className="h-5 w-5" />
                    Strategic Recommendations
                  </h3>
                  <ol className="space-y-2 list-decimal list-inside">
                    {analysisResult.analysis.recommendations.map((rec, i) => (
                      <li key={i} className="text-sm pl-2">
                        {rec}
                      </li>
                    ))}
                  </ol>
                </div>

                <Separator />

                {/* Detailed Analysis */}
                <div className="space-y-3">
                  <h3 className="text-lg font-semibold flex items-center gap-2">
                    <BrainCircuitIcon className="h-5 w-5 text-purple-600" />
                    Detailed Analysis
                  </h3>
                  <p className="text-sm leading-relaxed whitespace-pre-wrap">
                    {analysisResult.analysis.detailed_analysis}
                  </p>
                </div>
              </div>
            )}
          </ScrollArea>

          <div className="flex justify-end gap-2 pt-4 border-t">
            <Button variant="outline" onClick={() => setShowDialog(false)}>
              Close
            </Button>
            <Button onClick={exportToPDF} className="bg-purple-600 hover:bg-purple-700">
              <DownloadIcon className="h-4 w-4 mr-2" />
              Export PDF
            </Button>
          </div>
        </DialogContent>
      </Dialog>
    </Card>
  );
};
