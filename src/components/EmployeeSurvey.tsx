import { useState, useEffect, useCallback, useRef } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Checkbox } from "@/components/ui/checkbox";
import { CheckIcon, AlertTriangleIcon, LoaderIcon, Globe, Download, SaveIcon, ShieldIcon, XIcon } from "lucide-react";
import { cn } from "@/lib/utils";
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";
import { CookieConsentBanner } from "./CookieConsentBanner";
import { GDPRPrivacyPolicy } from "./GDPRPrivacyPolicy";
import { SurveyConsentDialog } from "./SurveyConsentDialog";
import { DataRightsManager } from "./DataRightsManager";
import { QRCodeSVG } from 'qrcode.react';
import buntingLogo from "@/assets/bunting-logo-2.png";
import magnetApplicationsLogo from "@/assets/magnet-applications-logo-2.png";
import northAmericaIcon from "@/assets/north-america-icon.png";
import europeIcon from "@/assets/europe-icon.png";
import { useSurveyQuestions } from "@/hooks/useSurveyQuestions";
interface LanguageContent {
  [key: string]: {
    [key: string]: string;
  };
}
const languageContent: LanguageContent = {
  en: {
    title: "Employee Engagement Survey",
    subtitle: "Your feedback helps us improve our workplace culture",
    languageLabel: "Language",
    getStarted: "Get Started",
    privacyNotice: "Privacy Notice",
    // Demographics
    locationQuestion: "Which division do you work in?",
    roleQuestion: "What is your role level?",
    magnetics: "Magnetics",
    equipment: "Equipment",
    other: "Other",
    operationsDistribution: "Operations & Distribution",
    engineeringServices: "Engineering & Services",
    salesFinance: "Sales & Finance",
    adminManagement: "Admin & Management",
    // Rating questions - Categories
    jobSatisfaction: "I am satisfied with my current role and responsibilities.",
    companySatisfaction: "I would recommend this company as a good place to work.",
    futureView: "I see myself working here in 2 years.",
    expectations: "Supervisors/managers communicate expectations clearly.",
    performanceAwareness: "Leadership is effective at keeping me informed about company performance.",
    relayingInformation: "When I don't have access to email, my supervisor effectively relays important information.",
    managementFeedback: "I feel comfortable raising concerns or giving feedback to management.",
    training: "I received enough training to do my job safely and effectively.",
    opportunities: "I have opportunities for growth and advancement within the company.",
    cooperation: "There is good cooperation between different teams and departments.",
    morale: "Employee morale is positive in my workplace.",
    pride: "I feel a sense of pride working for this company.",
    safetyFocus: "My workplace prioritizes employee safety.",
    safetyReporting: "I feel comfortable reporting safety concerns.",
    workload: "My workload is manageable.",
    workLifeBalance: "I can maintain a healthy work-life balance.",
    tools: "I have the tools and equipment I need to do my job effectively.",
    processes: "Work processes and procedures are efficient and effective.",
    companyValue: "The company values my contributions.",
    change: "The company handles change and transitions effectively.",
    // Feedback prompts
    jobSatisfactionFollowUp: "Please explain what factors contribute to your job satisfaction or dissatisfaction:",
    trainingFollowUp: "Please describe what additional training or resources would be helpful:",
    workLifeBalanceFollowUp: "Please explain what impacts your work-life balance:",
    lowRatingFeedback: "Please explain why you gave this rating and what could be improved:",
    // Rating Scale
    stronglyDisagree: "Strongly Disagree",
    disagree: "Disagree",
    neutral: "Neutral",
    agree: "Agree",
    stronglyAgree: "Strongly Agree",
    // Multi-select questions
    communicationPreferences: "Which communication styles do you prefer?",
    informationPreferences: "What information would you like to receive more from the company?",
    motivationFactors: "Check any of the following that motivates you to stay with the company.",
    // Multi-select options
    companywideEmails: "Companywide emails",
    quarterlyTownHalls: "Quarterly Town halls",
    companyIntranet: "Company Intranet",
    digitalSignage: "Digital Signage",
    printedSignage: "Printed Signage",
    teamMeetings: "Team meetings",
    communicationTransparency: "Communication and transparency",
    strategicDirection: "Strategic direction",
    financialIncentives: "Financial incentives",
    performanceMetrics: "Performance metrics",
    compensation: "Compensation",
    benefitsPackage: "Benefit Package",
    jobSatisfactionOption: "Job Satisfaction",
    thePeople: "The People",
    growthOpportunities: "Growth Opportunities",
    companyFuture: "Company's Future",
    recognition: "Recognition",
    otherOption: "Other",
    // Section headers
    demographics: "Demographics",
    engagementJobSatisfaction: "Engagement & Job Satisfaction",
    leadershipCommunication: "Leadership & Communication",
    trainingDevelopment: "Training & Development",
    teamworkCulture: "Teamwork & Culture",
    safetyWorkEnvironment: "Safety & Work Environment",
    schedulingWorkload: "Scheduling & Workload",
    toolsEquipmentProcesses: "Tools, Equipment & Processes",
    // Demographic questions
    continentQuestion: "Which Continent is your primary work location?",
    divisionQuestion: "Which Division of Bunting do you work in?",
    roleQuestionFull: "Which best explains your role?",
    // Demographic options
    northAmerica: "North America",
    europe: "Europe",
    both: "Both",
    salesMarketing: "Sales/Marketing/Product",
    operations: "Operations/Engineering/Production",
    adminHR: "Admin/HR/Finance"
  },
  es: {
    title: "Encuesta de compromiso de los empleados",
    subtitle: "Sus comentarios nos ayudan a mejorar nuestra cultura laboral",
    languageLabel: "Idioma",
    getStarted: "Empezar",
    privacyNotice: "Aviso de privacidad",
    locationQuestion: "¿En qué división trabaja?",
    roleQuestion: "¿Cuál es su nivel de función?",
    magnetics: "Magnéticos",
    equipment: "Equipo",
    other: "Otro",
    operationsDistribution: "Operaciones y Distribución",
    engineeringServices: "Ingeniería y Servicios",
    salesFinance: "Ventas y Finanzas",
    adminManagement: "Administración y Gestión",
    jobSatisfaction: "Estoy satisfecho con mi puesto y responsabilidades actuales.",
    companySatisfaction: "Recomendaría esta empresa como un buen lugar para trabajar.",
    futureView: "Me veo trabajando aquí en 2 años.",
    expectations: "Los supervisores/gerentes comunican las expectativas claramente.",
    performanceAwareness: "El liderazgo es efectivo manteniéndome informado sobre el desempeño de la empresa.",
    relayingInformation: "Cuando no tengo acceso al correo electrónico, mi supervisor transmite información importante de manera efectiva.",
    managementFeedback: "Me siento cómodo planteando inquietudes o dando comentarios a la gerencia.",
    training: "Recibí suficiente capacitación para hacer mi trabajo de manera segura y efectiva.",
    opportunities: "Tengo oportunidades de crecimiento y avance dentro de la empresa.",
    cooperation: "Existe buena cooperación entre diferentes equipos y departamentos.",
    morale: "La moral de los empleados es positiva en mi lugar de trabajo.",
    pride: "Siento orgullo de trabajar para esta empresa.",
    safetyFocus: "Mi lugar de trabajo prioriza la seguridad de los empleados.",
    safetyReporting: "Me siento cómodo reportando inquietudes de seguridad.",
    workload: "Mi carga de trabajo es manejable.",
    workLifeBalance: "Puedo mantener un equilibrio saludable entre el trabajo y la vida personal.",
    tools: "Tengo las herramientas y el equipo que necesito para hacer mi trabajo efectivamente.",
    processes: "Los procesos y procedimientos de trabajo son eficientes y efectivos.",
    companyValue: "La empresa valora mis contribuciones.",
    change: "La empresa maneja el cambio y las transiciones efectivamente.",
    jobSatisfactionFollowUp: "Por favor explique qué factores contribuyen a su satisfacción o insatisfacción laboral:",
    trainingFollowUp: "Por favor describa qué capacitación o recursos adicionales serían útiles:",
    workLifeBalanceFollowUp: "Por favor explique qué impacta su equilibrio entre el trabajo y la vida personal:",
    lowRatingFeedback: "Por favor, explique por qué dio esta calificación y qué se podría mejorar:",
    stronglyDisagree: "Totalmente en desacuerdo",
    disagree: "En desacuerdo",
    neutral: "Neutral",
    agree: "De acuerdo",
    stronglyAgree: "Totalmente de acuerdo",
    communicationPreferences: "¿Qué estilos de comunicación prefieres?",
    informationPreferences: "¿Qué información te gustaría recibir más de la empresa?",
    motivationFactors: "Marque cualquiera de los siguientes que lo motive a permanecer en la empresa.",
    companywideEmails: "Correos electrónicos para toda la empresa",
    quarterlyTownHalls: "Reuniones trimestrales",
    companyIntranet: "Intranet de la empresa",
    digitalSignage: "Señalización digital",
    printedSignage: "Señalización impresa",
    teamMeetings: "Reuniones de equipo",
    communicationTransparency: "Comunicación y transparencia",
    strategicDirection: "Dirección estratégica",
    financialIncentives: "Incentivos financieros",
    performanceMetrics: "Métricas de rendimiento",
    compensation: "Compensación",
    benefitsPackage: "Paquete de beneficios",
    jobSatisfactionOption: "Satisfacción laboral",
    thePeople: "La gente",
    growthOpportunities: "Oportunidades de crecimiento",
    companyFuture: "Futuro de la empresa",
    recognition: "Reconocimiento",
    otherOption: "Otro",
    // Section headers
    demographics: "Demografía",
    engagementJobSatisfaction: "Compromiso y satisfacción laboral",
    leadershipCommunication: "Liderazgo y comunicación",
    trainingDevelopment: "Capacitación y desarrollo",
    teamworkCulture: "Trabajo en equipo y cultura",
    safetyWorkEnvironment: "Seguridad y entorno laboral",
    schedulingWorkload: "Programación y carga de trabajo",
    toolsEquipmentProcesses: "Herramientas, equipos y procesos",
    // Demographic questions
    continentQuestion: "¿En qué continente se encuentra su ubicación de trabajo principal?",
    divisionQuestion: "¿En qué división de Bunting trabaja?",
    roleQuestionFull: "¿Cuál describe mejor su función?",
    // Demographic options
    northAmerica: "Norteamérica",
    europe: "Europa",
    both: "Ambos",
    salesMarketing: "Ventas/Marketing/Producto",
    operations: "Operaciones/Ingeniería/Producción",
    adminHR: "Administración/RRHH/Finanzas"
  },
  fr: {
    title: "Enquête d'engagement des employés",
    subtitle: "Vos commentaires nous aident à améliorer notre culture de travail",
    languageLabel: "Langue",
    getStarted: "Commencer",
    privacyNotice: "Avis de confidentialité",
    locationQuestion: "Dans quelle division travaillez-vous?",
    roleQuestion: "Quel est votre niveau de rôle?",
    magnetics: "Magnétiques",
    equipment: "Équipement",
    other: "Autre",
    operationsDistribution: "Opérations et Distribution",
    engineeringServices: "Ingénierie et Services",
    salesFinance: "Ventes et Finance",
    adminManagement: "Administration et Gestion",
    jobSatisfaction: "Je suis satisfait de mon rôle et de mes responsabilités actuels.",
    companySatisfaction: "Je recommanderais cette entreprise comme un bon endroit pour travailler.",
    futureView: "Je me vois travailler ici dans 2 ans.",
    expectations: "Les superviseurs/gestionnaires communiquent clairement les attentes.",
    performanceAwareness: "Le leadership est efficace pour me tenir informé de la performance de l'entreprise.",
    relayingInformation: "Quand je n'ai pas accès au courrier électronique, mon superviseur transmet efficacement les informations importantes.",
    managementFeedback: "Je me sens à l'aise pour soulever des préoccupations ou donner des commentaires à la direction.",
    training: "J'ai reçu suffisamment de formation pour faire mon travail de manière sûre et efficace.",
    opportunities: "J'ai des opportunités de croissance et d'avancement au sein de l'entreprise.",
    cooperation: "Il y a une bonne coopération entre les différentes équipes et départements.",
    morale: "Le moral des employés est positif dans mon lieu de travail.",
    pride: "Je suis fier de travailler pour cette entreprise.",
    safetyFocus: "Mon lieu de travail priorise la sécurité des employés.",
    safetyReporting: "Je me sens à l'aise pour signaler des préoccupations de sécurité.",
    workload: "Ma charge de travail est gérable.",
    workLifeBalance: "Je peux maintenir un équilibre sain entre travail et vie personnelle.",
    tools: "J'ai les outils et l'équipement dont j'ai besoin pour faire mon travail efficacement.",
    processes: "Les processus et procédures de travail sont efficaces et performants.",
    companyValue: "L'entreprise valorise mes contributions.",
    change: "L'entreprise gère efficacement le changement et les transitions.",
    jobSatisfactionFollowUp: "Veuillez expliquer quels facteurs contribuent à votre satisfaction ou insatisfaction au travail:",
    trainingFollowUp: "Veuillez décrire quelle formation ou ressources supplémentaires seraient utiles:",
    workLifeBalanceFollowUp: "Veuillez expliquer ce qui impacte votre équilibre travail-vie personnelle:",
    lowRatingFeedback: "Veuillez expliquer pourquoi vous avez donné cette note et ce qui pourrait être amélioré:",
    stronglyDisagree: "Fortement en désaccord",
    disagree: "En désaccord",
    neutral: "Neutre",
    agree: "D'accord",
    stronglyAgree: "Fortement d'accord",
    communicationPreferences: "Quels styles de communication préférez-vous?",
    informationPreferences: "Quelles informations aimeriez-vous recevoir davantage de l'entreprise?",
    motivationFactors: "Cochez tout ce qui suit qui vous motive à rester dans l'entreprise.",
    companywideEmails: "Courriels à l'échelle de l'entreprise",
    quarterlyTownHalls: "Assemblées publiques trimestrielles",
    companyIntranet: "Intranet de l'entreprise",
    digitalSignage: "Signalisation numérique",
    printedSignage: "Signalisation imprimée",
    teamMeetings: "Réunions d'équipe",
    communicationTransparency: "Communication et transparence",
    strategicDirection: "Direction stratégique",
    financialIncentives: "Incitatifs financiers",
    performanceMetrics: "Métriques de performance",
    compensation: "Rémunération",
    benefitsPackage: "Ensemble des avantages",
    jobSatisfactionOption: "Satisfaction au travail",
    thePeople: "Les collègues / Les gens",
    growthOpportunities: "Opportunités de croissance",
    companyFuture: "Avenir de l'entreprise",
    recognition: "Reconnaissance",
    otherOption: "Autre",
    // Section headers
    demographics: "Démographie",
    engagementJobSatisfaction: "Engagement et satisfaction au travail",
    leadershipCommunication: "Leadership et communication",
    trainingDevelopment: "Formation et développement",
    teamworkCulture: "Travail d'équipe et culture",
    safetyWorkEnvironment: "Sécurité et environnement de travail",
    schedulingWorkload: "Planification et charge de travail",
    toolsEquipmentProcesses: "Outils, équipement et processus",
    // Demographic questions
    continentQuestion: "Quel est votre lieu de travail principal par continent?",
    divisionQuestion: "Dans quelle division de Bunting travaillez-vous?",
    roleQuestionFull: "Quelle option décrit le mieux votre rôle?",
    // Demographic options
    northAmerica: "Amérique du Nord",
    europe: "Europe",
    both: "Les deux",
    salesMarketing: "Ventes/Marketing/Produit",
    operations: "Opérations/Ingénierie/Production",
    adminHR: "Administration/RH/Finance"
  },
  it: {
    title: "Sondaggio sul coinvolgimento dei dipendenti",
    subtitle: "Il tuo feedback ci aiuta a migliorare la nostra cultura aziendale",
    languageLabel: "Lingua",
    getStarted: "Inizia",
    privacyNotice: "Informativa sulla privacy",
    locationQuestion: "In quale divisione lavori?",
    roleQuestion: "Qual è il tuo livello di ruolo?",
    magnetics: "Magnetici",
    equipment: "Attrezzatura",
    other: "Altro",
    operationsDistribution: "Operazioni e Distribuzione",
    engineeringServices: "Ingegneria e Servizi",
    salesFinance: "Vendite e Finanza",
    adminManagement: "Amministrazione e Gestione",
    jobSatisfaction: "Sono soddisfatto del mio ruolo e delle mie responsabilità attuali.",
    companySatisfaction: "Consiglierei questa azienda come un buon posto di lavoro.",
    futureView: "Mi vedo lavorare qui tra 2 anni.",
    expectations: "I supervisori/manager comunicano chiaramente le aspettative.",
    performanceAwareness: "La leadership è efficace nel tenermi informato sulle prestazioni aziendali.",
    relayingInformation: "Quando non ho accesso alla posta elettronica, il mio supervisore trasmette efficacemente le informazioni importanti.",
    managementFeedback: "Mi sento a mio agio nel sollevare preoccupazioni o dare feedback alla direzione.",
    training: "Ho ricevuto una formazione sufficiente per svolgere il mio lavoro in modo sicuro ed efficace.",
    opportunities: "Ho opportunità di crescita e avanzamento all'interno dell'azienda.",
    cooperation: "C'è buona cooperazione tra i diversi team e dipartimenti.",
    morale: "Il morale dei dipendenti è positivo nel mio posto di lavoro.",
    pride: "Sono orgoglioso di lavorare per questa azienda.",
    safetyFocus: "Il mio posto di lavoro dà priorità alla sicurezza dei dipendenti.",
    safetyReporting: "Mi sento a mio agio nel segnalare problemi di sicurezza.",
    workload: "Il mio carico di lavoro è gestibile.",
    workLifeBalance: "Posso mantenere un sano equilibrio tra lavoro e vita privata.",
    tools: "Ho gli strumenti e le attrezzature di cui ho bisogno per svolgere il mio lavoro in modo efficace.",
    processes: "I processi e le procedure di lavoro sono efficienti ed efficaci.",
    companyValue: "L'azienda valorizza i miei contributi.",
    change: "L'azienda gestisce efficacemente i cambiamenti e le transizioni.",
    jobSatisfactionFollowUp: "Si prega di spiegare quali fattori contribuiscono alla vostra soddisfazione o insoddisfazione lavorativa:",
    trainingFollowUp: "Si prega di descrivere quale formazione o risorse aggiuntive sarebbero utili:",
    workLifeBalanceFollowUp: "Si prega di spiegare cosa influenza il vostro equilibrio tra lavoro e vita privata:",
    lowRatingFeedback: "Per favore, spiega perché hai dato questo punteggio e cosa potrebbe essere migliorato:",
    stronglyDisagree: "Fortemente in disaccordo",
    disagree: "In disaccordo",
    neutral: "Neutrale",
    agree: "D'accordo",
    stronglyAgree: "Fortemente d'accordo",
    communicationPreferences: "Quali stili di comunicazione preferisci?",
    informationPreferences: "Quali informazioni vorresti ricevere maggiormente dall'azienda?",
    motivationFactors: "Seleziona uno o più dei seguenti motivi che ti incoraggiano a rimanere in azienda.",
    companywideEmails: "Email aziendali",
    quarterlyTownHalls: "Riunioni aziendali trimestrali",
    companyIntranet: "Intranet aziendale",
    digitalSignage: "Segnaletica digitale",
    printedSignage: "Segnaletica stampata",
    teamMeetings: "Riunioni di team",
    communicationTransparency: "Comunicazione e trasparenza",
    strategicDirection: "Direzione strategica",
    financialIncentives: "Incentivi finanziari",
    performanceMetrics: "Metriche di prestazione",
    compensation: "Retribuzione",
    benefitsPackage: "Pacchetto di benefici",
    jobSatisfactionOption: "Soddisfazione lavorativa",
    thePeople: "Le persone",
    growthOpportunities: "Opportunità di crescita",
    companyFuture: "Futuro dell'azienda",
    recognition: "Riconoscimento",
    otherOption: "Altro",
    // Section headers
    demographics: "Dati demografici",
    engagementJobSatisfaction: "Coinvolgimento e soddisfazione lavorativa",
    leadershipCommunication: "Leadership e comunicazione",
    trainingDevelopment: "Formazione e sviluppo",
    teamworkCulture: "Lavoro di squadra e cultura",
    safetyWorkEnvironment: "Sicurezza e ambiente di lavoro",
    schedulingWorkload: "Programmazione e carico di lavoro",
    toolsEquipmentProcesses: "Strumenti, attrezzature e processi",
    // Demographic questions
    continentQuestion: "Qual è la tua sede di lavoro principale per continente?",
    divisionQuestion: "In quale divisione di Bunting lavori?",
    roleQuestionFull: "Quale opzione descrive meglio il tuo ruolo?",
    // Demographic options
    northAmerica: "Nord America",
    europe: "Europa",
    both: "Entrambi",
    salesMarketing: "Vendite/Marketing/Prodotto",
    operations: "Operazioni/Ingegneria/Produzione",
    adminHR: "Amministrazione/HR/Finanza"
  }
};
interface RatingQuestion {
  id: string;
  text: string;
  section: string;
  feedbackPrompt: string;
  answerSet?: any;
  display_order: number;
  allow_na?: boolean;
}
interface DemographicQuestion {
  id: string;
  text: string;
  options: {
    value: string;
    label: string;
  }[];
  section: string;
  display_order: number;
}

