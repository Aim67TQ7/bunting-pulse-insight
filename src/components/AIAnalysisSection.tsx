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
import buntingLogo from '@/assets/bunting-logo.png';

interface AIAnalysisSurveyResponse {
  id: string;
  continent: string;
  division: string;
  role: string;
  submitted_at: string;
  completion_time_seconds: number;
  responses_jsonb: {
    question_id: string;
    question_type: string;
    answer_value: any;
  }[];
}

interface AIAnalysisSectionProps {
  responses: AIAnalysisSurveyResponse[];
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
    const margin = 50;
    const lineHeight = 18;
    let yPosition = margin;
    let currentPage = 1;

    // Brand colors (RGB for jsPDF)
    const colors = {
      primary: [59, 130, 246] as [number, number, number],
      purple: [139, 92, 246] as [number, number, number],
      pink: [236, 72, 153] as [number, number, number],
      green: [16, 185, 129] as [number, number, number],
      orange: [245, 158, 11] as [number, number, number],
      text: [51, 65, 85] as [number, number, number],
      textLight: [100, 116, 139] as [number, number, number],
      divider: [220, 220, 230] as [number, number, number]
    };

    // Calculate metrics
    const calculateMetrics = () => {
      const totalResponses = responses.length;
      const ratingResponses = responses.flatMap(r => 
        r.responses_jsonb.filter((q: any) => q.question_type === 'rating')
      );
      const avgEngagement = ratingResponses.length > 0
        ? ratingResponses.reduce((sum, r: any) => sum + (r.answer_value?.rating || 0), 0) / ratingResponses.length
        : 0;
      const avgCompletionTime = responses.reduce((sum, r) => sum + (r.completion_time_seconds || 0), 0) / totalResponses / 60;
      const commentsCount = responses.filter(r => 
        r.responses_jsonb.some((q: any) => q.question_type === 'text' && q.answer_value?.text)
      ).length;

      return { totalResponses, avgEngagement, avgCompletionTime, commentsCount };
    };

    const metrics = calculateMetrics();

    // Helper: Page header
    const addPageHeader = (pageNum: number) => {
      if (pageNum > 1) {
        pdf.addImage(buntingLogo, 'PNG', margin, 20, 60, 20);
        pdf.setFontSize(10);
        pdf.setTextColor(...colors.textLight);
        pdf.text('Survey Analysis Report', pageWidth - margin - 100, 30);
        pdf.setDrawColor(...colors.divider);
        pdf.line(margin, 50, pageWidth - margin, 50);
      }
    };

    // Helper: Page footer
    const addPageFooter = (pageNum: number) => {
      pdf.setFontSize(8);
      pdf.setTextColor(...colors.textLight);
      pdf.text('Confidential - Internal Use Only', margin, pageHeight - 20);
      pdf.text(`Page ${pageNum}`, pageWidth / 2, pageHeight - 20, { align: 'center' });
      pdf.text(new Date().toLocaleDateString(), pageWidth - margin, pageHeight - 20, { align: 'right' });
    };

    // Helper: Check page break
    const checkPageBreak = (neededSpace: number = lineHeight) => {
      if (yPosition + neededSpace > pageHeight - margin - 40) {
        addPageFooter(currentPage);
        pdf.addPage();
        currentPage++;
        yPosition = 70;
        addPageHeader(currentPage);
        return true;
      }
      return false;
    };

    // ========== COVER PAGE ==========
    pdf.addImage(buntingLogo, 'PNG', (pageWidth - 120) / 2, 80, 120, 40);
    
    yPosition = 180;
    pdf.setFontSize(32);
    pdf.setFont('helvetica', 'bold');
    pdf.setTextColor(...colors.primary);
    pdf.text('SURVEY ANALYSIS REPORT', pageWidth / 2, yPosition, { align: 'center' });
    
    yPosition += 20;
    pdf.setDrawColor(...colors.purple);
    pdf.setLineWidth(3);
    pdf.line(pageWidth / 2 - 150, yPosition, pageWidth / 2 + 150, yPosition);
    
    yPosition += 50;
    pdf.setFontSize(16);
    pdf.setFont('helvetica', 'normal');
    pdf.setTextColor(...colors.text);
    pdf.text('Comprehensive Employee Survey Results', pageWidth / 2, yPosition, { align: 'center' });
    
