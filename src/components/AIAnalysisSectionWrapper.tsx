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
  
  // Survey close date - must match SurveyTimer.tsx
  const SURVEY_END = new Date("2025-11-23T23:59:59-06:00"); // 11:59 PM Newton KS time Nov 23
  const isSurveyComplete = new Date() > SURVEY_END;

  useEffect(() => {
    loadResponses();
  }, []);

  const loadResponses = async () => {
    setLoading(true);
    try {
      const { data: surveyData, error } = await supabase
        .from('employee_survey_responses')
        .select('id, responses_jsonb, continent, division, role, submitted_at, completion_time_seconds')
        .eq('is_draft', false)
        .order('submitted_at', { ascending: false });
      
      if (error) throw error;

      const combined = (surveyData || []).map(survey => ({
        id: survey.id,
        continent: survey.continent,
        division: survey.division,
        role: survey.role,
        submitted_at: survey.submitted_at,
        completion_time_seconds: survey.completion_time_seconds,
        responses: (survey.responses_jsonb as any[] || []).map((answer: any) => ({
          question_id: answer.question_id,
          question_type: answer.question_type,
          answer_value: answer.answer_value,
          question_labels: answer.question_labels,
          display_order: answer.display_order
        }))
      }));
      
      setResponses(combined);
    } catch (error: any) {
      toast({ title: "Error", description: error.message, variant: "destructive" });
    } finally {
      setLoading(false);
    }
  };

  if (loading) return <div className="p-8">Loading AI Analysis...</div>;

  return <AIAnalysisSection responses={responses} isSurveyComplete={isSurveyComplete} />;
};
