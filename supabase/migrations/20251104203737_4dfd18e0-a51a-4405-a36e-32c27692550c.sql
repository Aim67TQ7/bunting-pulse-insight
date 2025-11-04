-- Create survey configurations table
CREATE TABLE IF NOT EXISTS survey_configurations (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL,
  description TEXT,
  is_active BOOLEAN DEFAULT false,
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now(),
  
  -- Configuration settings
  enabled_demographics JSONB DEFAULT '["continent", "division", "role"]'::jsonb,
  enabled_rating_questions JSONB DEFAULT '["job_satisfaction", "recommend_company", "strategic_confidence", "manager_alignment", "performance_awareness", "communication_clarity", "leadership_openness", "training_satisfaction", "advancement_opportunities", "cross_functional_collaboration", "team_morale", "pride_in_work", "workplace_safety", "safety_reporting_comfort", "workload_manageability", "work_life_balance", "tools_equipment_quality", "manual_processes_focus", "company_value_alignment", "comfortable_suggesting_improvements"]'::jsonb,
  enabled_multiselect_questions JSONB DEFAULT '["communication_preferences", "motivation_factors", "information_preferences"]'::jsonb,
  require_low_score_feedback BOOLEAN DEFAULT true,
  languages_enabled TEXT[] DEFAULT ARRAY['en', 'es', 'fr', 'it']
);

-- Create survey question config table for fine-grained control
CREATE TABLE IF NOT EXISTS survey_question_config (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  configuration_id UUID REFERENCES survey_configurations(id) ON DELETE CASCADE,
  question_type TEXT NOT NULL, -- 'demographic', 'rating', 'multiselect'
  question_id TEXT NOT NULL,
  is_enabled BOOLEAN DEFAULT true,
  is_required BOOLEAN DEFAULT true,
  custom_label JSONB, -- Optional custom labels per language
  display_order INTEGER,
  created_at TIMESTAMPTZ DEFAULT now(),
  UNIQUE(configuration_id, question_id)
);

-- Add configuration_id to responses table
ALTER TABLE employee_survey_responses 
ADD COLUMN IF NOT EXISTS configuration_id UUID REFERENCES survey_configurations(id);

-- Enable RLS
ALTER TABLE survey_configurations ENABLE ROW LEVEL SECURITY;
ALTER TABLE survey_question_config ENABLE ROW LEVEL SECURITY;

-- Policies for survey_configurations
CREATE POLICY "Anyone can view active configurations"
  ON survey_configurations FOR SELECT
  USING (is_active = true);

CREATE POLICY "Admins can manage configurations"
  ON survey_configurations FOR ALL
  USING (true);

-- Policies for survey_question_config
CREATE POLICY "Anyone can view question configs for active surveys"
  ON survey_question_config FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM survey_configurations 
      WHERE id = survey_question_config.configuration_id 
      AND is_active = true
    )
  );

CREATE POLICY "Admins can manage question configs"
  ON survey_question_config FOR ALL
  USING (true);

-- Create default configuration with all current questions
INSERT INTO survey_configurations (name, description, is_active)
VALUES (
  'Default Full Survey',
  'Complete employee engagement survey with all questions enabled',
  true
);

-- Create indexes for better performance
CREATE INDEX IF NOT EXISTS idx_survey_config_active ON survey_configurations(is_active);
CREATE INDEX IF NOT EXISTS idx_question_config_survey ON survey_question_config(configuration_id);
CREATE INDEX IF NOT EXISTS idx_responses_config ON employee_survey_responses(configuration_id);