    yPosition += 80;
    pdf.setFontSize(12);
    pdf.setTextColor(...colors.textLight);
    pdf.text(`Total Responses: ${metrics.totalResponses}`, pageWidth / 2, yPosition, { align: 'center' });
    yPosition += 25;
    pdf.text(`Generated: ${new Date().toLocaleDateString('en-US', { month: 'long', day: 'numeric', year: 'numeric' })}`, pageWidth / 2, yPosition, { align: 'center' });
    yPosition += 25;
    pdf.text(`Survey Period: October 15 - November 23, 2025`, pageWidth / 2, yPosition, { align: 'center' });
    
    yPosition = pageHeight - 80;
    pdf.setDrawColor(...colors.divider);
    pdf.line(margin, yPosition, pageWidth - margin, yPosition);
    yPosition += 20;
    pdf.setFontSize(10);
    pdf.text('Confidential - Internal Use Only', pageWidth / 2, yPosition, { align: 'center' });

    // ========== EXECUTIVE SUMMARY PAGE ==========
    pdf.addPage();
    currentPage++;
    yPosition = 70;
    addPageHeader(currentPage);
    
    pdf.setFontSize(24);
    pdf.setFont('helvetica', 'bold');
    pdf.setTextColor(...colors.purple);
    pdf.text('Executive Summary', margin, yPosition);
    yPosition += 40;

    // Key Metrics Dashboard (4 boxes)
    const boxWidth = (pageWidth - 2 * margin - 20) / 2;
    const boxHeight = 80;
    const boxGap = 20;

    const metricsBoxes = [
      { label: 'Total Responses', value: metrics.totalResponses.toString(), color: colors.purple },
      { label: 'Engagement Score', value: metrics.avgEngagement.toFixed(1), color: colors.pink },
      { label: 'Avg Completion', value: `${Math.round(metrics.avgCompletionTime)}m`, color: colors.green },
      { label: 'Comments Received', value: metrics.commentsCount.toString(), color: colors.orange }
    ];

    metricsBoxes.forEach((box, idx) => {
      const row = Math.floor(idx / 2);
      const col = idx % 2;
      const boxX = margin + col * (boxWidth + boxGap);
      const boxY = yPosition + row * (boxHeight + boxGap);

      // Box background with light tint
      pdf.setFillColor(box.color[0], box.color[1], box.color[2]);
      pdf.setGState(pdf.GState({ opacity: 0.1 }));
      pdf.roundedRect(boxX, boxY, boxWidth, boxHeight, 8, 8, 'F');
      pdf.setGState(pdf.GState({ opacity: 1 }));

      // Value
      pdf.setFontSize(32);
      pdf.setFont('helvetica', 'bold');
      pdf.setTextColor(...box.color);
      pdf.text(box.value, boxX + 20, boxY + 45);

      // Label
      pdf.setFontSize(12);
      pdf.setFont('helvetica', 'normal');
      pdf.setTextColor(...colors.text);
      pdf.text(box.label, boxX + 20, boxY + 65);
    });

    yPosition += (boxHeight * 2) + boxGap + 40;
    addPageFooter(currentPage);

    // ========== DEMOGRAPHICS PAGE ==========
    pdf.addPage();
    currentPage++;
    yPosition = 70;
    addPageHeader(currentPage);

    pdf.setFontSize(24);
    pdf.setFont('helvetica', 'bold');
    pdf.setTextColor(...colors.purple);
    pdf.text('Demographic Breakdown', margin, yPosition);
    yPosition += 40;

    // Get demographic data
    const getDemographicData = (field: 'continent' | 'division' | 'role') => {
      const counts = new Map<string, number>();
      responses.forEach(r => {
        const val = r[field];
        if (val) counts.set(val, (counts.get(val) || 0) + 1);
      });
      return Array.from(counts.entries()).map(([name, value]) => ({ name, value }));
    };

    const continentData = getDemographicData('continent');
    const divisionData = getDemographicData('division');
    const roleData = getDemographicData('role');

    // Display demographic stats as text lists
    pdf.setFontSize(14);
    pdf.setFont('helvetica', 'bold');
    pdf.setTextColor(...colors.text);
    pdf.text('By Continent:', margin, yPosition);
    yPosition += 20;

