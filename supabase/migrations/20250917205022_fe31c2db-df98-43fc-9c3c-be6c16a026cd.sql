-- Create comprehensive employee survey responses table
CREATE TABLE public.employee_survey_responses (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  
  -- Demographics
  continent TEXT NOT NULL CHECK (continent IN ('North America', 'Europe')),
  division TEXT NOT NULL CHECK (division IN ('Equipment', 'Magnets', 'Both')),
  role TEXT NOT NULL CHECK (role IN ('Sales/Marketing/Product', 'Operations/Engineering/Production', 'Admin/HR/Finance')),
  
  -- Rating responses (1-5 scale for most questions)
  job_satisfaction INTEGER CHECK (job_satisfaction >= 1 AND job_satisfaction <= 5),
  training_satisfaction INTEGER CHECK (training_satisfaction >= 1 AND training_satisfaction <= 5),
  work_life_balance INTEGER CHECK (work_life_balance >= 1 AND work_life_balance <= 5),
  communication_clarity INTEGER CHECK (communication_clarity >= 1 AND communication_clarity <= 5),
  leadership_openness INTEGER CHECK (leadership_openness >= 1 AND leadership_openness <= 5),
  manager_alignment INTEGER CHECK (manager_alignment >= 1 AND manager_alignment <= 5),
  us_uk_collaboration INTEGER CHECK (us_uk_collaboration >= 1 AND us_uk_collaboration <= 5),
  cross_functional_collaboration INTEGER CHECK (cross_functional_collaboration >= 1 AND cross_functional_collaboration <= 5),
  strategic_confidence INTEGER CHECK (strategic_confidence >= 1 AND strategic_confidence <= 5),
  advancement_opportunities INTEGER CHECK (advancement_opportunities >= 1 AND advancement_opportunities <= 5),
  workplace_safety INTEGER CHECK (workplace_safety >= 1 AND workplace_safety <= 5),
  recommend_company INTEGER CHECK (recommend_company >= 1 AND recommend_company <= 5),
  
  -- Process efficiency questions (1-5 scale: Strongly Disagree to Strongly Agree)
  manual_processes_focus INTEGER CHECK (manual_processes_focus >= 1 AND manual_processes_focus <= 5),
  comfortable_suggesting_improvements INTEGER CHECK (comfortable_suggesting_improvements >= 1 AND comfortable_suggesting_improvements <= 5),
  failed_experiments_learning INTEGER CHECK (failed_experiments_learning >= 1 AND failed_experiments_learning <= 5),
  
  -- Follow-up responses for low scores (stored as JSONB)
  follow_up_responses JSONB DEFAULT '{}'::jsonb,
  
  -- Optional open feedback
  collaboration_feedback TEXT,
  
  -- Preferences (arrays)
  communication_preferences TEXT[] DEFAULT '{}',
  motivation_factors TEXT[] DEFAULT '{}',
  
  -- Metadata
  session_id TEXT NOT NULL UNIQUE,
  submitted_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Enable Row Level Security
ALTER TABLE public.employee_survey_responses ENABLE ROW LEVEL SECURITY;

-- Create policy for anonymous submissions
CREATE POLICY "Allow anonymous survey submissions" 
ON public.employee_survey_responses 
FOR INSERT 
WITH CHECK (true);

-- Create policy for viewing responses (for dashboard)
CREATE POLICY "Allow public read access to responses" 
ON public.employee_survey_responses 
FOR SELECT 
USING (true);

-- Create indexes for better performance
CREATE INDEX idx_employee_survey_responses_submitted_at ON public.employee_survey_responses(submitted_at DESC);
CREATE INDEX idx_employee_survey_responses_continent ON public.employee_survey_responses(continent);
CREATE INDEX idx_employee_survey_responses_division ON public.employee_survey_responses(division);
CREATE INDEX idx_employee_survey_responses_role ON public.employee_survey_responses(role);

-- Create trigger for updated_at
CREATE TRIGGER update_employee_survey_responses_updated_at
  BEFORE UPDATE ON public.employee_survey_responses
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();