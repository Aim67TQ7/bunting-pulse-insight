import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import { AIAnalysisSection } from "./AIAnalysisSection";
import { FilteredAIAnalysis } from "./FilteredAIAnalysis";
import { WordReportGenerator } from "./WordReportGenerator";

interface AIAnalysisSurveyResponse {
  id: string;
  continent: string | null;
  division: string | null;
  role: string | null;
  submitted_at: string;
  completion_time_seconds: number | null;
  additional_comments?: string | null;
  responses_jsonb: Array<{
    question_id: string;
    question_type: string;
    answer_value: any;
  }>;
}

export const AIAnalysisSectionWrapper = () => {
  const [responses, setResponses] = useState<AIAnalysisSurveyResponse[]>([]);
  const [loading, setLoading] = useState(true);
  const { toast } = useToast();
  
  // Survey close date - must match SurveyTimer.tsx
  const SURVEY_END = new Date("2025-11-30T23:59:59+00:00"); // 11:59 PM UK time Nov 30
  const isSurveyComplete = new Date() > SURVEY_END;

  useEffect(() => {
    loadResponses();
  }, []);

  const loadResponses = async () => {
    setLoading(true);
    try {
      const { data: surveyData, error } = await supabase
        .from('employee_survey_responses')
        .select('id, responses_jsonb, continent, division, role, submitted_at, completion_time_seconds, additional_comments')
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
        additional_comments: survey.additional_comments,
        responses_jsonb: (survey.responses_jsonb as any[] || []).map((answer: any) => ({
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

  return (
    <div className="space-y-6">
      <AIAnalysisSection responses={responses} isSurveyComplete={isSurveyComplete} />
      
      {/* Filtered Analysis with Claude */}
      <FilteredAIAnalysis responses={responses} />
      
      {/* Word Report Generator with Claude */}
      <WordReportGenerator responses={responses} />
    </div>
  );
};