    pdf.setFontSize(11);
    pdf.setFont('helvetica', 'normal');
    continentData.forEach(item => {
      checkPageBreak(20);
      const percentage = ((item.value / metrics.totalResponses) * 100).toFixed(1);
      pdf.text(`• ${item.name}: ${item.value} responses (${percentage}%)`, margin + 20, yPosition);
      yPosition += 18;
    });

    yPosition += 10;
    pdf.setFontSize(14);
    pdf.setFont('helvetica', 'bold');
    pdf.text('By Division:', margin, yPosition);
    yPosition += 20;

    pdf.setFontSize(11);
    pdf.setFont('helvetica', 'normal');
    divisionData.forEach(item => {
      checkPageBreak(20);
      const percentage = ((item.value / metrics.totalResponses) * 100).toFixed(1);
      pdf.text(`• ${item.name}: ${item.value} responses (${percentage}%)`, margin + 20, yPosition);
      yPosition += 18;
    });

    yPosition += 10;
    pdf.setFontSize(14);
    pdf.setFont('helvetica', 'bold');
    pdf.text('By Role:', margin, yPosition);
    yPosition += 20;

    pdf.setFontSize(11);
    pdf.setFont('helvetica', 'normal');
    roleData.forEach(item => {
      checkPageBreak(20);
      const percentage = ((item.value / metrics.totalResponses) * 100).toFixed(1);
      pdf.text(`• ${item.name}: ${item.value} responses (${percentage}%)`, margin + 20, yPosition);
      yPosition += 18;
    });

    addPageFooter(currentPage);

    // ========== AI ANALYSIS CONTENT ==========
    pdf.addPage();
    currentPage++;
    yPosition = 70;
    addPageHeader(currentPage);

    pdf.setFontSize(24);
    pdf.setFont('helvetica', 'bold');
    pdf.setTextColor(...colors.purple);
    pdf.text('Detailed Analysis', margin, yPosition);
    yPosition += 40;

