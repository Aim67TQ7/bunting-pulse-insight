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
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import ReactMarkdown from 'react-markdown';
import { 
  BrainCircuit, 
  Play, 
  History,
  Settings,
  Filter,
  Star,
  Lock,
  FlaskConical
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
                                onClick={() => setCurrentAnalysis(test)}
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
      </div>
    </div>
  );
}
