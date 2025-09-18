import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Progress } from "@/components/ui/progress";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, PieChart, Pie, Cell } from "recharts";
import { ChevronLeftIcon, ChevronDownIcon, ChevronRightIcon, UsersIcon, TrendingUpIcon, AlertTriangleIcon, LockIcon, UnlockIcon, BrainIcon, LoaderIcon } from "lucide-react";
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from "@/components/ui/collapsible";
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
  manager_alignment?: number;
  us_uk_collaboration?: number;
  cross_functional_collaboration?: number;
  strategic_confidence?: number;
  advancement_opportunities?: number;
  workplace_safety?: number;
  recommend_company?: number;
  manual_processes_focus?: number;
  comfortable_suggesting_improvements?: number;
  communication_preferences?: string[];
  motivation_factors?: string[];
  information_preferences?: string[];
  follow_up_responses?: any;
  collaboration_feedback?: string;
  additional_comments?: string;
  submitted_at: string;
}

const COLORS = ['hsl(var(--primary))', 'hsl(var(--secondary))', 'hsl(var(--accent))', 'hsl(var(--muted))', 'hsl(var(--success))', 'hsl(var(--warning))'];

const surveySections = [
  {
    id: "job-satisfaction",
    title: "Job & Role Satisfaction",
    description: "Overall satisfaction with job, training, and work-life balance",
    questions: [
      { key: "job_satisfaction", label: "Job Satisfaction" },
      { key: "training_satisfaction", label: "Training Satisfaction" },
      { key: "work_life_balance", label: "Work-Life Balance" }
    ]
  },
  {
    id: "leadership-communication",
    title: "Leadership & Communication",
    description: "Communication clarity and leadership effectiveness",
    questions: [
      { key: "communication_clarity", label: "Communication Clarity" },
      { key: "manager_alignment", label: "Manager Business Alignment" }
    ],
    multiSelect: [
      { key: "communication_preferences", label: "Communication Preferences" }
    ]
  },
  {
    id: "collaboration",
    title: "Collaboration & Cross-Functional Work",
    description: "Team collaboration and cross-functional effectiveness",
    questions: [
      { key: "us_uk_collaboration", label: "US-UK Collaboration" },
      { key: "cross_functional_collaboration", label: "Cross-Functional Collaboration" }
    ],
    multiSelect: [
      { key: "motivation_factors", label: "Motivation Factors" }
    ]
  },
  {
    id: "growth-alignment",
    title: "Growth & Strategic Alignment",
    description: "Strategic confidence and career development opportunities",
    questions: [
      { key: "strategic_confidence", label: "Strategic Direction Confidence" },
      { key: "advancement_opportunities", label: "Advancement Opportunities" }
    ]
  },
  {
    id: "process-innovation",
    title: "Process Efficiency & Innovation",
    description: "Process improvement and innovation comfort",
    questions: [
      { key: "manual_processes_focus", label: "Focus on High-Impact Work" },
      { key: "comfortable_suggesting_improvements", label: "Comfortable Suggesting Improvements" }
    ]
  },
  {
    id: "workplace-experience",
    title: "Workplace Experience",
    description: "Safety, company recommendation, and information needs",
    questions: [
      { key: "workplace_safety", label: "Workplace Safety" },
      { key: "recommend_company", label: "Company Recommendation" }
    ],
    multiSelect: [
      { key: "information_preferences", label: "Information Preferences" }
    ]
  }
];

