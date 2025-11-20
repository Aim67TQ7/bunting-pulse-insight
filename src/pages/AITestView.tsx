import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Separator } from "@/components/ui/separator";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle } from "@/components/ui/alert-dialog";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import ReactMarkdown from 'react-markdown';
import jsPDF from 'jspdf';
import { 
  BrainCircuit, 
  Play, 
  History,
  Settings,
  Filter,
  Star,
  Lock,
  FlaskConical,
  Download,
  Trash2
} from "lucide-react";

const TEST_PASSCODE = "203";

interface TestAnalysis {
  id: string;
  created_at: string;
  model_used: string;
  analysis_text: string;
  filters_applied: any;
  response_count: number;
  tokens_used?: number;
  generation_time_ms?: number;
  notes?: string;
  rating?: number;
  is_favorite: boolean;
}

export default function AITestView() {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [passcodeInput, setPasscodeInput] = useState("");
  const [responses, setResponses] = useState<any[]>([]);
  const [filterContinent, setFilterContinent] = useState("all");
  const [filterDivision, setFilterDivision] = useState("all");
  const [filteredResponses, setFilteredResponses] = useState<any[]>([]);
  const [selectedModel, setSelectedModel] = useState("google/gemini-2.5-flash");
  const [customPrompt, setCustomPrompt] = useState("");
  const [isGenerating, setIsGenerating] = useState(false);
  const [currentAnalysis, setCurrentAnalysis] = useState<TestAnalysis | null>(null);
  const [testHistory, setTestHistory] = useState<TestAnalysis[]>([]);
  const [viewDialogOpen, setViewDialogOpen] = useState(false);
  const [selectedAnalysisForView, setSelectedAnalysisForView] = useState<TestAnalysis | null>(null);
  const [deleteConfirmOpen, setDeleteConfirmOpen] = useState(false);
  const [analysisToDelete, setAnalysisToDelete] = useState<string | null>(null);
  const [isDeleting, setIsDeleting] = useState(false);
  const [isGeneratingPDF, setIsGeneratingPDF] = useState(false);
  
  const { toast } = useToast();

  const handleAuth = () => {
    if (passcodeInput === TEST_PASSCODE) {
      setIsAuthenticated(true);
      loadData();
    } else {
      toast({
        title: "Access Denied",
        description: "Invalid passcode",
        variant: "destructive"
      });
    }
  };

  const loadData = async () => {
    const { data: surveyData } = await supabase
      .from('employee_survey_responses')
      .select('*')
      .eq('is_draft', false);
    
    if (surveyData) {
      setResponses(surveyData);
      setFilteredResponses(surveyData);
    }

    const { data: historyData } = await supabase
      .from('ai_test_analyses' as any)
      .select('*')
      .order('created_at', { ascending: false });
    
    if (historyData) {
      setTestHistory(historyData as unknown as TestAnalysis[]);
    }
  };

  useEffect(() => {
    if (!isAuthenticated) return;
    
    let filtered = responses;
    if (filterContinent !== "all") {
      filtered = filtered.filter(r => r.continent === filterContinent);
    }
    if (filterDivision !== "all") {
      filtered = filtered.filter(r => r.division === filterDivision);
    }
    setFilteredResponses(filtered);
  }, [filterContinent, filterDivision, responses, isAuthenticated]);

  const generateTestAnalysis = async () => {
    setIsGenerating(true);
    const startTime = Date.now();

    try {
      const { data, error } = await supabase.functions.invoke('generate-survey-analysis', {
        body: { 
          surveyData: filteredResponses,
          testMode: true,
          model: selectedModel,
          customPrompt: customPrompt || undefined
        }
      });

      if (error) throw error;

      const generationTime = Date.now() - startTime;

      const testAnalysis: TestAnalysis = {
        id: crypto.randomUUID(),
        created_at: new Date().toISOString(),
        model_used: selectedModel,
        analysis_text: data.analysis,
        filters_applied: { continent: filterContinent, division: filterDivision },
        response_count: filteredResponses.length,
        generation_time_ms: generationTime,
        is_favorite: false
      };

      await supabase.from('ai_test_analyses' as any).insert(testAnalysis);

      setCurrentAnalysis(testAnalysis);
      setTestHistory([testAnalysis, ...testHistory]);

      toast({
        title: "Analysis Generated",
        description: `Completed in ${(generationTime / 1000).toFixed(1)}s`
      });

    } catch (error: any) {
      toast({
        title: "Generation Failed",
        description: error.message,
        variant: "destructive"
      });
    } finally {
      setIsGenerating(false);
    }
  };

  const rateAnalysis = async (id: string, rating: number) => {
    await supabase
      .from('ai_test_analyses' as any)
      .update({ rating } as any)
      .eq('id', id);
    
    setTestHistory(testHistory.map(t => 
      t.id === id ? { ...t, rating } : t
    ));
    
    if (currentAnalysis?.id === id) {
      setCurrentAnalysis({ ...currentAnalysis, rating });
    }
  };

  const toggleFavorite = async (id: string) => {
    const analysis = testHistory.find(t => t.id === id);
    if (!analysis) return;

    const newFavoriteState = !analysis.is_favorite;
    
    await supabase
      .from('ai_test_analyses' as any)
      .update({ is_favorite: newFavoriteState } as any)
      .eq('id', id);
    
    setTestHistory(testHistory.map(t => 
      t.id === id ? { ...t, is_favorite: newFavoriteState } : t
    ));
  };

  const downloadAnalysisAsPDF = async (analysis: TestAnalysis) => {
    setIsGeneratingPDF(true);
    try {
      const pdf = new jsPDF('p', 'pt', 'a4');
      const pageWidth = pdf.internal.pageSize.width;
      const pageHeight = pdf.internal.pageSize.height;
      const margin = 40;
      const lineHeight = 16;
      let yPosition = 60;

      const checkPageBreak = (neededSpace = lineHeight) => {
        if (yPosition + neededSpace > pageHeight - margin) {
          pdf.addPage();
          yPosition = margin;
          return true;
        }
        return false;
      };

      // Header
      pdf.setFontSize(20);
      pdf.setFont('helvetica', 'bold');
      pdf.text('AI Test Analysis Report', margin, yPosition);
      yPosition += 30;

      // Metadata
      pdf.setFontSize(10);
      pdf.setFont('helvetica', 'normal');
      pdf.text(`Model: ${analysis.model_used}`, margin, yPosition);
      yPosition += 15;
      pdf.text(`Response Count: ${analysis.response_count}`, margin, yPosition);
      yPosition += 15;
      pdf.text(`Generated: ${new Date(analysis.created_at).toLocaleString()}`, margin, yPosition);
      yPosition += 15;
      if (analysis.rating) {
        pdf.text(`Rating: ${'★'.repeat(analysis.rating)}${'☆'.repeat(5 - analysis.rating)}`, margin, yPosition);
        yPosition += 15;
      }
      yPosition += 10;

      // Analysis content
      const lines = analysis.analysis_text.split('\n');
      for (let line of lines) {
        checkPageBreak();
        
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
          yPosition += lineHeight / 2;
        } else {
          pdf.setFontSize(11);
          pdf.setFont('helvetica', 'normal');
          const cleanText = line.replace(/\*\*/g, '').replace(/\*/g, '');
          const splitLines = pdf.splitTextToSize(cleanText, pageWidth - 2 * margin);
          for (const splitLine of splitLines) {
            checkPageBreak();
            pdf.text(splitLine, margin, yPosition);
            yPosition += lineHeight;
          }
        }
      }

      const dateStr = new Date(analysis.created_at).toISOString().split('T')[0];
      pdf.save(`ai-test-analysis-${dateStr}.pdf`);

      toast({
        title: "PDF Downloaded",
        description: "Analysis report has been downloaded successfully"
      });
    } catch (error: any) {
      toast({
        title: "PDF Generation Failed",
        description: error.message,
        variant: "destructive"
      });
    } finally {
      setIsGeneratingPDF(false);
    }
  };

  const deleteAnalysis = async () => {
    if (!analysisToDelete) return;
    
    setIsDeleting(true);
    try {
      const { error } = await supabase
        .from('ai_test_analyses' as any)
        .delete()
        .eq('id', analysisToDelete);

      if (error) throw error;

      setTestHistory(testHistory.filter(t => t.id !== analysisToDelete));
      
      if (currentAnalysis?.id === analysisToDelete) {
        setCurrentAnalysis(null);
      }
      
      if (selectedAnalysisForView?.id === analysisToDelete) {
        setViewDialogOpen(false);
        setSelectedAnalysisForView(null);
      }

      toast({
        title: "Analysis Deleted",
        description: "Test analysis has been permanently deleted"
      });
    } catch (error: any) {
      toast({
        title: "Deletion Failed",
        description: error.message,
        variant: "destructive"
      });
    } finally {
      setIsDeleting(false);
      setDeleteConfirmOpen(false);
      setAnalysisToDelete(null);
    }
  };

  if (!isAuthenticated) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-purple-50 to-blue-50 flex items-center justify-center p-4">
        <Card className="w-full max-w-md">
          <CardHeader className="text-center space-y-2">
            <div className="mx-auto w-16 h-16 bg-purple-100 rounded-full flex items-center justify-center">
              <Lock className="h-8 w-8 text-purple-600" />
            </div>
            <CardTitle className="text-2xl">AI Test Lab</CardTitle>
            <p className="text-sm text-muted-foreground">Internal Use Only</p>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <label className="text-sm font-medium">Access Code</label>
              <Input
                type="password"
                value={passcodeInput}
                onChange={(e) => setPasscodeInput(e.target.value)}
                onKeyPress={(e) => e.key === 'Enter' && handleAuth()}
                placeholder="Enter passcode"
              />
            </div>
            <Button onClick={handleAuth} className="w-full">
              <Lock className="mr-2 h-4 w-4" />
              Access Test Lab
            </Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background p-4 md:p-8">
      <div className="max-w-7xl mx-auto space-y-6">
        <div className="flex items-center justify-between">
          <div className="space-y-1">
            <div className="flex items-center gap-3">
              <FlaskConical className="h-8 w-8 text-purple-600" />
              <h1 className="text-3xl font-bold">AI Analysis Testing Lab</h1>
            </div>
            <p className="text-muted-foreground">Internal use only - Test and refine AI analyses</p>
          </div>
          <Badge variant="outline" className="text-xs">
            {filteredResponses.length} responses loaded
          </Badge>
        </div>

        <Tabs defaultValue="generate" className="space-y-6">
          <TabsList className="grid w-full grid-cols-3">
            <TabsTrigger value="generate">
              <Play className="mr-2 h-4 w-4" />
              Generate
            </TabsTrigger>
            <TabsTrigger value="history">
              <History className="mr-2 h-4 w-4" />
              History ({testHistory.length})
            </TabsTrigger>
            <TabsTrigger value="settings">
              <Settings className="mr-2 h-4 w-4" />
              Settings
            </TabsTrigger>
          </TabsList>

          <TabsContent value="generate" className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <Card className="md:col-span-1">
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Filter className="h-5 w-5" />
                    Controls
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="space-y-3">
                    <label className="text-sm font-medium">Data Filters</label>
                    <Select value={filterContinent} onValueChange={setFilterContinent}>
                      <SelectTrigger>
                        <SelectValue placeholder="Continent" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="all">All Continents</SelectItem>
                        <SelectItem value="Europe">Europe</SelectItem>
                        <SelectItem value="North America">North America</SelectItem>
                      </SelectContent>
                    </Select>

                    <Select value={filterDivision} onValueChange={setFilterDivision}>
                      <SelectTrigger>
                        <SelectValue placeholder="Division" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="all">All Divisions</SelectItem>
                        <SelectItem value="Both">Both</SelectItem>
                        <SelectItem value="Equipment">Equipment</SelectItem>
                        <SelectItem value="Magnets">Magnets</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>

                  <Separator />

                  <div className="space-y-3">
                    <label className="text-sm font-medium">AI Model</label>
                    <Select value={selectedModel} onValueChange={setSelectedModel}>
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="google/gemini-2.5-flash">Gemini 2.5 Flash (Default)</SelectItem>
                        <SelectItem value="google/gemini-2.5-pro">Gemini 2.5 Pro</SelectItem>
                        <SelectItem value="google/gemini-2.5-flash-lite">Gemini 2.5 Flash Lite</SelectItem>
                        <SelectItem value="openai/gpt-5">GPT-5</SelectItem>
                        <SelectItem value="openai/gpt-5-mini">GPT-5 Mini</SelectItem>
                        <SelectItem value="openai/gpt-5-nano">GPT-5 Nano</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>

                  <Separator />

                  <div className="space-y-3">
                    <label className="text-sm font-medium">Custom Prompt (Optional)</label>
                    <Textarea
                      value={customPrompt}
                      onChange={(e) => setCustomPrompt(e.target.value)}
                      placeholder="Leave empty to use default prompt..."
                      rows={4}
                    />
                  </div>

                  <Button 
                    onClick={generateTestAnalysis} 
                    disabled={isGenerating}
                    className="w-full"
                    size="lg"
                  >
                    <BrainCircuit className="mr-2 h-5 w-5" />
                    {isGenerating ? "Generating..." : "Generate Test Analysis"}
                  </Button>
                </CardContent>
              </Card>

              <Card className="md:col-span-2">
                <CardHeader>
                  <CardTitle>Analysis Result</CardTitle>
                </CardHeader>
                <CardContent>
                  {!currentAnalysis && !isGenerating && (
                    <div className="text-center py-12 text-muted-foreground">
                      <BrainCircuit className="h-12 w-12 mx-auto mb-4 opacity-50" />
                      <p>No analysis generated yet</p>
                      <p className="text-sm mt-2">Configure settings and click Generate</p>
                    </div>
                  )}

                  {isGenerating && (
                    <div className="text-center py-12">
                      <div className="animate-spin h-8 w-8 border-4 border-primary border-t-transparent rounded-full mx-auto mb-4"></div>
                      <p className="text-muted-foreground">Generating analysis...</p>
                    </div>
                  )}

                  {currentAnalysis && !isGenerating && (
                    <ScrollArea className="h-[600px]">
                      <div className="space-y-4">
                        <div className="flex items-center justify-between flex-wrap gap-2 pb-4 border-b">
                          <div className="flex gap-2">
                            <Badge>{currentAnalysis.model_used}</Badge>
                            <Badge variant="outline">{currentAnalysis.response_count} responses</Badge>
                            {currentAnalysis.generation_time_ms && (
                              <Badge variant="outline">
                                {(currentAnalysis.generation_time_ms / 1000).toFixed(1)}s
                              </Badge>
                            )}
                          </div>
                          
                          <div className="flex gap-1">
                            {[1, 2, 3, 4, 5].map(star => (
                              <Star
                                key={star}
                                className={`h-5 w-5 cursor-pointer ${
                                  star <= (currentAnalysis.rating || 0)
                                    ? 'fill-yellow-400 text-yellow-400'
                                    : 'text-gray-300'
                                }`}
                                onClick={() => rateAnalysis(currentAnalysis.id, star)}
                              />
                            ))}
                          </div>
                        </div>

                        <div className="prose prose-sm max-w-none">
                          <ReactMarkdown>{currentAnalysis.analysis_text}</ReactMarkdown>
                        </div>
                      </div>
                    </ScrollArea>
                  )}
                </CardContent>
              </Card>
            </div>
          </TabsContent>

          <TabsContent value="history">
            <Card>
              <CardHeader>
                <CardTitle>Test History</CardTitle>
              </CardHeader>
              <CardContent>
                <ScrollArea className="h-[600px]">
                  <div className="space-y-4">
                    {testHistory.length === 0 && (
                      <p className="text-center text-muted-foreground py-8">
                        No test analyses yet
                      </p>
                    )}
                    
                    {testHistory.map(test => (
                      <Card key={test.id} className="relative">
                        <CardContent className="pt-6">
                          <div className="flex items-start justify-between gap-4">
                            <div className="space-y-2 flex-1">
                              <div className="flex items-center gap-2 flex-wrap">
                                <Badge>{test.model_used}</Badge>
                                <Badge variant="outline">{test.response_count} responses</Badge>
                                <span className="text-xs text-muted-foreground">
                                  {new Date(test.created_at).toLocaleString()}
                                </span>
                                {test.is_favorite && (
                                  <Badge variant="secondary">
                                    <Star className="h-3 w-3 mr-1 fill-yellow-400" />
                                    Favorite
                                  </Badge>
                                )}
                              </div>
                              
                              {test.rating && (
                                <div className="flex gap-1">
                                  {[1, 2, 3, 4, 5].map(star => (
                                    <Star
                                      key={star}
                                      className={`h-4 w-4 ${
                                        star <= test.rating!
                                          ? 'fill-yellow-400 text-yellow-400'
                                          : 'text-gray-300'
                                      }`}
                                    />
                                  ))}
                                </div>
                              )}
                              
                              <p className="text-sm text-muted-foreground line-clamp-2">
                                {test.analysis_text.substring(0, 150)}...
                              </p>
                            </div>
                            
                            <div className="flex gap-2">
                              <Button
                                size="sm"
                                variant="outline"
                                onClick={() => {
                                  setSelectedAnalysisForView(test);
                                  setViewDialogOpen(true);
                                }}
                              >
                                View
                              </Button>
                              <Button
                                size="sm"
                                variant="ghost"
                                onClick={() => toggleFavorite(test.id)}
                              >
                                <Star className={`h-4 w-4 ${test.is_favorite ? 'fill-yellow-400' : ''}`} />
                              </Button>
                            </div>
                          </div>
                        </CardContent>
                      </Card>
                    ))}
                  </div>
                </ScrollArea>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="settings">
            <Card>
              <CardHeader>
                <CardTitle>Settings & Information</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-2">
                  <h3 className="font-medium">About This Tool</h3>
                  <p className="text-sm text-muted-foreground">
                    This is an internal testing environment for refining AI survey analyses before the final report is generated.
                    Use this tool to:
                  </p>
                  <ul className="text-sm text-muted-foreground list-disc list-inside space-y-1">
                    <li>Test different AI models and parameters</li>
                    <li>Filter data by demographics to see how analysis changes</li>
                    <li>Compare multiple analysis versions</li>
                    <li>Rate and save favorite outputs</li>
                    <li>Refine prompts for better results</li>
                  </ul>
                </div>
                
                <Separator />
                
                <div className="space-y-2">
                  <h3 className="font-medium">Security</h3>
                  <p className="text-sm text-muted-foreground">
                    This page is protected and not linked from anywhere in the application.
                    Access URL: <code className="text-xs bg-muted px-1 py-0.5 rounded">/ai-test-internal-2025</code>
                  </p>
                </div>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>

        {/* View Dialog */}
        <Dialog open={viewDialogOpen} onOpenChange={setViewDialogOpen}>
          <DialogContent className="max-w-4xl max-h-[90vh] flex flex-col">
            <DialogHeader>
              <DialogTitle>Analysis Report</DialogTitle>
            </DialogHeader>

            {selectedAnalysisForView && (
              <div className="flex-1 overflow-hidden flex flex-col gap-4">
                <div className="flex items-center justify-between flex-wrap gap-2 pb-2 border-b">
                  <div className="flex gap-2 flex-wrap">
                    <Badge>{selectedAnalysisForView.model_used}</Badge>
                    <Badge variant="outline">{selectedAnalysisForView.response_count} responses</Badge>
                    <Badge variant="outline">
                      {new Date(selectedAnalysisForView.created_at).toLocaleString()}
                    </Badge>
                    {selectedAnalysisForView.generation_time_ms && (
                      <Badge variant="outline">
                        {(selectedAnalysisForView.generation_time_ms / 1000).toFixed(1)}s
                      </Badge>
                    )}
                  </div>
                  
                  {selectedAnalysisForView.rating && (
                    <div className="flex gap-1">
                      {[1, 2, 3, 4, 5].map(star => (
                        <Star
                          key={star}
                          className={`h-4 w-4 ${
                            star <= selectedAnalysisForView.rating!
                              ? 'fill-yellow-400 text-yellow-400'
                              : 'text-gray-300'
                          }`}
                        />
                      ))}
                    </div>
                  )}
                </div>

                {selectedAnalysisForView.filters_applied && 
                 Object.keys(selectedAnalysisForView.filters_applied).length > 0 && (
                  <div className="text-sm">
                    <span className="font-medium">Filters: </span>
                    <span className="text-muted-foreground">
                      {JSON.stringify(selectedAnalysisForView.filters_applied)}
                    </span>
                  </div>
                )}

                <ScrollArea className="flex-1 max-h-[60vh]">
                  <div className="prose prose-sm max-w-none pr-4">
                    <ReactMarkdown>{selectedAnalysisForView.analysis_text}</ReactMarkdown>
                  </div>
                </ScrollArea>

                <DialogFooter className="flex-row justify-between sm:justify-between gap-2 pt-4 border-t">
                  <Button
                    onClick={() => downloadAnalysisAsPDF(selectedAnalysisForView)}
                    disabled={isGeneratingPDF}
                    className="flex-1 sm:flex-none"
                  >
                    <Download className="mr-2 h-4 w-4" />
                    {isGeneratingPDF ? "Generating..." : "Download PDF"}
                  </Button>
                  <Button
                    variant="destructive"
                    onClick={() => {
                      setAnalysisToDelete(selectedAnalysisForView.id);
                      setDeleteConfirmOpen(true);
                    }}
                    className="flex-1 sm:flex-none"
                  >
                    <Trash2 className="mr-2 h-4 w-4" />
                    Delete
                  </Button>
                </DialogFooter>
              </div>
            )}
          </DialogContent>
        </Dialog>

        {/* Delete Confirmation Dialog */}
        <AlertDialog open={deleteConfirmOpen} onOpenChange={setDeleteConfirmOpen}>
          <AlertDialogContent>
            <AlertDialogHeader>
              <AlertDialogTitle>Delete Analysis?</AlertDialogTitle>
              <AlertDialogDescription>
                This action cannot be undone. This will permanently delete this test analysis from the database.
              </AlertDialogDescription>
            </AlertDialogHeader>
            <AlertDialogFooter>
              <AlertDialogCancel disabled={isDeleting}>Cancel</AlertDialogCancel>
              <AlertDialogAction
                onClick={deleteAnalysis}
                disabled={isDeleting}
                className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
              >
                {isDeleting ? "Deleting..." : "Delete"}
              </AlertDialogAction>
            </AlertDialogFooter>
          </AlertDialogContent>
        </AlertDialog>
      </div>
    </div>
  );
}