// These functions now use database questions with answer sets
const getMultiSelectQuestions = (dbQuestions: any[] | undefined, language: string) => {
  if (!dbQuestions) return [];
  return dbQuestions.filter(q => q.question_type === 'multiselect').map(q => {
    // Use answer_set options if available, otherwise fall back to inline options
    const options = q.answer_set?.answer_options ? q.answer_set.answer_options.map((opt: any) => ({
      value: opt.option_key,
      label: opt.labels[language] || opt.labels.en
    })) : (q.options || []).map((opt: any) => ({
      value: opt.value,
      label: opt.labels[language] || opt.labels.en
    }));
    return {
      id: q.question_id,
      text: q.labels[language] || q.labels.en,
      section: q.section || "Other",
      options,
      display_order: q.display_order || 0
    };
  });
};
interface MultiSelectQuestion {
  id: string;
  text: string;
  section: string;
  options: {
    value: string;
    label: string;
  }[];
  display_order: number;
}
interface TextQuestion {
  id: string;
  text: string;
  section: string;
  display_order: number;
  is_required: boolean;
}
const getRatingQuestions = (dbQuestions: any[] | undefined, language: string): RatingQuestion[] => {
  if (!dbQuestions) return [];
  return dbQuestions.filter(q => q.question_type === 'rating').map(q => ({
    id: q.question_id,
    text: q.labels[language] || q.labels.en,
    section: q.section || "Other",
    feedbackPrompt: q.follow_up_rules?.prompts?.[language] || q.follow_up_rules?.prompts?.en || "",
    answerSet: q.answer_set,
    display_order: q.display_order || 0,
    allow_na: q.allow_na ?? false
  }));
};
const getDemographicQuestions = (dbQuestions: any[] | undefined, language: string): DemographicQuestion[] => {
  if (!dbQuestions) return [];
  return dbQuestions.filter(q => q.question_type === 'demographic').map(q => {
    // Use answer_set options if available, otherwise fall back to inline options
    const options = q.answer_set?.answer_options ? q.answer_set.answer_options.map((opt: any) => ({
      value: opt.option_key,
      label: opt.labels[language] || opt.labels.en
    })) : (q.options || []).map((opt: any) => ({
      value: opt.value,
      label: opt.labels[language] || opt.labels.en
    }));
    return {
      id: q.question_id,
      text: q.labels[language] || q.labels.en,
      options,
      section: q.section || "Demographics",
      display_order: q.display_order || 0
    };
  });
};
const getTextQuestions = (dbQuestions: any[] | undefined, language: string): TextQuestion[] => {
  if (!dbQuestions) return [];
  return dbQuestions.filter(q => q.question_type === 'text').map(q => ({
    id: q.question_id,
    text: q.labels[language] || q.labels.en,
    section: q.section || "Feedback",
    display_order: q.display_order || 0,
    is_required: q.is_required || false
  }));
};

