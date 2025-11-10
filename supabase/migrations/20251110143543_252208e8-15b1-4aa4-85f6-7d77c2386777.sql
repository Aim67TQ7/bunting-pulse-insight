-- Enhance survey_question_config table to store multilingual content
ALTER TABLE survey_question_config
ADD COLUMN IF NOT EXISTS labels JSONB DEFAULT '{}'::jsonb,
ADD COLUMN IF NOT EXISTS section TEXT,
ADD COLUMN IF NOT EXISTS options JSONB DEFAULT '[]'::jsonb,
ADD COLUMN IF NOT EXISTS follow_up_rules JSONB DEFAULT '{}'::jsonb,
ADD COLUMN IF NOT EXISTS description JSONB DEFAULT '{}'::jsonb;

-- Clear existing data to start fresh
DELETE FROM survey_question_config;

-- Insert Demographics Questions
INSERT INTO survey_question_config (question_id, question_type, labels, options, display_order, is_required) VALUES
(
  'continent',
  'demographic',
  '{
    "en": "Which Continent is your primary work location?",
    "es": "¿En qué continente se encuentra su ubicación de trabajo principal?",
    "fr": "Quel est votre lieu de travail principal par continent?",
    "it": "Qual è la tua sede di lavoro principale per continente?"
  }'::jsonb,
  '[
    {"value": "north-america", "labels": {"en": "North America", "es": "Norteamérica", "fr": "Amérique du Nord", "it": "Nord America"}},
    {"value": "europe", "labels": {"en": "Europe", "es": "Europa", "fr": "Europe", "it": "Europa"}}
  ]'::jsonb,
  1,
  true
),
(
  'division',
  'demographic',
  '{
    "en": "Which Division of Bunting do you work in?",
    "es": "¿En qué división de Bunting trabaja?",
    "fr": "Dans quelle division de Bunting travaillez-vous?",
    "it": "In quale divisione di Bunting lavori?"
  }'::jsonb,
  '[
    {"value": "equipment", "labels": {"en": "Equipment", "es": "Equipo", "fr": "Équipement", "it": "Attrezzatura"}},
    {"value": "magnetics", "labels": {"en": "Magnetics", "es": "Magnéticos", "fr": "Magnétiques", "it": "Magnetici"}},
    {"value": "both", "labels": {"en": "Both", "es": "Ambos", "fr": "Les deux", "it": "Entrambi"}}
  ]'::jsonb,
  2,
  true
),
(
  'role',
  'demographic',
  '{
    "en": "Which best explains your role?",
    "es": "¿Cuál describe mejor su función?",
    "fr": "Quelle option décrit le mieux votre rôle?",
    "it": "Quale opzione descrive meglio il tuo ruolo?"
  }'::jsonb,
  '[
    {"value": "sales-marketing", "labels": {"en": "Sales/Marketing/Product", "es": "Ventas/Marketing/Producto", "fr": "Ventes/Marketing/Produit", "it": "Vendite/Marketing/Prodotto"}},
    {"value": "operations", "labels": {"en": "Operations/Engineering/Production", "es": "Operaciones/Ingeniería/Producción", "fr": "Opérations/Ingénierie/Production", "it": "Operazioni/Ingegneria/Produzione"}},
    {"value": "admin", "labels": {"en": "Admin/HR/Finance", "es": "Administración/RRHH/Finanzas", "fr": "Administration/RH/Finance", "it": "Amministrazione/HR/Finanza"}}
  ]'::jsonb,
  3,
  true
);

