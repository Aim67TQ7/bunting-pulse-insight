import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";

export interface SurveyQuestion {
  id: string;
  question_id: string;
  question_type: string;
  labels: Record<string, string>;
  section?: string;
  options?: Array<{
    value: string;
    labels: Record<string, string>;
  }>;
  follow_up_rules?: {
    trigger?: string;
    prompts?: Record<string, string>;
  };
  display_order: number;
  is_required: boolean;
}

export const useSurveyQuestions = (configurationId?: string) => {
  return useQuery({
    queryKey: ["survey-questions", configurationId],
    queryFn: async () => {
      let query = supabase
        .from("survey_question_config")
        .select("*")
        .order("display_order");

      if (configurationId) {
        query = query.eq("configuration_id", configurationId);
      }

      const { data, error } = await query;

      if (error) throw error;
      return (data || []).map(q => ({
        ...q,
        labels: q.labels as Record<string, string>,
        options: q.options as Array<{ value: string; labels: Record<string, string> }> | undefined,
        follow_up_rules: q.follow_up_rules as { trigger?: string; prompts?: Record<string, string> } | undefined,
      })) as SurveyQuestion[];
    },
  });
};

export const useSurveyQuestionsByType = (
  questionType: "demographic" | "rating" | "multiselect",
  configurationId?: string
) => {
  return useQuery({
    queryKey: ["survey-questions", questionType, configurationId],
    queryFn: async () => {
      let query = supabase
        .from("survey_question_config")
        .select("*")
        .eq("question_type", questionType)
        .order("display_order");

      if (configurationId) {
        query = query.eq("configuration_id", configurationId);
      }

      const { data, error } = await query;

      if (error) throw error;
      return (data || []).map(q => ({
        ...q,
        labels: q.labels as Record<string, string>,
        options: q.options as Array<{ value: string; labels: Record<string, string> }> | undefined,
        follow_up_rules: q.follow_up_rules as { trigger?: string; prompts?: Record<string, string> } | undefined,
      })) as SurveyQuestion[];
    },
  });
};
