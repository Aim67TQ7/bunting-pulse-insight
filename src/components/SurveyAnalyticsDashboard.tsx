import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { ArrowLeftIcon, DownloadIcon, FilterIcon } from "lucide-react";
import { ChartContainer, ChartTooltip, ChartTooltipContent } from "@/components/ui/chart";
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, ResponsiveContainer, PieChart, Pie, Cell, LineChart, Line } from "recharts";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import jsPDF from 'jspdf';
import html2canvas from 'html2canvas';

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

const COLORS = ['#0088FE', '#00C49F', '#FFBB28', '#FF8042', '#8884d8'];

export const SurveyAnalyticsDashboard = ({ onBack }: AnalyticsDashboardProps) => {
  const [responses, setResponses] = useState<SurveyResponse[]>([]);
  const [filteredResponses, setFilteredResponses] = useState<SurveyResponse[]>([]);
  const [loading, setLoading] = useState(true);
  const [filters, setFilters] = useState({
    continent: "all",
    division: "all", 
    role: "all",
    dateFrom: "",
    dateTo: "",
    minRating: "",
    maxRating: ""
  });
  const { toast } = useToast();

  useEffect(() => {
    loadResponses();
  }, []);

  useEffect(() => {
    applyFilters();
  }, [responses, filters]);

  const loadResponses = async () => {
    console.log('Loading survey responses...');
    try {
      const { data, error } = await supabase
        .from('employee_survey_responses')
        .select('*')
        .order('submitted_at', { ascending: false });

      if (error) throw error;
      
      console.log('Survey responses loaded:', data);
      console.log('Number of responses:', data?.length || 0);
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
    console.log('Applying filters to', responses.length, 'responses');
    console.log('Current filters:', filters);

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

    console.log('Filtered responses:', filtered.length);
    setFilteredResponses(filtered);
  };

  const clearFilters = () => {
    setFilters({
      continent: "all",
      division: "all",
      role: "all", 
      dateFrom: "",
      dateTo: "",
      minRating: "",
      maxRating: ""
    });
  };

  const getAverageRatings = () => {
    if (filteredResponses.length === 0) return [];

    const questions = Object.keys(questionLabels) as (keyof typeof questionLabels)[];
    return questions.map(question => ({
      question: questionLabels[question],
      average: filteredResponses.reduce((sum, response) => {
        const value = response[question];
        return sum + (typeof value === 'number' ? value : 0);
      }, 0) / filteredResponses.length
    })).sort((a, b) => b.average - a.average);
  };

  const getDemographicBreakdown = (field: keyof Pick<SurveyResponse, 'continent' | 'division' | 'role'>) => {
    const counts = filteredResponses.reduce((acc, response) => {
      const value = response[field];
      acc[value] = (acc[value] || 0) + 1;
      return acc;
    }, {} as Record<string, number>);

    return Object.entries(counts).map(([name, value]) => ({ name, value }));
  };

  const getSatisfactionTrend = () => {
    const groupedByDate = filteredResponses.reduce((acc, response) => {
      const date = new Date(response.submitted_at).toLocaleDateString();
      if (!acc[date]) {
        acc[date] = { date, total: 0, count: 0 };
      }
      acc[date].total += response.job_satisfaction || 0;
      acc[date].count += 1;
      return acc;
    }, {} as Record<string, { date: string; total: number; count: number }>);

    return Object.values(groupedByDate)
      .map(item => ({
        date: item.date,
        average: item.total / item.count
      }))
      .sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime());
  };

  const exportToPDF = async () => {
    try {
      const dashboardElement = document.getElementById('analytics-dashboard');
      if (!dashboardElement) {
        toast({
          title: "Export Error",
          description: "Dashboard element not found",
          variant: "destructive",
        });
        return;
      }

      // Create canvas from the dashboard
      const canvas = await html2canvas(dashboardElement, {
        scale: 1,
        useCORS: true,
        allowTaint: true,
        backgroundColor: '#ffffff'
      });

      // Create PDF in letter size (8.5" x 11")
      const pdf = new jsPDF('p', 'in', 'letter');
      const imgWidth = 8.5;
      const imgHeight = (canvas.height * imgWidth) / canvas.width;
      
      // If content is too tall, scale it down
      if (imgHeight > 11) {
        const scaledHeight = 11;
        const scaledWidth = (canvas.width * scaledHeight) / canvas.height;
        pdf.addImage(canvas.toDataURL('image/png'), 'PNG', (8.5 - scaledWidth) / 2, 0, scaledWidth, scaledHeight);
      } else {
        pdf.addImage(canvas.toDataURL('image/png'), 'PNG', 0, 0, imgWidth, imgHeight);
      }

      pdf.save('survey-analytics-report.pdf');
      
      toast({
        title: "Export Successful",
        description: "Analytics report downloaded as PDF",
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
        <div className="text-center">Loading analytics...</div>
      </div>
    );
  }

  const averageRatings = getAverageRatings();
  const continentData = getDemographicBreakdown('continent');
  const divisionData = getDemographicBreakdown('division');
  const roleData = getDemographicBreakdown('role');
  const satisfactionTrend = getSatisfactionTrend();

  return (
    <div className="min-h-screen bg-background">
      <header className="border-b bg-card">
        <div className="max-w-7xl mx-auto px-4 py-6">
          <div className="flex items-center justify-between">
            <Button 
              variant="ghost" 
              onClick={onBack}
              className="flex items-center gap-2"
            >
              <ArrowLeftIcon className="h-4 w-4" />
              Back to Admin
            </Button>
            <h1 className="text-2xl font-bold text-foreground">Survey Analytics Dashboard</h1>
            <Button onClick={exportToPDF} className="flex items-center gap-2">
              <DownloadIcon className="h-4 w-4" />
              Export PDF
            </Button>
          </div>
        </div>
      </header>

      <main className="max-w-7xl mx-auto px-4 py-8" id="analytics-dashboard">
        {/* Filters Section */}
        <Card className="mb-8">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <FilterIcon className="h-5 w-5" />
              Filters
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-3 lg:grid-cols-7 gap-4">
              <div>
                <Label htmlFor="continent">Continent</Label>
                <Select value={filters.continent} onValueChange={(value) => setFilters({...filters, continent: value})}>
                  <SelectTrigger>
                    <SelectValue placeholder="All" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All</SelectItem>
                    <SelectItem value="North America">North America</SelectItem>
                    <SelectItem value="Europe">Europe</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              
              <div>
                <Label htmlFor="division">Division</Label>
                <Select value={filters.division} onValueChange={(value) => setFilters({...filters, division: value})}>
                  <SelectTrigger>
                    <SelectValue placeholder="All" />
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
                <Label htmlFor="role">Role</Label>
                <Select value={filters.role} onValueChange={(value) => setFilters({...filters, role: value})}>
                  <SelectTrigger>
                    <SelectValue placeholder="All" />
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
                <Label htmlFor="dateFrom">From Date</Label>
                <Input
                  type="date"
                  value={filters.dateFrom}
                  onChange={(e) => setFilters({...filters, dateFrom: e.target.value})}
                />
              </div>

              <div>
                <Label htmlFor="dateTo">To Date</Label>
                <Input
                  type="date"
                  value={filters.dateTo}
                  onChange={(e) => setFilters({...filters, dateTo: e.target.value})}
                />
              </div>

              <div className="flex items-end">
                <Button variant="outline" onClick={clearFilters}>
                  Clear Filters
                </Button>
              </div>

              <div className="flex items-end">
                <Badge variant="secondary">
                  {filteredResponses.length} of {responses.length} responses
                </Badge>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Overview Cards */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm">Total Responses</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{filteredResponses.length}</div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm">Avg Job Satisfaction</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">
                {filteredResponses.length > 0 
                  ? (filteredResponses.reduce((sum, r) => sum + (r.job_satisfaction || 0), 0) / filteredResponses.length).toFixed(1)
                  : 'N/A'
                }
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm">Comments</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">
                {filteredResponses.filter(r => r.additional_comments || r.collaboration_feedback).length}
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm">Response Rate</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">
                {((filteredResponses.length / Math.max(responses.length, 1)) * 100).toFixed(0)}%
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Charts Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 mb-8">
          {/* Average Ratings Chart */}
          <Card>
            <CardHeader>
              <CardTitle>Average Ratings by Question</CardTitle>
            </CardHeader>
            <CardContent>
              <ChartContainer config={{}} className="h-[400px]">
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={averageRatings} layout="horizontal" margin={{ left: 120 }}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis type="number" domain={[0, 5]} />
                    <YAxis dataKey="question" type="category" width={120} />
                    <ChartTooltip content={<ChartTooltipContent />} />
                    <Bar dataKey="average" fill="#8884d8" />
                  </BarChart>
                </ResponsiveContainer>
              </ChartContainer>
            </CardContent>
          </Card>

          {/* Satisfaction Trend */}
          <Card>
            <CardHeader>
              <CardTitle>Job Satisfaction Trend</CardTitle>
            </CardHeader>
            <CardContent>
              <ChartContainer config={{}} className="h-[400px]">
                <ResponsiveContainer width="100%" height="100%">
                  <LineChart data={satisfactionTrend}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="date" />
                    <YAxis domain={[0, 5]} />
                    <ChartTooltip content={<ChartTooltipContent />} />
                    <Line type="monotone" dataKey="average" stroke="#8884d8" strokeWidth={2} />
                  </LineChart>
                </ResponsiveContainer>
              </ChartContainer>
            </CardContent>
          </Card>
        </div>

        {/* Demographics Charts */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          <Card>
            <CardHeader>
              <CardTitle>By Continent</CardTitle>
            </CardHeader>
            <CardContent>
              <ChartContainer config={{}} className="h-[300px]">
                <ResponsiveContainer width="100%" height="100%">
                  <PieChart>
                    <Pie
                      data={continentData}
                      cx="50%"
                      cy="50%"
                      outerRadius={80}
                      fill="#8884d8"
                      dataKey="value"
                      label={({ name, value }) => `${name}: ${value}`}
                    >
                      {continentData.map((_, index) => (
                        <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
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
              <ChartContainer config={{}} className="h-[300px]">
                <ResponsiveContainer width="100%" height="100%">
                  <PieChart>
                    <Pie
                      data={divisionData}
                      cx="50%"
                      cy="50%"
                      outerRadius={80}
                      fill="#8884d8"
                      dataKey="value"
                      label={({ name, value }) => `${name}: ${value}`}
                    >
                      {divisionData.map((_, index) => (
                        <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
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
              <ChartContainer config={{}} className="h-[300px]">
                <ResponsiveContainer width="100%" height="100%">
                  <PieChart>
                    <Pie
                      data={roleData}
                      cx="50%"
                      cy="50%"
                      outerRadius={80}
                      fill="#8884d8"
                      dataKey="value"
                      label={({ name, value }) => `${name}: ${value}`}
                    >
                      {roleData.map((_, index) => (
                        <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                      ))}
                    </Pie>
                    <ChartTooltip content={<ChartTooltipContent />} />
                  </PieChart>
                </ResponsiveContainer>
              </ChartContainer>
            </CardContent>
          </Card>
        </div>
      </main>
    </div>
  );
};