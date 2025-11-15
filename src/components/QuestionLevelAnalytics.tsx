import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from "@/components/ui/collapsible";
import { ArrowLeftIcon, DownloadIcon, FilterIcon, TrendingUp, Clock, BarChart3, PieChart as PieChartIcon, Calendar, ChevronDown } from "lucide-react";
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, ResponsiveContainer, PieChart, Pie, Cell, LineChart, Line, Tooltip, Legend, Area, AreaChart } from "recharts";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import { useSurveyQuestions } from "@/hooks/useSurveyQuestions";
const CHART_COLORS = ['hsl(var(--chart-primary))', 'hsl(var(--chart-secondary))', 'hsl(var(--chart-tertiary))', 'hsl(var(--chart-quaternary))', 'hsl(var(--chart-quinary))', 'hsl(var(--chart-senary))', 'hsl(var(--chart-septenary))', 'hsl(var(--chart-octonary))'];
const RATING_EMOJIS: Record<number, string> = {
  1: "😞",
  2: "😕",
  3: "😐",
  4: "😊",
  5: "😄"
};
interface QuestionResponse {
  id: string;
  response_id: string;
  question_id: string;
  question_type: string;
  answer_value: any;
  display_order: number;
  created_at: string;
}
interface SurveyMetadata {
  id: string;
  continent: string;
  division: string;
  completion_time_seconds: number;
  submitted_at: string;
}
interface QuestionLevelAnalyticsProps {
  onBack: () => void;
}
export const QuestionLevelAnalytics = ({
  onBack
}: QuestionLevelAnalyticsProps) => {
  const [questionResponses, setQuestionResponses] = useState<QuestionResponse[]>([]);
  const [surveyMetadata, setSurveyMetadata] = useState<SurveyMetadata[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedQuestion, setSelectedQuestion] = useState<string>("all");
  const [selectedDemographic, setSelectedDemographic] = useState<"continent" | "division">("continent");
  const {
    toast
  } = useToast();
  const {
    data: questions
  } = useSurveyQuestions();
  useEffect(() => {
    loadData();
  }, []);
  const loadData = async () => {
    try {
      setLoading(true);

      // Load from single table
      const {
        data: surveys,
        error
      } = await supabase.from('employee_survey_responses').select('id, responses_jsonb, continent, division, completion_time_seconds, submitted_at').eq('is_draft', false).order('submitted_at', {
        ascending: false
      });
      if (error) throw error;

      // Transform responses_jsonb into flat question responses
      const flatResponses: QuestionResponse[] = (surveys || []).flatMap(survey => (survey.responses_jsonb as any[] || []).map((answer: any) => ({
        id: `${survey.id}-${answer.question_id}`,
        response_id: survey.id,
        question_id: answer.question_id,
        question_type: answer.question_type,
        answer_value: answer.answer_value,
        display_order: answer.display_order,
        created_at: survey.submitted_at
      })));
      setQuestionResponses(flatResponses);
      setSurveyMetadata(surveys || []);
      toast({
        title: "Data Loaded",
        description: `${flatResponses.length} question responses from ${surveys?.length || 0} surveys`
      });
    } catch (error: any) {
      console.error('Error loading data:', error);
      toast({
        title: "Error Loading Data",
        description: error.message,
        variant: "destructive"
      });
    } finally {
      setLoading(false);
    }
  };

  // Get question label from database
  const getQuestionLabel = (questionId: string) => {
    const question = questions?.find(q => q.question_id === questionId);
    return question?.labels?.en || questionId;
  };

  // Get all unique questions with response counts
  const getQuestionStats = () => {
    const stats = new Map<string, {
      id: string;
      label: string;
      type: string;
      count: number;
      displayOrder: number;
    }>();
    questionResponses.forEach(response => {
      if (!stats.has(response.question_id)) {
        stats.set(response.question_id, {
          id: response.question_id,
          label: getQuestionLabel(response.question_id),
          type: response.question_type,
          count: 0,
          displayOrder: response.display_order || 999
        });
      }
      const stat = stats.get(response.question_id)!;
      stat.count++;
    });
    return Array.from(stats.values()).sort((a, b) => a.displayOrder - b.displayOrder);
  };

  // Get rating distribution for a specific question
  const getRatingDistribution = (questionId: string) => {
    const responses = questionResponses.filter(r => r.question_id === questionId && r.question_type === 'rating');
    const distribution: Record<number, number> = {
      1: 0,
      2: 0,
      3: 0,
      4: 0,
      5: 0
    };
    responses.forEach(r => {
      const rating = r.answer_value?.rating;
      if (rating >= 1 && rating <= 5) {
        distribution[rating]++;
      }
    });
    return Object.entries(distribution).map(([rating, count]) => ({
      rating: `${rating} ${RATING_EMOJIS[parseInt(rating)]}`,
      ratingNum: parseInt(rating),
      count,
      percentage: responses.length > 0 ? (count / responses.length * 100).toFixed(1) : '0',
      fill: getRatingColor(parseInt(rating))
    }));
  };

  // Get rating color
  const getRatingColor = (rating: number) => {
    if (rating >= 4) return CHART_COLORS[1]; // Good
    if (rating === 3) return CHART_COLORS[2]; // Neutral
    return CHART_COLORS[7]; // Needs attention
  };

  // Get demographic breakdown for a question
  const getDemographicBreakdown = (questionId: string, demographic: 'continent' | 'division') => {
    const responses = questionResponses.filter(r => r.question_id === questionId && r.question_type === 'rating');
    const groups = new Map<string, {
      sum: number;
      count: number;
    }>();
    responses.forEach(r => {
      const metadata = surveyMetadata.find(m => m.id === r.response_id);
      if (!metadata) return;
      const group = metadata[demographic];
      if (!groups.has(group)) {
        groups.set(group, {
          sum: 0,
          count: 0
        });
      }
      const data = groups.get(group)!;
      data.sum += r.answer_value?.rating || 0;
      data.count++;
    });
    return Array.from(groups.entries()).map(([name, data], index) => ({
      name,
      average: data.count > 0 ? (data.sum / data.count).toFixed(2) : '0',
      count: data.count,
      fill: CHART_COLORS[index % CHART_COLORS.length]
    }));
  };

  // Get trends over time for rating questions
  const getTrendsOverTime = () => {
    const ratingQuestions = questionResponses.filter(r => r.question_type === 'rating');

    // Group by date and question
    const dateMap = new Map<string, Map<string, {
      sum: number;
      count: number;
    }>>();
    ratingQuestions.forEach(r => {
      const date = new Date(r.created_at).toLocaleDateString();
      if (!dateMap.has(date)) {
        dateMap.set(date, new Map());
      }
      const dayData = dateMap.get(date)!;
      if (!dayData.has(r.question_id)) {
        dayData.set(r.question_id, {
          sum: 0,
          count: 0
        });
      }
      const questionData = dayData.get(r.question_id)!;
      questionData.sum += r.answer_value?.rating || 0;
      questionData.count++;
    });

    // Convert to array and calculate averages
    const trends = Array.from(dateMap.entries()).map(([date, questions]) => {
      const dataPoint: any = {
        date
      };
      questions.forEach((data, questionId) => {
        const shortLabel = getQuestionLabel(questionId).substring(0, 30);
        dataPoint[shortLabel] = (data.sum / data.count).toFixed(2);
      });
      return dataPoint;
    }).sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime());
    return trends;
  };

  // Get completion time statistics
  const getCompletionTimeStats = () => {
    const times = surveyMetadata.map(m => m.completion_time_seconds);
    const average = times.reduce((sum, t) => sum + t, 0) / times.length;
    const min = Math.min(...times);
    const max = Math.max(...times);

    // Group into buckets
    const buckets = [{
      range: '0-5 min',
      count: 0,
      fill: CHART_COLORS[0]
    }, {
      range: '5-10 min',
      count: 0,
      fill: CHART_COLORS[1]
    }, {
      range: '10-15 min',
      count: 0,
      fill: CHART_COLORS[2]
    }, {
      range: '15-20 min',
      count: 0,
      fill: CHART_COLORS[3]
    }, {
      range: '20+ min',
      count: 0,
      fill: CHART_COLORS[4]
    }];
    times.forEach(t => {
      const minutes = t / 60;
      if (minutes < 5) buckets[0].count++;else if (minutes < 10) buckets[1].count++;else if (minutes < 15) buckets[2].count++;else if (minutes < 20) buckets[3].count++;else buckets[4].count++;
    });
    return {
      average: Math.floor(average / 60),
      min: Math.floor(min / 60),
      max: Math.floor(max / 60),
      buckets
    };
  };

  // Get multiselect breakdown
  const getMultiSelectBreakdown = (questionId: string) => {
    const responses = questionResponses.filter(r => r.question_id === questionId && r.question_type === 'multiselect');
    const counts = new Map<string, number>();
    responses.forEach(r => {
      const selected = r.answer_value?.selected || [];
      selected.forEach((option: string) => {
        counts.set(option, (counts.get(option) || 0) + 1);
      });
    });
    return Array.from(counts.entries()).map(([option, count], index) => ({
      option,
      count,
      percentage: (count / responses.length * 100).toFixed(1),
      fill: CHART_COLORS[index % CHART_COLORS.length]
    })).sort((a, b) => b.count - a.count);
  };

  // Get low-score comments for a rating question
  const getLowRatingComments = (questionId: string) => {
    const responses = questionResponses.filter(r => 
      r.question_id === questionId && 
      r.question_type === 'rating' &&
      r.answer_value?.rating <= 2 &&
      r.answer_value?.feedback?.trim()
    );
    
    return responses.map(r => ({
      rating: r.answer_value.rating,
      feedback: r.answer_value.feedback,
      date: new Date(r.created_at).toLocaleDateString(),
      response_id: r.response_id
    }));
  };
  if (loading) {
    return <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="text-center">Loading question-level analytics...</div>
      </div>;
  }
  const questionStats = getQuestionStats();
  const completionStats = getCompletionTimeStats();
  const trendsData = getTrendsOverTime();
  return <div className="min-h-screen bg-background p-6">
      <div className="max-w-7xl mx-auto space-y-6">
        {/* Header */}
        

        <Tabs defaultValue="questions" className="space-y-6 mx-0">
          <TabsList>
            <TabsTrigger value="questions">Question Analysis</TabsTrigger>
            <TabsTrigger value="trends">Trends</TabsTrigger>
            <TabsTrigger value="completion">Completion Times</TabsTrigger>
          </TabsList>

          {/* Question Analysis Tab */}
          <TabsContent value="questions" className="space-y-6">
            {/* Question Selector */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <FilterIcon className="h-5 w-5" />
                  Select Question
                </CardTitle>
              </CardHeader>
              <CardContent>
                <Select value={selectedQuestion} onValueChange={setSelectedQuestion}>
                  <SelectTrigger>
                    <SelectValue placeholder="Select a question" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All Questions</SelectItem>
                    {questionStats.map(stat => <SelectItem key={stat.id} value={stat.id}>
                        {stat.label}
                      </SelectItem>)}
                  </SelectContent>
                </Select>
              </CardContent>
            </Card>

            {selectedQuestion !== "all" && <>
                {/* Rating Distribution */}
                {questionStats.find(q => q.id === selectedQuestion)?.type === 'rating' && <>
                    <Card>
                      <CardHeader>
                        <CardTitle>Rating Distribution</CardTitle>
                      </CardHeader>
                      <CardContent className="space-y-4">
                        <ResponsiveContainer width="100%" height={300}>
                          <BarChart data={getRatingDistribution(selectedQuestion)}>
                            <CartesianGrid strokeDasharray="3 3" />
                            <XAxis dataKey="rating" />
                            <YAxis />
                            <Tooltip />
                            <Bar dataKey="count" fill="hsl(var(--primary))" radius={[8, 8, 0, 0]} />
                          </BarChart>
                        </ResponsiveContainer>

                        {/* Low Score Feedback Section */}
                        {(() => {
                          const lowRatingComments = getLowRatingComments(selectedQuestion);
                          if (lowRatingComments.length === 0) return null;
                          
                          return (
                            <Collapsible>
                              <CollapsibleTrigger className="flex items-center gap-2 text-sm font-medium hover:underline w-full">
                                <ChevronDown className="h-4 w-4" />
                                Low Score Feedback (Ratings 1-2)
                                <Badge variant="destructive" className="ml-2">{lowRatingComments.length}</Badge>
                              </CollapsibleTrigger>
                              <CollapsibleContent className="space-y-2 mt-4">
                                {lowRatingComments.map((comment, idx) => (
                                  <Card key={idx} className="p-3 bg-muted/50 border-destructive/20">
                                    <div className="flex items-start gap-3">
                                      <span className="text-2xl">{RATING_EMOJIS[comment.rating]}</span>
                                      <div className="flex-1 space-y-1">
                                        <div className="flex items-center gap-2">
                                          <Badge variant="outline" className="text-xs">Rating: {comment.rating}</Badge>
                                          <span className="text-xs text-muted-foreground">{comment.date}</span>
                                        </div>
                                        <p className="text-sm text-foreground">{comment.feedback}</p>
                                      </div>
                                    </div>
                                  </Card>
                                ))}
                              </CollapsibleContent>
                            </Collapsible>
                          );
                        })()}
                      </CardContent>
                    </Card>

                    {/* Demographic Breakdown */}
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                      <Card>
                        <CardHeader>
                          <CardTitle>By Continent</CardTitle>
                        </CardHeader>
                        <CardContent>
                          <ResponsiveContainer width="100%" height={250}>
                            <BarChart data={getDemographicBreakdown(selectedQuestion, 'continent')}>
                              <CartesianGrid strokeDasharray="3 3" />
                              <XAxis dataKey="name" />
                              <YAxis domain={[0, 5]} />
                              <Tooltip />
                              <Bar dataKey="average" fill="hsl(var(--chart-primary))" radius={[8, 8, 0, 0]} />
                            </BarChart>
                          </ResponsiveContainer>
                        </CardContent>
                      </Card>

                      <Card>
                        <CardHeader>
                          <CardTitle>By Division</CardTitle>
                        </CardHeader>
                        <CardContent>
                          <ResponsiveContainer width="100%" height={250}>
                            <BarChart data={getDemographicBreakdown(selectedQuestion, 'division')}>
                              <CartesianGrid strokeDasharray="3 3" />
                              <XAxis dataKey="name" />
                              <YAxis domain={[0, 5]} />
                              <Tooltip />
                              <Bar dataKey="average" fill="hsl(var(--chart-secondary))" radius={[8, 8, 0, 0]} />
                            </BarChart>
                          </ResponsiveContainer>
                        </CardContent>
                      </Card>
                    </div>
                  </>}

                {/* MultiSelect Breakdown */}
                {questionStats.find(q => q.id === selectedQuestion)?.type === 'multiselect' && <Card>
                    <CardHeader>
                      <CardTitle>Option Selection Frequency</CardTitle>
                    </CardHeader>
                    <CardContent>
                      <ResponsiveContainer width="100%" height={400}>
                        <BarChart data={getMultiSelectBreakdown(selectedQuestion)} layout="vertical">
                          <CartesianGrid strokeDasharray="3 3" />
                          <XAxis type="number" />
                          <YAxis dataKey="option" type="category" width={150} />
                          <Tooltip />
                          <Bar dataKey="count" fill="hsl(var(--primary))" radius={[0, 8, 8, 0]} />
                        </BarChart>
                      </ResponsiveContainer>
                    </CardContent>
                  </Card>}
              </>}
          </TabsContent>

          {/* Trends Tab */}
          <TabsContent value="trends" className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <TrendingUp className="h-5 w-5" />
                  Response Trends Over Time
                </CardTitle>
              </CardHeader>
              <CardContent>
                <ResponsiveContainer width="100%" height={400}>
                  <LineChart data={trendsData}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="date" />
                    <YAxis domain={[0, 5]} />
                    <Tooltip />
                    <Legend />
                    {trendsData[0] && Object.keys(trendsData[0]).filter(key => key !== 'date').slice(0, 5).map((key, index) => <Line key={key} type="monotone" dataKey={key} stroke={CHART_COLORS[index]} strokeWidth={2} />)}
                  </LineChart>
                </ResponsiveContainer>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Completion Times Tab */}
          <TabsContent value="completion" className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <Card>
                <CardHeader className="pb-2">
                  <CardTitle className="text-sm font-medium text-muted-foreground">
                    Average Time
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="text-3xl font-bold">{completionStats.average} min</div>
                </CardContent>
              </Card>

              <Card>
                <CardHeader className="pb-2">
                  <CardTitle className="text-sm font-medium text-muted-foreground">
                    Fastest
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="text-3xl font-bold">{completionStats.min} min</div>
                </CardContent>
              </Card>

              <Card>
                <CardHeader className="pb-2">
                  <CardTitle className="text-sm font-medium text-muted-foreground">
                    Longest
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="text-3xl font-bold">{completionStats.max} min</div>
                </CardContent>
              </Card>
            </div>

            <Card>
              <CardHeader>
                <CardTitle>Completion Time Distribution</CardTitle>
              </CardHeader>
              <CardContent>
                <ResponsiveContainer width="100%" height={300}>
                  <BarChart data={completionStats.buckets}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="range" />
                    <YAxis />
                    <Tooltip />
                    <Bar dataKey="count" fill="hsl(var(--primary))" radius={[8, 8, 0, 0]} />
                  </BarChart>
                </ResponsiveContainer>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </div>;
};