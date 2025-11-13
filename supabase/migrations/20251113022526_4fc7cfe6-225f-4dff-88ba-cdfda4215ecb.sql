-- Make demographic fields nullable to support auto-save drafts
-- These fields will be validated as required on final submission
ALTER TABLE employee_survey_responses 
  ALTER COLUMN continent DROP NOT NULL,
  ALTER COLUMN division DROP NOT NULL,
  ALTER COLUMN role DROP NOT NULL;

-- Add a comment to explain why these are nullable
COMMENT ON COLUMN employee_survey_responses.continent IS 'Nullable to support draft saves; required on final submission (is_draft = false)';
COMMENT ON COLUMN employee_survey_responses.division IS 'Nullable to support draft saves; required on final submission (is_draft = false)';
COMMENT ON COLUMN employee_survey_responses.role IS 'Nullable to support draft saves; required on final submission (is_draft = false)';