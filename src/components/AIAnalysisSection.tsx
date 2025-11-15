import { useState, useEffect } from "react";
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

interface DynamicSurveyResponse {
  id: string;
  continent: string;
  division: string;
  role: string;
  submitted_at: string;
  completion_time_seconds: number;
  responses: {
    question_id: string;
    question_type: string;
    answer_value: any;
  }[];
}

interface AIAnalysisSectionProps {
  responses: DynamicSurveyResponse[];
  isSurveyComplete: boolean;
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

export const AIAnalysisSection = ({ responses, isSurveyComplete }: AIAnalysisSectionProps) => {
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [analysisResult, setAnalysisResult] = useState<AnalysisResult | null>(null);
  const [showAnalysisDialog, setShowAnalysisDialog] = useState(false);
  const [savedReports, setSavedReports] = useState<any[]>([]);
  const { toast } = useToast();

  // Load existing reports on mount
  useEffect(() => {
    loadSavedReports();
  }, []);

  const loadSavedReports = async () => {
    const { data, error } = await supabase
      .from('survey_analysis_reports')
      .select('*')
      .order('created_at', { ascending: false })
      .limit(5);

    if (!error && data) {
      setSavedReports(data);
      // If there's a recent report, set it as the current analysis
      if (data.length > 0 && !analysisResult) {
        setAnalysisResult({
          analysis: data[0].analysis_text,
          metadata: {
            totalResponses: data[0].total_responses,
            generatedAt: data[0].generated_at,
            model: 'gemini-2.5-flash',
          }
        });
      }
    }
  };

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
      
      // Create properly structured result with metadata
      const result: AnalysisResult = {
        analysis: data.analysis,
        metadata: {
          totalResponses: responses.length,
          generatedAt: new Date().toISOString(),
          model: 'gpt-4o'
        }
      };
      
      setAnalysisResult(result);

      // Generate and upload PDF
      const pdfBlob = await generatePDFBlob(result);
      const fileName = `survey-analysis-${Date.now()}-${crypto.randomUUID()}.pdf`;
      
      const { data: uploadData, error: uploadError } = await supabase.storage
        .from('pdfs')
        .upload(fileName, pdfBlob, {
          contentType: 'application/pdf',
          cacheControl: '3600',
          upsert: false
        });

      if (uploadError) {
        console.error('Error uploading PDF:', uploadError);
        toast({
          title: "PDF Upload Failed",
          description: "Analysis saved but PDF upload failed. You can still export manually.",
          variant: "destructive",
        });
      }

      const pdfUrl = uploadData ? supabase.storage.from('pdfs').getPublicUrl(fileName).data.publicUrl : null;

      // Save to database with PDF URL
      const { error: saveError } = await supabase
        .from('survey_analysis_reports')
        .insert({
          analysis_text: result.analysis,
          total_responses: result.metadata.totalResponses,
          generated_at: result.metadata.generatedAt,
          pdf_url: pdfUrl,
        });

      if (saveError) {
        console.error('Error saving analysis:', saveError);
      } else {
        loadSavedReports(); // Reload reports list
      }

      setShowAnalysisDialog(true);
      
      toast({
        title: "Analysis Complete",
        description: `Comprehensive analysis generated and saved for ${data.metadata.totalResponses} responses.`,
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

  const generatePDFBlob = async (result: AnalysisResult): Promise<Blob> => {
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
        
        for (let line of lines) {
          checkPageBreak();
          
          // Handle headers
          if (line.startsWith('#### ')) {
            pdf.setFontSize(12);
            pdf.setFont('helvetica', 'bold');
            pdf.text(line.substring(5), margin, yPosition);
            yPosition += 18;
          } else if (line.startsWith('### ')) {
            pdf.setFontSize(14);
            pdf.setFont('helvetica', 'bold');
            pdf.text(line.substring(4), margin, yPosition);
            yPosition += 20;
          } else if (line.startsWith('## ')) {
            pdf.setFontSize(16);
            pdf.setFont('helvetica', 'bold');
            pdf.text(line.substring(3), margin, yPosition);
            yPosition += 22;
          } else if (line.startsWith('# ')) {
            pdf.setFontSize(18);
            pdf.setFont('helvetica', 'bold');
            pdf.text(line.substring(2), margin, yPosition);
            yPosition += 25;
          } else if (line.startsWith('- ') || line.startsWith('• ')) {
            // Bullet points - clean markdown
            pdf.setFontSize(11);
            pdf.setFont('helvetica', 'normal');
            const bulletText = line.startsWith('- ') ? line.substring(2) : line.substring(2);
            const cleanText = bulletText.replace(/\*\*/g, '').replace(/\*/g, '');
            const splitLines = pdf.splitTextToSize(`• ${cleanText}`, pageWidth - 2 * margin - 20);
            for (const splitLine of splitLines) {
              checkPageBreak();
              pdf.text(splitLine, margin + 20, yPosition);
              yPosition += lineHeight;
            }
          } else if (line.match(/^\d+\. /)) {
            // Numbered lists - clean markdown
            pdf.setFontSize(11);
            pdf.setFont('helvetica', 'normal');
            const cleanText = line.replace(/\*\*/g, '').replace(/\*/g, '');
            const splitLines = pdf.splitTextToSize(cleanText, pageWidth - 2 * margin - 20);
            for (const splitLine of splitLines) {
              checkPageBreak();
              pdf.text(splitLine, margin + 20, yPosition);
              yPosition += lineHeight;
            }
          } else if (line.trim() === '') {
            // Empty line - add space
            yPosition += lineHeight / 2;
          } else {
            // Regular paragraph text - clean all markdown symbols
            pdf.setFontSize(11);
            
            // Remove markdown formatting but identify bold sections
            const hasBold = line.includes('**');
            
            if (hasBold && line.startsWith('**') && line.indexOf('**', 2) !== -1) {
              // Line starts with bold text
              const endBold = line.indexOf('**', 2);
              const boldPart = line.substring(2, endBold);
              const restPart = line.substring(endBold + 2);
              
              // Print bold part
              pdf.setFont('helvetica', 'bold');
              pdf.text(boldPart, margin, yPosition);
              
              // Calculate width and continue with rest if exists
              const boldWidth = pdf.getTextWidth(boldPart);
              if (restPart.trim()) {
                pdf.setFont('helvetica', 'normal');
                const cleanRest = restPart.replace(/\*\*/g, '').replace(/\*/g, '');
                const splitLines = pdf.splitTextToSize(cleanRest, pageWidth - 2 * margin - boldWidth - 5);
                
                if (splitLines.length === 1) {
                  pdf.text(splitLines[0], margin + boldWidth + 5, yPosition);
                  yPosition += lineHeight;
                } else {
                  yPosition += lineHeight;
                  for (const splitLine of splitLines) {
                    checkPageBreak();
                    pdf.text(splitLine, margin, yPosition);
                    yPosition += lineHeight;
                  }
                }
              } else {
                yPosition += lineHeight;
              }
            } else {
              // No special formatting, just clean and print
              pdf.setFont('helvetica', 'normal');
              const cleanText = line.replace(/\*\*/g, '').replace(/\*/g, '').replace(/`/g, '');
              const splitLines = pdf.splitTextToSize(cleanText, pageWidth - 2 * margin);
              for (const splitLine of splitLines) {
                checkPageBreak();
                pdf.text(splitLine, margin, yPosition);
                yPosition += lineHeight;
              }
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
      pdf.text(`Generated: ${new Date(result.metadata.generatedAt).toLocaleString()}`, margin, yPosition);
      yPosition += lineHeight;
      pdf.text(`Total Responses: ${result.metadata.totalResponses}`, margin, yPosition);
      yPosition += lineHeight;
      if (result.metadata.validResponses) {
        pdf.text(`Valid Responses: ${result.metadata.validResponses} (${result.metadata.responseRate?.toFixed(1)}% quality)`, margin, yPosition);
        yPosition += lineHeight;
      }
      if (result.metadata.commentsCount !== undefined) {
        pdf.text(`Comments: ${result.metadata.commentsCount}`, margin, yPosition);
        yPosition += lineHeight;
      }
      pdf.text(`AI Model: ${result.metadata.model}`, margin, yPosition);
      yPosition += 30;

      // Analysis content with markdown formatting
      renderMarkdownToPDF(result.analysis);

      return pdf.output('blob');
  };

  const exportAnalysisToPDF = () => {
    if (!analysisResult) return;

    try {
      generatePDFBlob(analysisResult).then(blob => {
        const url = URL.createObjectURL(blob);
        const link = document.createElement('a');
        link.href = url;
        link.download = 'survey-ai-analysis.pdf';
        link.click();
        URL.revokeObjectURL(url);
        
        toast({
          title: "Export Successful",
          description: "AI analysis exported to PDF with formatting successfully.",
        });
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
                disabled={isAnalyzing || responses.length < 5 || !isSurveyComplete}
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
              
              {!isSurveyComplete && (
                <div className="bg-blue-50 border border-blue-200 rounded-lg p-3">
                  <p className="text-sm text-blue-800">
                    <strong>Survey is still active.</strong> AI Analysis will be available after the survey closes on November 23, 2025.
                  </p>
                </div>
              )}
              
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

      {/* Previous Reports */}
      {savedReports.length > 0 && (
        <Card className="mb-8">
          <CardHeader>
            <CardTitle>Previous Reports</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-2">
              {savedReports.map((report) => (
                <div 
                  key={report.id} 
                  className="flex items-center justify-between p-3 bg-muted/30 rounded-lg"
                >
                  <div className="flex-1">
                    <p className="text-sm font-medium">
                      {new Date(report.created_at).toLocaleDateString()} - {report.total_responses} responses
                    </p>
                    <p className="text-xs text-muted-foreground">
                      Generated: {new Date(report.generated_at).toLocaleString()}
                    </p>
                  </div>
                  <div className="flex gap-2">
                    {report.pdf_url && (
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={() => window.open(report.pdf_url, '_blank')}
                      >
                        <DownloadIcon className="h-3 w-3 mr-1" />
                        PDF
                      </Button>
                    )}
                    <Button
                      size="sm"
                      variant="ghost"
                      onClick={() => {
                        setAnalysisResult({
                          analysis: report.analysis_text,
                          metadata: {
                            totalResponses: report.total_responses,
                            generatedAt: report.generated_at,
                            model: 'gemini-2.5-flash',
                          }
                        });
                        setShowAnalysisDialog(true);
                      }}
                    >
                      View
                    </Button>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}

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