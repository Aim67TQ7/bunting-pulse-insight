import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Checkbox } from "@/components/ui/checkbox";
import { CheckIcon, AlertTriangleIcon, LoaderIcon, Globe, Download } from "lucide-react";
import { cn } from "@/lib/utils";
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";
import { PrivacyNotice } from "./PrivacyNotice";
import { QRCodeSVG } from 'qrcode.react';
import buntingLogo from "@/assets/bunting-logo-2.png";
import magnetApplicationsLogo from "@/assets/magnet-applications-logo-2.png";
import northAmericaIcon from "@/assets/north-america-icon.png";
import europeIcon from "@/assets/europe-icon.png";

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
    otherOption: "Other"
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
    otherOption: "Otro"
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
    otherOption: "Autre"
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
    otherOption: "Altro"
  }
};

interface RatingQuestion {
  id: string;
  text: string;
  section: string;
  feedbackPrompt: string;
}

interface DemographicQuestion {
  id: string;
  text: string;
  options: { value: string; label: string }[];
}

const getMultiSelectQuestions = (language: string) => [
  {
    id: "communication-preferences",
    text: languageContent[language].communicationPreferences,
    section: "Leadership & Communication",
    options: [
      { value: "companywide-emails", label: languageContent[language].companywideEmails },
      { value: "quarterly-town-halls", label: languageContent[language].quarterlyTownHalls },
      { value: "company-intranet", label: languageContent[language].companyIntranet },
      { value: "digital-signage", label: languageContent[language].digitalSignage },
      { value: "printed-signage", label: languageContent[language].printedSignage },
      { value: "team-meetings", label: languageContent[language].teamMeetings }
    ]
  },
  {
    id: "motivation-factors",
    text: languageContent[language].motivationFactors,
    section: "Engagement & Job Satisfaction",
    options: [
      { value: "compensation", label: languageContent[language].compensation },
      { value: "benefits-package", label: languageContent[language].benefitsPackage },
      { value: "job-satisfaction", label: languageContent[language].jobSatisfactionOption },
      { value: "the-people", label: languageContent[language].thePeople },
      { value: "growth-opportunities", label: languageContent[language].growthOpportunities },
      { value: "company-future", label: languageContent[language].companyFuture },
      { value: "recognition", label: languageContent[language].recognition },
      { value: "other", label: languageContent[language].otherOption }
    ]
  },
  {
    id: "information-preferences",
    text: languageContent[language].informationPreferences,
    section: "Workplace Experience",
    options: [
      { value: "communication-transparency", label: languageContent[language].communicationTransparency },
      { value: "strategic-direction", label: languageContent[language].strategicDirection },
      { value: "financial-incentives", label: languageContent[language].financialIncentives },
      { value: "performance-metrics", label: languageContent[language].performanceMetrics }
    ]
  }
];

interface MultiSelectQuestion {
  id: string;
  text: string;
  section: string;
  options: { value: string; label: string }[];
}

