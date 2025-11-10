-- Create table to track individual question responses for analytics
CREATE TABLE IF NOT EXISTS survey_question_responses (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  response_id UUID NOT NULL REFERENCES employee_survey_responses(id) ON DELETE CASCADE,
  question_id TEXT NOT NULL,
  question_type TEXT NOT NULL CHECK (question_type IN ('demographic', 'rating', 'multiselect')),
  answer_value JSONB NOT NULL,
  display_order NUMERIC,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- Create indexes for efficient querying
CREATE INDEX idx_survey_question_responses_response_id ON survey_question_responses(response_id);
CREATE INDEX idx_survey_question_responses_question_id ON survey_question_responses(question_id);
CREATE INDEX idx_survey_question_responses_question_type ON survey_question_responses(question_type);
CREATE INDEX idx_survey_question_responses_created_at ON survey_question_responses(created_at);

-- Enable RLS
ALTER TABLE survey_question_responses ENABLE ROW LEVEL SECURITY;

-- Allow anonymous inserts (for survey submissions)
CREATE POLICY "Allow anonymous survey question response submissions"
ON survey_question_responses
FOR INSERT
TO anon
WITH CHECK (true);

-- Allow authenticated inserts
CREATE POLICY "Allow authenticated survey question response submissions"
ON survey_question_responses
FOR INSERT
TO authenticated
WITH CHECK (true);

-- Allow public read access for analytics
CREATE POLICY "Allow public read access to question responses"
ON survey_question_responses
FOR SELECT
TO public
USING (true);