export function SurveyDashboardNew({ onBack, setCurrentView }: { onBack: () => void; setCurrentView: (view: string) => void }) {
  const [surveyData, setSurveyData] = useState<SurveyResponse[]>([]);
  const [expandedSections, setExpandedSections] = useState<Set<string>>(new Set());
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
    
    // Set up real-time subscription
    const channel = supabase
      .channel('schema-db-changes')
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'employee_survey_responses'
        },
        () => {
          loadSurveyData();
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, []);

  const loadSurveyData = async () => {
    console.log('SurveyDashboardNew: Loading survey data...');
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

      console.log('SurveyDashboardNew: Survey data loaded:', data);
      console.log('SurveyDashboardNew: Number of responses:', data?.length || 0);
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
      toast({
        title: "Admin access granted",
        description: "You can now view comments and generate AI analysis"
      });
    } else {
      toast({
        title: "Invalid passcode",
        description: "Please check your admin passcode",
        variant: "destructive"
      });
    }
  };

  const toggleSection = (sectionId: string) => {
    const newExpanded = new Set(expandedSections);
    if (newExpanded.has(sectionId)) {
      newExpanded.delete(sectionId);
    } else {
      newExpanded.add(sectionId);
    }
    setExpandedSections(newExpanded);
  };

  const calculateSectionAverage = (section: typeof surveySections[0]) => {
    if (surveyData.length === 0) return 0;
    
    const validResponses = section.questions
      .map(q => surveyData
        .map(response => response[q.key as keyof SurveyResponse] as number)
        .filter(value => value != null))
      .flat();
    
    if (validResponses.length === 0) return 0;
    return validResponses.reduce((sum, val) => sum + val, 0) / validResponses.length;
  };

  const getSectionStatus = (average: number) => {
    if (average >= 4) return { status: "excellent", color: "bg-green-500", textColor: "text-green-700" };
    if (average >= 3.5) return { status: "good", color: "bg-blue-500", textColor: "text-blue-700" };
    if (average >= 3) return { status: "neutral", color: "bg-yellow-500", textColor: "text-yellow-700" };
    if (average >= 2) return { status: "poor", color: "bg-orange-500", textColor: "text-orange-700" };
    return { status: "critical", color: "bg-red-500", textColor: "text-red-700" };
  };

  const generateChartData = (questionKey: string) => {
    const counts = { 1: 0, 2: 0, 3: 0, 4: 0, 5: 0 };
    
    surveyData.forEach(response => {
      const value = response[questionKey as keyof SurveyResponse] as number;
      if (value && value >= 1 && value <= 5) {
        counts[value as keyof typeof counts]++;
      }
    });

    return Object.entries(counts).map(([rating, count]) => ({
      rating: `${rating}`,
      count,
      percentage: surveyData.length > 0 ? Math.round((count / surveyData.length) * 100) : 0
    }));
  };

  const generateMultiSelectData = (questionKey: string) => {
    const optionCounts: Record<string, number> = {};
    
    surveyData.forEach(response => {
      const values = response[questionKey as keyof SurveyResponse] as string[];
      if (Array.isArray(values)) {
        values.forEach(value => {
          optionCounts[value] = (optionCounts[value] || 0) + 1;
        });
      }
    });

    return Object.entries(optionCounts)
      .map(([option, count]) => ({
        option: option.replace(/-/g, ' ').replace(/\b\w/g, l => l.toUpperCase()),
        count,
        percentage: surveyData.length > 0 ? Math.round((count / surveyData.length) * 100) : 0
      }))
      .sort((a, b) => b.count - a.count);
  };

  const getDemographicData = () => {
    const continentData = surveyData.reduce((acc: Record<string, number>, response) => {
      acc[response.continent] = (acc[response.continent] || 0) + 1;
      return acc;
    }, {});

    const divisionData = surveyData.reduce((acc: Record<string, number>, response) => {
      acc[response.division] = (acc[response.division] || 0) + 1;
      return acc;
    }, {});

    const roleData = surveyData.reduce((acc: Record<string, number>, response) => {
      acc[response.role] = (acc[response.role] || 0) + 1;
      return acc;
    }, {});

    return { continentData, divisionData, roleData };
  };

  const generateAIAnalysis = async () => {
    if (totalResponses < 10) {
      toast({
        title: "Insufficient data",
        description: `AI analysis requires at least 10 responses. Currently have ${totalResponses} responses.`,
        variant: "destructive"
      });
      return;
    }

    if (!isAdminAuthenticated) {
      setShowAdminDialog(true);
      return;
    }

    setIsLoadingAnalysis(true);
    // This would integrate with an AI service - placeholder for now
    setTimeout(() => {
      setAIAnalysis(`AI Analysis Report (Based on ${totalResponses} responses)

KEY INSIGHTS:
${surveySections.map(section => {
  const avg = calculateSectionAverage(section);
  const status = getSectionStatus(avg).status;
  return `• ${section.title}: ${avg.toFixed(1)}/5 (${status})`;
}).join('\n')}

RECOMMENDATIONS:
• Focus on areas scoring below 3.5/5
• Investigate low-scoring sections for improvement opportunities
• Monitor trends over time as more responses are collected

This is a placeholder analysis. In production, this would use AI to analyze the actual survey responses and provide detailed insights.`);
      setIsLoadingAnalysis(false);
      setShowAIAnalysis(true);
    }, 2000);
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <LoaderIcon className="h-8 w-8 animate-spin" />
      </div>
    );
  }

  if (surveyData.length === 0) {
    return (
      <div className="min-h-screen bg-background p-4">
        <div className="max-w-6xl mx-auto">
          <div className="flex items-center justify-between mb-8">
            <Button variant="outline" onClick={onBack} className="flex items-center gap-2">
              <ChevronLeftIcon className="h-4 w-4" />
              Back to Survey
            </Button>
          </div>
          <Card>
            <CardContent className="text-center p-8">
              <AlertTriangleIcon className="h-12 w-12 text-warning mx-auto mb-4" />
              <h2 className="text-xl font-semibold mb-2">No Survey Data</h2>
              <p className="text-muted-foreground">
                No survey responses have been submitted yet. Complete the survey to see analytics.
              </p>
            </CardContent>
          </Card>
        </div>
      </div>
    );
  }

  const { continentData, divisionData, roleData } = getDemographicData();
  const totalResponses = surveyData.length;

  return (
    <div className="min-h-screen bg-background p-4">
      <div className="max-w-6xl mx-auto">
        {/* Header */}
        <div className="flex items-center justify-between mb-8">
          <div className="flex items-center gap-4">
            <Button variant="outline" onClick={onBack} className="flex items-center gap-2">
              <ChevronLeftIcon className="h-4 w-4" />
              Back to Survey
            </Button>
            <div className="flex items-center gap-4">
              <img src={buntingLogo} alt="Bunting" className="h-8" />
              <img src={magnetApplicationsLogo} alt="Magnet Applications" className="h-8" />
            </div>
          </div>
          <div className="flex items-center gap-4">
            <Button
              onClick={generateAIAnalysis}
              disabled={isLoadingAnalysis || totalResponses < 10}
              className="flex items-center gap-2"
              variant={totalResponses >= 10 ? "default" : "outline"}
            >
              {isLoadingAnalysis ? (
                <LoaderIcon className="h-4 w-4 animate-spin" />
              ) : (
                <BrainIcon className="h-4 w-4" />
              )}
              {totalResponses >= 10 ? 'Generate AI Analysis' : `AI Analysis (${totalResponses}/10 responses)`}
            </Button>
            <Button
              onClick={() => setCurrentView("admin")}
              variant="ghost"
              size="sm"
              className="text-muted-foreground hover:text-foreground"
            >
              Admin
            </Button>
          </div>
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
                  <p className="text-sm font-medium text-muted-foreground">Avg. Job Satisfaction</p>
                  <p className="text-2xl font-bold">
                    {surveyData.filter(r => r.job_satisfaction).length > 0 
                      ? (surveyData.reduce((sum, r) => sum + (r.job_satisfaction || 0), 0) / 
                         surveyData.filter(r => r.job_satisfaction).length).toFixed(1)
                      : "N/A"}
                  </p>
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
                  <p className="text-2xl font-bold">
                    {surveyData.filter(r => r.collaboration_feedback || r.additional_comments).length}
                  </p>
                </div>
                {isAdminAuthenticated ? <UnlockIcon className="h-8 w-8 text-success" /> : <LockIcon className="h-8 w-8 text-warning" />}
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
                <AlertTriangleIcon className="h-8 w-8 text-primary" />
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Survey Sections */}
        <div className="space-y-6">
          {surveySections.map((section) => {
            const average = calculateSectionAverage(section);
            const { status, color, textColor } = getSectionStatus(average);
            const isExpanded = expandedSections.has(section.id);

            return (
              <Card key={section.id} className="overflow-hidden">
                <Collapsible open={isExpanded} onOpenChange={() => toggleSection(section.id)}>
                  <CollapsibleTrigger asChild>
                    <CardHeader className="cursor-pointer hover:bg-muted/50 transition-colors">
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-6">
                          {/* Circular Progress Dial */}
                          <div className="relative w-16 h-16 flex-shrink-0">
                            <svg className="w-16 h-16 transform -rotate-90" viewBox="0 0 64 64">
                              <circle
                                cx="32"
                                cy="32"
                                r="28"
                                stroke="hsl(var(--muted))"
                                strokeWidth="6"
                                fill="none"
                              />
                              <circle
                                cx="32"
                                cy="32"
                                r="28"
                                stroke={average >= 4 ? "hsl(var(--success))" : average >= 3.5 ? "hsl(var(--primary))" : average >= 3 ? "hsl(var(--warning))" : average >= 2 ? "hsl(var(--destructive))" : "hsl(var(--destructive))"}
                                strokeWidth="6"
                                fill="none"
                                strokeDasharray={`${(average / 5) * 176} 176`}
                                strokeLinecap="round"
                                className="transition-all duration-700 ease-out"
                              />
                            </svg>
                            <div className="absolute inset-0 flex items-center justify-center">
                              <span className="text-sm font-bold">{average.toFixed(1)}</span>
                            </div>
                          </div>
                          <div>
                            <CardTitle className="text-lg">{section.title}</CardTitle>
                            <p className="text-sm text-muted-foreground">{section.description}</p>
                          </div>
                        </div>
                        <div className="flex items-center gap-4">
                          <Badge variant="outline" className={textColor}>
                            {status.charAt(0).toUpperCase() + status.slice(1)}
                          </Badge>
                          {isExpanded ? <ChevronDownIcon className="h-5 w-5" /> : <ChevronRightIcon className="h-5 w-5" />}
                        </div>
                      </div>
                    </CardHeader>
                  </CollapsibleTrigger>
                  
                  <CollapsibleContent>
                    <CardContent className="pt-0">
                      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                        {/* Rating Questions */}
                        {section.questions.map((question) => (
                          <div key={question.key} className="space-y-3">
                            <h4 className="font-medium">{question.label}</h4>
                            <div className="h-48">
                              <ResponsiveContainer width="100%" height="100%">
                                <BarChart data={generateChartData(question.key)}>
                                  <CartesianGrid strokeDasharray="3 3" />
                                  <XAxis dataKey="rating" />
                                  <YAxis />
                                  <Tooltip 
                                    formatter={(value: any) => [value, 'Responses']}
                                    labelFormatter={(label) => `Rating: ${label}`}
                                  />
                                  <Bar dataKey="count" fill="hsl(var(--primary))" />
                                </BarChart>
                              </ResponsiveContainer>
                            </div>
                          </div>
                        ))}

                        {/* Multi-Select Questions */}
                        {section.multiSelect?.map((multiQ) => (
                          <div key={multiQ.key} className="space-y-3">
                            <h4 className="font-medium">{multiQ.label}</h4>
                            {multiQ.key === 'communication_preferences' ? (
                              // Pie chart for Communication Preferences
                              <div className="h-64">
                                <ResponsiveContainer width="100%" height="100%">
                                  <PieChart>
                                    <Pie
                                      data={generateMultiSelectData(multiQ.key)}
                                      cx="50%"
                                      cy="50%"
                                      innerRadius={40}
                                      outerRadius={80}
                                      dataKey="count"
                                      label={({ option, percentage }) => `${option}: ${percentage}%`}
                                      labelLine={false}
                                    >
                                      {generateMultiSelectData(multiQ.key).map((entry, index) => (
                                        <Cell 
                                          key={`cell-${index}`} 
                                          fill={COLORS[index % COLORS.length]} 
                                        />
                                      ))}
                                    </Pie>
                                    <Tooltip 
                                      formatter={(value: any, name: any, props: any) => [
                                        `${value} responses (${props.payload.percentage}%)`, 
                                        props.payload.option
                                      ]}
                                    />
                                  </PieChart>
                                </ResponsiveContainer>
                              </div>
                            ) : (
                              // Bar chart for other multi-select questions
                              <div className="h-48">
                                <ResponsiveContainer width="100%" height="100%">
                                  <BarChart data={generateMultiSelectData(multiQ.key)} layout="horizontal">
                                    <CartesianGrid strokeDasharray="3 3" />
                                    <XAxis type="number" />
                                    <YAxis dataKey="option" type="category" width={120} />
                                    <Tooltip formatter={(value: any) => [value, 'Responses']} />
                                    <Bar dataKey="count" fill="hsl(var(--accent))" />
                                  </BarChart>
                                </ResponsiveContainer>
                              </div>
                            )}
                          </div>
                        ))}
                      </div>
                    </CardContent>
                  </CollapsibleContent>
                </Collapsible>
              </Card>
            );
          })}
        </div>

        {/* Demographics Section */}
        <Card className="mt-8">
          <CardHeader>
            <CardTitle>Demographics Breakdown</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              {/* Continent Distribution */}
              <div>
                <h4 className="font-medium mb-3">By Continent</h4>
                <div className="h-64">
                  <ResponsiveContainer width="100%" height="100%">
                    <PieChart>
                      <Pie
                        data={Object.entries(continentData).map(([key, value], index) => ({
                          name: key,
                          value,
                          fill: COLORS[index % COLORS.length]
                        }))}
                        cx="50%"
                        cy="45%"
                        innerRadius={35}
                        outerRadius={55}
                        dataKey="value"
                        label={({ name, percent }) => `${name}: ${(percent * 100).toFixed(0)}%`}
                        labelLine={false}
                      />
                      <Tooltip />
                    </PieChart>
                  </ResponsiveContainer>
                </div>
              </div>

              {/* Division Distribution */}
              <div>
                <h4 className="font-medium mb-3">By Division</h4>
                <div className="h-64">
                  <ResponsiveContainer width="100%" height="100%">
                    <PieChart>
                      <Pie
                        data={Object.entries(divisionData).map(([key, value], index) => ({
                          name: key,
                          value,
                          fill: COLORS[index % COLORS.length]
                        }))}
                        cx="50%"
                        cy="45%"
                        innerRadius={35}
                        outerRadius={55}
                        dataKey="value"
                        label={({ name, percent }) => `${name}: ${(percent * 100).toFixed(0)}%`}
                        labelLine={false}
                      />
                      <Tooltip />
                    </PieChart>
                  </ResponsiveContainer>
                </div>
              </div>

              {/* Role Distribution */}
              <div>
                <h4 className="font-medium mb-3">By Role</h4>
                <div className="h-64">
                  <ResponsiveContainer width="100%" height="100%">
                    <PieChart>
                      <Pie
                        data={Object.entries(roleData).map(([key, value], index) => ({
                          name: key,
                          value,
                          fill: COLORS[index % COLORS.length]
                        }))}
                        cx="50%"
                        cy="45%"
                        innerRadius={35}
                        outerRadius={55}
                        dataKey="value"
                        label={({ name, percent }) => `${name}: ${(percent * 100).toFixed(0)}%`}
                        labelLine={false}
                      />
                      <Tooltip />
                    </PieChart>
                  </ResponsiveContainer>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Admin Comments Section */}
        {isAdminAuthenticated && (
          <Card className="mt-8">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <UnlockIcon className="h-5 w-5" />
                Comments & Feedback (Admin Only)
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {surveyData
                  .filter(response => response.collaboration_feedback || response.additional_comments)
                  .map((response, index) => (
                    <div key={response.id} className="border rounded-lg p-4">
                      <div className="flex items-center justify-between mb-2">
                        <Badge variant="outline">
                          Response #{index + 1}
                        </Badge>
                        <span className="text-sm text-muted-foreground">
                          {new Date(response.submitted_at).toLocaleDateString()}
                        </span>
                      </div>
                      {response.collaboration_feedback && (
                        <div className="mb-2">
                          <p className="font-medium text-sm">Collaboration Feedback:</p>
                          <p className="text-sm">{response.collaboration_feedback}</p>
                        </div>
                      )}
                      {response.additional_comments && (
                        <div>
                          <p className="font-medium text-sm">Additional Comments:</p>
                          <p className="text-sm">{response.additional_comments}</p>
                        </div>
                      )}
                    </div>
                  ))}
              </div>
            </CardContent>
          </Card>
        )}

        {/* Admin Dialog */}
        <Dialog open={showAdminDialog} onOpenChange={setShowAdminDialog}>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Admin Access Required</DialogTitle>
            </DialogHeader>
            <div className="space-y-4">
              <p className="text-sm text-muted-foreground">
                Enter the admin passcode to view comments and generate AI analysis.
              </p>
              <Input
                type="password"
                placeholder="Enter admin passcode"
                value={adminPasscode}
                onChange={(e) => setAdminPasscode(e.target.value)}
                onKeyPress={(e) => e.key === 'Enter' && handleAdminAuth()}
              />
              <div className="flex justify-end gap-2">
                <Button variant="outline" onClick={() => setShowAdminDialog(false)}>
                  Cancel
                </Button>
                <Button onClick={handleAdminAuth}>
                  Authenticate
                </Button>
              </div>
            </div>
          </DialogContent>
        </Dialog>

        {/* AI Analysis Dialog */}
        <Dialog open={showAIAnalysis} onOpenChange={setShowAIAnalysis}>
          <DialogContent className="max-w-4xl max-h-[80vh] overflow-y-auto">
            <DialogHeader>
              <DialogTitle>AI Analysis Report</DialogTitle>
            </DialogHeader>
            <div className="whitespace-pre-wrap text-sm">
              {aiAnalysis}
            </div>
          </DialogContent>
        </Dialog>
      </div>
    </div>
  );
}