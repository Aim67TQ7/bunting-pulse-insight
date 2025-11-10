-- Create survey_answer_sets table
CREATE TABLE IF NOT EXISTS public.survey_answer_sets (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  set_key TEXT UNIQUE NOT NULL,
  name JSONB NOT NULL,
  description JSONB,
  set_type TEXT NOT NULL CHECK (set_type IN ('single_select', 'multi_select', 'rating')),
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);

-- Create survey_answer_options table
CREATE TABLE IF NOT EXISTS public.survey_answer_options (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  answer_set_id UUID REFERENCES public.survey_answer_sets(id) ON DELETE CASCADE,
  option_key TEXT NOT NULL,
  labels JSONB NOT NULL,
  display_order INTEGER NOT NULL DEFAULT 0,
  is_active BOOLEAN DEFAULT true,
  metadata JSONB,
  created_at TIMESTAMPTZ DEFAULT now(),
  UNIQUE(answer_set_id, option_key)
);

-- Add answer_set_id to survey_question_config
ALTER TABLE public.survey_question_config 
  ADD COLUMN IF NOT EXISTS answer_set_id UUID REFERENCES public.survey_answer_sets(id);

-- Enable RLS on new tables
ALTER TABLE public.survey_answer_sets ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.survey_answer_options ENABLE ROW LEVEL SECURITY;

-- Create RLS policies for public read access
CREATE POLICY "Allow public read access to answer sets"
  ON public.survey_answer_sets FOR SELECT
  TO public
  USING (is_active = true);

CREATE POLICY "Allow public read access to answer options"
  ON public.survey_answer_options FOR SELECT
  TO public
  USING (is_active = true);

-- Create updated_at trigger for survey_answer_sets
CREATE TRIGGER update_survey_answer_sets_updated_at
  BEFORE UPDATE ON public.survey_answer_sets
  FOR EACH ROW
  EXECUTE FUNCTION public.update_updated_at_column();

-- Insert answer sets
INSERT INTO public.survey_answer_sets (set_key, name, description, set_type) VALUES
  ('continents', '{"en": "Continents", "es": "Continentes", "fr": "Continents", "it": "Continenti"}', '{"en": "Primary work location by continent"}', 'single_select'),
  ('divisions', '{"en": "Divisions", "es": "Divisiones", "fr": "Divisions", "it": "Divisioni"}', '{"en": "Company division"}', 'single_select'),
  ('rating_1_5', '{"en": "1-5 Rating Scale", "es": "Escala de Calificación 1-5", "fr": "Échelle de notation 1-5", "it": "Scala di valutazione 1-5"}', '{"en": "Standard 5-point Likert scale"}', 'rating'),
  ('motivation_factors', '{"en": "Motivation Factors", "es": "Factores de Motivación", "fr": "Facteurs de motivation", "it": "Fattori motivazionali"}', '{"en": "Factors that motivate employees"}', 'multi_select'),
  ('communication_preferences', '{"en": "Communication Preferences", "es": "Preferencias de Comunicación", "fr": "Préférences de communication", "it": "Preferenze di comunicazione"}', '{"en": "Preferred communication channels"}', 'multi_select'),
  ('information_preferences', '{"en": "Information Preferences", "es": "Preferencias de Información", "fr": "Préférences d''information", "it": "Preferenze informative"}', '{"en": "Types of information employees want to receive"}', 'multi_select');

-- Insert answer options for continents
INSERT INTO public.survey_answer_options (answer_set_id, option_key, labels, display_order) VALUES
  ((SELECT id FROM public.survey_answer_sets WHERE set_key = 'continents'), 'north-america', '{"en": "North America", "es": "América del Norte", "fr": "Amérique du Nord", "it": "Nord America"}', 1),
  ((SELECT id FROM public.survey_answer_sets WHERE set_key = 'continents'), 'europe', '{"en": "Europe", "es": "Europa", "fr": "Europe", "it": "Europa"}', 2);

-- Insert answer options for divisions
INSERT INTO public.survey_answer_options (answer_set_id, option_key, labels, display_order) VALUES
  ((SELECT id FROM public.survey_answer_sets WHERE set_key = 'divisions'), 'equipment', '{"en": "Equipment", "es": "Equipo", "fr": "Équipement", "it": "Attrezzatura"}', 1),
  ((SELECT id FROM public.survey_answer_sets WHERE set_key = 'divisions'), 'magnetics', '{"en": "Magnetics", "es": "Magnética", "fr": "Magnétique", "it": "Magnetica"}', 2),
  ((SELECT id FROM public.survey_answer_sets WHERE set_key = 'divisions'), 'both', '{"en": "Both", "es": "Ambos", "fr": "Les deux", "it": "Entrambi"}', 3);

