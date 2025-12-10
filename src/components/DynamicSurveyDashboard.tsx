import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, PieChart, Pie, Cell, Legend } from "recharts";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Globe, UsersIcon, TrendingUpIcon, ChevronDownIcon, FilterIcon, ClockIcon, MessageSquareWarning } from "lucide-react";
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from "@/components/ui/collapsible";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import { useSurveyQuestions } from "@/hooks/useSurveyQuestions";
import { cn } from "@/lib/utils";
import buntingLogo from "@/assets/bunting-logo-2.png";
import magnetApplicationsLogo from "@/assets/magnet-applications-logo-2.png";

const CHART_COLORS = ['hsl(var(--chart-primary))', 'hsl(var(--chart-secondary))', 'hsl(var(--chart-tertiary))', 'hsl(var(--chart-quaternary))', 'hsl(var(--chart-quinary))', 'hsl(var(--chart-senary))', 'hsl(var(--chart-septenary))', 'hsl(var(--chart-octonary))'];

const RATING_EMOJIS: Record<number, string> = {
  1: '😞',
  2: '😕',
  3: '😐',
  4: '😊',
  5: '😄'
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
interface GroupedResponse {
  response_id: string;
  created_at: string;
  answers: Map<string, QuestionResponse>;
  continent?: string;
  division?: string;
  completion_time_seconds?: number;
}
export default function DynamicSurveyDashboard({
  onBack
}: {
  onBack?: () => void;
}) {
  const [language, setLanguage] = useState<string>("en");
  const [responses, setResponses] = useState<GroupedResponse[]>([]);
  const [loading, setLoading] = useState(true);
  const [openSections, setOpenSections] = useState<Record<string, boolean>>({});
  const [filterContinent, setFilterContinent] = useState<string>("all");
  const [filterDivision, setFilterDivision] = useState<string>("all");
  const [filteredResponses, setFilteredResponses] = useState<GroupedResponse[]>([]);
  const {
    toast
  } = useToast();
  const {
    data: questions = [],
    isLoading: questionsLoading
  } = useSurveyQuestions();
  useEffect(() => {
    loadResponses();
  }, []);

  useEffect(() => {
    applyFilters();
  }, [responses, filterContinent, filterDivision]);

  const applyFilters = () => {
    let filtered = responses;
    
    if (filterContinent !== "all") {
      filtered = filtered.filter(r => r.continent === filterContinent);
    }
    
    if (filterDivision !== "all") {
      filtered = filtered.filter(r => r.division === filterDivision);
    }
    
    setFilteredResponses(filtered);
  };
  const loadResponses = async () => {
    try {
      setLoading(true);
      const {
        data,
        error
      } = await supabase.from("employee_survey_responses").select("id, responses_jsonb, created_at, continent, division, completion_time_seconds, submitted_at").eq("is_draft", false).order("submitted_at", {
        ascending: false
      });
      if (error) throw error;

      // Transform responses_jsonb into the old GroupedResponse format
      const groupedArray: GroupedResponse[] = (data || []).map(survey => {
        const answers = new Map();
        (survey.responses_jsonb as any[] || []).forEach((answer: any) => {
          answers.set(answer.question_id, {
            response_id: survey.id,
            question_id: answer.question_id,
            question_type: answer.question_type,
            answer_value: answer.answer_value,
            display_order: answer.display_order,
            created_at: survey.created_at
          });
        });
        return {
          response_id: survey.id,
          created_at: survey.created_at,
          answers,
          continent: survey.continent,
          division: survey.division,
          completion_time_seconds: survey.completion_time_seconds
        };
      });
      setResponses(groupedArray);
    } catch (error: any) {
      toast({
        title: "Error loading responses",
        description: error.message,
        variant: "destructive"
      });
    } finally {
      setLoading(false);
    }
  };
  const getQuestionLabel = (questionId: string): string => {
    const question = questions.find(q => q.question_id === questionId);
    return question?.labels[language] || questionId;
  };
  const getRatingQuestions = () => {
    return questions.filter(q => q.question_type === "rating");
  };
  const getDemographicQuestions = () => {
    return questions.filter(q => q.question_type === "demographic");
  };
  const getMultiselectQuestions = () => {
    return questions.filter(q => q.question_type === "multiselect");
  };
  const getTextQuestions = () => {
    return questions.filter(q => q.question_type === "text");
  };
  const calculateRatingStats = (questionId: string) => {
    const ratings = filteredResponses.map(r => r.answers.get(questionId)?.answer_value?.rating).filter(r => r !== undefined && r !== null);
    if (ratings.length === 0) return {
      average: 0,
      distribution: []
    };
    const average = ratings.reduce((sum, r) => sum + r, 0) / ratings.length;
    const distribution = [1, 2, 3, 4, 5].map(rating => ({
      rating: rating.toString(),
      count: ratings.filter(r => r === rating).length
    }));
    return {
      average,
      distribution
    };
  };
  const calculateDemographicBreakdown = (questionId: string) => {
    const values = filteredResponses.map(r => r.answers.get(questionId)?.answer_value?.value).filter(v => v !== undefined && v !== null);
    const counts = values.reduce((acc, val) => {
      acc[val] = (acc[val] || 0) + 1;
      return acc;
    }, {} as Record<string, number>);
    return Object.entries(counts).map(([name, value]) => ({
      name,
      value
    }));
  };
  const calculateMultiselectBreakdown = (questionId: string) => {
    const allSelections: string[] = [];
    filteredResponses.forEach(r => {
      const answer = r.answers.get(questionId)?.answer_value?.selected;
      if (Array.isArray(answer)) {
        allSelections.push(...answer);
      }
    });
    const counts = allSelections.reduce((acc, val) => {
      acc[val] = (acc[val] || 0) + 1;
      return acc;
    }, {} as Record<string, number>);
    return Object.entries(counts).map(([name, value]) => ({
      name,
      value
    }));
  };
  const getTextResponses = (questionId: string) => {
    return filteredResponses.map(r => ({
      text: r.answers.get(questionId)?.answer_value?.text,
      date: r.created_at
    })).filter(r => r.text && r.text.trim() !== '');
  };

  // Get low-score comments (ratings 1-2) for a specific question
  const getLowScoreComments = (questionId: string) => {
    return filteredResponses
      .filter(r => {
        const answer = r.answers.get(questionId);
        return answer?.question_type === 'rating' && 
               answer?.answer_value?.rating <= 2 &&
               answer?.answer_value?.feedback?.trim();
      })
      .map(r => ({
        rating: r.answers.get(questionId)?.answer_value.rating as number,
        feedback: r.answers.get(questionId)?.answer_value.feedback as string,
        date: r.created_at
      }))
      .sort((a, b) => a.rating - b.rating); // Show rating 1 before rating 2
  };
  const getSectionQuestions = (section: string) => {
    return questions.filter(q => q.section === section);
  };
  const calculateSectionAverage = (section: string) => {
    const sectionQuestions = getSectionQuestions(section).filter(q => q.question_type === "rating");
    if (sectionQuestions.length === 0) return 0;
    const averages = sectionQuestions.map(q => calculateRatingStats(q.question_id).average);
    return averages.reduce((sum, avg) => sum + avg, 0) / averages.length;
  };
  const getUniqueSection = () => {
    const sections = new Set(questions.map(q => q.section).filter(s => s));
    return Array.from(sections);
  };
  const getStatusColor = (average: number): string => {
    if (average >= 4.5) return "hsl(var(--success))";
    if (average >= 4) return "hsl(var(--chart-primary))";
    if (average >= 3) return "hsl(var(--warning))";
    return "hsl(var(--destructive))";
  };
  const getStatusLabel = (average: number): string => {
    if (average >= 4.5) return "Excellent";
    if (average >= 4) return "Good";
    if (average >= 3) return "Neutral";
    if (average >= 2) return "Poor";
    return "Critical";
  };
  const toggleSection = (section: string) => {
    setOpenSections(prev => ({
      ...prev,
      [section]: !prev[section]
    }));
  };
  if (loading || questionsLoading) {
    return <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="text-center">
          
          <p className="text-muted-foreground">Loading dashboard...</p>
        </div>
      </div>;
  }
  if (responses.length === 0) {
    return <div className="min-h-screen bg-background p-8">
        <div className="max-w-7xl mx-auto">
          
          <Card>
            <CardContent className="pt-6 text-center">
              <UsersIcon className="h-16 w-16 mx-auto mb-4 text-muted-foreground" />
              <h3 className="text-xl font-semibold mb-2">No Survey Data</h3>
              <p className="text-muted-foreground">
                No survey responses have been submitted yet. Complete the survey to see analytics.
              </p>
            </CardContent>
          </Card>
        </div>
      </div>;
  }
  const totalResponses = filteredResponses.length;
  const ratingQuestions = getRatingQuestions();
  const overallAverage = ratingQuestions.length > 0 ? ratingQuestions.reduce((sum, q) => sum + calculateRatingStats(q.question_id).average, 0) / ratingQuestions.length : 0;
  return <div className="min-h-screen bg-background p-4 md:p-8">
      <div className="max-w-7xl mx-auto">
        {/* Header with Filters and Language Selector */}
        <div className="mb-8 space-y-4">
          <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
            <div>
              <h1 className="text-3xl font-bold">Survey Dashboard</h1>
              <p className="text-muted-foreground mt-1">Analyze employee survey responses</p>
            </div>
            <Select value={language} onValueChange={setLanguage}>
              <SelectTrigger className="w-[180px]">
                <Globe className="mr-2 h-4 w-4" />
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="en">English</SelectItem>
                <SelectItem value="fr">Français</SelectItem>
              </SelectContent>
            </Select>
          </div>
          
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <FilterIcon className="h-5 w-5" />
                Filters
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="flex flex-col md:flex-row gap-4">
                <div className="flex-1">
                  <label className="text-sm font-medium text-muted-foreground mb-2 block">
                    Location
                  </label>
                  <Select value={filterContinent} onValueChange={setFilterContinent}>
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all">All Locations</SelectItem>
                      <SelectItem value="Europe">Europe</SelectItem>
                      <SelectItem value="North America">North America</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div className="flex-1">
                  <label className="text-sm font-medium text-muted-foreground mb-2 block">
                    Division
                  </label>
                  <Select value={filterDivision} onValueChange={setFilterDivision}>
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all">All Divisions</SelectItem>
                      <SelectItem value="Both">Both</SelectItem>
                      <SelectItem value="Equipment">Equipment</SelectItem>
                      <SelectItem value="Magnets">Magnets</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div className="flex-1 flex items-end">
                  <div className="text-sm">
                    <span className="font-medium">Showing:</span>
                    <Badge variant="secondary" className="ml-2">
                      {filteredResponses.length} of {responses.length} responses
                    </Badge>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>


        {/* Overview Cards */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-8">
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium text-muted-foreground">
                Total Responses
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="flex items-center justify-between">
                <div className="text-3xl font-bold">{totalResponses}</div>
                <UsersIcon className="h-8 w-8 text-muted-foreground" />
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium text-muted-foreground">
                Overall Average
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="flex items-center justify-between">
                <div className="text-3xl font-bold">{overallAverage.toFixed(1)}</div>
                <Badge style={{
                backgroundColor: getStatusColor(overallAverage)
              }}>
                  {getStatusLabel(overallAverage)}
                </Badge>
              </div>
              <Progress value={overallAverage / 5 * 100} className="mt-2" />
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium text-muted-foreground">
                Rating Questions
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="flex items-center justify-between">
                <div className="text-3xl font-bold">{ratingQuestions.length}</div>
                <TrendingUpIcon className="h-8 w-8 text-muted-foreground" />
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium text-muted-foreground">
                Response Time
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="flex items-center justify-between">
                <div className="text-3xl font-bold">
                  {filteredResponses.length > 0 
                    ? Math.round(
                        filteredResponses.reduce((sum, r) => 
                          sum + (r.completion_time_seconds || 0), 0
                        ) / filteredResponses.length / 60
                      )
                    : 0} min
                </div>
                <ClockIcon className="h-8 w-8 text-muted-foreground" />
              </div>
              <div className="text-xs text-muted-foreground mt-1">
                Average completion time
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Rating Questions by Section */}
        {getUniqueSection().map(section => {
        const sectionQuestions = getSectionQuestions(section).filter(q => q.question_type === "rating");
        if (sectionQuestions.length === 0) return null;
        const sectionAverage = calculateSectionAverage(section);
        const isOpen = openSections[section] !== false;
        return <Card key={section} className="mb-6">
              <Collapsible open={isOpen} onOpenChange={() => toggleSection(section)}>
                <CollapsibleTrigger className="w-full">
                  <CardHeader className="cursor-pointer hover:bg-accent/50 transition-colors">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-4">
                        <ChevronDownIcon className={`h-5 w-5 transition-transform ${isOpen ? "" : "-rotate-90"}`} />
                        <div className="text-left">
                          <CardTitle>{section || "General"}</CardTitle>
                          <p className="text-sm text-muted-foreground mt-1">
                            Average: {sectionAverage.toFixed(1)} / 5.0
                          </p>
                        </div>
                      </div>
                      <Badge style={{
                    backgroundColor: getStatusColor(sectionAverage)
                  }}>
                        {getStatusLabel(sectionAverage)}
                      </Badge>
                    </div>
                  </CardHeader>
                </CollapsibleTrigger>
                <CollapsibleContent>
                  <CardContent className="space-y-6">
                    {sectionQuestions.map(question => {
                      const stats = calculateRatingStats(question.question_id);
                      const lowScoreComments = getLowScoreComments(question.question_id);
                      const feedbackSectionKey = `feedback-${question.question_id}`;
                      
                      return (
                        <div key={question.id} className="space-y-3 pb-4 border-b border-border last:border-0 last:pb-0">
                          <div className="flex items-center justify-between">
                            <h4 className="font-medium">{getQuestionLabel(question.question_id)}</h4>
                            <div className="flex items-center gap-2">
                              <span className="text-2xl font-bold">{stats.average.toFixed(1)}</span>
                              <span className="text-muted-foreground">/ 5.0</span>
                            </div>
                          </div>
                          <ResponsiveContainer width="100%" height={150}>
                            <BarChart data={stats.distribution}>
                              <CartesianGrid strokeDasharray="3 3" />
                              <XAxis dataKey="rating" />
                              <YAxis />
                              <Tooltip />
                              <Bar dataKey="count" fill={CHART_COLORS[0]} />
                            </BarChart>
                          </ResponsiveContainer>
                          
                          {/* Low Score Feedback Section */}
                          {lowScoreComments.length > 0 && (
                            <Collapsible 
                              open={openSections[feedbackSectionKey]} 
                              onOpenChange={(open) => setOpenSections(prev => ({
                                ...prev,
                                [feedbackSectionKey]: open
                              }))}
                            >
                              <CollapsibleTrigger className="flex items-center gap-2 w-full p-3 bg-destructive/10 rounded-lg hover:bg-destructive/15 transition-colors">
                                <MessageSquareWarning className="h-4 w-4 text-destructive" />
                                <span className="text-sm font-medium text-destructive">
                                  Low Score Feedback (Ratings 1-2)
                                </span>
                                <Badge variant="destructive" className="ml-auto mr-2">
                                  {lowScoreComments.length}
                                </Badge>
                                <ChevronDownIcon className={cn(
                                  "h-4 w-4 text-destructive transition-transform",
                                  openSections[feedbackSectionKey] && "rotate-180"
                                )} />
                              </CollapsibleTrigger>
                              <CollapsibleContent className="pt-3 space-y-2">
                                {lowScoreComments.map((comment, idx) => (
                                  <Card key={idx} className="bg-destructive/5 border-destructive/20">
                                    <CardContent className="pt-3 pb-3">
                                      <div className="flex items-start gap-3">
                                        <span className="text-xl">{RATING_EMOJIS[comment.rating]}</span>
                                        <div className="flex-1">
                                          <div className="flex items-center gap-2 mb-1">
                                            <Badge variant="outline" className="text-xs border-destructive/30 text-destructive">
                                              Rating: {comment.rating}
                                            </Badge>
                                            <span className="text-xs text-muted-foreground">
                                              {new Date(comment.date).toLocaleDateString()}
                                            </span>
                                          </div>
                                          <p className="text-sm whitespace-pre-wrap">{comment.feedback}</p>
                                        </div>
                                      </div>
                                    </CardContent>
                                  </Card>
                                ))}
                              </CollapsibleContent>
                            </Collapsible>
                          )}
                        </div>
                      );
                    })}
                  </CardContent>
                </CollapsibleContent>
              </Collapsible>
            </Card>;
      })}

        {/* Demographics */}
        {getDemographicQuestions().length > 0 && <Card className="mb-6">
            <CardHeader>
              <CardTitle>Demographics Breakdown</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                {getDemographicQuestions().map(question => {
              const data = calculateDemographicBreakdown(question.question_id);
              return <div key={question.id}>
                      <h4 className="font-medium mb-4 text-center">{getQuestionLabel(question.question_id)}</h4>
                      <ResponsiveContainer width="100%" height={300}>
                        <PieChart>
                          <Pie data={data} cx="50%" cy="45%" labelLine={false} outerRadius={80} fill="#8884d8" dataKey="value" label={({
                      percent
                    }) => `${(percent * 100).toFixed(0)}%`}>
                            {data.map((entry, index) => <Cell key={`cell-${index}`} fill={CHART_COLORS[index % CHART_COLORS.length]} />)}
                          </Pie>
                          <Tooltip />
                          <Legend verticalAlign="bottom" height={36} formatter={value => <span className="text-sm">{value}</span>} />
                        </PieChart>
                      </ResponsiveContainer>
                    </div>;
            })}
              </div>
            </CardContent>
          </Card>}

        {/* Multiselect Questions */}
        {getMultiselectQuestions().length > 0 && <Card>
            <CardHeader>
              <CardTitle>Multiple Choice Insights</CardTitle>
            </CardHeader>
            <CardContent className="space-y-6">
              {getMultiselectQuestions().map(question => {
            const data = calculateMultiselectBreakdown(question.question_id);
            return <div key={question.id}>
                    <h4 className="font-medium mb-4">{getQuestionLabel(question.question_id)}</h4>
                    <ResponsiveContainer width="100%" height={300}>
                      <BarChart data={data} layout="vertical">
                        <CartesianGrid strokeDasharray="3 3" />
                        <XAxis type="number" />
                        <YAxis dataKey="name" type="category" width={150} />
                        <Tooltip />
                        <Bar dataKey="value" fill={CHART_COLORS[1]} />
                      </BarChart>
                    </ResponsiveContainer>
                  </div>;
          })}
            </CardContent>
          </Card>}

        {/* Text Question Responses */}
        {getTextQuestions().length > 0 && <Card className="col-span-full">
            <CardHeader>
              <CardTitle>Open-Ended Responses</CardTitle>
            </CardHeader>
            <CardContent className="space-y-6">
              {getTextQuestions().map(question => {
            const textResponses = getTextResponses(question.question_id);
            return <Collapsible key={question.question_id} open={openSections[`text-${question.question_id}`]} onOpenChange={open => setOpenSections(prev => ({
              ...prev,
              [`text-${question.question_id}`]: open
            }))}>
                    <div className="space-y-4">
                      <CollapsibleTrigger className="flex items-center justify-between w-full p-4 bg-muted/50 rounded-lg hover:bg-muted transition-colors">
                        <div className="flex items-center gap-3">
                          <h3 className="font-medium text-left">{getQuestionLabel(question.question_id)}</h3>
                          <Badge variant="secondary">{textResponses.length} responses</Badge>
                        </div>
                        <ChevronDownIcon className={cn("h-5 w-5 transition-transform", openSections[`text-${question.question_id}`] && "rotate-180")} />
                      </CollapsibleTrigger>
                      <CollapsibleContent className="space-y-3 pt-2">
                        {textResponses.map((response, idx) => <Card key={idx} className="bg-card/50">
                            <CardContent className="pt-4">
                              <p className="text-sm whitespace-pre-wrap">{response.text}</p>
                              <p className="text-xs text-muted-foreground mt-2">
                                {new Date(response.date).toLocaleDateString()}
                              </p>
                            </CardContent>
                          </Card>)}
                      </CollapsibleContent>
                    </div>
                  </Collapsible>;
          })}
            </CardContent>
          </Card>}
      </div>
    </div>;
}