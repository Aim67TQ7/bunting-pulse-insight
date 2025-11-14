-- Fix existing draft records that were actually submitted
-- These records have submitted_at timestamps and question responses, but are marked as drafts
UPDATE employee_survey_responses 
SET is_draft = false 
WHERE is_draft = true 
  AND submitted_at IS NOT NULL 
  AND id IN (
    SELECT DISTINCT response_id 
    FROM survey_question_responses
  );