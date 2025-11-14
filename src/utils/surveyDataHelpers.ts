/**
 * Helper utilities for converting between legacy and new survey data structures
 */

export interface LegacyQuestion {
  key: string;
  label: string;
}

export interface LegacySection {
  id: string;
  title: string;
  description: string;
  questions?: LegacyQuestion[];
  multiSelect?: LegacyQuestion[];
}

/**
 * Maps database question_id to legacy employee_survey_responses column names
 * This maintains backward compatibility with existing hard-coded column names
 */
export const QUESTION_ID_TO_LEGACY_COLUMN: Record<string, string> = {
  // Engagement & Job Satisfaction
  "job-satisfaction": "job_satisfaction",
  "company-satisfaction": "recommend_company",
  "future-view": "strategic_confidence",
  
  // Leadership & Communication
  "expectations": "leadership_openness",
  "performance-awareness": "performance_awareness",
  "relaying-information": "communication_clarity",
  "management-feedback": "manager_alignment",
  
  // Training & Development
  "training": "training_satisfaction",
  "opportunities": "advancement_opportunities",
  
  // Teamwork & Culture
  "cooperation": "cross_functional_collaboration",
  "morale": "team_morale",
  "pride": "pride_in_work",
  
  // Safety & Work Environment
  "safety-focus": "workplace_safety",
  "safety-reporting": "safety_reporting_comfort",
  
  // Scheduling & Workload
  "workload": "workload_manageability",
  "work-life-balance": "work_life_balance",
  
  // Tools, Equipment & Processes
  "tools": "tools_equipment_quality",
  "processes": "manual_processes_focus",
  "company-value": "company_value_alignment",
  "change": "comfortable_suggesting_improvements",
  
  // Multi-select questions
  "communication-preferences": "communication_preferences",
  "information-preferences": "information_preferences",
  "motivation-factors": "motivation_factors",
};

/**
 * Reverse mapping: legacy column names to question IDs
 */
export const LEGACY_COLUMN_TO_QUESTION_ID: Record<string, string> = Object.entries(
  QUESTION_ID_TO_LEGACY_COLUMN
).reduce((acc, [questionId, columnName]) => {
  acc[columnName] = questionId;
  return acc;
}, {} as Record<string, string>);

/**
 * Get the legacy column name for a question ID
 */
export function getLegacyColumnName(questionId: string): string {
  return QUESTION_ID_TO_LEGACY_COLUMN[questionId] || questionId;
}

/**
 * Get the question ID for a legacy column name
 */
export function getQuestionIdFromLegacyColumn(columnName: string): string {
  return LEGACY_COLUMN_TO_QUESTION_ID[columnName] || columnName;
}

/**
 * Check if a question is a multiselect type based on legacy column name
 */
export function isMultiSelectQuestion(columnName: string): boolean {
  const multiSelectColumns = [
    "communication_preferences",
    "information_preferences",
    "motivation_factors"
  ];
  return multiSelectColumns.includes(columnName);
}

/**
 * Get section mapping from database section names to legacy section IDs
 */
export const SECTION_NAME_TO_ID: Record<string, string> = {
  "Demographics": "demographics",
  "Engagement & Job Satisfaction": "engagement-satisfaction",
  "Leadership & Communication": "leadership-communication",
  "Training & Development": "training-development",
  "Teamwork & Culture": "teamwork-culture",
  "Safety & Work Environment": "safety-environment",
  "Scheduling & Workload": "scheduling-workload",
  "Tools, Equipment & Processes": "tools-processes",
};