    // Helper function to render markdown
    const renderMarkdownToPDF = (text: string) => {
      const lines = text.split('\n');
      
      for (let line of lines) {
        checkPageBreak(lineHeight + 5);
        
        if (line.startsWith('#### ')) {
          pdf.setFontSize(12);
          pdf.setFont('helvetica', 'bold');
          pdf.setTextColor(...colors.text);
          pdf.text(line.substring(5), margin, yPosition);
          yPosition += 20;
        } else if (line.startsWith('### ')) {
          pdf.setFontSize(14);
          pdf.setFont('helvetica', 'bold');
          pdf.setTextColor(...colors.purple);
          pdf.text(line.substring(4), margin, yPosition);
          yPosition += 24;
        } else if (line.startsWith('## ')) {
          pdf.setFontSize(16);
          pdf.setFont('helvetica', 'bold');
          pdf.setTextColor(...colors.purple);
          pdf.text(line.substring(3), margin, yPosition);
          yPosition += 28;
        } else if (line.startsWith('# ')) {
          pdf.setFontSize(18);
          pdf.setFont('helvetica', 'bold');
          pdf.setTextColor(...colors.purple);
          pdf.text(line.substring(2), margin, yPosition);
          yPosition += 30;
        } else if (line.startsWith('- ') || line.startsWith('• ')) {
          pdf.setFontSize(11);
          pdf.setFont('helvetica', 'normal');
          pdf.setTextColor(...colors.text);
          const bulletText = line.substring(2).replace(/\*\*/g, '').replace(/\*/g, '');
          const splitLines = pdf.splitTextToSize(`• ${bulletText}`, pageWidth - 2 * margin - 20);
          
          // Check if we have space for ALL lines before rendering
          const totalHeight = splitLines.length * lineHeight;
          checkPageBreak(totalHeight + 5);
          
          splitLines.forEach((splitLine: string) => {
            pdf.text(splitLine, margin + 20, yPosition);
            yPosition += lineHeight;
          });
        } else if (line.match(/^\d+\. /)) {
          pdf.setFontSize(11);
          pdf.setFont('helvetica', 'normal');
          pdf.setTextColor(...colors.text);
          const cleanText = line.replace(/\*\*/g, '').replace(/\*/g, '');
          const splitLines = pdf.splitTextToSize(cleanText, pageWidth - 2 * margin - 20);
          
          // Check if we have space for ALL lines before rendering
          const totalHeight = splitLines.length * lineHeight;
          checkPageBreak(totalHeight + 5);
          
          splitLines.forEach((splitLine: string) => {
            pdf.text(splitLine, margin + 20, yPosition);
            yPosition += lineHeight;
          });
        } else if (line.trim() === '') {
          yPosition += lineHeight / 2;
        } else {
          pdf.setFontSize(11);
          pdf.setFont('helvetica', 'normal');
          pdf.setTextColor(...colors.text);
          const cleanText = line.replace(/\*\*/g, '').replace(/\*/g, '').replace(/`/g, '');
          const splitLines = pdf.splitTextToSize(cleanText, pageWidth - 2 * margin);
          
          // Check if we have space for ALL lines before rendering
          const totalHeight = splitLines.length * lineHeight;
          checkPageBreak(totalHeight + 5);
          
          splitLines.forEach((splitLine: string) => {
            pdf.text(splitLine, margin, yPosition);
            yPosition += lineHeight;
          });
        }
      }
    };

    // Render analysis content
    renderMarkdownToPDF(result.analysis);

    // Add final footer
    addPageFooter(currentPage);

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
          description: "AI analysis exported to PDF successfully.",
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

  const downloadSavedReport = async (report: any) => {
    try {
      // Try to fetch PDF from storage first
      if (report.pdf_url) {
        const response = await fetch(report.pdf_url);
        if (response.ok) {
          const blob = await response.blob();
          if (blob.size > 1000) { // Validate PDF is not empty
            const url = URL.createObjectURL(blob);
            const link = document.createElement('a');
            link.href = url;
            link.download = `survey-analysis-${new Date(report.created_at).toLocaleDateString()}.pdf`;
            link.click();
            URL.revokeObjectURL(url);
            toast({
              title: "Download Successful",
              description: "Report downloaded successfully.",
            });
            return;
          }
        }
      }

      // Fallback: Regenerate PDF from saved analysis text
      toast({
        title: "Regenerating PDF",
        description: "Creating PDF from saved report...",
      });

      const result: AnalysisResult = {
        analysis: report.analysis_text,
        metadata: {
          totalResponses: report.total_responses,
          generatedAt: report.generated_at,
        }
      };

      const blob = await generatePDFBlob(result);
      const url = URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url;
      link.download = `survey-analysis-${new Date(report.created_at).toLocaleDateString()}.pdf`;
      link.click();
      URL.revokeObjectURL(url);

      toast({
        title: "Download Successful",
        description: "Report regenerated and downloaded successfully.",
      });
    } catch (error: any) {
      console.error('Error downloading report:', error);
      toast({
        title: "Download Failed",
        description: error.message || "Failed to download report. Please try again.",
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
                    {analysisResult.metadata.totalResponses} responses.
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
                    <Button 
                      variant="outline" 
                      size="sm"
                      onClick={() => {
                        setAnalysisResult({
                          analysis: report.analysis_text,
                          metadata: {
                            totalResponses: report.total_responses,
                            generatedAt: report.generated_at,
                          }
                        });
                        setShowAnalysisDialog(true);
                      }}
                    >
                      View
                    </Button>
                    <Button 
                      variant="outline" 
                      size="sm"
                      onClick={() => downloadSavedReport(report)}
                    >
                      <DownloadIcon className="h-3 w-3 mr-1" />
                      PDF
                    </Button>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}

      {/* Analysis Dialog */}
      <Dialog open={showAnalysisDialog} onOpenChange={setShowAnalysisDialog}>
        <DialogContent className="max-w-4xl max-h-[80vh]">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <SparklesIcon className="h-5 w-5" />
              AI Analysis Results
            </DialogTitle>
          </DialogHeader>
          <ScrollArea className="h-[60vh] pr-4">
            {analysisResult && (
              <div className="space-y-4">
                <div className="bg-muted/50 rounded-lg p-4 space-y-2">
                  <div className="flex items-center justify-between">
                    <span className="text-sm font-medium">Analysis Metadata</span>
                  </div>
                  <div className="text-xs text-muted-foreground space-y-1">
                    <p>Total Responses: {analysisResult.metadata.totalResponses}</p>
                    <p>Generated: {new Date(analysisResult.metadata.generatedAt).toLocaleString()}</p>
                  </div>
                </div>
                <div className="prose prose-sm max-w-none">
                  <ReactMarkdown>{analysisResult.analysis}</ReactMarkdown>
                </div>
              </div>
            )}
          </ScrollArea>
        </DialogContent>
      </Dialog>
    </>
  );
};
