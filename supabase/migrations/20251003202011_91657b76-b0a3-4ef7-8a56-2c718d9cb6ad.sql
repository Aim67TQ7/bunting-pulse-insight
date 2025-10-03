-- Phase 1: Add new columns for missing questions
ALTER TABLE employee_survey_responses
ADD COLUMN IF NOT EXISTS performance_awareness integer,
ADD COLUMN IF NOT EXISTS safety_reporting_comfort integer,
ADD COLUMN IF NOT EXISTS workload_manageability integer,
ADD COLUMN IF NOT EXISTS tools_equipment_quality integer,
ADD COLUMN IF NOT EXISTS company_value_alignment integer,
ADD COLUMN IF NOT EXISTS team_morale integer,
ADD COLUMN IF NOT EXISTS pride_in_work integer;

-- Phase 2: Migrate data from JSONB to new columns
UPDATE employee_survey_responses
SET 
  performance_awareness = CASE 
    WHEN follow_up_responses->>'performance-awareness' ~ '^\d+$' 
    THEN (follow_up_responses->>'performance-awareness')::integer 
    ELSE NULL 
  END,
  safety_reporting_comfort = CASE 
    WHEN follow_up_responses->>'safety-reporting' ~ '^\d+$' 
    THEN (follow_up_responses->>'safety-reporting')::integer 
    ELSE NULL 
  END,
  workload_manageability = CASE 
    WHEN follow_up_responses->>'workload' ~ '^\d+$' 
    THEN (follow_up_responses->>'workload')::integer 
    ELSE NULL 
  END,
  tools_equipment_quality = CASE 
    WHEN follow_up_responses->>'tools' ~ '^\d+$' 
    THEN (follow_up_responses->>'tools')::integer 
    ELSE NULL 
  END,
  company_value_alignment = CASE 
    WHEN follow_up_responses->>'company-value' ~ '^\d+$' 
    THEN (follow_up_responses->>'company-value')::integer 
    ELSE NULL 
  END
WHERE follow_up_responses IS NOT NULL;

-- Phase 3: Fix incorrect mappings - move data from misnamed columns to correct ones
UPDATE employee_survey_responses
SET 
  team_morale = us_uk_collaboration,
  pride_in_work = failed_experiments_learning;

-- Phase 4: Drop the old misnamed columns
ALTER TABLE employee_survey_responses
DROP COLUMN IF EXISTS us_uk_collaboration,
DROP COLUMN IF EXISTS failed_experiments_learning;

-- Phase 5: Clean up JSONB - remove migrated rating data, keep only text feedback
UPDATE employee_survey_responses
SET follow_up_responses = jsonb_strip_nulls(
  follow_up_responses - 'performance-awareness' - 'safety-reporting' - 'workload' - 'tools' - 'company-value'
)
WHERE follow_up_responses IS NOT NULL;