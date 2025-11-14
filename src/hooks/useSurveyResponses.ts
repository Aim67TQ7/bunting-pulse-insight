import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";

export interface AggregatedResponse {
  response_id: string;
  session_id: string;
  continent: string;
  division: string;
  role: string;
  submitted_at: string;
  completion_time_seconds: number;
  is_draft: boolean;
  configuration_id?: string;
  // Dynamic question responses - keyed by question_id
  ratings: Record<string, number>;
  multiselect: Record<string, string[]>;
  text_responses: Record<string, string>;
  na_responses: Record<string, boolean>;
}

/**
 * Hook to fetch aggregated survey responses from both old and new tables
 * Combines data from:
 * - employee_survey_responses (legacy hard-coded columns)
 * - survey_question_responses (new flexible question/answer system)
 */
export function useSurveyResponses(configurationId?: string) {
  return useQuery({
    queryKey: ["survey-responses", configurationId],
    queryFn: async () => {
      try {
        // Fetch all responses from new table
        let query = supabase
          .from("survey_question_responses")
          .select(`
            *,
            survey_question_config (
              question_id,
              question_type,
              question_key,
              section
            )
          `)
          .order("created_at", { ascending: false });

        if (configurationId) {
          query = query.eq("configuration_id", configurationId);
        }

        const { data: questionResponses, error: qError } = await query;
        if (qError) throw qError;

        // Fetch survey metadata
        let metadataQuery = supabase
          .from("employee_survey_responses")
          .select("id, session_id, continent, division, role, submitted_at, completion_time_seconds, is_draft, configuration_id, follow_up_responses")
          .eq("is_draft", false)
          .order("submitted_at", { ascending: false });

        if (configurationId) {
          metadataQuery = metadataQuery.eq("configuration_id", configurationId);
        }

        const { data: metadata, error: mError } = await metadataQuery;
        if (mError) throw mError;

        // Aggregate responses by response_id
        const aggregated: Record<string, AggregatedResponse> = {};

        // Process question responses
        questionResponses?.forEach((qr: any) => {
          if (!aggregated[qr.response_id]) {
            // Find metadata for this response
            const meta = metadata?.find(m => m.id === qr.response_id);
            
            aggregated[qr.response_id] = {
              response_id: qr.response_id,
              session_id: meta?.session_id || qr.response_id,
              continent: meta?.continent || "",
              division: meta?.division || "",
              role: meta?.role || "",
              submitted_at: meta?.submitted_at || qr.created_at,
              completion_time_seconds: meta?.completion_time_seconds || 0,
              is_draft: meta?.is_draft || false,
              configuration_id: meta?.configuration_id || qr.configuration_id,
              ratings: {},
              multiselect: {},
              text_responses: {},
              na_responses: {}
            };
            
            // Extract N/A responses from follow_up_responses if available
            if (meta?.follow_up_responses?.na_responses) {
              aggregated[qr.response_id].na_responses = meta.follow_up_responses.na_responses;
            }
          }

          const questionId = qr.survey_question_config?.question_id || qr.question_id;
          const questionType = qr.survey_question_config?.question_type || qr.question_type;
          const questionKey = qr.survey_question_config?.question_key;

          // Categorize by question type
          if (questionType === "rating") {
            aggregated[qr.response_id].ratings[questionKey || questionId] = qr.answer_value;
          } else if (questionType === "multiselect") {
            aggregated[qr.response_id].multiselect[questionKey || questionId] = qr.answer_value || [];
          } else if (questionType === "text" || questionType === "demographic") {
            aggregated[qr.response_id].text_responses[questionKey || questionId] = qr.answer_value;
          }
        });

        // Also include responses from legacy table for backward compatibility
        metadata?.forEach((meta) => {
          if (!aggregated[meta.id]) {
            aggregated[meta.id] = {
              response_id: meta.id,
              session_id: meta.session_id,
              continent: meta.continent || "",
              division: meta.division || "",
              role: meta.role || "",
              submitted_at: meta.submitted_at,
              completion_time_seconds: meta.completion_time_seconds || 0,
              is_draft: meta.is_draft,
              configuration_id: meta.configuration_id,
              ratings: {},
              multiselect: {},
              text_responses: {},
              na_responses: meta.follow_up_responses?.na_responses || {}
            };
          }
        });

        return Object.values(aggregated).filter(r => !r.is_draft);
      } catch (error) {
        console.error("Error fetching survey responses:", error);
        throw error;
      }
    },
    staleTime: 30000, // 30 seconds
  });
}

/**
 * Hook to fetch legacy responses from employee_survey_responses table
 * Used for backward compatibility with existing data
 */
export function useLegacyResponses(configurationId?: string) {
  return useQuery({
    queryKey: ["legacy-survey-responses", configurationId],
    queryFn: async () => {
      let query = supabase
        .from("employee_survey_responses")
        .select("*")
        .eq("is_draft", false)
        .order("submitted_at", { ascending: false });

      if (configurationId) {
        query = query.eq("configuration_id", configurationId);
      }

      const { data, error } = await query;
      if (error) throw error;
      return data || [];
    },
    staleTime: 30000,
  });
}