const getRatingQuestions = (language: string): RatingQuestion[] => [
  // Engagement & Job Satisfaction
  {
    id: "job-satisfaction",
    text: languageContent[language].jobSatisfaction,
    section: "Engagement & Job Satisfaction",
    feedbackPrompt: languageContent[language].jobSatisfactionFollowUp
  },
  {
    id: "company-satisfaction",
    text: languageContent[language].companySatisfaction,
    section: "Engagement & Job Satisfaction",
    feedbackPrompt: ""
  },
  {
    id: "future-view",
    text: languageContent[language].futureView,
    section: "Engagement & Job Satisfaction",
    feedbackPrompt: ""
  },
  
  // Leadership & Communication
  {
    id: "expectations",
    text: languageContent[language].expectations,
    section: "Leadership & Communication",
    feedbackPrompt: ""
  },
  {
    id: "performance-awareness",
    text: languageContent[language].performanceAwareness,
    section: "Leadership & Communication",
    feedbackPrompt: ""
  },
  {
    id: "relaying-information",
    text: languageContent[language].relayingInformation,
    section: "Leadership & Communication",
    feedbackPrompt: ""
  },
  {
    id: "management-feedback",
    text: languageContent[language].managementFeedback,
    section: "Leadership & Communication",
    feedbackPrompt: ""
  },
  
  // Training & Development
  {
    id: "training",
    text: languageContent[language].training,
    section: "Training & Development",
    feedbackPrompt: languageContent[language].trainingFollowUp
  },
  {
    id: "opportunities",
    text: languageContent[language].opportunities,
    section: "Training & Development",
    feedbackPrompt: ""
  },
  
  // Teamwork & Culture
  {
    id: "cooperation",
    text: languageContent[language].cooperation,
    section: "Teamwork & Culture",
    feedbackPrompt: ""
  },
  {
    id: "morale",
    text: languageContent[language].morale,
    section: "Teamwork & Culture",
    feedbackPrompt: ""
  },
  {
    id: "pride",
    text: languageContent[language].pride,
    section: "Teamwork & Culture",
    feedbackPrompt: ""
  },
  
  // Safety & Work Environment
  {
    id: "safety-focus",
    text: languageContent[language].safetyFocus,
    section: "Safety & Work Environment",
    feedbackPrompt: ""
  },
  {
    id: "safety-reporting",
    text: languageContent[language].safetyReporting,
    section: "Safety & Work Environment",
    feedbackPrompt: ""
  },
  
  // Scheduling & Workload
  {
    id: "workload",
    text: languageContent[language].workload,
    section: "Scheduling & Workload",
    feedbackPrompt: ""
  },
  {
    id: "work-life-balance",
    text: languageContent[language].workLifeBalance,
    section: "Scheduling & Workload",
    feedbackPrompt: languageContent[language].workLifeBalanceFollowUp
  },
  
  // Tools, Equipment & Processes
  {
    id: "tools",
    text: languageContent[language].tools,
    section: "Tools, Equipment & Processes",
    feedbackPrompt: ""
  },
  {
    id: "processes",
    text: languageContent[language].processes,
    section: "Tools, Equipment & Processes",
    feedbackPrompt: ""
  },
  {
    id: "company-value",
    text: languageContent[language].companyValue,
    section: "Tools, Equipment & Processes",
    feedbackPrompt: ""
  },
  {
    id: "change",
    text: languageContent[language].change,
    section: "Tools, Equipment & Processes",
    feedbackPrompt: ""
  }
];

const getDemographicQuestions = (language: string): DemographicQuestion[] => [
  {
    id: "continent",
    text: "Which Continent is your primary work location?",
    options: [
      { value: "north-america", label: "North America" },
      { value: "europe", label: "Europe" }
    ]
  },
  {
    id: "division",
    text: "Which Division of Bunting do you work in?",
    options: [
      { value: "equipment", label: "Equipment" },
      { value: "magnetics", label: "Magnetics" },
      { value: "both", label: "Both" }
    ]
  },
  {
    id: "role",
    text: "Which best explains your role?",
    options: [
      { value: "sales-marketing", label: "Sales/Marketing/Product" },
      { value: "operations", label: "Operations/Engineering/Production" },
      { value: "admin", label: "Admin/HR/Finance" }
    ]
  }
];

// Emojis for 1-5 scale (matching document requirements)
const ratingEmojis = {
  1: "😞",
  2: "😕", 
  3: "😐",
  4: "😊",
  5: "😍"
};

const getRatingLabels = (language: string) => ({
  1: languageContent[language].stronglyDisagree,
  2: languageContent[language].disagree, 
  3: languageContent[language].neutral,
  4: languageContent[language].agree,
  5: languageContent[language].stronglyAgree
});

type SurveySection = "landing" | "survey" | "complete";

