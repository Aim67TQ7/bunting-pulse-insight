-- Add UPDATE policy for anonymous survey submissions
CREATE POLICY "Allow anonymous survey updates" 
ON public.employee_survey_responses 
FOR UPDATE 
TO public
USING (true)
WITH CHECK (true);