-- Insert Rating Questions with follow-up rules
-- Engagement & Job Satisfaction Section
INSERT INTO survey_question_config (question_id, question_type, section, labels, follow_up_rules, display_order, is_required) VALUES
(
  'job_satisfaction',
  'rating',
  'Engagement & Job Satisfaction',
  '{
    "en": "I am satisfied with my current role and responsibilities.",
    "es": "Estoy satisfecho con mi puesto y responsabilidades actuales.",
    "fr": "Je suis satisfait de mon rôle et de mes responsabilités actuels.",
    "it": "Sono soddisfatto del mio ruolo e delle mie responsabilità attuali."
  }'::jsonb,
  '{
    "trigger": "rating <= 3",
    "prompts": {
      "en": "Please explain what factors contribute to your job satisfaction or dissatisfaction:",
      "es": "Por favor explique qué factores contribuyen a su satisfacción o insatisfacción laboral:",
      "fr": "Veuillez expliquer quels facteurs contribuent à votre satisfaction ou insatisfaction au travail:",
      "it": "Si prega di spiegare quali fattori contribuiscono alla vostra soddisfazione o insoddisfazione lavorativa:"
    }
  }'::jsonb,
  10,
  true
),
(
  'recommend_company',
  'rating',
  'Engagement & Job Satisfaction',
  '{
    "en": "I would recommend this company as a good place to work.",
    "es": "Recomendaría esta empresa como un buen lugar para trabajar.",
    "fr": "Je recommanderais cette entreprise comme un bon endroit pour travailler.",
    "it": "Consiglierei questa azienda come un buon posto di lavoro."
  }'::jsonb,
  '{}'::jsonb,
  11,
  true
),
(
  'strategic_confidence',
  'rating',
  'Engagement & Job Satisfaction',
  '{
    "en": "I see myself working here in 2 years.",
    "es": "Me veo trabajando aquí en 2 años.",
    "fr": "Je me vois travailler ici dans 2 ans.",
    "it": "Mi vedo lavorare qui tra 2 anni."
  }'::jsonb,
  '{}'::jsonb,
  12,
  true
);

-- Leadership & Communication Section
INSERT INTO survey_question_config (question_id, question_type, section, labels, follow_up_rules, display_order, is_required) VALUES
(
  'manager_alignment',
  'rating',
  'Leadership & Communication',
  '{
    "en": "Supervisors/managers communicate expectations clearly.",
    "es": "Los supervisores/gerentes comunican las expectativas claramente.",
    "fr": "Les superviseurs/gestionnaires communiquent clairement les attentes.",
    "it": "I supervisori/manager comunicano chiaramente le aspettative."
  }'::jsonb,
  '{}'::jsonb,
  20,
  true
),
(
  'performance_awareness',
  'rating',
  'Leadership & Communication',
  '{
    "en": "Leadership is effective at keeping me informed about company performance.",
    "es": "El liderazgo es efectivo manteniéndome informado sobre el desempeño de la empresa.",
    "fr": "Le leadership est efficace pour me tenir informé de la performance de l''entreprise.",
    "it": "La leadership è efficace nel tenermi informato sulle prestazioni aziendali."
  }'::jsonb,
  '{}'::jsonb,
  21,
  true
),
(
  'communication_clarity',
  'rating',
  'Leadership & Communication',
  '{
    "en": "When I don''t have access to email, my supervisor effectively relays important information.",
    "es": "Cuando no tengo acceso al correo electrónico, mi supervisor transmite información importante de manera efectiva.",
    "fr": "Quand je n''ai pas accès au courrier électronique, mon superviseur transmet efficacement les informations importantes.",
    "it": "Quando non ho accesso alla posta elettronica, il mio supervisore trasmette efficacemente le informazioni importanti."
  }'::jsonb,
  '{}'::jsonb,
  22,
  true
),
(
  'leadership_openness',
  'rating',
  'Leadership & Communication',
  '{
    "en": "I feel comfortable raising concerns or giving feedback to management.",
    "es": "Me siento cómodo planteando inquietudes o dando comentarios a la gerencia.",
    "fr": "Je me sens à l''aise pour soulever des préoccupations ou donner des commentaires à la direction.",
    "it": "Mi sento a mio agio nel sollevare preoccupazioni o dare feedback alla direzione."
  }'::jsonb,
  '{}'::jsonb,
  23,
  true
);