-- Insert answer options for rating scale 1-5
INSERT INTO public.survey_answer_options (answer_set_id, option_key, labels, display_order, metadata) VALUES
  ((SELECT id FROM public.survey_answer_sets WHERE set_key = 'rating_1_5'), '1', '{"en": "Strongly Disagree", "es": "Muy en desacuerdo", "fr": "Fortement en désaccord", "it": "Fortemente in disaccordo"}', 1, '{"numeric_value": 1}'),
  ((SELECT id FROM public.survey_answer_sets WHERE set_key = 'rating_1_5'), '2', '{"en": "Disagree", "es": "En desacuerdo", "fr": "Pas d''accord", "it": "In disaccordo"}', 2, '{"numeric_value": 2}'),
  ((SELECT id FROM public.survey_answer_sets WHERE set_key = 'rating_1_5'), '3', '{"en": "Neutral", "es": "Neutral", "fr": "Neutre", "it": "Neutro"}', 3, '{"numeric_value": 3}'),
  ((SELECT id FROM public.survey_answer_sets WHERE set_key = 'rating_1_5'), '4', '{"en": "Agree", "es": "De acuerdo", "fr": "D''accord", "it": "D''accordo"}', 4, '{"numeric_value": 4}'),
  ((SELECT id FROM public.survey_answer_sets WHERE set_key = 'rating_1_5'), '5', '{"en": "Strongly Agree", "es": "Muy de acuerdo", "fr": "Tout à fait d''accord", "it": "Fortemente d''accordo"}', 5, '{"numeric_value": 5}');

-- Insert answer options for motivation factors
INSERT INTO public.survey_answer_options (answer_set_id, option_key, labels, display_order) VALUES
  ((SELECT id FROM public.survey_answer_sets WHERE set_key = 'motivation_factors'), 'compensation', '{"en": "Compensation", "es": "Compensación", "fr": "Rémunération", "it": "Compensazione"}', 1),
  ((SELECT id FROM public.survey_answer_sets WHERE set_key = 'motivation_factors'), 'benefits', '{"en": "Benefits package", "es": "Paquete de beneficios", "fr": "Package d''avantages", "it": "Pacchetto di benefit"}', 2),
  ((SELECT id FROM public.survey_answer_sets WHERE set_key = 'motivation_factors'), 'job-satisfaction', '{"en": "Job satisfaction", "es": "Satisfacción laboral", "fr": "Satisfaction au travail", "it": "Soddisfazione lavorativa"}', 3),
  ((SELECT id FROM public.survey_answer_sets WHERE set_key = 'motivation_factors'), 'work-life-balance', '{"en": "Work-life balance", "es": "Equilibrio entre trabajo y vida personal", "fr": "Équilibre travail-vie", "it": "Equilibrio vita-lavoro"}', 4),
  ((SELECT id FROM public.survey_answer_sets WHERE set_key = 'motivation_factors'), 'career-growth', '{"en": "Career growth opportunities", "es": "Oportunidades de crecimiento profesional", "fr": "Opportunités de croissance de carrière", "it": "Opportunità di crescita professionale"}', 5),
  ((SELECT id FROM public.survey_answer_sets WHERE set_key = 'motivation_factors'), 'company-culture', '{"en": "Company culture", "es": "Cultura de la empresa", "fr": "Culture d''entreprise", "it": "Cultura aziendale"}', 6),
  ((SELECT id FROM public.survey_answer_sets WHERE set_key = 'motivation_factors'), 'team-collaboration', '{"en": "Team collaboration", "es": "Colaboración en equipo", "fr": "Collaboration d''équipe", "it": "Collaborazione di squadra"}', 7);

