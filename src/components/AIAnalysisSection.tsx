import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { ScrollArea } from "@/components/ui/scroll-area";
import { BrainCircuitIcon, DownloadIcon, RefreshCwIcon, SparklesIcon } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import ReactMarkdown from 'react-markdown';
import jsPDF from 'jspdf';

interface SurveyResponse {
  id: string;
  continent: string;
  division: string;
  role: string;
  job_satisfaction: number;
  work_life_balance: number;
  training_satisfaction: number;
  advancement_opportunities: number;
  workplace_safety: number;
  leadership_openness: number;
  communication_clarity: number;
  strategic_confidence: number;
  manager_alignment: number;
  cross_functional_collaboration: number;
  us_uk_collaboration: number;
  comfortable_suggesting_improvements: number;
  manual_processes_focus: number;
  failed_experiments_learning: number;
  recommend_company: number;
  additional_comments: string;
  collaboration_feedback: string;
  submitted_at: string;
}

interface AIAnalysisSectionProps {
  responses: SurveyResponse[];
}

interface AnalysisResult {
  analysis: string;
  metadata: {
    totalResponses: number;
    validResponses?: number;
    responseRate?: number;
    commentsCount?: number;
    analysisLength?: number;
    generatedAt: string;
    model: string;
  };
}