// Emojis for 1-5 scale (matching document requirements)
const ratingEmojis = {
  1: "😞",
  2: "😕",
  3: "😐",
  4: "😊",
  5: "😍"
};
const getRatingLabels = (language: string, answerSet?: any) => {
  // Always use answer set from database
  if (answerSet?.answer_options) {
    const labels: Record<number, string> = {};
    answerSet.answer_options.forEach((opt: any) => {
      const numericValue = opt.metadata?.numeric_value || parseInt(opt.option_key);
      if (!isNaN(numericValue)) {
        labels[numericValue] = opt.labels[language] || opt.labels.en;
      }
    });
    return labels;
  }

  // No fallback - return empty object if no answer set
  console.warn('No answer set found for rating question');
  return {};
};
type SurveySection = "landing" | "survey" | "complete";
export function EmployeeSurvey({
  onViewResults
}: {
  onViewResults?: () => void;
}) {
  const [currentSection, setCurrentSection] = useState<SurveySection>("landing");
  const [responses, setResponses] = useState<Record<string, string>>({});
  const [ratingResponses, setRatingResponses] = useState<Record<string, number>>({});
  const [feedbackResponses, setFeedbackResponses] = useState<Record<string, string>>({});
  const [multiSelectResponses, setMultiSelectResponses] = useState<Record<string, string[]>>({});
  const [naResponses, setNaResponses] = useState<Record<string, boolean>>({});
  const [textResponses, setTextResponses] = useState<Record<string, string>>({});
  const [collaborationFeedback, setCollaborationFeedback] = useState("");
  const [additionalComments, setAdditionalComments] = useState("");
  const [isComplete, setIsComplete] = useState(false);
  const [submissionCount, setSubmissionCount] = useState(0);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [language, setLanguage] = useState<'en' | 'es' | 'fr' | 'it'>('en');
  const [startTime, setStartTime] = useState<number | null>(null);
  const [elapsedTime, setElapsedTime] = useState(0);
  const [showQRCode, setShowQRCode] = useState(false);
  const [sessionId] = useState(() => `session-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`);
  const [redirectCountdown, setRedirectCountdown] = useState<number | null>(null);

  // GDPR Consent state
  const [showConsentDialog, setShowConsentDialog] = useState(false);
  const [consentGiven, setConsentGiven] = useState(false);
  const [showPrivacyPolicy, setShowPrivacyPolicy] = useState(false);
  const [showDataRights, setShowDataRights] = useState(false);

  // Auto-save state
  const [autoSaveStatus, setAutoSaveStatus] = useState<'idle' | 'saving' | 'saved' | 'error'>('idle');
  const [draftId, setDraftId] = useState<string | null>(null);
  const autoSaveTimeoutRef = useRef<NodeJS.Timeout | null>(null);
  const lastSavedDataRef = useRef<string>('');
  const {
    toast
  } = useToast();

  // Load questions from database
  const {
    data: allQuestions,
    isLoading: questionsLoading
  } = useSurveyQuestions();
  useEffect(() => {
    const count = parseInt(localStorage.getItem("survey-submissions") || "0");
    setSubmissionCount(count);
  }, []);

  // Auto-save function with debounce
  const autoSaveSurvey = useCallback(async () => {
    // Only auto-save if survey is in progress
    if (currentSection !== 'survey') return;

    // Create current data snapshot
    const currentData = JSON.stringify({
      responses,
      ratingResponses,
      feedbackResponses,
      multiSelectResponses,
      naResponses,
      collaborationFeedback,
      additionalComments,
      elapsedTime
    });

    // Skip if data hasn't changed since last save
    if (currentData === lastSavedDataRef.current) {
      return;
    }
    setAutoSaveStatus('saving');
    try {
      const surveyData = {
        continent: mapDemographicValues(responses.continent, 'continent') || null,
        division: mapDemographicValues(responses.division, 'division') || null,
        role: mapDemographicValues(responses.role, 'role') || null,
        session_id: sessionId,
        completion_time_seconds: elapsedTime,
        is_draft: true,
        last_autosave_at: new Date().toISOString(),
        // Engagement & Job Satisfaction
        job_satisfaction: ratingResponses["job-satisfaction"] || null,
        recommend_company: ratingResponses["company-satisfaction"] || null,
        strategic_confidence: ratingResponses["future-view"] || null,
        // Leadership & Communication
        leadership_openness: ratingResponses["expectations"] || null,
        performance_awareness: ratingResponses["performance-awareness"] || null,
        communication_clarity: ratingResponses["relaying-information"] || null,
        manager_alignment: ratingResponses["management-feedback"] || null,
        // Training & Development
        training_satisfaction: ratingResponses["training"] || null,
        advancement_opportunities: ratingResponses["opportunities"] || null,
        // Teamwork & Culture
        cross_functional_collaboration: ratingResponses["cooperation"] || null,
        team_morale: ratingResponses["morale"] || null,
        pride_in_work: ratingResponses["pride"] || null,
        // Safety & Work Environment
        workplace_safety: ratingResponses["safety-focus"] || null,
        safety_reporting_comfort: ratingResponses["safety-reporting"] || null,
        // Scheduling & Workload
        workload_manageability: ratingResponses["workload"] || null,
        work_life_balance: ratingResponses["work-life-balance"] || null,
        // Tools, Equipment & Processes
        tools_equipment_quality: ratingResponses["tools"] || null,
        manual_processes_focus: ratingResponses["processes"] || null,
        company_value_alignment: ratingResponses["company-value"] || null,
        comfortable_suggesting_improvements: ratingResponses["change"] || null,
        // Multi-select arrays
        communication_preferences: multiSelectResponses["communication-preferences"] || [],
        information_preferences: multiSelectResponses["information-preferences"] || [],
        motivation_factors: multiSelectResponses["motivation-factors"] || [],
        // Text feedback
        collaboration_feedback: collaborationFeedback || "",
        additional_comments: additionalComments || "",
        // Store ALL feedback responses in JSONB (including low-rating feedback)
        follow_up_responses: {
          ...feedbackResponses,
          language: language,
          na_responses: naResponses
        },
        // GDPR consent fields
        consent_given: consentGiven,
        consent_timestamp: consentGiven ? new Date().toISOString() : null
      };
      const {
        data,
        error
      } = await supabase.from("employee_survey_responses").upsert(surveyData, {
        onConflict: 'session_id'
      }).select('id').single();
      if (error) throw error;
      if (data?.id) {
        setDraftId(data.id);
        lastSavedDataRef.current = currentData;
        setAutoSaveStatus('saved');

        // Reset to idle after 2 seconds
        setTimeout(() => setAutoSaveStatus('idle'), 2000);
      }
    } catch (error) {
      console.error("Auto-save error:", error);
      setAutoSaveStatus('error');
      // Reset to idle after showing error
      setTimeout(() => setAutoSaveStatus('idle'), 3000);
    }
  }, [currentSection, responses, ratingResponses, feedbackResponses, multiSelectResponses, collaborationFeedback, additionalComments, sessionId, elapsedTime, language]);

  // Debounced auto-save trigger
  const triggerAutoSave = useCallback(() => {
    // Clear existing timeout
    if (autoSaveTimeoutRef.current) {
      clearTimeout(autoSaveTimeoutRef.current);
    }

    // Set new timeout
    autoSaveTimeoutRef.current = setTimeout(() => {
      autoSaveSurvey();
    }, 1000); // 1 second debounce
  }, [autoSaveSurvey]);

  // Load draft on mount
  useEffect(() => {
    const loadDraft = async () => {
      try {
        const {
          data,
          error
        } = await supabase.from("employee_survey_responses").select('*').eq('session_id', sessionId).eq('is_draft', true).maybeSingle();
        if (error) throw error;
        if (data) {
          // Restore demographic responses
          const restoredResponses: Record<string, string> = {};
          if (data.continent) restoredResponses.continent = data.continent.toLowerCase().replace(' ', '-');
          if (data.division) restoredResponses.division = data.division.toLowerCase();
          if (data.role) restoredResponses.role = data.role.toLowerCase().replace(/\//g, '-').replace(' ', '-');
          setResponses(restoredResponses);

          // Restore rating responses
          const restoredRatings: Record<string, number> = {};
          if (data.job_satisfaction) restoredRatings["job-satisfaction"] = data.job_satisfaction;
          if (data.recommend_company) restoredRatings["company-satisfaction"] = data.recommend_company;
          if (data.strategic_confidence) restoredRatings["future-view"] = data.strategic_confidence;
          if (data.leadership_openness) restoredRatings["expectations"] = data.leadership_openness;
          if (data.performance_awareness) restoredRatings["performance-awareness"] = data.performance_awareness;
          if (data.communication_clarity) restoredRatings["relaying-information"] = data.communication_clarity;
          if (data.manager_alignment) restoredRatings["management-feedback"] = data.manager_alignment;
          if (data.training_satisfaction) restoredRatings["training"] = data.training_satisfaction;
          if (data.advancement_opportunities) restoredRatings["opportunities"] = data.advancement_opportunities;
          if (data.cross_functional_collaboration) restoredRatings["cooperation"] = data.cross_functional_collaboration;
          if (data.team_morale) restoredRatings["morale"] = data.team_morale;
          if (data.pride_in_work) restoredRatings["pride"] = data.pride_in_work;
          if (data.workplace_safety) restoredRatings["safety-focus"] = data.workplace_safety;
          if (data.safety_reporting_comfort) restoredRatings["safety-reporting"] = data.safety_reporting_comfort;
          if (data.workload_manageability) restoredRatings["workload"] = data.workload_manageability;
          if (data.work_life_balance) restoredRatings["work-life-balance"] = data.work_life_balance;
          if (data.tools_equipment_quality) restoredRatings["tools"] = data.tools_equipment_quality;
          if (data.manual_processes_focus) restoredRatings["processes"] = data.manual_processes_focus;
          if (data.company_value_alignment) restoredRatings["company-value"] = data.company_value_alignment;
          if (data.comfortable_suggesting_improvements) restoredRatings["change"] = data.comfortable_suggesting_improvements;
          setRatingResponses(restoredRatings);

          // Restore ALL feedback responses (including low-rating feedback)
          const restoredFeedback: Record<string, string> = {};
          if (data.follow_up_responses) {
            const followUp = data.follow_up_responses as any;
            // Restore all feedback except the 'language' property
            Object.keys(followUp).forEach(key => {
              if (key !== 'language' && followUp[key]) {
                restoredFeedback[key] = followUp[key];
              }
            });
          }
          setFeedbackResponses(restoredFeedback);

          // Restore multi-select responses
          const restoredMultiSelect: Record<string, string[]> = {};
          if (data.communication_preferences?.length) restoredMultiSelect["communication-preferences"] = data.communication_preferences;
          if (data.information_preferences?.length) restoredMultiSelect["information-preferences"] = data.information_preferences;
          if (data.motivation_factors?.length) restoredMultiSelect["motivation-factors"] = data.motivation_factors;
          setMultiSelectResponses(restoredMultiSelect);

          // Restore text fields
          if (data.collaboration_feedback) setCollaborationFeedback(data.collaboration_feedback);
          if (data.additional_comments) setAdditionalComments(data.additional_comments);
          setDraftId(data.id);
          setElapsedTime(data.completion_time_seconds || 0);
          toast({
            title: "Draft restored",
            description: "Continuing your previous survey session."
          });
        }
      } catch (error) {
        console.error("Error loading draft:", error);
      }
    };
    if (currentSection === 'survey') {
      loadDraft();
    }
  }, [sessionId, currentSection, toast]);

  // Trigger auto-save when responses change
  useEffect(() => {
    if (currentSection === 'survey' && startTime) {
      triggerAutoSave();
    }
  }, [responses, ratingResponses, feedbackResponses, multiSelectResponses, collaborationFeedback, additionalComments, currentSection, startTime, triggerAutoSave]);

  // Timer effect
  useEffect(() => {
    let interval: NodeJS.Timeout;
    if (startTime && !isComplete) {
      interval = setInterval(() => {
        setElapsedTime(Math.floor((Date.now() - startTime) / 1000));
      }, 1000);
    }
    return () => clearInterval(interval);
  }, [startTime, isComplete]);
  const startSurvey = async () => {
    // Check if cookie consent has been given
    const cookieConsent = localStorage.getItem("cookie-consent");
    if (cookieConsent !== "accepted") {
      toast({
        title: "Cookie Consent Required",
        description: "Please accept cookies to proceed with the survey",
        variant: "destructive"
      });
      return;
    }

    // Auto-consent and proceed directly to survey
    setConsentGiven(true);

    // Record consent in database
    try {
      await supabase.from("survey_consent_log").insert({
        session_id: sessionId,
        consent_given: true,
        consent_timestamp: new Date().toISOString(),
        user_agent: navigator.userAgent,
        consent_version: "1.0"
      });
    } catch (error) {
      console.error("Error recording consent:", error);
    }

    // Start the survey
    setStartTime(Date.now());
    setCurrentSection("survey");
    toast({
      title: "Welcome",
      description: "Let's begin the survey."
    });
  };
  const handleConsentGiven = async () => {
    setConsentGiven(true);
    setShowConsentDialog(false);

    // Record consent in database
    try {
      await supabase.from("survey_consent_log").insert({
        session_id: sessionId,
        consent_given: true,
        consent_timestamp: new Date().toISOString(),
        user_agent: navigator.userAgent,
        consent_version: "1.0"
      });
    } catch (error) {
      console.error("Error recording consent:", error);
    }

    // Start the survey
    setStartTime(Date.now());
    setCurrentSection("survey");
    toast({
      title: "Thank you",
      description: "Your consent has been recorded. Let's begin the survey."
    });
  };
  const handleConsentDeclined = () => {
    setShowConsentDialog(false);
    toast({
      title: "Survey Cancelled",
      description: "You chose not to participate. No data has been collected."
    });
  };
  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };
  const downloadQRCode = () => {
    const svg = document.getElementById('survey-qr-code');
    if (!svg) return;
    const svgData = new XMLSerializer().serializeToString(svg);
    const canvas = document.createElement('canvas');
    const ctx = canvas.getContext('2d');
    const img = new Image();
    img.onload = () => {
      canvas.width = img.width;
      canvas.height = img.height;
      ctx?.drawImage(img, 0, 0);
      const pngFile = canvas.toDataURL('image/png');
      const downloadLink = document.createElement('a');
      downloadLink.download = 'survey-qr-code.png';
      downloadLink.href = pngFile;
      downloadLink.click();
    };
    img.src = 'data:image/svg+xml;base64,' + btoa(svgData);
  };

  // Reset function for testing purposes
  const resetSurveyData = () => {
    localStorage.removeItem("survey-submissions");
    localStorage.removeItem("survey-data");
    setSubmissionCount(0);
    setIsComplete(false);
    setCurrentSection("landing");
    setResponses({});
    setRatingResponses({});
    setFeedbackResponses({});
    setMultiSelectResponses({});
    setNaResponses({});
    setStartTime(null);
    setElapsedTime(0);
    setAdditionalComments("");
    toast({
      title: "Survey data reset",
      description: "You can now take the survey again for testing."
    });
  };

  // Add reset function to window for testing
  useEffect(() => {
    (window as any).resetSurvey = resetSurveyData;
    return () => {
      delete (window as any).resetSurvey;
    };
  }, []);

  // Auto-redirect countdown effect
  useEffect(() => {
    if (isComplete) {
      setRedirectCountdown(5);
      const interval = setInterval(() => {
        setRedirectCountdown(prev => {
          if (prev === null || prev <= 1) {
            clearInterval(interval);
            // Redirect to external URL
            window.location.href = 'https://survey.buntinggpt.com';
            return null;
          }
          return prev - 1;
        });
      }, 1000);
      return () => clearInterval(interval);
    }
  }, [isComplete]);

  const handleReturnNow = () => {
    // Redirect to external URL immediately
    window.location.href = 'https://survey.buntinggpt.com';
  };

  const getTotalQuestions = () => {
    const textQuestions = getTextQuestions(allQuestions, language);
    const requiredTextQuestions = textQuestions.filter(q => q.is_required).length;
    return getDemographicQuestions(allQuestions, language).length + getRatingQuestions(allQuestions, language).length + getMultiSelectQuestions(allQuestions, language).length + requiredTextQuestions;
  };
  const progress = (Object.keys(responses).length + Object.keys(ratingResponses).length + Object.keys(multiSelectResponses).length + Object.keys(textResponses).filter(key => {
    const question = getTextQuestions(allQuestions, language).find(q => q.id === key);
    return question?.is_required;
  }).length) / getTotalQuestions() * 100;
  const handleDemographicResponse = (questionId: string, value: string) => {
    setResponses(prev => ({
      ...prev,
      [questionId]: value
    }));
  };
  const handleRatingResponse = (questionId: string, rating: number) => {
    setRatingResponses(prev => ({
      ...prev,
      [questionId]: rating
    }));
  };
  const handleFeedbackResponse = (questionId: string, feedback: string) => {
    setFeedbackResponses(prev => ({
      ...prev,
      [questionId]: feedback
    }));
  };
  const handleMultiSelectResponse = (questionId: string, selectedOptions: string[]) => {
    setMultiSelectResponses(prev => ({
      ...prev,
      [questionId]: selectedOptions
    }));
  };
  const handleNaResponse = (questionId: string, isNa: boolean) => {
    setNaResponses(prev => ({
      ...prev,
      [questionId]: isNa
    }));
    // Clear rating and feedback when N/A is selected
    if (isNa) {
      setRatingResponses(prev => {
        const updated = {
          ...prev
        };
        delete updated[questionId];
        return updated;
      });
      setFeedbackResponses(prev => {
        const updated = {
          ...prev
        };
        delete updated[questionId];
        return updated;
      });
    }
  };
  const isAllQuestionsAnswered = () => {
    // Get all questions
    const demographicQuestions = getDemographicQuestions(allQuestions, language);
    const ratingQuestions = getRatingQuestions(allQuestions, language);
    const multiSelectQuestions = getMultiSelectQuestions(allQuestions, language);
    const textQuestions = getTextQuestions(allQuestions, language);

    // Check demographics - all required
    const unansweredDemographics = demographicQuestions.filter(q => {
      const answer = responses[q.id];
      return !answer || answer.trim() === '';
    });
    const allDemographicsAnswered = unansweredDemographics.length === 0;

    // Check ratings - all required (unless marked N/A)
    const unansweredRatings = ratingQuestions.filter(q => {
      const isNa = naResponses[q.id];
      if (isNa) return false; // N/A questions don't need answers
      const rating = ratingResponses[q.id];
      return rating === undefined || rating === null || rating < 1 || rating > 5;
    });
    const allRatingsAnswered = unansweredRatings.length === 0;

    // Check low rating feedback - required for ratings 1 or 2 (not for N/A)
    const lowRatingsWithoutFeedback = ratingQuestions.filter(q => !naResponses[q.id] && ratingResponses[q.id] !== undefined && ratingResponses[q.id] <= 2).filter(q => {
      const feedback = feedbackResponses[q.id];
      return !feedback || feedback.trim() === '';
    });
    const allLowRatingsFeedbackProvided = lowRatingsWithoutFeedback.length === 0;

    // Check multiselect - at least one option selected for each
    const unansweredMultiSelect = multiSelectQuestions.filter(q => {
      const selected = multiSelectResponses[q.id];
      return !selected || !Array.isArray(selected) || selected.length === 0;
    });
    const allMultiSelectAnswered = unansweredMultiSelect.length === 0;

    // Check text questions - only required ones need answers
    const unansweredTextQuestions = textQuestions.filter(q => {
      if (!q.is_required) return false;
      const answer = textResponses[q.id];
      return !answer || answer.trim() === '';
    });
    const allTextQuestionsAnswered = unansweredTextQuestions.length === 0;

    // Debug logging
    console.log('Survey Completion Check:', {
      allDemographicsAnswered,
      unansweredDemographics: unansweredDemographics.map(q => q.id),
      allRatingsAnswered,
      unansweredRatings: unansweredRatings.map(q => q.id),
      allLowRatingsFeedbackProvided,
      lowRatingsWithoutFeedback: lowRatingsWithoutFeedback.map(q => q.id),
      allMultiSelectAnswered,
      unansweredMultiSelect: unansweredMultiSelect.map(q => q.id),
      allTextQuestionsAnswered,
      unansweredTextQuestions: unansweredTextQuestions.map(q => q.id)
    });
    return allDemographicsAnswered && allRatingsAnswered && allLowRatingsFeedbackProvided && allMultiSelectAnswered && allTextQuestionsAnswered;
  };

  // Helper function to map frontend values to database-expected values
  const mapDemographicValues = (value: string, field: 'continent' | 'division' | 'role'): string => {
    const mappings = {
      continent: {
        'north-america': 'North America',
        'europe': 'Europe'
      },
      division: {
        'equipment': 'Equipment',
        'magnetics': 'Magnets',
        // Note: database expects "Magnets" not "Magnetics"
        'both': 'Both'
      },
      role: {
        'sales-marketing': 'Sales/Marketing/Product',
        'operations': 'Operations/Engineering/Production',
        'admin': 'Admin/HR/Finance'
      }
    };
    return mappings[field][value as keyof typeof mappings[typeof field]] || value;
  };
  const handleSubmit = async () => {
    if (!isAllQuestionsAnswered()) {
      // Provide specific feedback about what's missing
      const demographicQuestions = getDemographicQuestions(allQuestions, language);
      const ratingQuestions = getRatingQuestions(allQuestions, language);
      const multiSelectQuestions = getMultiSelectQuestions(allQuestions, language);
      const missingDemographics = demographicQuestions.filter(q => !responses[q.id]?.trim());
      const missingRatings = ratingQuestions.filter(q => !naResponses[q.id] && ratingResponses[q.id] === undefined);
      const missingMultiSelect = multiSelectQuestions.filter(q => !multiSelectResponses[q.id]?.length);
      const missingFeedback = ratingQuestions.filter(q => !naResponses[q.id] && ratingResponses[q.id] <= 2 && !feedbackResponses[q.id]?.trim());
      let errorMessage = "Please complete all required fields:\n";
      if (missingDemographics.length > 0) {
        errorMessage += `\n• ${missingDemographics.length} demographic question(s)`;
      }
      if (missingRatings.length > 0) {
        errorMessage += `\n• ${missingRatings.length} rating question(s):`;
        missingRatings.forEach(q => {
          errorMessage += `\n  - ${q.text.substring(0, 60)}...`;
        });
      }
      if (missingMultiSelect.length > 0) {
        errorMessage += `\n• ${missingMultiSelect.length} multi-select question(s)`;
      }
      if (missingFeedback.length > 0) {
        errorMessage += `\n• ${missingFeedback.length} low rating(s) need explanation`;
      }
      toast({
        title: "Survey Incomplete",
        description: errorMessage,
        variant: "destructive",
        duration: 10000
      });

      // Scroll to first missing question
      const firstMissing = missingDemographics[0] || missingRatings[0] || missingMultiSelect[0];
      if (firstMissing) {
        setTimeout(() => {
          const element = document.querySelector(`[data-question-id="${firstMissing.id}"]`);
          element?.scrollIntoView({
            behavior: 'smooth',
            block: 'center'
          });
        }, 300);
      }
      return;
    }
    setIsSubmitting(true);
    try {
      // Map survey responses to database schema with proper value mapping
      const surveyData = {
        continent: mapDemographicValues(responses.continent, 'continent'),
        division: mapDemographicValues(responses.division, 'division'),
        role: mapDemographicValues(responses.role, 'role'),
        session_id: sessionId,
        completion_time_seconds: elapsedTime,
        is_draft: false,
        // Mark as complete
        submitted_at: new Date().toISOString(),
        // Engagement & Job Satisfaction
        job_satisfaction: ratingResponses["job-satisfaction"],
        recommend_company: ratingResponses["company-satisfaction"],
        strategic_confidence: ratingResponses["future-view"],
        // Leadership & Communication
        leadership_openness: ratingResponses["expectations"],
        performance_awareness: ratingResponses["performance-awareness"],
        communication_clarity: ratingResponses["relaying-information"],
        manager_alignment: ratingResponses["management-feedback"],
        // Training & Development
        training_satisfaction: ratingResponses["training"],
        advancement_opportunities: ratingResponses["opportunities"],
        // Teamwork & Culture
        cross_functional_collaboration: ratingResponses["cooperation"],
        team_morale: ratingResponses["morale"],
        pride_in_work: ratingResponses["pride"],
        // Safety & Work Environment
        workplace_safety: ratingResponses["safety-focus"],
        safety_reporting_comfort: ratingResponses["safety-reporting"],
        // Scheduling & Workload
        workload_manageability: ratingResponses["workload"],
        work_life_balance: ratingResponses["work-life-balance"],
        // Tools, Equipment & Processes
        tools_equipment_quality: ratingResponses["tools"],
        manual_processes_focus: ratingResponses["processes"],
        company_value_alignment: ratingResponses["company-value"],
        comfortable_suggesting_improvements: ratingResponses["change"],
        // Multi-select arrays
        communication_preferences: multiSelectResponses["communication-preferences"] || [],
        information_preferences: multiSelectResponses["information-preferences"] || [],
        motivation_factors: multiSelectResponses["motivation-factors"] || [],
        // Text feedback
        collaboration_feedback: collaborationFeedback || "",
        additional_comments: additionalComments || "",
        // Store ALL feedback responses in JSONB (including low-rating feedback)
        follow_up_responses: {
          ...feedbackResponses,
          language: language,
          na_responses: naResponses
        },
        // GDPR consent fields
        consent_given: consentGiven,
        consent_timestamp: consentGiven ? new Date().toISOString() : null
      };

      // Check if there's an existing draft for this session
      const { data: existingDraft } = await supabase
        .from("employee_survey_responses")
        .select('id')
        .eq('session_id', sessionId)
        .maybeSingle();

      let insertedResponse;
      if (existingDraft) {
        // Update existing draft
        const { data, error } = await supabase
          .from("employee_survey_responses")
          .update(surveyData)
          .eq('id', existingDraft.id)
          .select('id')
          .single();
        if (error) throw error;
        insertedResponse = data;
      } else {
        // Insert new response
        const { data, error } = await supabase
          .from("employee_survey_responses")
          .insert(surveyData)
          .select('id')
          .single();
        if (error) throw error;
        insertedResponse = data;
      }

      // Track individual question responses for analytics
      if (insertedResponse?.id && allQuestions) {
        const questionResponses = [];

        // Create a lookup map for display_order from raw database questions
        const displayOrderMap = new Map(allQuestions.map(q => [q.question_id, q.display_order]));

        // Track demographic questions
        const demographicQuestions = getDemographicQuestions(allQuestions, language);
        for (const question of demographicQuestions) {
          if (responses[question.id]) {
            questionResponses.push({
              response_id: insertedResponse.id,
              question_id: question.id,
              question_type: 'demographic',
              answer_value: {
                value: responses[question.id]
              },
              display_order: displayOrderMap.get(question.id)
            });
          }
        }

        // Track rating questions
        const ratingQuestions = getRatingQuestions(allQuestions, language);
        for (const question of ratingQuestions) {
          if (ratingResponses[question.id]) {
            questionResponses.push({
              response_id: insertedResponse.id,
              question_id: question.id,
              question_type: 'rating',
              answer_value: {
                rating: ratingResponses[question.id],
                feedback: feedbackResponses[question.id] || null
              },
              display_order: displayOrderMap.get(question.id)
            });
          }
        }

        // Track multi-select questions
        const multiSelectQuestions = getMultiSelectQuestions(allQuestions, language);
        for (const question of multiSelectQuestions) {
          if (multiSelectResponses[question.id]) {
            questionResponses.push({
              response_id: insertedResponse.id,
              question_id: question.id,
              question_type: 'multiselect',
              answer_value: {
                selected: multiSelectResponses[question.id]
              },
              display_order: displayOrderMap.get(question.id)
            });
          }
        }

        // Track text questions
        const textQuestions = getTextQuestions(allQuestions, language);
        for (const question of textQuestions) {
          if (textResponses[question.id]) {
            questionResponses.push({
              response_id: insertedResponse.id,
              question_id: question.id,
              question_type: 'text',
              answer_value: {
                text: textResponses[question.id]
              },
              display_order: displayOrderMap.get(question.id)
            });
          }
        }

        // Insert all question responses
        if (questionResponses.length > 0) {
          const {
            error: detailError
          } = await supabase.from("survey_question_responses").insert(questionResponses);
          if (detailError) {
            console.error("Error saving question responses:", detailError);
            // Don't fail the whole submission if detail tracking fails
          }
        }
      }
      const currentCount = parseInt(localStorage.getItem("survey-submissions") || "0");
      localStorage.setItem("survey-submissions", String(currentCount + 1));
      setSubmissionCount(currentCount + 1);
      setIsComplete(true);
      toast({
        title: "Survey submitted!",
        description: "Thank you for your feedback."
      });
    } catch (error) {
      console.error("Error submitting survey:", error);
      toast({
        title: "Submission failed",
        description: "There was an error submitting your survey. Please try again.",
        variant: "destructive"
      });
    } finally {
      setIsSubmitting(false);
    }
  };
  if (currentSection === "landing") {
    return <div className="min-h-screen bg-background p-4">
        <div className="max-w-4xl mx-auto mt-12">
          <Card className="text-center">
            <CardHeader>
              <CardTitle className="text-3xl mb-4">Employee Survey – Actionable Insights</CardTitle>
              <p className="text-muted-foreground text-lg">
                Your feedback helps us improve. This survey takes approximately 10-15 minutes to complete.
              </p>
            </CardHeader>
            <CardContent className="space-y-6">
              <Button onClick={startSurvey} className="w-full max-w-md mx-auto" size="lg">
                Start Survey
              </Button>
              
              
            </CardContent>
          </Card>
        </div>
      </div>;
  }
  if (isComplete) {
    return <div className="min-h-screen bg-background p-4">
        <div className="max-w-4xl mx-auto mt-12">
          <Card className="text-center">
            <CardHeader>
              <CardTitle className="text-3xl mb-4">Thank You!</CardTitle>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="space-y-2">
                <p className="text-lg font-medium">
                  Your survey has been submitted successfully.
                </p>
                <p className="text-muted-foreground">
                  Time to complete: {formatTime(elapsedTime)}
                </p>
              </div>
              
              {redirectCountdown !== null && (
                <div className="bg-primary/10 border border-primary/20 rounded-lg p-4">
                  <p className="text-sm font-medium">
                    Returning to home page in {redirectCountdown} second{redirectCountdown !== 1 ? 's' : ''}...
                  </p>
                  <Button 
                    variant="outline" 
                    size="sm" 
                    onClick={handleReturnNow}
                    className="mt-2"
                  >
                    Return Now
                  </Button>
                </div>
              )}
              
              <div className="bg-muted/50 p-6 rounded-lg">
                <p className="text-lg">
                  We truly appreciate you taking the time to share your feedback with us.
                </p>
                <p className="text-muted-foreground mt-4">
                  Survey results will be posted within the next 30 days.
                </p>
              </div>
              
              {/* GDPR Data Rights */}
              <div className="bg-primary/10 border border-primary/20 rounded-lg p-4 text-left">
                <div className="flex items-start gap-2 mb-2">
                  <ShieldIcon className="h-5 w-5 text-primary flex-shrink-0 mt-0.5" />
                  <div className="space-y-2">
                    <p className="text-sm font-semibold">Your Data Rights (GDPR)</p>
                    <p className="text-xs text-muted-foreground">
                      Save this Session ID to access, download, or delete your survey response:
                    </p>
                    <div className="bg-background rounded px-3 py-2 font-mono text-xs break-all border">
                      {sessionId}
                    </div>
                    <p className="text-xs text-muted-foreground">
                      Your data will be automatically deleted after 12 months. 
                      You can request deletion anytime using the button below.
                    </p>
                  </div>
                </div>
              </div>
              
              <Button variant="outline" onClick={() => setShowDataRights(true)} className="gap-2">
                <ShieldIcon className="h-4 w-4" />
                Manage My Data (Access, Download, or Delete)
              </Button>
            </CardContent>
          </Card>
        </div>
        
        {/* Data Rights Manager Dialog */}
        <DataRightsManager open={showDataRights} onOpenChange={setShowDataRights} />
      </div>;
  }
  return <div className="min-h-screen bg-background p-4 touch-pan-y">
      {/* GDPR Components */}
      <CookieConsentBanner />
      <GDPRPrivacyPolicy open={showPrivacyPolicy} onOpenChange={setShowPrivacyPolicy} />
      <SurveyConsentDialog open={showConsentDialog} onConsent={handleConsentGiven} onDecline={handleConsentDeclined} onViewPrivacyPolicy={() => setShowPrivacyPolicy(true)} />
      <DataRightsManager open={showDataRights} onOpenChange={setShowDataRights} />
      
      <div className="max-w-4xl mx-auto" style={{
      WebkitTouchCallout: 'none',
      WebkitUserSelect: 'none',
      userSelect: 'none'
    }}>
        {/* Language Selector and Timer */}
        <div className="flex justify-between items-center mb-8">
          <div className="flex items-center gap-2">
            <Globe className="h-4 w-4 text-muted-foreground" />
            <div className="flex gap-1">
              <Button variant={language === 'en' ? 'default' : 'outline'} size="sm" onClick={() => setLanguage('en')}>
                EN
              </Button>
              <Button variant={language === 'es' ? 'default' : 'outline'} size="sm" onClick={() => setLanguage('es')}>
                ES
              </Button>
              <Button variant={language === 'fr' ? 'default' : 'outline'} size="sm" onClick={() => setLanguage('fr')}>
                FR
              </Button>
              <Button variant={language === 'it' ? 'default' : 'outline'} size="sm" onClick={() => setLanguage('it')}>
                IT
              </Button>
            </div>
          </div>
          <div className="flex items-center gap-4">
            {/* Auto-save indicator */}
            {autoSaveStatus !== 'idle' && <Badge variant={autoSaveStatus === 'error' ? 'destructive' : 'outline'} className="text-sm px-3 py-1">
                {autoSaveStatus === 'saving' && <><LoaderIcon className="w-3 h-3 mr-1 animate-spin inline" /> Saving...</>}
                {autoSaveStatus === 'saved' && <><SaveIcon className="w-3 h-3 mr-1 inline" /> Saved</>}
                {autoSaveStatus === 'error' && <><AlertTriangleIcon className="w-3 h-3 mr-1 inline" /> Save failed</>}
              </Badge>}
            <div className="text-sm font-medium">
              Time: {formatTime(elapsedTime)}
            </div>
            <Button variant="destructive" size="sm" onClick={resetSurveyData}>
              Reset
            </Button>
          </div>
        </div>
        
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-center mb-2">Employee Survey – Actionable Insights</h1>
          <p className="text-center text-muted-foreground mb-2">
            Rate each aspect from 1 (Poor) to 5 (Excellent)
          </p>
          <p className="text-center text-sm text-muted-foreground mb-6">
            If you select 1 or 2, a text box will appear asking for details.
          </p>
          <div className="space-y-2">
            <div className="flex justify-between text-sm text-muted-foreground">
              <span>Progress</span>
              <span>{Math.round(progress)}% complete</span>
            </div>
            <Progress value={progress} className="h-2" />
          </div>
        </div>

        {questionsLoading ? <div className="flex items-center justify-center p-12">
            <LoaderIcon className="w-8 h-8 animate-spin" />
          </div> : <OnPageSurvey demographicQuestions={getDemographicQuestions(allQuestions, language)} ratingQuestions={getRatingQuestions(allQuestions, language)} multiSelectQuestions={getMultiSelectQuestions(allQuestions, language)} textQuestions={getTextQuestions(allQuestions, language)} demographicResponses={responses} ratingResponses={ratingResponses} feedbackResponses={feedbackResponses} multiSelectResponses={multiSelectResponses} textResponses={textResponses} naResponses={naResponses} collaborationFeedback={collaborationFeedback} additionalComments={additionalComments} onDemographicChange={handleDemographicResponse} onRatingChange={handleRatingResponse} onFeedbackChange={handleFeedbackResponse} onNaChange={handleNaResponse} onMultiSelectChange={handleMultiSelectResponse} onTextChange={(questionId, value) => setTextResponses(prev => ({
        ...prev,
        [questionId]: value
      }))} onCollaborationFeedbackChange={setCollaborationFeedback} onAdditionalCommentsChange={setAdditionalComments} onSubmit={handleSubmit} canSubmit={isAllQuestionsAnswered()} isSubmitting={isSubmitting} language={language} />}
      </div>
    </div>;
}