-- Insert answer options for communication preferences
INSERT INTO public.survey_answer_options (answer_set_id, option_key, labels, display_order) VALUES
  ((SELECT id FROM public.survey_answer_sets WHERE set_key = 'communication_preferences'), 'emails', '{"en": "Emails", "es": "Correos electrónicos", "fr": "E-mails", "it": "Email"}', 1),
  ((SELECT id FROM public.survey_answer_sets WHERE set_key = 'communication_preferences'), 'town-halls', '{"en": "Town hall meetings", "es": "Reuniones generales", "fr": "Réunions générales", "it": "Riunioni generali"}', 2),
  ((SELECT id FROM public.survey_answer_sets WHERE set_key = 'communication_preferences'), 'team-meetings', '{"en": "Team meetings", "es": "Reuniones de equipo", "fr": "Réunions d''équipe", "it": "Riunioni di squadra"}', 3),
  ((SELECT id FROM public.survey_answer_sets WHERE set_key = 'communication_preferences'), 'intranet', '{"en": "Company intranet", "es": "Intranet de la empresa", "fr": "Intranet de l''entreprise", "it": "Intranet aziendale"}', 4),
  ((SELECT id FROM public.survey_answer_sets WHERE set_key = 'communication_preferences'), 'one-on-one', '{"en": "One-on-one with manager", "es": "Uno a uno con el gerente", "fr": "Tête-à-tête avec le responsable", "it": "Uno a uno con il manager"}', 5),
  ((SELECT id FROM public.survey_answer_sets WHERE set_key = 'communication_preferences'), 'instant-messaging', '{"en": "Instant messaging", "es": "Mensajería instantánea", "fr": "Messagerie instantanée", "it": "Messaggistica istantanea"}', 6);

-- Insert answer options for information preferences
INSERT INTO public.survey_answer_options (answer_set_id, option_key, labels, display_order) VALUES
  ((SELECT id FROM public.survey_answer_sets WHERE set_key = 'information_preferences'), 'communication', '{"en": "Company-wide communication", "es": "Comunicación a nivel de empresa", "fr": "Communication à l''échelle de l''entreprise", "it": "Comunicazione aziendale"}', 1),
  ((SELECT id FROM public.survey_answer_sets WHERE set_key = 'information_preferences'), 'strategy', '{"en": "Strategic direction", "es": "Dirección estratégica", "fr": "Direction stratégique", "it": "Direzione strategica"}', 2),
  ((SELECT id FROM public.survey_answer_sets WHERE set_key = 'information_preferences'), 'performance', '{"en": "Performance metrics", "es": "Métricas de rendimiento", "fr": "Indicateurs de performance", "it": "Metriche di performance"}', 3),
  ((SELECT id FROM public.survey_answer_sets WHERE set_key = 'information_preferences'), 'development', '{"en": "Professional development", "es": "Desarrollo profesional", "fr": "Développement professionnel", "it": "Sviluppo professionale"}', 4),
  ((SELECT id FROM public.survey_answer_sets WHERE set_key = 'information_preferences'), 'recognition', '{"en": "Employee recognition", "es": "Reconocimiento de empleados", "fr": "Reconnaissance des employés", "it": "Riconoscimento dei dipendenti"}', 5),
  ((SELECT id FROM public.survey_answer_sets WHERE set_key = 'information_preferences'), 'changes', '{"en": "Organizational changes", "es": "Cambios organizacionales", "fr": "Changements organisationnels", "it": "Cambiamenti organizzativi"}', 6);

-- Update existing questions to link to appropriate answer sets
UPDATE public.survey_question_config 
SET answer_set_id = (SELECT id FROM public.survey_answer_sets WHERE set_key = 'continents')
WHERE question_id = 'continent';

UPDATE public.survey_question_config 
SET answer_set_id = (SELECT id FROM public.survey_answer_sets WHERE set_key = 'divisions')
WHERE question_id = 'division';

UPDATE public.survey_question_config 
SET answer_set_id = (SELECT id FROM public.survey_answer_sets WHERE set_key = 'rating_1_5')
WHERE question_type = 'rating';

UPDATE public.survey_question_config 
SET answer_set_id = (SELECT id FROM public.survey_answer_sets WHERE set_key = 'motivation_factors')
WHERE question_id = 'motivation_factors';

UPDATE public.survey_question_config 
SET answer_set_id = (SELECT id FROM public.survey_answer_sets WHERE set_key = 'communication_preferences')
WHERE question_id = 'communication_preferences';

UPDATE public.survey_question_config 
SET answer_set_id = (SELECT id FROM public.survey_answer_sets WHERE set_key = 'information_preferences')
WHERE question_id = 'information_preferences';