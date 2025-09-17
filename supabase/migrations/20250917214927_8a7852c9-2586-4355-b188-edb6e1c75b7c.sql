-- Add missing columns to employee_survey_responses table
ALTER TABLE public.employee_survey_responses 
ADD COLUMN IF NOT EXISTS information_preferences text[] DEFAULT '{}',
ADD COLUMN IF NOT EXISTS additional_comments text;

-- Update any existing records to have empty arrays for information_preferences if null
UPDATE public.employee_survey_responses 
SET information_preferences = '{}' 
WHERE information_preferences IS NULL;