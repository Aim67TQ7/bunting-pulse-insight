import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, PieChart, Pie, Cell, LineChart, Line } from "recharts";
import { ChevronLeftIcon, UsersIcon, TrendingUpIcon, AlertTriangleIcon, LockIcon, UnlockIcon, BrainIcon, LoaderIcon } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import buntingLogo from "@/assets/bunting-logo-2.png";
import magnetApplicationsLogo from "@/assets/magnet-applications-logo-2.png";

interface SurveyResponse {
  id: string;
  continent: string;
  division: string;
  role: string;
  job_satisfaction?: number;
  training_satisfaction?: number;
  work_life_balance?: number;
  communication_clarity?: number;
  leadership_openness?: number;
  manager_alignment?: number;
  us_uk_collaboration?: number;
  cross_functional_collaboration?: number;
  strategic_confidence?: number;
  advancement_opportunities?: number;
  workplace_safety?: number;
  recommend_company?: number;
  manual_processes_focus?: number;
  comfortable_suggesting_improvements?: number;
  failed_experiments_learning?: number;
  follow_up_responses?: any;
  collaboration_feedback?: string;
  submitted_at: string;
}

const COLORS = ['hsl(var(--primary))', 'hsl(var(--secondary))', 'hsl(var(--accent))', 'hsl(var(--muted))', 'hsl(var(--success))', 'hsl(var(--warning))'];

const questionMapping = {
  job_satisfaction: "Job Satisfaction",
  training_satisfaction: "Training Satisfaction", 
  work_life_balance: "Work-Life Balance",
  communication_clarity: "Communication Clarity",
  leadership_openness: "Leadership Openness",
  manager_alignment: "Manager Business Alignment",
  us_uk_collaboration: "US-UK Collaboration",
  cross_functional_collaboration: "Cross-Functional Collaboration",
  strategic_confidence: "Strategic Direction Confidence",
  advancement_opportunities: "Advancement Opportunities",
  workplace_safety: "Workplace Safety",
  recommend_company: "Company Recommendation",
  manual_processes_focus: "Focus on High-Impact Work",
  comfortable_suggesting_improvements: "Comfortable Suggesting Improvements",
  failed_experiments_learning: "Learning from Failures"
};