-- Training & Development Section
INSERT INTO survey_question_config (question_id, question_type, section, labels, follow_up_rules, display_order, is_required) VALUES
(
  'training_satisfaction',
  'rating',
  'Training & Development',
  '{
    "en": "I received enough training to do my job safely and effectively.",
    "es": "Recibí suficiente capacitación para hacer mi trabajo de manera segura y efectiva.",
    "fr": "J''ai reçu suffisamment de formation pour faire mon travail de manière sûre et efficace.",
    "it": "Ho ricevuto una formazione sufficiente per svolgere il mio lavoro in modo sicuro ed efficace."
  }'::jsonb,
  '{
    "trigger": "rating <= 3",
    "prompts": {
      "en": "Please describe what additional training or resources would be helpful:",
      "es": "Por favor describa qué capacitación o recursos adicionales serían útiles:",
      "fr": "Veuillez décrire quelle formation ou ressources supplémentaires seraient utiles:",
      "it": "Si prega di descrivere quale formazione o risorse aggiuntive sarebbero utili:"
    }
  }'::jsonb,
  30,
  true
),
(
  'advancement_opportunities',
  'rating',
  'Training & Development',
  '{
    "en": "I have opportunities for growth and advancement within the company.",
    "es": "Tengo oportunidades de crecimiento y avance dentro de la empresa.",
    "fr": "J''ai des opportunités de croissance et d''avancement au sein de l''entreprise.",
    "it": "Ho opportunità di crescita e avanzamento all''interno dell''azienda."
  }'::jsonb,
  '{}'::jsonb,
  31,
  true
);

-- Teamwork & Culture Section
INSERT INTO survey_question_config (question_id, question_type, section, labels, follow_up_rules, display_order, is_required) VALUES
(
  'cross_functional_collaboration',
  'rating',
  'Teamwork & Culture',
  '{
    "en": "There is good cooperation between different teams and departments.",
    "es": "Existe buena cooperación entre diferentes equipos y departamentos.",
    "fr": "Il y a une bonne coopération entre les différentes équipes et départements.",
    "it": "C''è buona cooperazione tra i diversi team e dipartimenti."
  }'::jsonb,
  '{}'::jsonb,
  40,
  true
),
(
  'team_morale',
  'rating',
  'Teamwork & Culture',
  '{
    "en": "Employee morale is positive in my workplace.",
    "es": "La moral de los empleados es positiva en mi lugar de trabajo.",
    "fr": "Le moral des employés est positif dans mon lieu de travail.",
    "it": "Il morale dei dipendenti è positivo nel mio posto di lavoro."
  }'::jsonb,
  '{}'::jsonb,
  41,
  true
),
(
  'pride_in_work',
  'rating',
  'Teamwork & Culture',
  '{
    "en": "I feel a sense of pride working for this company.",
    "es": "Siento orgullo de trabajar para esta empresa.",
    "fr": "Je suis fier de travailler pour cette entreprise.",
    "it": "Sono orgoglioso di lavorare per questa azienda."
  }'::jsonb,
  '{}'::jsonb,
  42,
  true
);

-- Safety & Work Environment Section
INSERT INTO survey_question_config (question_id, question_type, section, labels, follow_up_rules, display_order, is_required) VALUES
(
  'workplace_safety',
  'rating',
  'Safety & Work Environment',
  '{
    "en": "My workplace prioritizes employee safety.",
    "es": "Mi lugar de trabajo prioriza la seguridad de los empleados.",
    "fr": "Mon lieu de travail priorise la sécurité des employés.",
    "it": "Il mio posto di lavoro dà priorità alla sicurezza dei dipendenti."
  }'::jsonb,
  '{}'::jsonb,
  50,
  true
),
(
  'safety_reporting_comfort',
  'rating',
  'Safety & Work Environment',
  '{
    "en": "I feel comfortable reporting safety concerns.",
    "es": "Me siento cómodo reportando inquietudes de seguridad.",
    "fr": "Je me sens à l''aise pour signaler des préoccupations de sécurité.",
    "it": "Mi sento a mio agio nel segnalare problemi di sicurezza."
  }'::jsonb,
  '{}'::jsonb,
  51,
  true
);

