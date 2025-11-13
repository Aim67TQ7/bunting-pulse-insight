-- Fix the information_relay question to use the correct rating answer set
UPDATE survey_question_config
SET answer_set_id = '25431cd7-d97f-4e92-bdaf-9e08f8fffd54'
WHERE question_id = 'information_relay';