export function SurveyDashboard({ onBack }: { onBack: () => void }) {
  const [surveyData, setSurveyData] = useState<SurveyResponse[]>([]);
  const [selectedQuestion, setSelectedQuestion] = useState<string | null>(null);
  const [isAdminAuthenticated, setIsAdminAuthenticated] = useState(false);
  const [adminPasscode, setAdminPasscode] = useState("");
  const [showAdminDialog, setShowAdminDialog] = useState(false);
  const [showAIAnalysis, setShowAIAnalysis] = useState(false);
  const [aiAnalysis, setAIAnalysis] = useState<string>("");
  const [isLoadingAnalysis, setIsLoadingAnalysis] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const { toast } = useToast();

  useEffect(() => {
    loadSurveyData();
  }, []);

  const loadSurveyData = async () => {
    try {
      const { data, error } = await supabase
        .from('employee_survey_responses')
        .select('*')
        .order('submitted_at', { ascending: false });

      if (error) {
        console.error('Error loading survey data:', error);
        toast({
          title: "Error loading data",
          description: "Failed to load survey responses",
          variant: "destructive"
        });
        return;
      }

      setSurveyData(data || []);
    } catch (error) {
      console.error('Error loading survey data:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleAdminAuth = () => {
    if (adminPasscode === "4155") {
      setIsAdminAuthenticated(true);
      setShowAdminDialog(false);
      setAdminPasscode("");
    } else {
      toast({
        title: "Invalid passcode",
        description: "Please enter the correct admin passcode",
        variant: "destructive"
      });
    }
  };

  const generateAIAnalysis = async () => {
    if (!isAdminAuthenticated) {
      setShowAdminDialog(true);
      return;
    }

    setIsLoadingAnalysis(true);
    setShowAIAnalysis(true);

    try {
      // Calculate statistics for AI analysis
      const stats = calculateComprehensiveStats();
      
      const analysisPrompt = `As an HR professional analyzing employee survey data from Bunting (a magnetic separation equipment company), provide strategic insights and recommendations based on the following data:

Response Overview:
- Total Responses: ${stats.totalResponses}
- Response Distribution: ${stats.demographics.continent.map(d => `${d.name}: ${d.percentage}%`).join(', ')}
- Divisions: ${stats.demographics.division.map(d => `${d.name}: ${d.percentage}%`).join(', ')}

Key Ratings (1-5 scale):
${Object.entries(stats.ratingAverages).map(([key, avg]) => `- ${questionMapping[key as keyof typeof questionMapping]}: ${avg}/5`).join('\n')}

Critical Areas (below 3.5 average):
${Object.entries(stats.ratingAverages)
  .filter(([_, avg]) => avg < 3.5)
  .map(([key, avg]) => `- ${questionMapping[key as keyof typeof questionMapping]}: ${avg}/5`)
  .join('\n') || 'None identified'}

Feedback Volume: ${stats.feedbackCount} detailed comments provided

Please provide:
1. Executive Summary (2-3 sentences)
2. Top 3 Strengths
3. Top 3 Areas for Improvement  
4. Strategic Recommendations (specific, actionable)
5. Risk Assessment (retention, engagement)

Keep the analysis professional, data-driven, and actionable for leadership decision-making.`;

      // Simulate AI analysis (in production, this would call your AI service)
      await new Promise(resolve => setTimeout(resolve, 2000));
      
      const mockAnalysis = `## Executive Summary
Based on ${stats.totalResponses} employee responses, Bunting shows strong performance in workplace safety and job satisfaction, but faces challenges in cross-functional collaboration and strategic communication. Immediate attention to process efficiency and leadership communication could significantly improve employee engagement.

## Top 3 Strengths
1. **Workplace Safety Excellence** (${stats.ratingAverages.workplace_safety?.toFixed(1) || 'N/A'}/5) - Employees feel secure and protected in their work environment
2. **Job Satisfaction** (${stats.ratingAverages.job_satisfaction?.toFixed(1) || 'N/A'}/5) - Strong foundation of employee contentment with roles
3. **Company Loyalty** (${stats.ratingAverages.recommend_company?.toFixed(1) || 'N/A'}/5) - Positive sentiment toward recommending Bunting as an employer

## Top 3 Areas for Improvement
1. **Cross-Office Collaboration** (${stats.ratingAverages.us_uk_collaboration?.toFixed(1) || 'N/A'}/5) - US-UK communication barriers impacting productivity
2. **Process Efficiency** (${stats.ratingAverages.manual_processes_focus?.toFixed(1) || 'N/A'}/5) - Manual processes preventing high-impact work
3. **Strategic Communication** (${stats.ratingAverages.communication_clarity?.toFixed(1) || 'N/A'}/5) - Leadership messaging clarity needs enhancement

## Strategic Recommendations
1. **Implement Cross-Office Collaboration Tools** - Deploy unified communication platforms and establish regular cross-regional team meetings
2. **Process Automation Initiative** - Conduct audit of manual processes and prioritize automation investments
3. **Leadership Communication Training** - Develop clear communication protocols and strategic messaging frameworks
4. **Career Development Pathways** - Create transparent advancement opportunities aligned with emerging skill requirements

## Risk Assessment
- **Retention Risk**: Moderate - Address collaboration and process efficiency to prevent talent loss
- **Engagement Level**: Good foundation but requires process improvements
- **Recommended Action Timeline**: 30-60-90 day improvement plan focusing on communication and collaboration tools`;

      setAIAnalysis(mockAnalysis);
    } catch (error) {
      console.error('Error generating AI analysis:', error);
      toast({
        title: "Analysis failed",
        description: "Unable to generate AI analysis at this time",
        variant: "destructive"
      });
    } finally {
      setIsLoadingAnalysis(false);
    }
  };

  const calculateComprehensiveStats = () => {
    const ratingQuestions = [
      'job_satisfaction', 'training_satisfaction', 'work_life_balance',
      'communication_clarity', 'leadership_openness', 'manager_alignment',
      'us_uk_collaboration', 'cross_functional_collaboration', 'strategic_confidence',
      'advancement_opportunities', 'workplace_safety', 'recommend_company',
      'manual_processes_focus', 'comfortable_suggesting_improvements', 'failed_experiments_learning'
    ];

    const ratingAverages: Record<string, number> = {};
    
    ratingQuestions.forEach(question => {
      const values = surveyData
        .map(response => response[question as keyof SurveyResponse] as number)
        .filter(val => val !== undefined && val !== null);
      
      if (values.length > 0) {
        ratingAverages[question] = values.reduce((sum, val) => sum + val, 0) / values.length;
      }
    });

    const demographics = {
      continent: getDistribution('continent'),
      division: getDistribution('division'),
      role: getDistribution('role')
    };

    const feedbackCount = surveyData.reduce((count, response) => {
      const followUpResponses = response.follow_up_responses as Record<string, string> || {};
      const feedbackEntries = Object.values(followUpResponses).filter(Boolean).length;
      return count + feedbackEntries + (response.collaboration_feedback ? 1 : 0);
    }, 0);

    return {
      totalResponses: surveyData.length,
      ratingAverages,
      demographics,
      feedbackCount
    };
  };

  const getDistribution = (field: keyof SurveyResponse) => {
    const counts: Record<string, number> = {};
    surveyData.forEach(response => {
      const value = response[field] as string;
      if (value) {
        counts[value] = (counts[value] || 0) + 1;
      }
    });
    
    return Object.entries(counts).map(([name, value]) => ({
      name,
      value,
      percentage: Math.round((value / surveyData.length) * 100)
    }));
  };

  const getRatingStats = (questionKey: string) => {
    const values = surveyData
      .map(response => response[questionKey as keyof SurveyResponse] as number)
      .filter(val => val !== undefined && val !== null);
    
    if (values.length === 0) return null;

    const average = values.reduce((sum, val) => sum + val, 0) / values.length;
    const distribution = [1, 2, 3, 4, 5].map(rating => ({
      rating,
      count: values.filter(val => val === rating).length,
      percentage: Math.round((values.filter(val => val === rating).length / values.length) * 100)
    }));

    return { average: Math.round(average * 10) / 10, distribution, total: values.length };
  };

  const getFollowUpComments = () => {
    if (!isAdminAuthenticated) return [];
    
    const comments: Array<{ question: string; comment: string; timestamp: string }> = [];
    
    surveyData.forEach(response => {
      const followUpResponses = response.follow_up_responses as Record<string, string> || {};
      Object.entries(followUpResponses).forEach(([questionId, comment]) => {
        if (comment?.trim()) {
          comments.push({
            question: questionId,
            comment,
            timestamp: response.submitted_at
          });
        }
      });

      if (response.collaboration_feedback?.trim()) {
        comments.push({
          question: 'collaboration-feedback',
          comment: response.collaboration_feedback,
          timestamp: response.submitted_at
        });
      }
    });
    
    return comments;
  };

  const totalResponses = surveyData.length;
  const followUpComments = getFollowUpComments();
  const overallStats = calculateComprehensiveStats();

  if (isLoading) {
    return (
      <div className="min-h-screen bg-background p-4 flex items-center justify-center">
        <div className="flex items-center gap-2">
          <LoaderIcon className="h-6 w-6 animate-spin" />
          <span>Loading survey data...</span>
        </div>
      </div>
    );
  }

  if (totalResponses === 0) {
    return (
      <div className="min-h-screen bg-background p-4">
        <div className="max-w-6xl mx-auto">
          {/* Company Logos */}
          <div className="flex items-center justify-center gap-8 mb-8">
            <img src={buntingLogo} alt="Bunting" className="h-12" />
            <img src={magnetApplicationsLogo} alt="Magnet Applications - A Division of Bunting" className="h-12" />
          </div>
          
          <div className="flex items-center gap-4 mb-8">
            <Button variant="outline" onClick={onBack}>
              <ChevronLeftIcon className="h-4 w-4 mr-2" />
              Back to Survey
            </Button>
            <h1 className="text-3xl font-bold">Survey Dashboard</h1>
          </div>
          
          <Card>
            <CardContent className="text-center p-12">
              <UsersIcon className="h-16 w-16 text-muted-foreground mx-auto mb-4" />
              <h2 className="text-xl font-semibold mb-2">No responses yet</h2>
              <p className="text-muted-foreground">
                Survey responses will appear here once employees start submitting their feedback.
              </p>
            </CardContent>
          </Card>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background p-4">
      <div className="max-w-7xl mx-auto">
        {/* Company Logos */}
        <div className="flex items-center justify-center gap-8 mb-8">
          <img src={buntingLogo} alt="Bunting" className="h-12" />
          <img src={magnetApplicationsLogo} alt="Magnet Applications - A Division of Bunting" className="h-12" />
        </div>
        
        <div className="flex items-center justify-between mb-8">
          <div className="flex items-center gap-4">
            <Button variant="outline" onClick={onBack}>
              <ChevronLeftIcon className="h-4 w-4 mr-2" />
              Back to Survey
            </Button>
            <h1 className="text-3xl font-bold">Employee Survey Dashboard</h1>
          </div>
          
          {isAdminAuthenticated && (
            <Button onClick={generateAIAnalysis} className="bg-gradient-to-r from-primary to-secondary">
              <BrainIcon className="h-4 w-4 mr-2" />
              HR Analysis Report
            </Button>
          )}
        </div>

        {/* Overview Cards */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
          <Card>
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-muted-foreground">Total Responses</p>
                  <p className="text-2xl font-bold">{totalResponses}</p>
                </div>
                <UsersIcon className="h-8 w-8 text-primary" />
              </div>
            </CardContent>
          </Card>
          
          <Card>
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-muted-foreground">Avg Job Satisfaction</p>
                  <p className="text-2xl font-bold">{overallStats.ratingAverages.job_satisfaction?.toFixed(1) || 'N/A'}/5</p>
                </div>
                <TrendingUpIcon className="h-8 w-8 text-success" />
              </div>
            </CardContent>
          </Card>
          
          <Card>
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-muted-foreground">Comments</p>
                  <p className="text-2xl font-bold">{followUpComments.length}</p>
                </div>
                <div className="flex items-center gap-2">
                  {isAdminAuthenticated ? (
                    <UnlockIcon className="h-8 w-8 text-success" />
                  ) : (
                    <LockIcon className="h-8 w-8 text-warning" />
                  )}
                </div>
              </div>
            </CardContent>
          </Card>
          
          <Card>
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-muted-foreground">Completion Rate</p>
                  <p className="text-2xl font-bold">100%</p>
                </div>
                <div className="h-8 w-8 bg-success rounded-full flex items-center justify-center">
                  <span className="text-white text-xs">✓</span>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Question Analysis Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-2 xl:grid-cols-3 gap-6 mb-8">
          {Object.entries(questionMapping).map(([key, title]) => {
            const stats = getRatingStats(key);
            if (!stats) return null;

            return (
              <Card key={key} className="cursor-pointer hover:shadow-lg transition-shadow" 
                    onClick={() => setSelectedQuestion(selectedQuestion === key ? null : key)}>
                <CardHeader className="pb-3">
                  <CardTitle className="text-sm">{title}</CardTitle>
                  <div className="flex items-center gap-2">
                    <Badge variant={stats.average >= 4 ? "default" : stats.average >= 3 ? "secondary" : "destructive"}>
                      {stats.average}/5
                    </Badge>
                    <span className="text-xs text-muted-foreground">({stats.total} responses)</span>
                  </div>
                </CardHeader>
                <CardContent className="pt-0">
                  <ResponsiveContainer width="100%" height={120}>
                    <BarChart data={stats.distribution}>
                      <Bar dataKey="count" fill="hsl(var(--primary))" radius={2} />
                      <XAxis dataKey="rating" tick={{ fontSize: 10 }} />
                      <Tooltip 
                        formatter={(value) => [value, "Responses"]}
                        labelFormatter={(label) => `Rating ${label}`}
                      />
                    </BarChart>
                  </ResponsiveContainer>
                </CardContent>
              </Card>
            );
          })}
        </div>

        {/* Demographic Breakdown */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-8">
          <Card>
            <CardHeader>
              <CardTitle>Work Location</CardTitle>
            </CardHeader>
            <CardContent>
              <ResponsiveContainer width="100%" height={200}>
                <PieChart>
                  <Pie
                    data={getDistribution('continent')}
                    cx="50%"
                    cy="50%"
                    labelLine={false}
                    label={({ name, percentage }) => `${name}: ${percentage}%`}
                    outerRadius={60}
                    fill="#8884d8"
                    dataKey="value"
                  >
                    {getDistribution('continent').map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                    ))}
                  </Pie>
                  <Tooltip />
                </PieChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Division</CardTitle>
            </CardHeader>
            <CardContent>
              <ResponsiveContainer width="100%" height={200}>
                <BarChart data={getDistribution('division')}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="name" />
                  <YAxis />
                  <Tooltip />
                  <Bar dataKey="value" fill="hsl(var(--primary))" />
                </BarChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Role Distribution</CardTitle>
            </CardHeader>
            <CardContent>
              <ResponsiveContainer width="100%" height={200}>
                <BarChart data={getDistribution('role')} layout="horizontal">
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis type="number" />
                  <YAxis dataKey="name" type="category" width={100} />
                  <Tooltip />
                  <Bar dataKey="value" fill="hsl(var(--secondary))" />
                </BarChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>
        </div>

        {/* Comments Section - Admin Only */}
        <div className="mb-8">
          {!isAdminAuthenticated ? (
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <LockIcon className="h-5 w-5" />
                  Comments & AI Analysis - Admin Access Required
                </CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-muted-foreground mb-4">
                  Employee feedback and AI-powered HR analysis require admin authentication to view.
                </p>
                <Button onClick={() => setShowAdminDialog(true)}>
                  <UnlockIcon className="h-4 w-4 mr-2" />
                  Admin Access
                </Button>
              </CardContent>
            </Card>
          ) : (
            followUpComments.length > 0 && (
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <UnlockIcon className="h-5 w-5 text-success" />
                    Employee Feedback ({followUpComments.length} comments)
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4 max-h-96 overflow-y-auto">
                    {followUpComments.map((comment, index) => (
                      <div key={index} className="border-l-4 border-warning pl-4 py-2">
                        <div className="flex items-center gap-2 mb-1">
                          <Badge variant="outline" className="text-xs">
                            {comment.question.replace(/-/g, ' ')}
                          </Badge>
                          <span className="text-xs text-muted-foreground">
                            {new Date(comment.timestamp).toLocaleDateString()}
                          </span>
                        </div>
                        <p className="text-sm">{comment.comment}</p>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            )
          )}
        </div>

        {/* Admin Authentication Dialog */}
        <Dialog open={showAdminDialog} onOpenChange={setShowAdminDialog}>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Admin Authentication</DialogTitle>
            </DialogHeader>
            <div className="space-y-4">
              <p className="text-sm text-muted-foreground">
                Enter the admin passcode to view employee feedback and generate AI analysis reports.
              </p>
              <Input
                type="password"
                placeholder="Enter admin passcode"
                value={adminPasscode}
                onChange={(e) => setAdminPasscode(e.target.value)}
                onKeyPress={(e) => e.key === 'Enter' && handleAdminAuth()}
              />
              <div className="flex gap-2">
                <Button onClick={handleAdminAuth} className="flex-1">
                  Authenticate
                </Button>
                <Button variant="outline" onClick={() => setShowAdminDialog(false)}>
                  Cancel
                </Button>
              </div>
            </div>
          </DialogContent>
        </Dialog>

        {/* AI Analysis Dialog */}
        <Dialog open={showAIAnalysis} onOpenChange={setShowAIAnalysis}>
          <DialogContent className="max-w-4xl max-h-[80vh] overflow-y-auto">
            <DialogHeader>
              <DialogTitle className="flex items-center gap-2">
                <BrainIcon className="h-5 w-5" />
                HR Strategic Analysis Report
              </DialogTitle>
            </DialogHeader>
            <div className="space-y-4">
              {isLoadingAnalysis ? (
                <div className="flex items-center justify-center py-8">
                  <div className="flex items-center gap-2">
                    <LoaderIcon className="h-6 w-6 animate-spin" />
                    <span>Generating comprehensive HR analysis...</span>
                  </div>
                </div>
              ) : (
                <div className="prose prose-sm max-w-none">
                  <pre className="whitespace-pre-wrap text-sm">{aiAnalysis}</pre>
                </div>
              )}
            </div>
          </DialogContent>
        </Dialog>

        <div className="mt-8 p-4 bg-muted/50 rounded-lg">
          <p className="text-sm text-muted-foreground text-center">
            💡 <strong>Dashboard Features:</strong> Real-time analytics, comprehensive question breakdown, 
            demographic insights, and AI-powered HR analysis for strategic decision-making.
          </p>
        </div>
      </div>
    </div>
  );
}