export const AIAnalysisSection = ({ responses }: AIAnalysisSectionProps) => {
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [analysisResult, setAnalysisResult] = useState<AnalysisResult | null>(null);
  const [showAnalysisDialog, setShowAnalysisDialog] = useState(false);
  const { toast } = useToast();

  const generateAnalysis = async () => {
    if (responses.length === 0) {
      toast({
        title: "No Data Available",
        description: "Cannot generate analysis without survey responses.",
        variant: "destructive",
      });
      return;
    }

    setIsAnalyzing(true);
    console.log('Starting AI analysis for', responses.length, 'responses');

    try {
      const { data, error } = await supabase.functions.invoke('generate-survey-analysis', {
        body: { surveyData: responses }
      });

      if (error) {
        console.error('Edge function error:', error);
        throw new Error(error.message || 'Failed to generate analysis');
      }

      if (!data.success) {
        throw new Error(data.error || 'Analysis generation failed');
      }

      console.log('Analysis generated successfully');
      setAnalysisResult(data);
      setShowAnalysisDialog(true);
      
      toast({
        title: "Analysis Complete",
        description: `Comprehensive analysis generated for ${data.metadata.totalResponses} responses (${data.metadata.validResponses || data.metadata.totalResponses} complete). Analysis quality: ${data.metadata.analysisLength || 0} characters.`,
      });

    } catch (error: any) {
      console.error('Error generating analysis:', error);
      toast({
        title: "Analysis Failed", 
        description: error.message || "Failed to generate AI analysis. Please try again.",
        variant: "destructive",
      });
    } finally {
      setIsAnalyzing(false);
    }
  };

  const exportAnalysisToPDF = () => {
    if (!analysisResult) return;

    try {
      const pdf = new jsPDF('p', 'pt', 'a4');
      const pageWidth = pdf.internal.pageSize.width;
      const pageHeight = pdf.internal.pageSize.height;
      const margin = 40;
      const lineHeight = 16;
      let yPosition = 60;

      // Helper function to add new page if needed
      const checkPageBreak = (neededSpace = lineHeight) => {
        if (yPosition + neededSpace > pageHeight - margin) {
          pdf.addPage();
          yPosition = margin;
          return true;
        }
        return false;
      };

      // Helper function to parse and format markdown text
      const renderMarkdownToPDF = (text: string) => {
        const lines = text.split('\n');
        
        for (const line of lines) {
          checkPageBreak();
          
          // Handle headers
          if (line.startsWith('# ')) {
            pdf.setFontSize(18);
            pdf.setFont('helvetica', 'bold');
            pdf.text(line.substring(2), margin, yPosition);
            yPosition += 25;
          } else if (line.startsWith('## ')) {
            pdf.setFontSize(16);
            pdf.setFont('helvetica', 'bold');
            pdf.text(line.substring(3), margin, yPosition);
            yPosition += 22;
          } else if (line.startsWith('### ')) {
            pdf.setFontSize(14);
            pdf.setFont('helvetica', 'bold');
            pdf.text(line.substring(4), margin, yPosition);
            yPosition += 20;
          } else if (line.startsWith('**') && line.endsWith('**')) {
            // Bold text (section headers)
            pdf.setFontSize(12);
            pdf.setFont('helvetica', 'bold');
            const cleanText = line.replace(/\*\*/g, '');
            pdf.text(cleanText, margin, yPosition);
            yPosition += 18;
          } else if (line.startsWith('*') && line.endsWith('*') && !line.startsWith('**')) {
            // Italic text
            pdf.setFontSize(11);
            pdf.setFont('helvetica', 'italic');
            const cleanText = line.replace(/\*/g, '');
            const splitLines = pdf.splitTextToSize(cleanText, pageWidth - 2 * margin);
            for (const splitLine of splitLines) {
              checkPageBreak();
              pdf.text(splitLine, margin, yPosition);
              yPosition += lineHeight;
            }
          } else if (line.startsWith('- ') || line.startsWith('• ')) {
            // Bullet points
            pdf.setFontSize(11);
            pdf.setFont('helvetica', 'normal');
            const bulletText = line.startsWith('- ') ? line.substring(2) : line.substring(2);
            const splitLines = pdf.splitTextToSize(`• ${bulletText}`, pageWidth - 2 * margin - 20);
            for (const splitLine of splitLines) {
              checkPageBreak();
              pdf.text(splitLine, margin + 20, yPosition);
              yPosition += lineHeight;
            }
          } else if (line.match(/^\d+\. /)) {
            // Numbered lists
            pdf.setFontSize(11);
            pdf.setFont('helvetica', 'normal');
            const splitLines = pdf.splitTextToSize(line, pageWidth - 2 * margin - 20);
            for (const splitLine of splitLines) {
              checkPageBreak();
              pdf.text(splitLine, margin + 20, yPosition);
              yPosition += lineHeight;
            }
          } else if (line.trim() === '') {
            // Empty line - add space
            yPosition += lineHeight / 2;
          } else {
            // Regular paragraph text
            pdf.setFontSize(11);
            pdf.setFont('helvetica', 'normal');
            const splitLines = pdf.splitTextToSize(line, pageWidth - 2 * margin);
            for (const splitLine of splitLines) {
              checkPageBreak();
              pdf.text(splitLine, margin, yPosition);
              yPosition += lineHeight;
            }
          }
        }
      };

      // Title
      pdf.setFontSize(20);
      pdf.setFont('helvetica', 'bold');
      pdf.text('Survey Analysis Report', margin, yPosition);
      yPosition += 40;

      // Metadata
      pdf.setFontSize(10);
      pdf.setFont('helvetica', 'normal');
      pdf.text(`Generated: ${new Date(analysisResult.metadata.generatedAt).toLocaleString()}`, margin, yPosition);
      yPosition += lineHeight;
      pdf.text(`Total Responses: ${analysisResult.metadata.totalResponses}`, margin, yPosition);
      yPosition += lineHeight;
      if (analysisResult.metadata.validResponses) {
        pdf.text(`Valid Responses: ${analysisResult.metadata.validResponses} (${analysisResult.metadata.responseRate?.toFixed(1)}% quality)`, margin, yPosition);
        yPosition += lineHeight;
      }
      if (analysisResult.metadata.commentsCount !== undefined) {
        pdf.text(`Comments: ${analysisResult.metadata.commentsCount}`, margin, yPosition);
        yPosition += lineHeight;
      }
      pdf.text(`AI Model: ${analysisResult.metadata.model}`, margin, yPosition);
      yPosition += 30;

      // Analysis content with markdown formatting
      renderMarkdownToPDF(analysisResult.analysis);

      pdf.save('survey-ai-analysis.pdf');
      
      toast({
        title: "Export Successful",
        description: "AI analysis exported to PDF with formatting successfully.",
      });

    } catch (error: any) {
      console.error('PDF export error:', error);
      toast({
        title: "Export Failed",
        description: error.message || "Failed to export analysis to PDF.",
        variant: "destructive",
      });
    }
  };

  

  return (
    <>
      <Card className="mb-8">
        <CardHeader>
          <div className="flex items-center justify-between">
            <CardTitle className="flex items-center gap-2">
              <BrainCircuitIcon className="h-5 w-5" />
              AI-Powered Analysis
              {analysisResult && (
                <Badge variant="default">
                  <SparklesIcon className="h-3 w-3 mr-1" />
                  Ready
                </Badge>
              )}
            </CardTitle>
            <div className="flex gap-2">
              {analysisResult && (
                <>
                  <Button onClick={exportAnalysisToPDF} variant="outline" size="sm">
                    <DownloadIcon className="h-4 w-4 mr-2" />
                    Export PDF
                  </Button>
                  <Button 
                    onClick={() => setShowAnalysisDialog(true)} 
                    variant="outline" 
                    size="sm"
                  >
                    View Analysis
                  </Button>
                </>
              )}
              <Button 
                onClick={generateAnalysis}
                disabled={isAnalyzing || responses.length < 5}
                className="bg-primary hover:bg-primary/90"
              >
                {isAnalyzing ? (
                  <>
                    <RefreshCwIcon className="h-4 w-4 mr-2 animate-spin" />
                    Analyzing...
                  </>
                ) : (
                  <>
                    <SparklesIcon className="h-4 w-4 mr-2" />
                    Generate AI Analysis
                  </>
                )}
              </Button>
            </div>
          </div>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            <div className="bg-muted/50 rounded-lg p-6 space-y-4">
              <div className="flex items-center gap-3">
                <div className="h-2 w-2 rounded-full bg-primary"></div>
                <span className="font-medium">Comprehensive AI Analysis</span>
              </div>
              <p className="text-sm text-muted-foreground leading-relaxed">
                Generate an in-depth analysis of survey results using advanced AI. The analysis includes:
                executive summary, regional comparisons, division breakdowns, role-based insights, 
                score pattern analysis, sentiment analysis of comments, and strategic recommendations.
              </p>
              
              {responses.length < 5 && (
                <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-3">
                  <p className="text-sm text-yellow-800">
                    <strong>Minimum 5 responses required</strong> for AI analysis. 
                    Currently have {responses.length} responses.
                  </p>
                </div>
              )}

              {analysisResult && (
                <div className="bg-green-50 border border-green-200 rounded-lg p-3">
                  <p className="text-sm text-green-800">
                    <strong>Analysis Ready:</strong> Generated on {' '}
                    {new Date(analysisResult.metadata.generatedAt).toLocaleDateString()} for {' '}
                    {analysisResult.metadata.totalResponses} responses 
                    {analysisResult.metadata.validResponses && 
                      ` (${analysisResult.metadata.validResponses} complete, ${analysisResult.metadata.responseRate?.toFixed(1)}% quality)`
                    }
                    {analysisResult.metadata.commentsCount !== undefined && 
                      `, ${analysisResult.metadata.commentsCount} comments`
                    } using {analysisResult.metadata.model}.
                  </p>
                </div>
              )}
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Analysis Results Dialog */}
      <Dialog open={showAnalysisDialog} onOpenChange={setShowAnalysisDialog}>
        <DialogContent className="max-w-4xl max-h-[80vh]">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <BrainCircuitIcon className="h-5 w-5" />
              AI Survey Analysis Results
              {analysisResult && (
                <Badge variant="secondary" className="ml-2">
                  {analysisResult.metadata.totalResponses} responses
                </Badge>
              )}
            </DialogTitle>
          </DialogHeader>
          
          {analysisResult && (
            <ScrollArea className="max-h-[60vh]">
              <div className="space-y-6 pr-4">
                {/* Metadata */}
                <div className="border-b pb-4">
                  <div className="grid grid-cols-3 gap-4 text-sm">
                    <div>
                      <strong>Generated:</strong> {' '}
                      {new Date(analysisResult.metadata.generatedAt).toLocaleString()}
                    </div>
                    <div>
                      <strong>Total Responses:</strong> {analysisResult.metadata.totalResponses}
                    </div>
                    <div>
                      <strong>AI Model:</strong> {analysisResult.metadata.model}
                    </div>
                  </div>
                </div>

                {/* Analysis Content */}
                <div className="prose prose-sm max-w-none prose-headings:text-foreground prose-p:text-foreground prose-strong:text-foreground prose-li:text-foreground">
                  <ReactMarkdown
                    components={{
                      h1: ({ children }) => <h1 className="text-2xl font-bold mt-6 mb-4 text-foreground">{children}</h1>,
                      h2: ({ children }) => <h2 className="text-xl font-semibold mt-5 mb-3 text-foreground">{children}</h2>,
                      h3: ({ children }) => <h3 className="text-lg font-medium mt-4 mb-2 text-foreground">{children}</h3>,
                      p: ({ children }) => <p className="mb-3 leading-relaxed text-foreground">{children}</p>,
                      ul: ({ children }) => <ul className="mb-4 pl-6 space-y-1">{children}</ul>,
                      ol: ({ children }) => <ol className="mb-4 pl-6 space-y-1 list-decimal">{children}</ol>,
                      li: ({ children }) => <li className="text-foreground">{children}</li>,
                      strong: ({ children }) => <strong className="font-semibold text-foreground">{children}</strong>,
                      code: ({ children }) => <code className="bg-muted px-1 py-0.5 rounded text-sm font-mono">{children}</code>,
                      blockquote: ({ children }) => <blockquote className="border-l-4 border-primary pl-4 italic my-4 text-muted-foreground">{children}</blockquote>,
                    }}
                  >
                    {analysisResult.analysis}
                  </ReactMarkdown>
                </div>
              </div>
            </ScrollArea>
          )}
        </DialogContent>
      </Dialog>
    </>
  );
};