export function EmployeeSurvey({ onViewResults }: { onViewResults?: () => void }) {
  const [currentSection, setCurrentSection] = useState<SurveySection>("landing");
  const [responses, setResponses] = useState<Record<string, string>>({});
  const [ratingResponses, setRatingResponses] = useState<Record<string, number>>({});
  const [feedbackResponses, setFeedbackResponses] = useState<Record<string, string>>({});
  const [multiSelectResponses, setMultiSelectResponses] = useState<Record<string, string[]>>({});
  const [collaborationFeedback, setCollaborationFeedback] = useState("");
  const [additionalComments, setAdditionalComments] = useState("");
  const [isComplete, setIsComplete] = useState(false);
  const [showPrivacyNotice, setShowPrivacyNotice] = useState(false);
  const [submissionCount, setSubmissionCount] = useState(0);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [language, setLanguage] = useState<'en' | 'es' | 'fr' | 'it'>('en');
  const [startTime, setStartTime] = useState<number | null>(null);
  const [elapsedTime, setElapsedTime] = useState(0);
  const [showQRCode, setShowQRCode] = useState(false);
  const { toast } = useToast();

  useEffect(() => {
    const count = parseInt(localStorage.getItem("survey-submissions") || "0");
    setSubmissionCount(count);
  }, []);

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

  const startSurvey = () => {
    setStartTime(Date.now());
    setCurrentSection("survey");
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
    setCollaborationFeedback("");
    setStartTime(null);
    setElapsedTime(0);
    setAdditionalComments("");
    toast({
      title: "Survey data reset",
      description: "You can now take the survey again for testing.",
    });
  };

  // Add reset function to window for testing
  useEffect(() => {
    (window as any).resetSurvey = resetSurveyData;
    return () => {
      delete (window as any).resetSurvey;
    };
  }, []);

  const getTotalQuestions = () => {
    return getDemographicQuestions(language).length + getRatingQuestions(language).length + getMultiSelectQuestions(language).length;
  };

  const progress = ((Object.keys(responses).length + Object.keys(ratingResponses).length + Object.keys(multiSelectResponses).length) / getTotalQuestions()) * 100;

  const handleDemographicResponse = (questionId: string, value: string) => {
    setResponses(prev => ({
      ...prev,
      [questionId]: value
    }));
  };

  const handleRatingResponse = (questionId: string, rating: number) => {
    setRatingResponses(prev => ({ ...prev, [questionId]: rating }));
  };

  const handleFeedbackResponse = (questionId: string, feedback: string) => {
    setFeedbackResponses(prev => ({ ...prev, [questionId]: feedback }));
  };

  const handleMultiSelectResponse = (questionId: string, selectedOptions: string[]) => {
    setMultiSelectResponses(prev => ({ ...prev, [questionId]: selectedOptions }));
  };

  const isAllQuestionsAnswered = () => {
    const allDemographicsAnswered = getDemographicQuestions(language).every(q => responses[q.id] !== undefined);
    const allRatingsAnswered = getRatingQuestions(language).every(q => ratingResponses[q.id] !== undefined);
    const allLowRatingsFeedbackProvided = getRatingQuestions(language)
      .filter(q => ratingResponses[q.id] <= 2)
      .every(q => feedbackResponses[q.id]?.trim());
    
    return allDemographicsAnswered && allRatingsAnswered && allLowRatingsFeedbackProvided;
  };

  const handleSubmit = async () => {
    if (!isAllQuestionsAnswered()) {
      toast({
        title: "Incomplete survey",
        description: "Please answer all required questions and provide feedback for ratings of 1 or 2.",
        variant: "destructive",
      });
      return;
    }

    setIsSubmitting(true);

    try {
      const surveyData = {
        continent: responses.continent,
        division: responses.division,
        role: responses.role,
        completion_time_seconds: elapsedTime,
        job_satisfaction: ratingResponses["job-satisfaction"],
        company_satisfaction: ratingResponses["company-satisfaction"],
        future_view: ratingResponses["future-view"],
        expectations: ratingResponses["expectations"],
        performance_awareness: ratingResponses["performance-awareness"],
        relaying_information: ratingResponses["relaying-information"],
        management_feedback: ratingResponses["management-feedback"],
        training: ratingResponses["training"],
        opportunities: ratingResponses["opportunities"],
        cooperation: ratingResponses["cooperation"],
        morale: ratingResponses["morale"],
        pride: ratingResponses["pride"],
        safety_focus: ratingResponses["safety-focus"],
        safety_reporting: ratingResponses["safety-reporting"],
        workload: ratingResponses["workload"],
        work_life_balance: ratingResponses["work-life-balance"],
        tools: ratingResponses["tools"],
        processes: ratingResponses["processes"],
        company_value: ratingResponses["company-value"],
        change: ratingResponses["change"],
        communication_preferences: multiSelectResponses["communication-preferences"] || [],
        motivation_factors: multiSelectResponses["motivation-factors"] || [],
        information_preferences: multiSelectResponses["information-preferences"] || [],
        job_satisfaction_comment: feedbackResponses["job-satisfaction"] || "",
        training_comment: feedbackResponses["training"] || "",
        work_life_balance_comment: feedbackResponses["work-life-balance"] || "",
        collaboration_feedback: collaborationFeedback,
        additional_comments: additionalComments,
        language: language
      };

      const { error } = await supabase
        .from("survey_responses")
        .insert(surveyData);

      if (error) throw error;

      const currentCount = parseInt(localStorage.getItem("survey-submissions") || "0");
      localStorage.setItem("survey-submissions", String(currentCount + 1));
      setSubmissionCount(currentCount + 1);
      setIsComplete(true);

      toast({
        title: "Survey submitted!",
        description: "Thank you for your feedback.",
      });
    } catch (error) {
      console.error("Error submitting survey:", error);
      toast({
        title: "Submission failed",
        description: "There was an error submitting your survey. Please try again.",
        variant: "destructive",
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  if (currentSection === "landing") {
    return (
      <div className="min-h-screen bg-background p-4">
        <div className="max-w-4xl mx-auto mt-12">
          <Card className="text-center">
            <CardHeader>
              <CardTitle className="text-3xl mb-4">Employee Survey – Actionable Insights</CardTitle>
              <p className="text-muted-foreground text-lg">
                Your feedback helps us improve. This survey takes approximately 10-15 minutes to complete.
              </p>
            </CardHeader>
            <CardContent className="space-y-6">
              <Button 
                onClick={startSurvey}
                className="w-full max-w-md mx-auto"
                size="lg"
              >
                Start Survey
              </Button>
              
              <div className="pt-8 border-t">
                <Button
                  variant="outline"
                  onClick={() => setShowQRCode(!showQRCode)}
                  className="mb-4"
                >
                  {showQRCode ? 'Hide' : 'Show'} QR Code
                </Button>
                
                {showQRCode && (
                  <div className="space-y-4">
                    <div className="flex justify-center">
                      <QRCodeSVG 
                        id="survey-qr-code"
                        value="https://survey.buntinggpt.com"
                        size={256}
                        level="H"
                        includeMargin={true}
                      />
                    </div>
                    <Button
                      variant="secondary"
                      onClick={downloadQRCode}
                      className="gap-2"
                    >
                      <Download className="h-4 w-4" />
                      Download QR Code
                    </Button>
                    <p className="text-sm text-muted-foreground">
                      Scan to access: https://survey.buntinggpt.com
                    </p>
                  </div>
                )}
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    );
  }

  if (isComplete) {
    return (
      <div className="min-h-screen bg-background p-4">
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
              <div className="bg-muted/50 p-6 rounded-lg">
                <p className="text-lg">
                  We truly appreciate you taking the time to share your feedback with us.
                </p>
                <p className="text-muted-foreground mt-4">
                  Survey results will be posted within the next 30 days.
                </p>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background p-4 touch-pan-y">
      <PrivacyNotice />
      <div className="max-w-4xl mx-auto"
           style={{ 
             WebkitTouchCallout: 'none',
             WebkitUserSelect: 'none',
             userSelect: 'none'
           }}>
        {/* Language Selector and Timer */}
        <div className="flex justify-between items-center mb-8">
          <div className="flex items-center gap-2">
            <Globe className="h-4 w-4 text-muted-foreground" />
            <div className="flex gap-1">
              <Button
                variant={language === 'en' ? 'default' : 'outline'}
                size="sm"
                onClick={() => setLanguage('en')}
              >
                EN
              </Button>
              <Button
                variant={language === 'es' ? 'default' : 'outline'}
                size="sm"
                onClick={() => setLanguage('es')}
              >
                ES
              </Button>
              <Button
                variant={language === 'fr' ? 'default' : 'outline'}
                size="sm"
                onClick={() => setLanguage('fr')}
              >
                FR
              </Button>
              <Button
                variant={language === 'it' ? 'default' : 'outline'}
                size="sm"
                onClick={() => setLanguage('it')}
              >
                IT
              </Button>
            </div>
          </div>
          <div className="flex items-center gap-4">
            <div className="text-sm font-medium">
              Time: {formatTime(elapsedTime)}
            </div>
            <Button 
              variant="destructive" 
              size="sm" 
              onClick={resetSurveyData}
            >
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

        <OnPageSurvey
          demographicQuestions={getDemographicQuestions(language)}
          ratingQuestions={getRatingQuestions(language)}
          multiSelectQuestions={getMultiSelectQuestions(language)}
          demographicResponses={responses}
          ratingResponses={ratingResponses}
          feedbackResponses={feedbackResponses}
          multiSelectResponses={multiSelectResponses}
          collaborationFeedback={collaborationFeedback}
          additionalComments={additionalComments}
          onDemographicChange={handleDemographicResponse}
          onRatingChange={handleRatingResponse}
          onFeedbackChange={handleFeedbackResponse}
          onMultiSelectChange={handleMultiSelectResponse}
          onCollaborationFeedbackChange={setCollaborationFeedback}
          onAdditionalCommentsChange={setAdditionalComments}
          onSubmit={handleSubmit}
          canSubmit={isAllQuestionsAnswered()}
          isSubmitting={isSubmitting}
          language={language}
        />
      </div>
    </div>
  );
}

// One-Page Survey Component
interface OnPageSurveyProps {
  demographicQuestions: DemographicQuestion[];
  ratingQuestions: RatingQuestion[];
  multiSelectQuestions: MultiSelectQuestion[];
  demographicResponses: Record<string, string>;
  ratingResponses: Record<string, number>;
  feedbackResponses: Record<string, string>;
  multiSelectResponses: Record<string, string[]>;
  collaborationFeedback: string;
  additionalComments: string;
  onDemographicChange: (questionId: string, value: string) => void;
  onRatingChange: (questionId: string, rating: number) => void;
  onFeedbackChange: (questionId: string, feedback: string) => void;
  onMultiSelectChange: (questionId: string, selectedOptions: string[]) => void;
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
  demographicResponses,
  ratingResponses,
  feedbackResponses,
  multiSelectResponses,
  collaborationFeedback,
  additionalComments,
  onDemographicChange,
  onRatingChange,
  onFeedbackChange,
  onMultiSelectChange,
  onCollaborationFeedbackChange,
  onAdditionalCommentsChange,
  onSubmit,
  canSubmit,
  isSubmitting = false,
  language
}: OnPageSurveyProps) {
  const sectionOrder = [
    "Engagement & Job Satisfaction",
    "Leadership & Communication",
    "Training & Development",
    "Teamwork & Culture",
    "Safety & Work Environment",
    "Scheduling & Workload",
    "Tools, Equipment & Processes"
  ];

  const allQuestions = [...ratingQuestions, ...multiSelectQuestions];
  const groupedQuestions = allQuestions.reduce((acc, question) => {
    if (!acc[question.section]) {
      acc[question.section] = [];
    }
    acc[question.section].push(question);
    return acc;
  }, {} as Record<string, (RatingQuestion | MultiSelectQuestion)[]>);

  const sortedSections = sectionOrder.filter(section => groupedQuestions[section]);

  return (
    <div className="space-y-8">
      {/* Demographics Section */}
      <Card>
        <CardHeader>
          <CardTitle>Demographics</CardTitle>
        </CardHeader>
        <CardContent className="space-y-6">
          {demographicQuestions.map((question) => (
            <DemographicQuestion
              key={question.id}
              question={question}
              value={demographicResponses[question.id]}
              onResponse={(value) => onDemographicChange(question.id, value)}
            />
          ))}
        </CardContent>
      </Card>

      {/* Rating Sections */}
      {sortedSections.map((section) => {
        const sectionQuestions = groupedQuestions[section];
        return (
          <Card key={section}>
            <CardHeader>
              <CardTitle>{section}</CardTitle>
            </CardHeader>
            <CardContent className="space-y-6">
              {sectionQuestions.map((question) => {
                if ('options' in question) {
                  // Multi-select question
                  return (
                    <div key={question.id} className="space-y-4">
                      <h3 className="font-medium">{question.text}</h3>
                      <div className="space-y-2">
                        {question.options.map((option) => (
                          <div key={option.value} className="flex items-center space-x-2">
                            <Checkbox
                              id={`${question.id}-${option.value}`}
                              checked={multiSelectResponses[question.id]?.includes(option.value)}
                              onCheckedChange={(checked) => {
                                const current = multiSelectResponses[question.id] || [];
                                const updated = checked
                                  ? [...current, option.value]
                                  : current.filter(v => v !== option.value);
                                onMultiSelectChange(question.id, updated);
                              }}
                            />
                            <Label htmlFor={`${question.id}-${option.value}`}>{option.label}</Label>
                          </div>
                        ))}
                      </div>
                    </div>
                  );
                } else {
                  // Rating question
                  return (
                    <RatingQuestion
                      key={question.id}
                      question={question}
                      response={ratingResponses[question.id]}
                      feedback={feedbackResponses[question.id]}
                      onRatingChange={(rating) => onRatingChange(question.id, rating)}
                      onFeedbackChange={(feedback) => onFeedbackChange(question.id, feedback)}
                      language={language}
                    />
                  );
                }
              })}
            </CardContent>
          </Card>
        );
      })}

      {/* Additional Comments Section */}
      <Card>
        <CardHeader>
          <CardTitle>Additional Comments</CardTitle>
        </CardHeader>
        <CardContent>
          <Textarea
            placeholder="Any additional comments or suggestions..."
            value={additionalComments}
            onChange={(e) => onAdditionalCommentsChange(e.target.value)}
            className="min-h-[120px]"
          />
        </CardContent>
      </Card>

      {/* Submit Button */}
      <Button
        onClick={onSubmit}
        disabled={!canSubmit || isSubmitting}
        className="w-full"
        size="lg"
      >
        {isSubmitting ? "Submitting..." : "Submit Survey"}
      </Button>
    </div>
  );
}

// Demographic Question Component
interface DemographicQuestionProps {
  question: DemographicQuestion;
  value: string;
  onResponse: (value: string) => void;
}

function DemographicQuestion({ question, value, onResponse }: DemographicQuestionProps) {
  const isDivisionQuestion = question.id === "division";
  const isContinentQuestion = question.id === "continent";
  
  return (
    <Card>
      <CardHeader>
        <CardTitle>{question.text}</CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <RadioGroup onValueChange={onResponse} value={value}>
          {question.options.map((option) => (
            <div key={option.value} className="flex items-center space-x-4 p-4 rounded-lg hover:bg-muted/50 transition-colors touch-manipulation border">
              <RadioGroupItem value={option.value} id={option.value} className="min-w-[20px] min-h-[20px]" />
              
              {isDivisionQuestion && (option.value === "equipment" || option.value === "magnetics") && (
                <div className="flex items-center justify-center">
                  <img 
                    src={option.value === "equipment" ? buntingLogo : magnetApplicationsLogo} 
                    alt={option.value === "equipment" ? "Bunting" : "Magnet Applications - A Division of Bunting"}
                    className="h-8 w-auto"
                  />
                </div>
              )}

              {isContinentQuestion && (
                <div className="flex items-center justify-center">
                  <img 
                    src={option.value === "north-america" ? northAmericaIcon : europeIcon} 
                    alt={option.value === "north-america" ? "North America" : "Europe"}
                    className="h-8 w-auto"
                  />
                </div>
              )}
              
              <Label htmlFor={option.value} className="flex-1 cursor-pointer select-none text-lg font-medium">
                {option.label}
              </Label>
            </div>
          ))}
        </RadioGroup>
      </CardContent>
    </Card>
  );
}

interface RatingQuestionProps {
  question: RatingQuestion;
  response: number | undefined;
  feedback: string | undefined;
  onRatingChange: (rating: number) => void;
  onFeedbackChange: (feedback: string) => void;
  language: 'en' | 'es' | 'fr' | 'it';
}

function RatingQuestion({ question, response, feedback, onRatingChange, onFeedbackChange, language }: RatingQuestionProps) {
  const ratingLabels = getRatingLabels(language);

  return (
    <div>
      <h3 className="font-medium mb-4">{question.text}</h3>
      
      {/* Rating Scale with Emojis */}
      <div className="flex justify-center space-x-2 md:space-x-4 mb-4">
        {[1, 2, 3, 4, 5].map((rating) => (
          <button
            key={rating}
            onClick={() => onRatingChange(rating)}
            className={cn(
              "flex flex-col items-center p-2 md:p-3 rounded-lg border-2 transition-all touch-manipulation",
              "select-none focus:outline-none focus:ring-2 focus:ring-primary min-h-[80px] min-w-[60px]",
              "active:scale-95 hover:scale-105",
              response === rating
                ? "border-primary bg-primary/10 ring-2 ring-primary"
                : "border-border hover:border-primary/50 active:bg-muted/70"
            )}
            onTouchStart={(e) => e.preventDefault()}
            type="button"
          >
            <span className="text-xl md:text-2xl mb-1 select-none">{ratingEmojis[rating as keyof typeof ratingEmojis]}</span>
            <span className="text-xs font-medium select-none">{rating}</span>
            <span className="text-xs text-muted-foreground text-center select-none leading-tight">
              {ratingLabels[rating as keyof typeof ratingLabels]}
            </span>
          </button>
        ))}
      </div>

      {/* Feedback box for low scores - REQUIRED for all 1-2 ratings */}
      {response !== undefined && response <= 2 && (
        <div className="space-y-2">
          <Label htmlFor={`feedback-${question.id}`} className="text-sm font-medium text-destructive">
            {languageContent[language].lowRatingFeedback} *
          </Label>
          <Textarea
            id={`feedback-${question.id}`}
            placeholder={languageContent[language].lowRatingFeedback}
            value={feedback || ""}
            onChange={(e) => onFeedbackChange(e.target.value)}
            className="min-h-[100px] touch-manipulation border-destructive/50"
            required
          />
        </div>
      )}
    </div>
  );
}
