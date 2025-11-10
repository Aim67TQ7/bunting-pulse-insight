-- Drop existing policies if they exist
DROP POLICY IF EXISTS "Allow public read access to answer sets" ON public.survey_answer_sets;
DROP POLICY IF EXISTS "Allow public read access to answer options" ON public.survey_answer_options;

-- Recreate RLS policies
CREATE POLICY "Allow public read access to answer sets"
  ON public.survey_answer_sets FOR SELECT
  TO public
  USING (is_active = true);

CREATE POLICY "Allow public read access to answer options"
  ON public.survey_answer_options FOR SELECT
  TO public
  USING (is_active = true);

-- Insert answer sets (only if they don't exist)
INSERT INTO public.survey_answer_sets (set_key, name, description, set_type) 
SELECT * FROM (VALUES
  ('continents', '{"en": "Continents", "es": "Continentes", "fr": "Continents", "it": "Continenti"}'::jsonb, '{"en": "Primary work location by continent"}'::jsonb, 'single_select'),
  ('divisions', '{"en": "Divisions", "es": "Divisiones", "fr": "Divisions", "it": "Divisioni"}'::jsonb, '{"en": "Company division"}'::jsonb, 'single_select'),
  ('rating_1_5', '{"en": "1-5 Rating Scale", "es": "Escala de Calificación 1-5", "fr": "Échelle de notation 1-5", "it": "Scala di valutazione 1-5"}'::jsonb, '{"en": "Standard 5-point Likert scale"}'::jsonb, 'rating'),
  ('motivation_factors', '{"en": "Motivation Factors", "es": "Factores de Motivación", "fr": "Facteurs de motivation", "it": "Fattori motivazionali"}'::jsonb, '{"en": "Factors that motivate employees"}'::jsonb, 'multi_select'),
  ('communication_preferences', '{"en": "Communication Preferences", "es": "Preferencias de Comunicación", "fr": "Préférences de communication", "it": "Preferenze di comunicazione"}'::jsonb, '{"en": "Preferred communication channels"}'::jsonb, 'multi_select'),
  ('information_preferences', '{"en": "Information Preferences", "es": "Preferencias de Información", "fr": "Préférences d''information", "it": "Preferenze informative"}'::jsonb, '{"en": "Types of information employees want to receive"}'::jsonb, 'multi_select')
) AS v(set_key, name, description, set_type)
WHERE NOT EXISTS (
  SELECT 1 FROM public.survey_answer_sets WHERE survey_answer_sets.set_key = v.set_key
);

-- Insert answer options for continents
INSERT INTO public.survey_answer_options (answer_set_id, option_key, labels, display_order)
SELECT answer_set_id, option_key, labels, display_order FROM (VALUES
  ((SELECT id FROM public.survey_answer_sets WHERE set_key = 'continents'), 'north-america', '{"en": "North America", "es": "América del Norte", "fr": "Amérique du Nord", "it": "Nord America"}'::jsonb, 1),
  ((SELECT id FROM public.survey_answer_sets WHERE set_key = 'continents'), 'europe', '{"en": "Europe", "es": "Europa", "fr": "Europe", "it": "Europa"}'::jsonb, 2)
) AS v(answer_set_id, option_key, labels, display_order)
WHERE NOT EXISTS (
  SELECT 1 FROM public.survey_answer_options 
  WHERE survey_answer_options.answer_set_id = v.answer_set_id 
  AND survey_answer_options.option_key = v.option_key
);

-- Insert answer options for divisions
INSERT INTO public.survey_answer_options (answer_set_id, option_key, labels, display_order)
SELECT answer_set_id, option_key, labels, display_order FROM (VALUES
  ((SELECT id FROM public.survey_answer_sets WHERE set_key = 'divisions'), 'equipment', '{"en": "Equipment", "es": "Equipo", "fr": "Équipement", "it": "Attrezzatura"}'::jsonb, 1),
  ((SELECT id FROM public.survey_answer_sets WHERE set_key = 'divisions'), 'magnetics', '{"en": "Magnetics", "es": "Magnética", "fr": "Magnétique", "it": "Magnetica"}'::jsonb, 2),
  ((SELECT id FROM public.survey_answer_sets WHERE set_key = 'divisions'), 'both', '{"en": "Both", "es": "Ambos", "fr": "Les deux", "it": "Entrambi"}'::jsonb, 3)
) AS v(answer_set_id, option_key, labels, display_order)
WHERE NOT EXISTS (
  SELECT 1 FROM public.survey_answer_options 
  WHERE survey_answer_options.answer_set_id = v.answer_set_id 
  AND survey_answer_options.option_key = v.option_key
);

-- Insert answer options for rating scale 1-5
INSERT INTO public.survey_answer_options (answer_set_id, option_key, labels, display_order, metadata)
SELECT answer_set_id, option_key, labels, display_order, metadata FROM (VALUES
  ((SELECT id FROM public.survey_answer_sets WHERE set_key = 'rating_1_5'), '1', '{"en": "Strongly Disagree", "es": "Muy en desacuerdo", "fr": "Fortement en désaccord", "it": "Fortemente in disaccordo"}'::jsonb, 1, '{"numeric_value": 1}'::jsonb),
  ((SELECT id FROM public.survey_answer_sets WHERE set_key = 'rating_1_5'), '2', '{"en": "Disagree", "es": "En desacuerdo", "fr": "Pas d''accord", "it": "In disaccordo"}'::jsonb, 2, '{"numeric_value": 2}'::jsonb),
  ((SELECT id FROM public.survey_answer_sets WHERE set_key = 'rating_1_5'), '3', '{"en": "Neutral", "es": "Neutral", "fr": "Neutre", "it": "Neutro"}'::jsonb, 3, '{"numeric_value": 3}'::jsonb),
  ((SELECT id FROM public.survey_answer_sets WHERE set_key = 'rating_1_5'), '4', '{"en": "Agree", "es": "De acuerdo", "fr": "D''accord", "it": "D''accordo"}'::jsonb, 4, '{"numeric_value": 4}'::jsonb),
  ((SELECT id FROM public.survey_answer_sets WHERE set_key = 'rating_1_5'), '5', '{"en": "Strongly Agree", "es": "Muy de acuerdo", "fr": "Tout à fait d''accord", "it": "Fortemente d''accordo"}'::jsonb, 5, '{"numeric_value": 5}'::jsonb)
) AS v(answer_set_id, option_key, labels, display_order, metadata)
WHERE NOT EXISTS (
  SELECT 1 FROM public.survey_answer_options 
  WHERE survey_answer_options.answer_set_id = v.answer_set_id 
  AND survey_answer_options.option_key = v.option_key
);

-- Insert answer options for motivation factors
INSERT INTO public.survey_answer_options (answer_set_id, option_key, labels, display_order)
SELECT answer_set_id, option_key, labels, display_order FROM (VALUES
  ((SELECT id FROM public.survey_answer_sets WHERE set_key = 'motivation_factors'), 'compensation', '{"en": "Compensation", "es": "Compensación", "fr": "Rémunération", "it": "Compensazione"}'::jsonb, 1),
  ((SELECT id FROM public.survey_answer_sets WHERE set_key = 'motivation_factors'), 'benefits', '{"en": "Benefits package", "es": "Paquete de beneficios", "fr": "Package d''avantages", "it": "Pacchetto di benefit"}'::jsonb, 2),
  ((SELECT id FROM public.survey_answer_sets WHERE set_key = 'motivation_factors'), 'job-satisfaction', '{"en": "Job satisfaction", "es": "Satisfacción laboral", "fr": "Satisfaction au travail", "it": "Soddisfazione lavorativa"}'::jsonb, 3),
  ((SELECT id FROM public.survey_answer_sets WHERE set_key = 'motivation_factors'), 'work-life-balance', '{"en": "Work-life balance", "es": "Equilibrio entre trabajo y vida personal", "fr": "Équilibre travail-vie", "it": "Equilibrio vita-lavoro"}'::jsonb, 4),
  ((SELECT id FROM public.survey_answer_sets WHERE set_key = 'motivation_factors'), 'career-growth', '{"en": "Career growth opportunities", "es": "Oportunidades de crecimiento profesional", "fr": "Opportunités de croissance de carrière", "it": "Opportunità di crescita professionale"}'::jsonb, 5),
  ((SELECT id FROM public.survey_answer_sets WHERE set_key = 'motivation_factors'), 'company-culture', '{"en": "Company culture", "es": "Cultura de la empresa", "fr": "Culture d''entreprise", "it": "Cultura aziendale"}'::jsonb, 6),
  ((SELECT id FROM public.survey_answer_sets WHERE set_key = 'motivation_factors'), 'team-collaboration', '{"en": "Team collaboration", "es": "Colaboración en equipo", "fr": "Collaboration d''équipe", "it": "Collaborazione di squadra"}'::jsonb, 7)
) AS v(answer_set_id, option_key, labels, display_order)
WHERE NOT EXISTS (
  SELECT 1 FROM public.survey_answer_options 
  WHERE survey_answer_options.answer_set_id = v.answer_set_id 
  AND survey_answer_options.option_key = v.option_key
);

-- Insert answer options for communication preferences
INSERT INTO public.survey_answer_options (answer_set_id, option_key, labels, display_order)
SELECT answer_set_id, option_key, labels, display_order FROM (VALUES
  ((SELECT id FROM public.survey_answer_sets WHERE set_key = 'communication_preferences'), 'emails', '{"en": "Emails", "es": "Correos electrónicos", "fr": "E-mails", "it": "Email"}'::jsonb, 1),
  ((SELECT id FROM public.survey_answer_sets WHERE set_key = 'communication_preferences'), 'town-halls', '{"en": "Town hall meetings", "es": "Reuniones generales", "fr": "Réunions générales", "it": "Riunioni generali"}'::jsonb, 2),
  ((SELECT id FROM public.survey_answer_sets WHERE set_key = 'communication_preferences'), 'team-meetings', '{"en": "Team meetings", "es": "Reuniones de equipo", "fr": "Réunions d''équipe", "it": "Riunioni di squadra"}'::jsonb, 3),
  ((SELECT id FROM public.survey_answer_sets WHERE set_key = 'communication_preferences'), 'intranet', '{"en": "Company intranet", "es": "Intranet de la empresa", "fr": "Intranet de l''entreprise", "it": "Intranet aziendale"}'::jsonb, 4),
  ((SELECT id FROM public.survey_answer_sets WHERE set_key = 'communication_preferences'), 'one-on-one', '{"en": "One-on-one with manager", "es": "Uno a uno con el gerente", "fr": "Tête-à-tête avec le responsable", "it": "Uno a uno con il manager"}'::jsonb, 5),
  ((SELECT id FROM public.survey_answer_sets WHERE set_key = 'communication_preferences'), 'instant-messaging', '{"en": "Instant messaging", "es": "Mensajería instantánea", "fr": "Messagerie instantanée", "it": "Messaggistica istantanea"}'::jsonb, 6)
) AS v(answer_set_id, option_key, labels, display_order)
WHERE NOT EXISTS (
  SELECT 1 FROM public.survey_answer_options 
  WHERE survey_answer_options.answer_set_id = v.answer_set_id 
  AND survey_answer_options.option_key = v.option_key
);

-- Insert answer options for information preferences
INSERT INTO public.survey_answer_options (answer_set_id, option_key, labels, display_order)
SELECT answer_set_id, option_key, labels, display_order FROM (VALUES
  ((SELECT id FROM public.survey_answer_sets WHERE set_key = 'information_preferences'), 'communication', '{"en": "Company-wide communication", "es": "Comunicación a nivel de empresa", "fr": "Communication à l''échelle de l''entreprise", "it": "Comunicazione aziendale"}'::jsonb, 1),
  ((SELECT id FROM public.survey_answer_sets WHERE set_key = 'information_preferences'), 'strategy', '{"en": "Strategic direction", "es": "Dirección estratégica", "fr": "Direction stratégique", "it": "Direzione strategica"}'::jsonb, 2),
  ((SELECT id FROM public.survey_answer_sets WHERE set_key = 'information_preferences'), 'performance', '{"en": "Performance metrics", "es": "Métricas de rendimiento", "fr": "Indicateurs de performance", "it": "Metriche di performance"}'::jsonb, 3),
  ((SELECT id FROM public.survey_answer_sets WHERE set_key = 'information_preferences'), 'development', '{"en": "Professional development", "es": "Desarrollo profesional", "fr": "Développement professionnel", "it": "Sviluppo professionale"}'::jsonb, 4),
  ((SELECT id FROM public.survey_answer_sets WHERE set_key = 'information_preferences'), 'recognition', '{"en": "Employee recognition", "es": "Reconocimiento de empleados", "fr": "Reconnaissance des employés", "it": "Riconoscimento dei dipendenti"}'::jsonb, 5),
  ((SELECT id FROM public.survey_answer_sets WHERE set_key = 'information_preferences'), 'changes', '{"en": "Organizational changes", "es": "Cambios organizacionales", "fr": "Changements organisationnels", "it": "Cambiamenti organizzativi"}'::jsonb, 6)
) AS v(answer_set_id, option_key, labels, display_order)
WHERE NOT EXISTS (
  SELECT 1 FROM public.survey_answer_options 
  WHERE survey_answer_options.answer_set_id = v.answer_set_id 
  AND survey_answer_options.option_key = v.option_key
);

-- Update existing questions to link to appropriate answer sets
UPDATE public.survey_question_config 
SET answer_set_id = (SELECT id FROM public.survey_answer_sets WHERE set_key = 'continents')
WHERE question_id = 'continent' AND answer_set_id IS NULL;

UPDATE public.survey_question_config 
SET answer_set_id = (SELECT id FROM public.survey_answer_sets WHERE set_key = 'divisions')
WHERE question_id = 'division' AND answer_set_id IS NULL;

UPDATE public.survey_question_config 
SET answer_set_id = (SELECT id FROM public.survey_answer_sets WHERE set_key = 'rating_1_5')
WHERE question_type = 'rating' AND answer_set_id IS NULL;

UPDATE public.survey_question_config 
SET answer_set_id = (SELECT id FROM public.survey_answer_sets WHERE set_key = 'motivation_factors')
WHERE question_id = 'motivation_factors' AND answer_set_id IS NULL;

UPDATE public.survey_question_config 
SET answer_set_id = (SELECT id FROM public.survey_answer_sets WHERE set_key = 'communication_preferences')
WHERE question_id = 'communication_preferences' AND answer_set_id IS NULL;

UPDATE public.survey_question_config 
SET answer_set_id = (SELECT id FROM public.survey_answer_sets WHERE set_key = 'information_preferences')
WHERE question_id = 'information_preferences' AND answer_set_id IS NULL;