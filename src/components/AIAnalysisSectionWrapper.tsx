import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import { AIAnalysisSection } from "./AIAnalysisSection";

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

export const AIAnalysisSectionWrapper = () => {
  const [responses, setResponses] = useState<DynamicSurveyResponse[]>([]);
  const [loading, setLoading] = useState(true);
  const { toast } = useToast();

  useEffect(() => {
    loadResponses();
  }, []);

  const loadResponses = async () => {
    setLoading(true);
    try {
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

  if (loading) return <div className="p-8">Loading AI Analysis...</div>;

  return <AIAnalysisSection responses={responses} />;
};
