-- Remove duplicate and incorrect motivation_factors rating question
-- The correct one is the multiselect version at display_order 3
DELETE FROM survey_question_config 
WHERE question_id = 'motivation_factors' 
AND question_type = 'rating' 
AND display_order = 888;

-- Fix any other potential issues with question types
-- strategic_confidence should be rating, not multiselect
UPDATE survey_question_config
SET question_type = 'rating'
WHERE question_id = 'strategic_confidence' AND question_type = 'multiselect';

-- Make sure role question exists for demographics
INSERT INTO survey_question_config (
  question_id,
  question_type,
  labels,
  display_order,
  is_required
)
SELECT 
  'role',
  'demographic',
  jsonb_build_object(
    'en', 'Which best explains your role?',
    'es', '¿Cuál describe mejor su función?',
    'fr', 'Quelle option décrit le mieux votre rôle?',
    'it', 'Quale opzione descrive meglio il tuo ruolo?'
  ),
  2.5,
  true
WHERE NOT EXISTS (
  SELECT 1 FROM survey_question_config WHERE question_id = 'role'
);

-- Create answer set for role if it doesn't exist (using single_select type)
INSERT INTO survey_answer_sets (set_key, name, set_type)
SELECT 
  'roles',
  jsonb_build_object(
    'en', 'Role Options',
    'es', 'Opciones de rol',
    'fr', 'Options de rôle',
    'it', 'Opzioni di ruolo'
  ),
  'single_select'
WHERE NOT EXISTS (
  SELECT 1 FROM survey_answer_sets WHERE set_key = 'roles'
);

-- Add role options
INSERT INTO survey_answer_options (answer_set_id, option_key, labels, display_order)
SELECT 
  (SELECT id FROM survey_answer_sets WHERE set_key = 'roles'),
  'sales_marketing',
  jsonb_build_object(
    'en', 'Sales/Marketing/Product',
    'es', 'Ventas/Marketing/Producto',
    'fr', 'Ventes/Marketing/Produit',
    'it', 'Vendite/Marketing/Prodotto'
  ),
  1
WHERE NOT EXISTS (
  SELECT 1 FROM survey_answer_options 
  WHERE answer_set_id = (SELECT id FROM survey_answer_sets WHERE set_key = 'roles')
  AND option_key = 'sales_marketing'
);

INSERT INTO survey_answer_options (answer_set_id, option_key, labels, display_order)
SELECT 
  (SELECT id FROM survey_answer_sets WHERE set_key = 'roles'),
  'operations',
  jsonb_build_object(
    'en', 'Operations/Engineering/Production',
    'es', 'Operaciones/Ingeniería/Producción',
    'fr', 'Opérations/Ingénierie/Production',
    'it', 'Operazioni/Ingegneria/Produzione'
  ),
  2
WHERE NOT EXISTS (
  SELECT 1 FROM survey_answer_options 
  WHERE answer_set_id = (SELECT id FROM survey_answer_sets WHERE set_key = 'roles')
  AND option_key = 'operations'
);

INSERT INTO survey_answer_options (answer_set_id, option_key, labels, display_order)
SELECT 
  (SELECT id FROM survey_answer_sets WHERE set_key = 'roles'),
  'admin_hr',
  jsonb_build_object(
    'en', 'Admin/HR/Finance',
    'es', 'Administración/RRHH/Finanzas',
    'fr', 'Administration/RH/Finance',
    'it', 'Amministrazione/RU/Finanza'
  ),
  3
WHERE NOT EXISTS (
  SELECT 1 FROM survey_answer_options 
  WHERE answer_set_id = (SELECT id FROM survey_answer_sets WHERE set_key = 'roles')
  AND option_key = 'admin_hr'
);

-- Link role question to role answer set
UPDATE survey_question_config
SET answer_set_id = (SELECT id FROM survey_answer_sets WHERE set_key = 'roles')
WHERE question_id = 'role' AND answer_set_id IS NULL;