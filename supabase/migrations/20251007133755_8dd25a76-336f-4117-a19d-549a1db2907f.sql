-- Create survey_analysis_reports table to store generated AI analyses
CREATE TABLE public.survey_analysis_reports (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  analysis_text TEXT NOT NULL,
  pdf_url TEXT,
  total_responses INTEGER NOT NULL,
  generated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Enable Row Level Security
ALTER TABLE public.survey_analysis_reports ENABLE ROW LEVEL SECURITY;

-- Allow public read access to analysis reports
CREATE POLICY "Allow public read access to analysis reports" 
ON public.survey_analysis_reports 
FOR SELECT 
USING (true);

-- Allow public insert access for generating reports
CREATE POLICY "Allow public insert access to analysis reports" 
ON public.survey_analysis_reports 
FOR INSERT 
WITH CHECK (true);