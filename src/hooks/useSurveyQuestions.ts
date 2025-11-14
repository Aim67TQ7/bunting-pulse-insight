import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";

export interface AnswerOption {
  id: string;
  option_key: string;
  labels: Record<string, string>;
  display_order: number;
  metadata?: Record<string, any>;
}

export interface AnswerSet {
  id: string;
  set_key: string;
  name: Record<string, string>;
  set_type: string;
  answer_options?: AnswerOption[];
}

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
  answer_set_id?: string;
  answer_set?: AnswerSet;
  follow_up_rules?: {
    trigger?: string;
    prompts?: Record<string, string>;
  };
  display_order: number;
  is_required: boolean;
  allow_na?: boolean;
}

export const useSurveyQuestions = (configurationId?: string) => {
  return useQuery({
    queryKey: ["survey-questions", configurationId],
    queryFn: async () => {
      // First fetch questions
      let questionQuery = supabase
        .from("survey_question_config")
        .select("*")
        .order("display_order");

      if (configurationId) {
        questionQuery = questionQuery.eq("configuration_id", configurationId);
      }

      const { data: questions, error: questionsError } = await questionQuery;
      if (questionsError) throw questionsError;

      // Fetch answer sets with their options
      const { data: answerSets, error: answerSetsError } = await supabase
        .from("survey_answer_sets")
        .select(`
          *,
          answer_options:survey_answer_options(
            id,
            option_key,
            labels,
            display_order,
            metadata
          )
        `)
        .eq("is_active", true);

      if (answerSetsError) throw answerSetsError;

      // Map answer sets by ID for quick lookup
      const answerSetsMap = new Map(
        (answerSets || []).map(set => [
          set.id,
          {
            ...set,
            answer_options: (set.answer_options || [])
              .sort((a: any, b: any) => a.display_order - b.display_order)
              .map((opt: any) => ({
                id: opt.id,
                option_key: opt.option_key,
                labels: opt.labels as Record<string, string>,
                display_order: opt.display_order,
                metadata: opt.metadata,
              })),
          },
        ])
      );

      // Attach answer sets to questions
      return (questions || []).map(q => ({
        ...q,
        labels: q.labels as Record<string, string>,
        options: q.options as Array<{ value: string; labels: Record<string, string> }> | undefined,
        follow_up_rules: q.follow_up_rules as { trigger?: string; prompts?: Record<string, string> } | undefined,
        answer_set: q.answer_set_id ? answerSetsMap.get(q.answer_set_id) : undefined,
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
