import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { BarChart, Bar, LineChart, Line, PieChart, Pie, Cell, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';
import { Button } from "@/components/ui/button";
import { Download, Filter, TrendingUp, Users, Clock, MessageSquare } from "lucide-react";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import { CommentsSection } from "./CommentsSection";
import { AIAnalysisSection } from "./AIAnalysisSection";
import { useSurveyQuestions } from "@/hooks/useSurveyQuestions";

const CHART_COLORS = ['#8b5cf6', '#ec4899', '#10b981', '#f59e0b', '#3b82f6', '#ef4444'];

interface DynamicSurveyResponse {
  id: string;
  continent: string | null;
  division: string | null;
  role: string | null;
  submitted_at: string;
  completion_time_seconds: number | null;
  responses: Array<{
    question_id: string;
    question_type: string;
    answer_value: any;
  }>;
}

interface AnalyticsDashboardProps {
  configurationId?: string;
}

const SurveyAnalyticsDashboard = ({ configurationId }: AnalyticsDashboardProps) => {
  const [responses, setResponses] = useState<DynamicSurveyResponse[]>([]);
  const [filteredResponses, setFilteredResponses] = useState<DynamicSurveyResponse[]>([]);
  const [loading, setLoading] = useState(true);
  const { toast } = useToast();
  const { data: questions } = useSurveyQuestions(configurationId);
  const [filterContinent, setFilterContinent] = useState("all");
  const [filterDivision, setFilterDivision] = useState("all");
  const [filterRole, setFilterRole] = useState("all");

  useEffect(() => {
    loadResponses();
  }, []);

  useEffect(() => {
    applyFilters();
  }, [responses, filterContinent, filterDivision, filterRole]);

  const loadResponses = async () => {
    setLoading(true);
    try {
      // Remove is_draft filter to match QuestionLevelAnalytics behavior
      const { data: metadata, error: metaError } = await supabase
        .from('employee_survey_responses')
        .select('id, continent, division, role, submitted_at, completion_time_seconds')
        .order('submitted_at', { ascending: false });
      if (metaError) throw metaError;

      const { data: responseData, error: respError } = await supabase
        .from('survey_question_responses')
        .select('*');
      if (respError) throw respError;

      const combined = (metadata || []).map(meta => ({
        ...meta,
        responses: (responseData || []).filter(r => r.response_id === meta.id)
      }));
      setResponses(combined);
    } catch (error: any) {
      toast({ title: "Error", description: error.message, variant: "destructive" });
    } finally {
      setLoading(false);
    }
  };

  const applyFilters = () => {
    let filtered = [...responses];
    if (filterContinent !== "all") filtered = filtered.filter(r => r.continent === filterContinent);
    if (filterDivision !== "all") filtered = filtered.filter(r => r.division === filterDivision);
    if (filterRole !== "all") filtered = filtered.filter(r => r.role === filterRole);
    setFilteredResponses(filtered);
  };

  const calculateAverage = (questionId: string) => {
    const vals = filteredResponses.flatMap(r => 
      r.responses.filter(resp => resp.question_id === questionId && resp.question_type === 'rating')
        .map(resp => resp.answer_value?.rating)
    ).filter(v => v != null);
    return vals.length > 0 ? vals.reduce((s, v) => s + v, 0) / vals.length : 0;
  };

  const getDemographicBreakdown = (field: 'continent' | 'division' | 'role') => {
    const counts = new Map<string, number>();
    filteredResponses.forEach(r => {
      const val = r[field];
      if (val) counts.set(val, (counts.get(val) || 0) + 1);
    });
    return Array.from(counts.entries()).map(([name, value], idx) => ({
      name, value, fill: CHART_COLORS[idx % CHART_COLORS.length]
    }));
  };

  if (loading) return <div className="p-8">Loading...</div>;

  const ratingQuestions = questions?.filter(q => q.question_type === 'rating') || [];
  const overallAvg = ratingQuestions.length > 0 
    ? ratingQuestions.reduce((s, q) => s + calculateAverage(q.question_id), 0) / ratingQuestions.length 
    : 0;

  return (
    <Tabs defaultValue="overview" className="w-full">
      <TabsList className="grid w-full grid-cols-3">
        <TabsTrigger value="overview">Overview</TabsTrigger>
        <TabsTrigger value="comments">Comments</TabsTrigger>
        <TabsTrigger value="ai-analysis">AI Analysis</TabsTrigger>
      </TabsList>

      <TabsContent value="overview" className="space-y-6">
        {/* Filters */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Filter className="h-5 w-5" />
              Filters
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid gap-4 md:grid-cols-3">
              <div className="space-y-2">
                <label className="text-sm font-medium">Continent</label>
                <Select value={filterContinent} onValueChange={setFilterContinent}>
                  <SelectTrigger>
                    <SelectValue placeholder="All Continents" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All Continents</SelectItem>
                    {Array.from(new Set(responses.map(r => r.continent).filter(Boolean))).map(c => (
                      <SelectItem key={c} value={c!}>{c}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-2">
                <label className="text-sm font-medium">Division</label>
                <Select value={filterDivision} onValueChange={setFilterDivision}>
                  <SelectTrigger>
                    <SelectValue placeholder="All Divisions" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All Divisions</SelectItem>
                    {Array.from(new Set(responses.map(r => r.division).filter(Boolean))).map(d => (
                      <SelectItem key={d} value={d!}>{d}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-2">
                <label className="text-sm font-medium">Role</label>
                <Select value={filterRole} onValueChange={setFilterRole}>
                  <SelectTrigger>
                    <SelectValue placeholder="All Roles" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All Roles</SelectItem>
                    {Array.from(new Set(responses.map(r => r.role).filter(Boolean))).map(r => (
                      <SelectItem key={r} value={r!}>{r}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </div>
          </CardContent>
        </Card>
        <div className="grid gap-4 md:grid-cols-4">
          <Card><CardHeader><CardTitle className="flex items-center gap-2"><Users className="h-5 w-5" />Responses</CardTitle></CardHeader><CardContent><div className="text-4xl font-bold">{filteredResponses.length}</div></CardContent></Card>
          <Card><CardHeader><CardTitle className="flex items-center gap-2"><TrendingUp className="h-5 w-5" />Engagement</CardTitle></CardHeader><CardContent><div className="text-4xl font-bold">{overallAvg.toFixed(1)}</div></CardContent></Card>
          <Card><CardHeader><CardTitle className="flex items-center gap-2"><Clock className="h-5 w-5" />Avg Time</CardTitle></CardHeader><CardContent><div className="text-4xl font-bold">{Math.round(filteredResponses.reduce((s, r) => s + (r.completion_time_seconds || 0), 0) / filteredResponses.length / 60)}m</div></CardContent></Card>
          <Card><CardHeader><CardTitle className="flex items-center gap-2"><MessageSquare className="h-5 w-5" />Comments</CardTitle></CardHeader><CardContent><div className="text-4xl font-bold">{filteredResponses.filter(r => r.responses.some(resp => resp.question_type === 'text' && resp.answer_value?.text)).length}</div></CardContent></Card>
        </div>

        <div className="grid gap-4 md:grid-cols-3">
          {['continent', 'division', 'role'].map(field => (
            <Card key={field}><CardHeader><CardTitle>{field.charAt(0).toUpperCase() + field.slice(1)}</CardTitle></CardHeader><CardContent><ResponsiveContainer width="100%" height={250}><PieChart><Pie data={getDemographicBreakdown(field as any)} dataKey="value" nameKey="name" cx="50%" cy="50%" outerRadius={80}>{getDemographicBreakdown(field as any).map((entry, idx) => <Cell key={idx} fill={entry.fill} />)}</Pie><Tooltip /><Legend /></PieChart></ResponsiveContainer></CardContent></Card>
          ))}
        </div>
      </TabsContent>

      <TabsContent value="comments"><CommentsSection configurationId={configurationId} /></TabsContent>
      <TabsContent value="ai-analysis"><AIAnalysisSection responses={filteredResponses} /></TabsContent>
    </Tabs>
  );
};

export { SurveyAnalyticsDashboard };