// One-Page Survey Component
interface OnPageSurveyProps {
  demographicQuestions: DemographicQuestion[];
  ratingQuestions: RatingQuestion[];
  multiSelectQuestions: MultiSelectQuestion[];
  textQuestions: TextQuestion[];
  demographicResponses: Record<string, string>;
  ratingResponses: Record<string, number>;
  feedbackResponses: Record<string, string>;
  multiSelectResponses: Record<string, string[]>;
  textResponses: Record<string, string>;
  naResponses: Record<string, boolean>;
  collaborationFeedback: string;
  additionalComments: string;
  onDemographicChange: (questionId: string, value: string) => void;
  onRatingChange: (questionId: string, rating: number) => void;
  onFeedbackChange: (questionId: string, feedback: string) => void;
  onNaChange: (questionId: string, isNa: boolean) => void;
  onMultiSelectChange: (questionId: string, selectedOptions: string[]) => void;
  onTextChange: (questionId: string, value: string) => void;
  onCollaborationFeedbackChange: (feedback: string) => void;
  onAdditionalCommentsChange: (comments: string) => void;
  onSubmit: () => void;
  canSubmit: boolean;
  isSubmitting?: boolean;
  language: 'en' | 'es' | 'fr' | 'it';
}
function OnPageSurvey({
  demographicQuestions,
  ratingQuestions,
  multiSelectQuestions,
  textQuestions,
  demographicResponses,
  ratingResponses,
  feedbackResponses,
  multiSelectResponses,
  textResponses,
  naResponses,
  collaborationFeedback,
  additionalComments,
  onDemographicChange,
  onRatingChange,
  onFeedbackChange,
  onNaChange,
  onMultiSelectChange,
  onTextChange,
  onCollaborationFeedbackChange,
  onAdditionalCommentsChange,
  onSubmit,
  canSubmit,
  isSubmitting = false,
  language
}: OnPageSurveyProps) {
  // Debug logging
  console.log('[OnPageSurvey] Text questions:', textQuestions);
  console.log('[OnPageSurvey] Text questions count:', textQuestions.length);
  
  const getSectionTitle = (sectionKey: string): string => {
    const sectionMap: Record<string, keyof typeof languageContent.en> = {
      "Demographics": "demographics",
      "Engagement & Job Satisfaction": "engagementJobSatisfaction",
      "Leadership & Communication": "leadershipCommunication",
      "Training & Development": "trainingDevelopment",
      "Teamwork & Culture": "teamworkCulture",
      "Safety & Work Environment": "safetyWorkEnvironment",
      "Scheduling & Workload": "schedulingWorkload",
      "Tools, Equipment & Processes": "toolsEquipmentProcesses"
    };
    return languageContent[language][sectionMap[sectionKey]] || sectionKey;
  };

  // Group ALL questions by section (including demographics) - Text questions are rendered separately
  const allQuestions = [...demographicQuestions, ...ratingQuestions, ...multiSelectQuestions];
  const groupedQuestions = allQuestions.reduce((acc, question) => {
    const section = question.section || "Demographics";
    if (!acc[section]) {
      acc[section] = [];
    }
    acc[section].push(question);
    return acc;
  }, {} as Record<string, (DemographicQuestion | RatingQuestion | MultiSelectQuestion)[]>);

  // Get all sections dynamically ordered by the display_order of the first question in each section
  const sortedSections = Object.keys(groupedQuestions).sort((a, b) => {
    const firstQuestionA = groupedQuestions[a][0];
    const firstQuestionB = groupedQuestions[b][0];
    return (firstQuestionA.display_order || 0) - (firstQuestionB.display_order || 0);
  });
  return <div className="space-y-8">
      {/* Required Fields Notice */}
      <Card className="bg-muted/50 border-primary/20">
        <CardContent className="pt-6">
          <div className="flex items-start gap-3">
            <div className="text-primary mt-1">
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
            </div>
            <div className="flex-1 space-y-1">
              <p className="text-sm font-medium">Required Fields</p>
              <p className="text-sm text-muted-foreground">
                All questions marked with <span className="text-destructive">*</span> are required. 
                For ratings of 1 or 2, you must provide feedback explaining your response.
              </p>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Dynamically render all sections based on database */}
      {sortedSections.map(section => {
      const sectionQuestions = groupedQuestions[section].sort((a, b) => (a.display_order || 0) - (b.display_order || 0));
      return <Card key={section}>
            <CardHeader>
              <CardTitle>{getSectionTitle(section)}</CardTitle>
            </CardHeader>
            <CardContent className="space-y-6">
              {sectionQuestions.map(question => {
            // Check if it's a demographic question (has 'continent', 'division', 'role' id pattern)
            if ('id' in question && demographicQuestions.some(dq => dq.id === question.id)) {
              return <DemographicQuestion key={question.id} question={question as DemographicQuestion} value={demographicResponses[question.id]} onResponse={value => onDemographicChange(question.id, value)} />;
            }
            // Check if it's a multi-select question
            else if ('options' in question && Array.isArray((question as MultiSelectQuestion).options)) {
              const msQuestion = question as MultiSelectQuestion;
              const isRequired = true; // All multiselect questions are required
              const hasError = isRequired && (!multiSelectResponses[question.id] || multiSelectResponses[question.id].length === 0);
              return <Card key={question.id}>
                      <CardHeader>
                        <CardTitle>
                          {msQuestion.text}
                          {isRequired && <span className="text-destructive ml-1">*</span>}
                        </CardTitle>
                        {hasError && <p className="text-xs text-destructive mt-2">Please select at least one option</p>}
                      </CardHeader>
                      <CardContent className="space-y-2">
                        {msQuestion.options.map(option => <div key={option.value} className="flex items-center space-x-2">
                            <Checkbox id={`${question.id}-${option.value}`} checked={multiSelectResponses[question.id]?.includes(option.value)} onCheckedChange={checked => {
                      const current = multiSelectResponses[question.id] || [];
                      const updated = checked ? [...current, option.value] : current.filter(v => v !== option.value);
                      onMultiSelectChange(question.id, updated);
                    }} />
                            <Label htmlFor={`${question.id}-${option.value}`}>{option.label}</Label>
                          </div>)}
                      </CardContent>
                    </Card>;
            }
            // Rating question
            else {
              const ratingQuestion = question as RatingQuestion;
              return <RatingQuestion key={question.id} question={ratingQuestion} response={ratingResponses[question.id]} feedback={feedbackResponses[question.id]} isNa={naResponses[question.id]} onRatingChange={rating => onRatingChange(question.id, rating)} onFeedbackChange={feedback => onFeedbackChange(question.id, feedback)} onNaChange={isNa => onNaChange(question.id, isNa)} language={language} />;
            }
          })}
            </CardContent>
          </Card>;
    })}

      {/* Text Questions Section */}
      {textQuestions.length > 0 && textQuestions.map(question => <Card key={question.id} data-question-id={question.id}>
          <CardHeader>
            <CardTitle>
              {question.text}
              {question.is_required && <span className="text-destructive ml-1">*</span>}
            </CardTitle>
            {question.is_required && !textResponses[question.id] && <p className="text-xs text-destructive mt-2">⚠️ This question is required</p>}
          </CardHeader>
          <CardContent>
            <Textarea value={textResponses[question.id] || ''} onChange={e => onTextChange(question.id, e.target.value)} placeholder={language === 'en' ? "Share your thoughts..." : language === 'es' ? "Comparte tus pensamientos..." : language === 'fr' ? "Partagez vos réflexions..." : "Condividi i tuoi pensieri..."} rows={5} className="w-full" />
          </CardContent>
        </Card>)}
      
      {/* Debug: Show if no text questions */}
      {textQuestions.length === 0 && (
        <div className="hidden" data-debug="no-text-questions">
          No text questions loaded
        </div>
      )}

      {/* Additional Comments Section */}
      <Card>
        <CardHeader>
          <CardTitle>
            Additional Comments
            <span className="text-muted-foreground text-sm ml-2 font-normal">(Optional)</span>
          </CardTitle>
        </CardHeader>
        <CardContent>
          <Textarea placeholder="Any additional comments or suggestions..." value={additionalComments} onChange={e => onAdditionalCommentsChange(e.target.value)} className="min-h-[120px]" />
        </CardContent>
      </Card>

      {/* Submit Button */}
      <Button onClick={onSubmit} disabled={!canSubmit || isSubmitting} className="w-full" size="lg">
        {isSubmitting ? "Submitting..." : "Submit Survey"}
      </Button>
    </div>;
}