-- Scheduling & Workload Section
INSERT INTO survey_question_config (question_id, question_type, section, labels, follow_up_rules, display_order, is_required) VALUES
(
  'workload_manageability',
  'rating',
  'Scheduling & Workload',
  '{
    "en": "My workload is manageable.",
    "es": "Mi carga de trabajo es manejable.",
    "fr": "Ma charge de travail est gérable.",
    "it": "Il mio carico di lavoro è gestibile."
  }'::jsonb,
  '{}'::jsonb,
  60,
  true
),
(
  'work_life_balance',
  'rating',
  'Scheduling & Workload',
  '{
    "en": "I can maintain a healthy work-life balance.",
    "es": "Puedo mantener un equilibrio saludable entre el trabajo y la vida personal.",
    "fr": "Je peux maintenir un équilibre sain entre travail et vie personnelle.",
    "it": "Posso mantenere un sano equilibrio tra lavoro e vita privata."
  }'::jsonb,
  '{
    "trigger": "rating <= 3",
    "prompts": {
      "en": "Please explain what impacts your work-life balance:",
      "es": "Por favor explique qué impacta su equilibrio entre el trabajo y la vida personal:",
      "fr": "Veuillez expliquer ce qui impacte votre équilibre travail-vie personnelle:",
      "it": "Si prega di spiegare cosa influenza il vostro equilibrio tra lavoro e vita privata:"
    }
  }'::jsonb,
  61,
  true
);

-- Tools, Equipment & Processes Section
INSERT INTO survey_question_config (question_id, question_type, section, labels, follow_up_rules, display_order, is_required) VALUES
(
  'tools_equipment_quality',
  'rating',
  'Tools, Equipment & Processes',
  '{
    "en": "I have the tools and equipment I need to do my job effectively.",
    "es": "Tengo las herramientas y el equipo que necesito para hacer mi trabajo efectivamente.",
    "fr": "J''ai les outils et l''équipement dont j''ai besoin pour faire mon travail efficacement.",
    "it": "Ho gli strumenti e le attrezzature di cui ho bisogno per svolgere il mio lavoro in modo efficace."
  }'::jsonb,
  '{}'::jsonb,
  70,
  true
),
(
  'manual_processes_focus',
  'rating',
  'Tools, Equipment & Processes',
  '{
    "en": "Work processes and procedures are efficient and effective.",
    "es": "Los procesos y procedimientos de trabajo son eficientes y efectivos.",
    "fr": "Les processus et procédures de travail sont efficaces et performants.",
    "it": "I processi e le procedure di lavoro sono efficienti ed efficaci."
  }'::jsonb,
  '{}'::jsonb,
  71,
  true
),
(
  'company_value_alignment',
  'rating',
  'Tools, Equipment & Processes',
  '{
    "en": "The company values my contributions.",
    "es": "La empresa valora mis contribuciones.",
    "fr": "L''entreprise valorise mes contributions.",
    "it": "L''azienda valorizza i miei contributi."
  }'::jsonb,
  '{}'::jsonb,
  72,
  true
),
(
  'comfortable_suggesting_improvements',
  'rating',
  'Tools, Equipment & Processes',
  '{
    "en": "The company handles change and transitions effectively.",
    "es": "La empresa maneja el cambio y las transiciones efectivamente.",
    "fr": "L''entreprise gère efficacement le changement et les transitions.",
    "it": "L''azienda gestisce efficacemente i cambiamenti e le transizioni."
  }'::jsonb,
  '{}'::jsonb,
  73,
  true
);

