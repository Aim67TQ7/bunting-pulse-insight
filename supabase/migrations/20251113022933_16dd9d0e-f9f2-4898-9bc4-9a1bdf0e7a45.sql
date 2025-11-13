-- Add GDPR compliance fields to employee_survey_responses
ALTER TABLE employee_survey_responses 
  ADD COLUMN IF NOT EXISTS consent_given BOOLEAN NOT NULL DEFAULT false,
  ADD COLUMN IF NOT EXISTS consent_timestamp TIMESTAMP WITH TIME ZONE,
  ADD COLUMN IF NOT EXISTS consent_ip_hash TEXT, -- hashed for security
  ADD COLUMN IF NOT EXISTS data_retention_date TIMESTAMP WITH TIME ZONE,
  ADD COLUMN IF NOT EXISTS deleted_at TIMESTAMP WITH TIME ZONE;

-- Create index for data retention queries
CREATE INDEX IF NOT EXISTS idx_employee_survey_data_retention 
  ON employee_survey_responses(data_retention_date) 
  WHERE deleted_at IS NULL;

-- Add comment explaining retention policy
COMMENT ON COLUMN employee_survey_responses.data_retention_date IS 'Date when survey response will be automatically deleted (12 months from submission)';
COMMENT ON COLUMN employee_survey_responses.consent_given IS 'Explicit GDPR consent recorded before survey submission';
COMMENT ON COLUMN employee_survey_responses.deleted_at IS 'Soft delete timestamp for GDPR right to erasure';

-- Create function to automatically set retention date on submission
CREATE OR REPLACE FUNCTION set_data_retention_date()
RETURNS TRIGGER AS $$
BEGIN
  -- Set retention date to 12 months from submission when survey is completed
  IF NEW.is_draft = false AND NEW.submitted_at IS NOT NULL AND NEW.data_retention_date IS NULL THEN
    NEW.data_retention_date := NEW.submitted_at + INTERVAL '12 months';
  END IF;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Create trigger to set retention date
DROP TRIGGER IF EXISTS set_retention_date_trigger ON employee_survey_responses;
CREATE TRIGGER set_retention_date_trigger
  BEFORE INSERT OR UPDATE ON employee_survey_responses
  FOR EACH ROW
  EXECUTE FUNCTION set_data_retention_date();

-- Create function to clean up expired data (to be run periodically)
CREATE OR REPLACE FUNCTION cleanup_expired_survey_data()
RETURNS INTEGER AS $$
DECLARE
  deleted_count INTEGER;
BEGIN
  -- Soft delete expired responses
  UPDATE employee_survey_responses
  SET deleted_at = NOW()
  WHERE data_retention_date < NOW()
    AND deleted_at IS NULL
    AND is_draft = false;
  
  GET DIAGNOSTICS deleted_count = ROW_COUNT;
  
  -- Hard delete drafts older than 30 days
  DELETE FROM employee_survey_responses
  WHERE is_draft = true
    AND last_autosave_at < NOW() - INTERVAL '30 days';
  
  RETURN deleted_count;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Add consent tracking table for audit trail
CREATE TABLE IF NOT EXISTS survey_consent_log (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  session_id UUID NOT NULL,
  consent_given BOOLEAN NOT NULL,
  consent_timestamp TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW(),
  ip_hash TEXT,
  user_agent TEXT,
  consent_version TEXT NOT NULL DEFAULT '1.0',
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW()
);

-- Create index for consent log queries
CREATE INDEX IF NOT EXISTS idx_consent_log_session 
  ON survey_consent_log(session_id, consent_timestamp DESC);

-- Enable RLS on consent log
ALTER TABLE survey_consent_log ENABLE ROW LEVEL SECURITY;

-- Policy: Anyone can insert consent records (anonymous survey)
CREATE POLICY "Allow anonymous consent recording" 
  ON survey_consent_log 
  FOR INSERT 
  TO anon, authenticated
  WITH CHECK (true);

-- Policy: No one can modify or delete consent records (audit trail)
CREATE POLICY "Consent records are immutable" 
  ON survey_consent_log 
  FOR ALL 
  TO anon, authenticated
  USING (false);