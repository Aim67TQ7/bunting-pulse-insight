-- Change company_value_alignment from rating to text type
UPDATE survey_question_config 
SET question_type = 'text'
WHERE question_id = 'company_value_alignment';