-- Insert Multi-Select Questions
INSERT INTO survey_question_config (question_id, question_type, section, labels, options, display_order, is_required) VALUES
(
  'communication_preferences',
  'multiselect',
  'Leadership & Communication',
  '{
    "en": "Which communication styles do you prefer?",
    "es": "¿Qué estilos de comunicación prefieres?",
    "fr": "Quels styles de communication préférez-vous?",
    "it": "Quali stili di comunicazione preferisci?"
  }'::jsonb,
  '[
    {"value": "companywide-emails", "labels": {"en": "Companywide emails", "es": "Correos electrónicos para toda la empresa", "fr": "Courriels à l''échelle de l''entreprise", "it": "Email aziendali"}},
    {"value": "quarterly-town-halls", "labels": {"en": "Quarterly Town halls", "es": "Reuniones trimestrales", "fr": "Assemblées publiques trimestrielles", "it": "Riunioni aziendali trimestrali"}},
    {"value": "company-intranet", "labels": {"en": "Company Intranet", "es": "Intranet de la empresa", "fr": "Intranet de l''entreprise", "it": "Intranet aziendale"}},
    {"value": "digital-signage", "labels": {"en": "Digital Signage", "es": "Señalización digital", "fr": "Signalisation numérique", "it": "Segnaletica digitale"}},
    {"value": "printed-signage", "labels": {"en": "Printed Signage", "es": "Señalización impresa", "fr": "Signalisation imprimée", "it": "Segnaletica stampata"}},
    {"value": "team-meetings", "labels": {"en": "Team meetings", "es": "Reuniones de equipo", "fr": "Réunions d''équipe", "it": "Riunioni di team"}}
  ]'::jsonb,
  80,
  true
),
(
  'motivation_factors',
  'multiselect',
  'Engagement & Job Satisfaction',
  '{
    "en": "Check any of the following that motivates you to stay with the company.",
    "es": "Marque cualquiera de los siguientes que lo motive a permanecer en la empresa.",
    "fr": "Cochez tout ce qui suit qui vous motive à rester dans l''entreprise.",
    "it": "Seleziona uno o più dei seguenti motivi che ti incoraggiano a rimanere in azienda."
  }'::jsonb,
  '[
    {"value": "compensation", "labels": {"en": "Compensation", "es": "Compensación", "fr": "Rémunération", "it": "Retribuzione"}},
    {"value": "benefits-package", "labels": {"en": "Benefit Package", "es": "Paquete de beneficios", "fr": "Ensemble des avantages", "it": "Pacchetto di benefici"}},
    {"value": "job-satisfaction", "labels": {"en": "Job Satisfaction", "es": "Satisfacción laboral", "fr": "Satisfaction au travail", "it": "Soddisfazione lavorativa"}},
    {"value": "the-people", "labels": {"en": "The People", "es": "La gente", "fr": "Les collègues / Les gens", "it": "Le persone"}},
    {"value": "growth-opportunities", "labels": {"en": "Growth Opportunities", "es": "Oportunidades de crecimiento", "fr": "Opportunités de croissance", "it": "Opportunità di crescita"}},
    {"value": "company-future", "labels": {"en": "Company''s Future", "es": "Futuro de la empresa", "fr": "Avenir de l''entreprise", "it": "Futuro dell''azienda"}},
    {"value": "recognition", "labels": {"en": "Recognition", "es": "Reconocimiento", "fr": "Reconnaissance", "it": "Riconoscimento"}},
    {"value": "other", "labels": {"en": "Other", "es": "Otro", "fr": "Autre", "it": "Altro"}}
  ]'::jsonb,
  81,
  true
),
(
  'information_preferences',
  'multiselect',
  'Workplace Experience',
  '{
    "en": "What information would you like to receive more from the company?",
    "es": "¿Qué información te gustaría recibir más de la empresa?",
    "fr": "Quelles informations aimeriez-vous recevoir davantage de l''entreprise?",
    "it": "Quali informazioni vorresti ricevere maggiormente dall''azienda?"
  }'::jsonb,
  '[
    {"value": "communication-transparency", "labels": {"en": "Communication and transparency", "es": "Comunicación y transparencia", "fr": "Communication et transparence", "it": "Comunicazione e trasparenza"}},
    {"value": "strategic-direction", "labels": {"en": "Strategic direction", "es": "Dirección estratégica", "fr": "Direction stratégique", "it": "Direzione strategica"}},
    {"value": "financial-incentives", "labels": {"en": "Financial incentives", "es": "Incentivos financieros", "fr": "Incitatifs financiers", "it": "Incentivi finanziari"}},
    {"value": "performance-metrics", "labels": {"en": "Performance metrics", "es": "Métricas de rendimiento", "fr": "Métriques de performance", "it": "Metriche di prestazione"}}
  ]'::jsonb,
  82,
  true
);