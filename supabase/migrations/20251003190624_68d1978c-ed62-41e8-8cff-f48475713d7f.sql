-- Add completion_time_seconds column to employee_survey_responses
ALTER TABLE public.employee_survey_responses
ADD COLUMN completion_time_seconds INTEGER;