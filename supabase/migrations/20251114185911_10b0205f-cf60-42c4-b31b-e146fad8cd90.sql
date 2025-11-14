-- Step 1: Add JSONB column for question responses
ALTER TABLE employee_survey_responses 
ADD COLUMN IF NOT EXISTS responses_jsonb JSONB DEFAULT '[]'::jsonb;

COMMENT ON COLUMN employee_survey_responses.responses_jsonb 
IS 'Stores all question responses as structured JSON array';

-- Step 2: Clean up orphaned draft records (47 drafts with no question responses)
DELETE FROM employee_survey_responses 
WHERE is_draft = true 
  AND id NOT IN (
    SELECT DISTINCT response_id 
    FROM survey_question_responses
  );

-- Step 3: Migrate existing data from survey_question_responses into responses_jsonb
UPDATE employee_survey_responses esr
SET responses_jsonb = (
  SELECT jsonb_agg(
    jsonb_build_object(
      'question_id', sqr.question_id,
      'question_type', sqr.question_type,
      'answer_value', sqr.answer_value,
      'display_order', sqr.display_order
    ) ORDER BY sqr.display_order
  )
  FROM survey_question_responses sqr
  WHERE sqr.response_id = esr.id
)
WHERE esr.is_draft = false
  AND esr.id IN (
    SELECT DISTINCT response_id 
    FROM survey_question_responses
  );