import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { ArrowLeftIcon, DownloadIcon, FilterIcon, TrendingUp, TrendingDown, AlertTriangle, Users, MessageSquare, BrainCircuit, Award, Target } from "lucide-react";
import { ChartContainer, ChartTooltip, ChartTooltipContent } from "@/components/ui/chart";
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, ResponsiveContainer, PieChart, Pie, Cell, LineChart, Line, RadarChart, PolarGrid, PolarAngleAxis, PolarRadiusAxis, Radar, Legend } from "recharts";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import { CommentsSection } from "./CommentsSection";
import { AIAnalysisSection } from "./AIAnalysisSection";
import jsPDF from 'jspdf';
import html2canvas from 'html2canvas';

// Enhanced color palette using design system tokens
const CHART_COLORS = [
  'hsl(var(--chart-primary))',
  'hsl(var(--chart-secondary))',  
  'hsl(var(--chart-tertiary))',
  'hsl(var(--chart-quaternary))',
  'hsl(var(--chart-quinary))',
  'hsl(var(--chart-senary))',
  'hsl(var(--chart-septenary))',
  'hsl(var(--chart-octonary))',
];

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
  completion_time_seconds: number;
  information_preferences: string[];
  communication_preferences: string[];
  motivation_factors: string[];
}

interface AnalyticsDashboardProps {
  onBack: () => void;
}

const questionLabels = {
  job_satisfaction: "Job Satisfaction",
  work_life_balance: "Work-Life Balance",
  training_satisfaction: "Training Satisfaction",
  advancement_opportunities: "Advancement Opportunities",
  workplace_safety: "Workplace Safety",
  leadership_openness: "Leadership Openness",
  communication_clarity: "Communication Clarity",
  strategic_confidence: "Strategic Confidence",
  manager_alignment: "Manager Alignment",
  cross_functional_collaboration: "Cross-Functional Collaboration",
  us_uk_collaboration: "US-UK Collaboration",
  comfortable_suggesting_improvements: "Comfortable Suggesting Improvements",
  manual_processes_focus: "Manual Processes Focus",
  failed_experiments_learning: "Failed Experiments Learning",
  recommend_company: "Recommend Company"
};

// Utility functions for scoring and color-coding
const getScoreColor = (score: number): string => {
  if (score >= 4.5) return 'hsl(var(--chart-secondary))'; // Excellent
  if (score >= 4.0) return 'hsl(var(--chart-primary))'; // Good
  if (score >= 3.5) return 'hsl(var(--chart-tertiary))'; // Average
  if (score >= 3.0) return 'hsl(var(--chart-quaternary))'; // Below Average
  return 'hsl(var(--destructive))'; // Needs Attention
};

const getScoreBadge = (score: number): { label: string; variant: "default" | "secondary" | "destructive" | "outline" } => {
  if (score >= 4.5) return { label: "Excellent", variant: "default" };
  if (score >= 4.0) return { label: "Good", variant: "secondary" };
  if (score >= 3.5) return { label: "Average", variant: "outline" };
  if (score >= 3.0) return { label: "Below Average", variant: "outline" };
  return { label: "Needs Attention", variant: "destructive" };
};

