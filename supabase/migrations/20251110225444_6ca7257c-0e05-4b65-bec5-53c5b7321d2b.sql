
-- Update rating_1_5_agree answer set labels to be numeric only
UPDATE survey_answer_options
SET labels = jsonb_build_object(
  'en', option_key,
  'es', option_key,
  'fr', option_key,
  'it', option_key
)
WHERE answer_set_id = '25431cd7-d97f-4e92-bdaf-9e08f8fffd54';
