-- Add draft tracking columns to employee_survey_responses
ALTER TABLE employee_survey_responses
ADD COLUMN is_draft boolean DEFAULT true,
ADD COLUMN last_autosave_at timestamp with time zone DEFAULT now();

-- Create index for faster draft lookups by session_id
CREATE INDEX idx_employee_survey_responses_session_id ON employee_survey_responses(session_id);

-- Add comment for documentation
COMMENT ON COLUMN employee_survey_responses.is_draft IS 'Indicates if this is a draft (true) or completed survey (false)';
COMMENT ON COLUMN employee_survey_responses.last_autosave_at IS 'Timestamp of the last auto-save operation';