export const SurveyAnalyticsDashboard = ({ onBack }: AnalyticsDashboardProps) => {
  const [responses, setResponses] = useState<SurveyResponse[]>([]);
  const [filteredResponses, setFilteredResponses] = useState<SurveyResponse[]>([]);
  const [loading, setLoading] = useState(true);
  const [filters, setFilters] = useState({
    continent: "all",
    division: "all", 
    role: "all",
    dateFrom: "",
    dateTo: ""
  });
  const { toast } = useToast();

  useEffect(() => {
    loadResponses();
  }, []);

  useEffect(() => {
    applyFilters();
  }, [responses, filters]);

  const loadResponses = async () => {
    try {
      const { data, error } = await supabase
        .from('employee_survey_responses')
        .select('*')
        .order('submitted_at', { ascending: false });

      if (error) throw error;
      setResponses(data || []);
    } catch (error: any) {
      toast({
        title: "Error Loading Data",
        description: error.message,
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const applyFilters = () => {
    let filtered = [...responses];

    if (filters.continent && filters.continent !== "all") {
      filtered = filtered.filter(r => r.continent === filters.continent);
    }
    if (filters.division && filters.division !== "all") {
      filtered = filtered.filter(r => r.division === filters.division);
    }
    if (filters.role && filters.role !== "all") {
      filtered = filtered.filter(r => r.role === filters.role);
    }
    if (filters.dateFrom) {
      filtered = filtered.filter(r => new Date(r.submitted_at) >= new Date(filters.dateFrom));
    }
    if (filters.dateTo) {
      filtered = filtered.filter(r => new Date(r.submitted_at) <= new Date(filters.dateTo));
    }

    setFilteredResponses(filtered);
  };

  const clearFilters = () => {
    setFilters({
      continent: "all",
      division: "all",
      role: "all", 
      dateFrom: "",
      dateTo: ""
    });
  };

  // Calculation utilities
  const calculateAverage = (field: keyof SurveyResponse) => {
    if (filteredResponses.length === 0) return 0;
    const sum = filteredResponses.reduce((acc, r) => acc + (Number(r[field]) || 0), 0);
    return sum / filteredResponses.length;
  };

  const getAveragesByQuestion = () => {
    const questions = Object.keys(questionLabels) as (keyof typeof questionLabels)[];
    return questions.map(q => ({
      question: questionLabels[q],
      questionKey: q,
      average: calculateAverage(q),
      color: getScoreColor(calculateAverage(q))
    })).sort((a, b) => a.average - b.average);
  };

  const getDemographicBreakdown = (field: keyof Pick<SurveyResponse, 'continent' | 'division' | 'role'>) => {
    const counts = filteredResponses.reduce((acc, r) => {
      const value = r[field];
      acc[value] = (acc[value] || 0) + 1;
      return acc;
    }, {} as Record<string, number>);

    return Object.entries(counts).map(([name, value], index) => ({ 
      name, 
      value,
      fill: CHART_COLORS[index % CHART_COLORS.length]
    }));
  };

  const getQuestionsByDemographic = (demographic: 'continent' | 'division' | 'role') => {
    const groups = [...new Set(filteredResponses.map(r => r[demographic]))];
    const questions = Object.keys(questionLabels) as (keyof typeof questionLabels)[];
    
    return questions.map(q => {
      const dataPoint: any = { question: questionLabels[q].substring(0, 20) + '...' };
      groups.forEach(group => {
        const groupResponses = filteredResponses.filter(r => r[demographic] === group);
        if (groupResponses.length > 0) {
          const avg = groupResponses.reduce((sum, r) => sum + (Number(r[q]) || 0), 0) / groupResponses.length;
          dataPoint[group] = Number(avg.toFixed(2));
        }
      });
      return dataPoint;
    });
  };

  const getTrendData = () => {
    const groupedByDate = filteredResponses.reduce((acc, response) => {
      const date = new Date(response.submitted_at).toLocaleDateString();
      if (!acc[date]) {
        acc[date] = { date, responses: [] };
      }
      acc[date].responses.push(response);
      return acc;
    }, {} as Record<string, { date: string; responses: SurveyResponse[] }>);

    return Object.values(groupedByDate)
      .map(item => ({
        date: item.date,
        satisfaction: item.responses.reduce((sum, r) => sum + (r.job_satisfaction || 0), 0) / item.responses.length,
        engagement: item.responses.reduce((sum, r) => sum + (r.recommend_company || 0), 0) / item.responses.length,
        training: item.responses.reduce((sum, r) => sum + (r.training_satisfaction || 0), 0) / item.responses.length,
      }))
      .sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime());
  };

  const getMultiSelectData = (field: 'communication_preferences' | 'motivation_factors' | 'information_preferences') => {
    const counts: Record<string, number> = {};
    filteredResponses.forEach(r => {
      const values = r[field] || [];
      values.forEach(v => {
        counts[v] = (counts[v] || 0) + 1;
      });
    });
    return Object.entries(counts)
      .map(([name, value], index) => ({ 
        name, 
        value,
        percentage: ((value / filteredResponses.length) * 100).toFixed(1),
        fill: CHART_COLORS[index % CHART_COLORS.length]
      }))
      .sort((a, b) => b.value - a.value);
  };

  const getLowestScoringQuestions = () => {
    const averages = getAveragesByQuestion();
    return averages.slice(0, 5);
  };

  const exportToPDF = async () => {
    try {
      const dashboardElement = document.getElementById('analytics-dashboard');
      if (!dashboardElement) return;

      const canvas = await html2canvas(dashboardElement, {
        scale: 1,
        useCORS: true,
        allowTaint: true,
        backgroundColor: '#ffffff'
      });

      const pdf = new jsPDF('p', 'in', 'letter');
      const imgWidth = 8.5;
      const imgHeight = (canvas.height * imgWidth) / canvas.width;
      
      if (imgHeight > 11) {
        const scaledHeight = 11;
        const scaledWidth = (canvas.width * scaledHeight) / canvas.height;
        pdf.addImage(canvas.toDataURL('image/png'), 'PNG', (8.5 - scaledWidth) / 2, 0, scaledWidth, scaledHeight);
      } else {
        pdf.addImage(canvas.toDataURL('image/png'), 'PNG', 0, 0, imgWidth, imgHeight);
      }

      pdf.save('comprehensive-survey-analytics.pdf');
      
      toast({
        title: "Export Successful",
        description: "Comprehensive analytics report downloaded",
      });
    } catch (error: any) {
      toast({
        title: "Export Error",
        description: error.message,
        variant: "destructive",
      });
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="text-center">Loading comprehensive analytics...</div>
      </div>
    );
  }

  const averagesByQuestion = getAveragesByQuestion();
  const continentData = getDemographicBreakdown('continent');
  const divisionData = getDemographicBreakdown('division');
  const roleData = getDemographicBreakdown('role');
  const trendData = getTrendData();
  const communicationPrefData = getMultiSelectData('communication_preferences');
  const motivationData = getMultiSelectData('motivation_factors');
  const informationPrefData = getMultiSelectData('information_preferences');
  const lowestScores = getLowestScoringQuestions();
  const questionsByContinent = getQuestionsByDemographic('continent');
  const questionsByDivision = getQuestionsByDemographic('division');

  const overallEngagement = calculateAverage('job_satisfaction');
  const overallSafety = calculateAverage('workplace_safety');
  const overallTraining = calculateAverage('training_satisfaction');
  const overallCollaboration = (calculateAverage('cross_functional_collaboration') + calculateAverage('us_uk_collaboration')) / 2;

  return (
    <div className="space-y-6" id="analytics-dashboard">
      <div className="flex items-center justify-between">
        <h2 className="text-2xl font-bold text-foreground">Comprehensive Survey Analytics</h2>
        <Button onClick={exportToPDF} className="flex items-center gap-2">
          <DownloadIcon className="h-4 w-4" />
          Export PDF
        </Button>
      </div>

      <Tabs defaultValue="overview" className="space-y-6">
        <TabsList className="grid w-full grid-cols-3">
          <TabsTrigger value="overview">Overview & Analytics</TabsTrigger>
          <TabsTrigger value="comments">
            <MessageSquare className="h-4 w-4 mr-2" />
            Comments ({filteredResponses.filter(r => r.additional_comments || r.collaboration_feedback).length})
          </TabsTrigger>
          <TabsTrigger value="ai-analysis">
            <BrainCircuit className="h-4 w-4 mr-2" />
            AI Analysis
          </TabsTrigger>
        </TabsList>

        <TabsContent value="overview" className="space-y-8">
          {/* Filters Section */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <FilterIcon className="h-5 w-5" />
                Filters
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-3 lg:grid-cols-6 gap-4">
                <div>
                  <Label>Continent</Label>
                  <Select value={filters.continent} onValueChange={(value) => setFilters({...filters, continent: value})}>
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all">All</SelectItem>
                      <SelectItem value="North America">North America</SelectItem>
                      <SelectItem value="Europe">Europe</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                
                <div>
                  <Label>Division</Label>
                  <Select value={filters.division} onValueChange={(value) => setFilters({...filters, division: value})}>
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all">All</SelectItem>
                      <SelectItem value="Equipment">Equipment</SelectItem>
                      <SelectItem value="Magnets">Magnets</SelectItem>
                      <SelectItem value="Both">Both</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div>
                  <Label>Role</Label>
                  <Select value={filters.role} onValueChange={(value) => setFilters({...filters, role: value})}>
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all">All</SelectItem>
                      <SelectItem value="Management">Management</SelectItem>
                      <SelectItem value="Operations/Engineering/Production">Operations/Engineering/Production</SelectItem>
                      <SelectItem value="Admin/HR/Finance">Admin/HR/Finance</SelectItem>
                      <SelectItem value="Sales">Sales</SelectItem>
                      <SelectItem value="Other">Other</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div>
                  <Label>From Date</Label>
                  <Input
                    type="date"
                    value={filters.dateFrom}
                    onChange={(e) => setFilters({...filters, dateFrom: e.target.value})}
                  />
                </div>

                <div>
                  <Label>To Date</Label>
                  <Input
                    type="date"
                    value={filters.dateTo}
                    onChange={(e) => setFilters({...filters, dateTo: e.target.value})}
                  />
                </div>

                <div className="flex flex-col gap-2 justify-end">
                  <Button variant="outline" onClick={clearFilters} className="w-full">
                    Clear Filters
                  </Button>
                  <Badge variant="secondary" className="justify-center">
                    {filteredResponses.length} of {responses.length}
                  </Badge>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Section 1: Executive Summary */}
          <div>
            <h3 className="text-xl font-semibold mb-4 flex items-center gap-2">
              <Target className="h-5 w-5" />
              Executive Summary
            </h3>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
              <Card>
                <CardHeader className="pb-2">
                  <CardTitle className="text-sm text-muted-foreground">Total Responses</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="text-3xl font-bold">{filteredResponses.length}</div>
                  <p className="text-xs text-muted-foreground mt-1">Survey participants</p>
                </CardContent>
              </Card>

              <Card>
                <CardHeader className="pb-2">
                  <CardTitle className="text-sm text-muted-foreground">Overall Engagement</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="flex items-center gap-2">
                    <div className="text-3xl font-bold">{overallEngagement.toFixed(1)}</div>
                    <Badge {...getScoreBadge(overallEngagement)}>{getScoreBadge(overallEngagement).label}</Badge>
                  </div>
                  <p className="text-xs text-muted-foreground mt-1">Job satisfaction average</p>
                </CardContent>
              </Card>

              <Card>
                <CardHeader className="pb-2">
                  <CardTitle className="text-sm text-muted-foreground">Response Rate</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="text-3xl font-bold">
                    {filteredResponses.length > 0 ? ((filteredResponses.length / responses.length) * 100).toFixed(0) : 0}%
                  </div>
                  <p className="text-xs text-muted-foreground mt-1">Of filtered dataset</p>
                </CardContent>
              </Card>

              <Card>
                <CardHeader className="pb-2">
                  <CardTitle className="text-sm text-muted-foreground">Avg Completion Time</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="text-3xl font-bold">
                    {(() => {
                      const times = filteredResponses.map(r => r.completion_time_seconds).filter(t => t > 0);
                      if (times.length === 0) return "N/A";
                      const avg = times.reduce((sum, t) => sum + t, 0) / times.length;
                      return `${Math.floor(avg / 60)}m`;
                    })()}
                  </div>
                  <p className="text-xs text-muted-foreground mt-1">Survey duration</p>
                </CardContent>
              </Card>
            </div>
          </div>

          {/* Section 2: Key Insights Cards */}
          <div>
            <h3 className="text-xl font-semibold mb-4 flex items-center gap-2">
              <Award className="h-5 w-5" />
              Key Performance Indicators
            </h3>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
              <Card>
                <CardHeader className="pb-2">
                  <CardTitle className="text-sm">Workplace Safety</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="flex items-center gap-2">
                    <div className="text-2xl font-bold">{overallSafety.toFixed(2)}</div>
                    <Badge {...getScoreBadge(overallSafety)}>{getScoreBadge(overallSafety).label}</Badge>
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardHeader className="pb-2">
                  <CardTitle className="text-sm">Training & Development</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="flex items-center gap-2">
                    <div className="text-2xl font-bold">{overallTraining.toFixed(2)}</div>
                    <Badge {...getScoreBadge(overallTraining)}>{getScoreBadge(overallTraining).label}</Badge>
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardHeader className="pb-2">
                  <CardTitle className="text-sm">Collaboration Score</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="flex items-center gap-2">
                    <div className="text-2xl font-bold">{overallCollaboration.toFixed(2)}</div>
                    <Badge {...getScoreBadge(overallCollaboration)}>{getScoreBadge(overallCollaboration).label}</Badge>
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardHeader className="pb-2">
                  <CardTitle className="text-sm">Comments Provided</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">
                    {filteredResponses.filter(r => r.additional_comments || r.collaboration_feedback).length}
                  </div>
                  <p className="text-xs text-muted-foreground">
                    {((filteredResponses.filter(r => r.additional_comments || r.collaboration_feedback).length / filteredResponses.length) * 100).toFixed(0)}% response rate
                  </p>
                </CardContent>
              </Card>
            </div>
          </div>

          {/* Section 3: Demographics Overview */}
          <div>
            <h3 className="text-xl font-semibold mb-4 flex items-center gap-2">
              <Users className="h-5 w-5" />
              Demographics Breakdown
            </h3>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <Card>
                <CardHeader>
                  <CardTitle>By Continent</CardTitle>
                </CardHeader>
                <CardContent>
                  <ChartContainer config={{}} className="h-[250px] w-full">
                    <ResponsiveContainer width="100%" height="100%">
                      <PieChart>
                        <Pie
                          data={continentData}
                          cx="50%"
                          cy="50%"
                          labelLine={false}
                          label={({name, percent}) => `${name}: ${(percent * 100).toFixed(0)}%`}
                          outerRadius={80}
                          fill="#8884d8"
                          dataKey="value"
                        >
                          {continentData.map((entry, index) => (
                            <Cell key={`cell-${index}`} fill={entry.fill} />
                          ))}
                        </Pie>
                        <ChartTooltip content={<ChartTooltipContent />} />
                      </PieChart>
                    </ResponsiveContainer>
                  </ChartContainer>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle>By Division</CardTitle>
                </CardHeader>
                <CardContent>
                  <ChartContainer config={{}} className="h-[250px] w-full">
                    <ResponsiveContainer width="100%" height="100%">
                      <PieChart>
                        <Pie
                          data={divisionData}
                          cx="50%"
                          cy="50%"
                          labelLine={false}
                          label={({name, percent}) => `${name}: ${(percent * 100).toFixed(0)}%`}
                          outerRadius={80}
                          fill="#8884d8"
                          dataKey="value"
                        >
                          {divisionData.map((entry, index) => (
                            <Cell key={`cell-${index}`} fill={entry.fill} />
                          ))}
                        </Pie>
                        <ChartTooltip content={<ChartTooltipContent />} />
                      </PieChart>
                    </ResponsiveContainer>
                  </ChartContainer>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle>By Role</CardTitle>
                </CardHeader>
                <CardContent>
                  <ChartContainer config={{}} className="h-[250px] w-full">
                    <ResponsiveContainer width="100%" height="100%">
                      <PieChart>
                        <Pie
                          data={roleData}
                          cx="50%"
                          cy="50%"
                          labelLine={false}
                          label={({name, percent}) => `${(percent * 100).toFixed(0)}%`}
                          outerRadius={80}
                          fill="#8884d8"
                          dataKey="value"
                        >
                          {roleData.map((entry, index) => (
                            <Cell key={`cell-${index}`} fill={entry.fill} />
                          ))}
                        </Pie>
                        <ChartTooltip content={<ChartTooltipContent />} />
                      </PieChart>
                    </ResponsiveContainer>
                  </ChartContainer>
                </CardContent>
              </Card>
            </div>
          </div>

          {/* Section 4: All Questions Ranked */}
          <Card>
            <CardHeader>
              <CardTitle>All Survey Questions - Ranked by Score</CardTitle>
              <p className="text-sm text-muted-foreground">Comprehensive view of all 15 rating questions</p>
            </CardHeader>
            <CardContent>
              <ChartContainer config={{}} className="h-[700px] w-full">
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={averagesByQuestion} layout="horizontal" margin={{ left: 220, right: 40, top: 20, bottom: 20 }}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis type="number" domain={[0, 5]} />
                    <YAxis 
                      dataKey="question" 
                      type="category" 
                      width={210}
                      tick={{ fontSize: 11 }}
                      interval={0}
                    />
                    <ChartTooltip content={<ChartTooltipContent />} />
                    <Bar dataKey="average" radius={4}>
                      {averagesByQuestion.map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={entry.color} />
                      ))}
                    </Bar>
                  </BarChart>
                </ResponsiveContainer>
              </ChartContainer>
            </CardContent>
          </Card>

          {/* Section 5: Attention Required */}
          <Card className="border-destructive/50">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <AlertTriangle className="h-5 w-5 text-destructive" />
                Areas Requiring Attention
              </CardTitle>
              <p className="text-sm text-muted-foreground">Lowest scoring questions</p>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                {lowestScores.map((item, index) => (
                  <div key={index} className="flex items-center justify-between p-3 bg-muted/50 rounded-lg">
                    <div className="flex-1">
                      <div className="font-medium">{item.question}</div>
                      <div className="text-sm text-muted-foreground">Score: {item.average.toFixed(2)}</div>
                    </div>
                    <Badge {...getScoreBadge(item.average)}>{getScoreBadge(item.average).label}</Badge>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>

          {/* Section 6: Questions by Continent */}
          <Card>
            <CardHeader>
              <CardTitle>Question Scores by Continent</CardTitle>
              <p className="text-sm text-muted-foreground">Comparative analysis across regions</p>
            </CardHeader>
            <CardContent>
              <ChartContainer config={{}} className="h-[700px] w-full">
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={questionsByContinent} layout="horizontal" margin={{ left: 180, right: 20, top: 20, bottom: 20 }}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis type="number" domain={[0, 5]} />
                    <YAxis 
                      dataKey="question" 
                      type="category" 
                      width={170}
                      tick={{ fontSize: 10 }}
                      interval={0}
                    />
                    <ChartTooltip content={<ChartTooltipContent />} />
                    <Legend />
                    {continentData.map((continent, index) => (
                      <Bar key={continent.name} dataKey={continent.name} fill={CHART_COLORS[index]} />
                    ))}
                  </BarChart>
                </ResponsiveContainer>
              </ChartContainer>
            </CardContent>
          </Card>

          {/* Section 7: Questions by Division */}
          <Card>
            <CardHeader>
              <CardTitle>Question Scores by Division</CardTitle>
              <p className="text-sm text-muted-foreground">Comparative analysis across divisions</p>
            </CardHeader>
            <CardContent>
              <ChartContainer config={{}} className="h-[700px] w-full">
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={questionsByDivision} layout="horizontal" margin={{ left: 180, right: 20, top: 20, bottom: 20 }}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis type="number" domain={[0, 5]} />
                    <YAxis 
                      dataKey="question" 
                      type="category" 
                      width={170}
                      tick={{ fontSize: 10 }}
                      interval={0}
                    />
                    <ChartTooltip content={<ChartTooltipContent />} />
                    <Legend />
                    {divisionData.map((division, index) => (
                      <Bar key={division.name} dataKey={division.name} fill={CHART_COLORS[index]} />
                    ))}
                  </BarChart>
                </ResponsiveContainer>
              </ChartContainer>
            </CardContent>
          </Card>

          {/* Section 8: Trends Over Time */}
          {trendData.length > 1 && (
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <TrendingUp className="h-5 w-5" />
                  Trends Over Time
                </CardTitle>
                <p className="text-sm text-muted-foreground">Key metrics tracked by submission date</p>
              </CardHeader>
              <CardContent>
                <ChartContainer config={{}} className="h-[350px] w-full">
                  <ResponsiveContainer width="100%" height="100%">
                    <LineChart data={trendData} margin={{ top: 5, right: 30, left: 20, bottom: 5 }}>
                      <CartesianGrid strokeDasharray="3 3" />
                      <XAxis dataKey="date" tick={{ fontSize: 10 }} />
                      <YAxis domain={[0, 5]} />
                      <ChartTooltip content={<ChartTooltipContent />} />
                      <Legend />
                      <Line type="monotone" dataKey="satisfaction" stroke={CHART_COLORS[0]} strokeWidth={2} name="Job Satisfaction" />
                      <Line type="monotone" dataKey="engagement" stroke={CHART_COLORS[1]} strokeWidth={2} name="Would Recommend" />
                      <Line type="monotone" dataKey="training" stroke={CHART_COLORS[2]} strokeWidth={2} name="Training Satisfaction" />
                    </LineChart>
                  </ResponsiveContainer>
                </ChartContainer>
              </CardContent>
            </Card>
          )}

          {/* Section 9: Communication Preferences */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <Card>
              <CardHeader>
                <CardTitle>Communication Preferences</CardTitle>
                <p className="text-sm text-muted-foreground">How employees prefer to receive updates</p>
              </CardHeader>
              <CardContent>
                <ChartContainer config={{}} className="h-[350px] w-full">
                  <ResponsiveContainer width="100%" height="100%">
                    <BarChart data={communicationPrefData} layout="vertical" margin={{ left: 150, right: 20, top: 10, bottom: 10 }}>
                      <CartesianGrid strokeDasharray="3 3" />
                      <XAxis type="number" />
                      <YAxis dataKey="name" type="category" width={140} tick={{ fontSize: 11 }} />
                      <ChartTooltip content={<ChartTooltipContent />} />
                      <Bar dataKey="value" radius={4}>
                        {communicationPrefData.map((entry, index) => (
                          <Cell key={`cell-${index}`} fill={entry.fill} />
                        ))}
                      </Bar>
                    </BarChart>
                  </ResponsiveContainer>
                </ChartContainer>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Motivation Factors</CardTitle>
                <p className="text-sm text-muted-foreground">What drives employee engagement</p>
              </CardHeader>
              <CardContent>
                <ChartContainer config={{}} className="h-[350px] w-full">
                  <ResponsiveContainer width="100%" height="100%">
                    <BarChart data={motivationData} layout="vertical" margin={{ left: 150, right: 20, top: 10, bottom: 10 }}>
                      <CartesianGrid strokeDasharray="3 3" />
                      <XAxis type="number" />
                      <YAxis dataKey="name" type="category" width={140} tick={{ fontSize: 11 }} />
                      <ChartTooltip content={<ChartTooltipContent />} />
                      <Bar dataKey="value" radius={4}>
                        {motivationData.map((entry, index) => (
                          <Cell key={`cell-${index}`} fill={entry.fill} />
                        ))}
                      </Bar>
                    </BarChart>
                  </ResponsiveContainer>
                </ChartContainer>
              </CardContent>
            </Card>
          </div>

          {/* Section 10: Information Preferences */}
          <Card>
            <CardHeader>
              <CardTitle>Information Preferences</CardTitle>
              <p className="text-sm text-muted-foreground">Topics employees want more information about</p>
            </CardHeader>
            <CardContent>
              <ChartContainer config={{}} className="h-[350px] w-full">
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={informationPrefData} margin={{ top: 10, right: 30, left: 20, bottom: 80 }}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="name" angle={-45} textAnchor="end" height={80} tick={{ fontSize: 10 }} />
                    <YAxis />
                    <ChartTooltip content={<ChartTooltipContent />} />
                    <Bar dataKey="value" radius={4}>
                      {informationPrefData.map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={entry.fill} />
                      ))}
                    </Bar>
                  </BarChart>
                </ResponsiveContainer>
              </ChartContainer>
            </CardContent>
          </Card>

        </TabsContent>

        <TabsContent value="comments">
          <CommentsSection responses={filteredResponses} />
        </TabsContent>

        <TabsContent value="ai-analysis">
          <AIAnalysisSection responses={filteredResponses} />
        </TabsContent>
      </Tabs>
    </div>
  );
};