// Demographic Question Component
interface DemographicQuestionProps {
  question: DemographicQuestion;
  value: string;
  onResponse: (value: string) => void;
}
function DemographicQuestion({
  question,
  value,
  onResponse
}: DemographicQuestionProps) {
  const isDivisionQuestion = question.id === "division";
  const isContinentQuestion = question.id === "continent";
  const isRoleQuestion = question.id === "role";
  const isRequired = true; // All demographic questions are required

  return <Card data-question-id={question.id}>
      <CardHeader>
        <CardTitle>
          {question.text}
          {isRequired && <span className="text-destructive ml-1">*</span>}
        </CardTitle>
        {/* Show error if unanswered */}
        {!value && <p className="text-xs text-destructive mt-2">⚠️ This question is required</p>}
      </CardHeader>
      <CardContent className="space-y-4">
        <RadioGroup onValueChange={onResponse} value={value}>
          {question.options.map(option => <div key={option.value} className="flex items-center space-x-4 p-4 rounded-lg hover:bg-muted/50 transition-colors touch-manipulation border">
              <RadioGroupItem value={option.value} id={option.value} className="min-w-[20px] min-h-[20px]" />
              
              {isDivisionQuestion && (option.value === "equipment" || option.value === "magnetics") && <div className="flex items-center justify-center">
                  <img src={option.value === "equipment" ? buntingLogo : magnetApplicationsLogo} alt={option.value === "equipment" ? "Bunting" : "Magnet Applications - A Division of Bunting"} className="h-8 w-auto" />
                </div>}

              {isContinentQuestion && <div className="flex items-center justify-center">
                  <img src={option.value === "north-america" ? northAmericaIcon : europeIcon} alt={option.value === "north-america" ? "North America" : "Europe"} className="h-8 w-auto" />
                </div>}
              
              <Label htmlFor={option.value} className="flex-1 cursor-pointer select-none text-lg font-medium">
                {option.label}
              </Label>
            </div>)}
        </RadioGroup>
        
        {isRoleQuestion && <Button variant="outline" className="w-full mt-4" onClick={() => onResponse("other")}>
            Skip
          </Button>}
      </CardContent>
    </Card>;
}
interface RatingQuestionProps {
  question: RatingQuestion;
  response: number | undefined;
  feedback: string | undefined;
  isNa: boolean | undefined;
  onRatingChange: (rating: number) => void;
  onFeedbackChange: (feedback: string) => void;
  onNaChange: (isNa: boolean) => void;
  language: 'en' | 'es' | 'fr' | 'it';
}
function RatingQuestion({
  question,
  response,
  feedback,
  isNa,
  onRatingChange,
  onFeedbackChange,
  onNaChange,
  language
}: RatingQuestionProps) {
  const ratingLabels = getRatingLabels(language, question.answerSet);
  const isRequired = true; // All rating questions are required
  const requiresFeedback = response !== undefined && response <= 2;
  const feedbackError = requiresFeedback && !feedback?.trim();
  const showNa = question.allow_na ?? false;

  // Get rating options from answerSet, or default to [1, 2, 3, 4, 5]
  const ratingOptions = question.answerSet?.answer_options ? question.answerSet.answer_options.map((opt: any) => opt.metadata?.numeric_value || parseInt(opt.option_key)).filter((val: number) => !isNaN(val)).sort((a: number, b: number) => a - b) : [1, 2, 3, 4, 5];
  
  const handleNaChange = () => {
    onNaChange(!isNa);
  };

  return <div data-question-id={question.id}>
      <div className="mb-4">
        <h3 className="font-medium">
          {question.text}
          {isRequired && <span className="text-destructive ml-1">*</span>}
        </h3>
      </div>

      {/* N/A Status Message */}
      {isNa && showNa && <div className="bg-muted/50 rounded-lg p-3 mb-4 flex items-center gap-2 text-sm">
          <CheckIcon className="h-4 w-4 text-primary" />
          <span>✓ Marked as Not Applicable</span>
        </div>}
      
      {/* Show warning if unanswered and not N/A */}
      {!isNa && response === undefined && <div className="mb-4 p-3 bg-amber-50 dark:bg-amber-950/30 border border-amber-200 dark:border-amber-800 rounded-lg">
          <p className="text-sm text-amber-800 dark:text-amber-200 font-medium">⚠️ Please rate this question{showNa ? ' or select N/A' : ''} to continue</p>
        </div>}

      {/* Rating Buttons - N/A First, then numbered ratings */}
      <div className="flex flex-wrap gap-2 md:gap-3 justify-center mb-4">
        {/* N/A Button positioned first */}
        {showNa && <button
          onClick={handleNaChange}
          onTouchEnd={(e) => {
            e.preventDefault();
            handleNaChange();
          }}
          className={cn(
            "flex flex-col items-center p-2 md:p-3 rounded-lg border-2 transition-all",
            "touch-manipulation select-none focus:outline-none focus:ring-2 focus:ring-ring",
            "min-h-[80px] min-w-[60px] active:scale-95 hover:scale-105",
            isNa
              ? "bg-primary/10 border-primary ring-2 ring-primary"
              : "bg-background border-border hover:border-primary/50"
          )}
          type="button"
        >
          <span className="text-2xl mb-1">⊘</span>
          <span className={cn(
            "text-xs font-medium text-center",
            isNa ? "text-foreground" : "text-muted-foreground"
          )}>
            N/A
          </span>
        </button>}
        
        {/* Numbered rating buttons */}
        {ratingOptions.map(rating => <button key={rating} onClick={() => onRatingChange(rating)} className={cn("flex flex-col items-center p-2 md:p-3 rounded-lg border-2 transition-all touch-manipulation", "select-none focus:outline-none focus:ring-2 focus:ring-primary min-h-[80px] min-w-[60px]", "active:scale-95 hover:scale-105", response === rating ? "border-primary bg-primary/10 ring-2 ring-primary" : "border-border hover:border-primary/50 active:bg-muted/70")} onTouchStart={e => e.preventDefault()} type="button">
            <span className="text-xl md:text-2xl mb-1 select-none">{ratingEmojis[rating as keyof typeof ratingEmojis]}</span>
            <span className="text-xs text-muted-foreground text-center select-none leading-tight">
              {ratingLabels[rating as keyof typeof ratingLabels] || rating}
            </span>
          </button>)}
      </div>

      {/* Feedback box for low scores - REQUIRED for all 1-2 ratings, hidden when N/A */}
      {!isNa && response !== undefined && response <= 2 && <div className="space-y-2">
          <Label htmlFor={`feedback-${question.id}`} className={cn("text-sm font-medium", feedbackError ? "text-destructive" : "text-destructive")}>
            {languageContent[language].lowRatingFeedback} *
          </Label>
          <Textarea id={`feedback-${question.id}`} placeholder={languageContent[language].lowRatingFeedback} value={feedback || ""} onChange={e => onFeedbackChange(e.target.value)} className={cn("min-h-[100px] touch-manipulation", feedbackError ? "border-destructive/50" : "border-destructive/50")} required />
          {feedbackError && <p className="text-xs text-destructive">This feedback is required for low ratings (1-2)</p>}
        </div>}
    </div>;
}