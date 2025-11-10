
-- Add allow_na column to survey_question_config table
ALTER TABLE survey_question_config 
ADD COLUMN allow_na boolean DEFAULT false;

COMMENT ON COLUMN survey_question_config.allow_na IS 'Indicates if this question accepts N/A as an answer option, which will be excluded from statistical calculations';
