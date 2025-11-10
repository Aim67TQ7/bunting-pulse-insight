-- Assign the 1-5 rating scale answer set to all rating questions that don't have one
UPDATE survey_question_config
SET answer_set_id = '25431cd7-d97f-4e92-bdaf-9e08f8fffd54'
WHERE question_type = 'rating'
  AND answer_set_id IS NULL;