-- Create table for storing AI test analyses
CREATE TABLE ai_test_analyses (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  created_at TIMESTAMPTZ DEFAULT NOW(),
  model_used TEXT NOT NULL,
  prompt_version TEXT,
  analysis_text TEXT NOT NULL,
  filters_applied JSONB,
  response_count INTEGER NOT NULL,
  tokens_used INTEGER,
  generation_time_ms INTEGER,
  notes TEXT,
  rating INTEGER CHECK (rating >= 1 AND rating <= 5),
  is_favorite BOOLEAN DEFAULT false
);

-- Add index for faster queries
CREATE INDEX idx_ai_test_analyses_created_at ON ai_test_analyses(created_at DESC);
CREATE INDEX idx_ai_test_analyses_is_favorite ON ai_test_analyses(is_favorite) WHERE is_favorite = true;

-- Enable RLS (but allow all operations since this is admin-only)
ALTER TABLE ai_test_analyses ENABLE ROW LEVEL SECURITY;

-- Policy to allow all operations (since page is already passcode-protected)
CREATE POLICY "Allow all operations on ai_test_analyses"
  ON ai_test_analyses
  FOR ALL
  USING (true)
  WITH CHECK (true);