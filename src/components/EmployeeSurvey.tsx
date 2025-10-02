import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { CheckIcon, AlertTriangleIcon, LoaderIcon, Globe } from "lucide-react";
import { cn } from "@/lib/utils";
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";
import { PrivacyNotice } from "./PrivacyNotice";
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
    opportunities: "There are opportunities to develop new skills or advance in my career here.",
    safetyFocus: "The company prioritizes safety in the workplace.",
    safetyReporting: "I feel comfortable reporting unsafe conditions or practices.",
    cooperation: "Team members cooperate and support each other to get the job done.",
    morale: "How would you describe the morale on your shift or in your department?",
    pride: "I feel pride in the company's products and services.",
    workload: "The workload is reasonable for my position.",
    workLifeBalance: "I have a good work-life balance.",
    tools: "I have the right tools and equipment to do my job well.",
    processes: "Processes are designed to maximize efficiency and quality.",
    companyValue: "The company values the quality of its products and services.",
    change: "One change that could improve my daily work experience.",
    // Multi-select questions
    communicationPreferences: "Which communication styles do you prefer?",
    motivationFactorsQuestion: "Check any of the following that motivates you to stay with the company.",
    informationPreferences: "What information would you like to receive more from the company?",
    // Multi-select options
    compensation: "Compensation",
    benefitsPackage: "Benefit Package",
    jobSatisfactionOpt: "Job Satisfaction",
    thePeople: "The People",
    growthOpportunities: "Growth Opportunities",
    companyFuture: "Company's Future",
    recognition: "Recognition",
    otherOption: "Other",
    // Generic low rating feedback prompt
    lowRatingFeedback: "Please explain why you gave this rating and what could be improved.",
    // Additional feedback
    additionalComments: "Any additional comments or suggestions?",
    // Follow-up prompts
    jobSatisfactionFollowUp: "Please explain why you feel dissatisfied with your job.",
    trainingFollowUp: "Please describe gaps in training or support you've experienced.",
    workLifeBalanceFollowUp: "Please explain what affects your work-life balance.",
    // Submit
    submitSurvey: "Submit Survey",
    next: "Next",
    // Ratings
    stronglyDisagree: "Strongly Disagree",
    disagree: "Disagree",
    neutral: "Neutral",
    agree: "Agree",
    stronglyAgree: "Strongly Agree"
  },
  es: {
    title: "Encuesta de Compromiso del Empleado",
    subtitle: "Sus comentarios nos ayudan a mejorar nuestra cultura laboral",
    languageLabel: "Idioma",
    getStarted: "Comenzar",
    privacyNotice: "Aviso de Privacidad",
    // Demographics
    locationQuestion: "¿En qué división trabajas?",
    roleQuestion: "¿Cuál es tu nivel de puesto?",
    magnetics: "Magnéticos",
    equipment: "Equipos",
    other: "Otro",
    operationsDistribution: "Operaciones y Distribución",
    engineeringServices: "Ingeniería y Servicios",
    salesFinance: "Ventas y Finanzas",
    adminManagement: "Administración y Gestión",
    // Rating questions
    jobSatisfaction: "Estoy satisfecho con mi puesto y responsabilidades actuales.",
    companySatisfaction: "Recomendaría esta empresa como un buen lugar para trabajar.",
    futureView: "Me veo trabajando aquí en los próximos 2 años.",
    expectations: "Los supervisores/gerentes comunican las expectativas con claridad.",
    performanceAwareness: "El liderazgo es eficaz en mantenerme informado sobre el desempeño de la empresa.",
    relayingInformation: "Cuando no tengo acceso al correo electrónico, mi supervisor transmite la información importante de manera eficaz.",
    managementFeedback: "Me siento cómodo planteando inquietudes o dando comentarios a la gerencia.",
    training: "Recibí suficiente capacitación para realizar mi trabajo de manera segura y eficaz.",
    opportunities: "Hay oportunidades para desarrollar nuevas habilidades o avanzar en mi carrera aquí.",
    safetyFocus: "La empresa prioriza la seguridad en el lugar de trabajo.",
    safetyReporting: "Me siento cómodo informando sobre condiciones o prácticas inseguras.",
    cooperation: "Los miembros del equipo cooperan y se apoyan entre sí para realizar el trabajo.",
    morale: "¿Cómo describirías la moral en tu turno o en tu departamento?",
    pride: "Siento orgullo por los productos y servicios de la empresa.",
    workload: "La carga de trabajo es razonable para mi puesto.",
    workLifeBalance: "Tengo un buen equilibrio entre trabajo y vida personal.",
    tools: "Tengo las herramientas y el equipo adecuados para hacer bien mi trabajo.",
    processes: "Los procesos están diseñados para maximizar la eficiencia y la calidad.",
    companyValue: "La empresa valora la calidad de sus productos y servicios.",
    change: "Un cambio que podría mejorar mi experiencia laboral diaria.",
    // Multi-select questions
    motivationFactorsQuestion: "Marque cualquiera de los siguientes que lo motive a permanecer en la empresa.",
    // Multi-select options
    compensation: "Compensación",
    benefitsPackage: "Paquete de beneficios",
    jobSatisfactionOpt: "Satisfacción laboral",
    thePeople: "La gente",
    growthOpportunities: "Oportunidades de crecimiento",
    companyFuture: "Futuro de la empresa",
    recognition: "Reconocimiento",
    otherOption: "Otro",
    // Generic low rating feedback prompt
    lowRatingFeedback: "Por favor, explique por qué dio esta calificación y qué se podría mejorar.",
    additionalComments: "¿Algún comentario o sugerencia adicional?",
    jobSatisfactionFollowUp: "Por favor, explique por qué se siente insatisfecho con su trabajo.",
    trainingFollowUp: "Describa las deficiencias en la capacitación o el apoyo que ha experimentado.",
    workLifeBalanceFollowUp: "Por favor, explique qué afecta su equilibrio entre trabajo y vida personal.",
    submitSurvey: "Enviar Encuesta",
    next: "Siguiente",
    stronglyDisagree: "Totalmente en desacuerdo",
    disagree: "En desacuerdo",
    neutral: "Neutral",
    agree: "De acuerdo",
    stronglyAgree: "Totalmente de acuerdo"
  },
  fr: {
    title: "Enquête d'engagement des employés",
    subtitle: "Vos commentaires nous aident à améliorer notre culture d'entreprise",
    languageLabel: "Langue",
    getStarted: "Commencer",
    privacyNotice: "Avis de confidentialité",
    // Demographics
    locationQuestion: "Dans quelle division travaillez-vous ?",
    roleQuestion: "Quel est votre niveau de poste ?",
    magnetics: "Magnétiques",
    equipment: "Équipements",
    other: "Autre",
    operationsDistribution: "Opérations et Distribution",
    engineeringServices: "Ingénierie et Services",
    salesFinance: "Ventes et Finances",
    adminManagement: "Administration et Gestion",
    // Rating questions
    jobSatisfaction: "Je suis satisfait de mon rôle et de mes responsabilités actuelles.",
    companySatisfaction: "Je recommanderais cette entreprise comme un bon endroit où travailler.",
    futureView: "Je me vois travailler ici dans 2 ans.",
    expectations: "Les superviseurs/gestionnaires communiquent clairement les attentes.",
    performanceAwareness: "La direction est efficace pour me tenir informé de la performance de l'entreprise.",
    relayingInformation: "Quand je n'ai pas accès aux e-mails, mon superviseur transmet efficacement les informations importantes.",
    managementFeedback: "Je me sens à l'aise de soulever des préoccupations ou de donner des retours à la direction.",
    training: "J'ai reçu une formation suffisante pour effectuer mon travail en toute sécurité et efficacement.",
    opportunities: "Il y a des opportunités pour développer de nouvelles compétences ou progresser dans ma carrière ici.",
    safetyFocus: "L'entreprise donne la priorité à la sécurité au travail.",
    safetyReporting: "Je me sens à l'aise de signaler des conditions ou pratiques dangereuses.",
    cooperation: "Les membres de l'équipe coopèrent et se soutiennent mutuellement pour accomplir le travail.",
    morale: "Comment décririez-vous le moral dans votre équipe ou département ?",
    pride: "Je ressens de la fierté pour les produits et services de l'entreprise.",
    workload: "La charge de travail est raisonnable pour mon poste.",
    workLifeBalance: "J'ai un bon équilibre entre vie professionnelle et vie personnelle.",
    tools: "J'ai les bons outils et équipements pour bien faire mon travail.",
    processes: "Les processus sont conçus pour maximiser l'efficacité et la qualité.",
    companyValue: "L'entreprise valorise la qualité de ses produits et services.",
    change: "Un changement qui pourrait améliorer mon expérience de travail quotidienne.",
    // Multi-select questions
    motivationFactorsQuestion: "Cochez tout ce qui suit qui vous motive à rester dans l'entreprise.",
    // Multi-select options
    compensation: "Rémunération",
    benefitsPackage: "Ensemble des avantages",
    jobSatisfactionOpt: "Satisfaction au travail",
    thePeople: "Les collègues",
    growthOpportunities: "Opportunités de croissance",
    companyFuture: "Avenir de l'entreprise",
    recognition: "Reconnaissance",
    otherOption: "Autre",
    // Generic low rating feedback prompt
    lowRatingFeedback: "Veuillez expliquer pourquoi vous avez donné cette note et ce qui pourrait être amélioré.",
    additionalComments: "Des commentaires ou suggestions supplémentaires ?",
    jobSatisfactionFollowUp: "Veuillez expliquer pourquoi vous êtes insatisfait de votre travail.",
    trainingFollowUp: "Veuillez décrire les lacunes de formation ou de soutien que vous avez rencontrées.",
    workLifeBalanceFollowUp: "Veuillez expliquer ce qui affecte votre équilibre travail-vie personnelle.",
    submitSurvey: "Soumettre l'enquête",
    next: "Suivant",
    stronglyDisagree: "Tout à fait en désaccord",
    disagree: "En désaccord",
    neutral: "Neutre",
    agree: "D'accord",
    stronglyAgree: "Tout à fait d'accord"
  },
  it: {
    title: "Sondaggio sul coinvolgimento dei dipendenti",
    subtitle: "Il tuo feedback ci aiuta a migliorare la nostra cultura aziendale",
    languageLabel: "Lingua",
    getStarted: "Inizia",
    privacyNotice: "Informativa sulla privacy",
    // Demographics
    locationQuestion: "In quale divisione lavori?",
    roleQuestion: "Qual è il tuo livello di ruolo?",
    magnetics: "Magnetici",
    equipment: "Attrezzature",
    other: "Altro",
    operationsDistribution: "Operazioni e Distribuzione",
    engineeringServices: "Ingegneria e Servizi",
    salesFinance: "Vendite e Finanza",
    adminManagement: "Amministrazione e Gestione",
    // Rating questions
    jobSatisfaction: "Sono soddisfatto del mio ruolo e delle mie responsabilità attuali.",
    companySatisfaction: "Raccomanderei questa azienda come un buon posto di lavoro.",
    futureView: "Mi vedo a lavorare qui nei prossimi 2 anni.",
    expectations: "I supervisori/manager comunicano chiaramente le aspettative.",
    performanceAwareness: "La leadership è efficace nel tenermi informato sulle prestazioni dell'azienda.",
    relayingInformation: "Quando non ho accesso alle email, il mio supervisore trasmette le informazioni importanti in modo efficace.",
    managementFeedback: "Mi sento a mio agio nell'esprimere preoccupazioni o fornire feedback alla direzione.",
    training: "Ho ricevuto una formazione sufficiente per svolgere il mio lavoro in modo sicuro ed efficace.",
    opportunities: "Ci sono opportunità per sviluppare nuove competenze o avanzare nella mia carriera qui.",
    safetyFocus: "L'azienda dà priorità alla sicurezza sul posto di lavoro.",
    safetyReporting: "Mi sento a mio agio nel segnalare condizioni o pratiche non sicure.",
    cooperation: "I membri del team collaborano e si supportano a vicenda per portare a termine il lavoro.",
    morale: "Come descriveresti il morale nel tuo turno o nel tuo reparto?",
    pride: "Provo orgoglio per i prodotti e servizi dell'azienda.",
    workload: "Il carico di lavoro è ragionevole per la mia posizione.",
    workLifeBalance: "Ho un buon equilibrio tra lavoro e vita privata.",
    tools: "Ho gli strumenti e le attrezzature giuste per svolgere bene il mio lavoro.",
    processes: "I processi sono progettati per massimizzare l'efficienza e la qualità.",
    companyValue: "L'azienda valorizza la qualità dei suoi prodotti e servizi.",
    change: "Un cambiamento che potrebbe migliorare la mia esperienza lavorativa quotidiana.",
    // Multi-select questions
    motivationFactorsQuestion: "Seleziona uno o più dei seguenti motivi che ti incoraggiano a rimanere in azienda.",
    // Multi-select options
    compensation: "Retribuzione",
    benefitsPackage: "Pacchetto di benefici",
    jobSatisfactionOpt: "Soddisfazione lavorativa",
    thePeople: "Le persone",
    growthOpportunities: "Opportunità di crescita",
    companyFuture: "Futuro dell'azienda",
    recognition: "Riconoscimento",
    otherOption: "Altro",
    // Generic low rating feedback prompt
    lowRatingFeedback: "Per favore, spiega perché hai dato questo punteggio e cosa potrebbe essere migliorato.",
    additionalComments: "Ulteriori commenti o suggerimenti?",
    jobSatisfactionFollowUp: "Per favore, spiega perché ti senti insoddisfatto del tuo lavoro.",
    trainingFollowUp: "Descrivi le lacune nella formazione o nel supporto che hai sperimentato.",
    workLifeBalanceFollowUp: "Per favore, spiega cosa influisce sul tuo equilibrio tra lavoro e vita privata.",
    submitSurvey: "Invia sondaggio",
    next: "Avanti",
    stronglyDisagree: "Completamente in disaccordo",
    disagree: "In disaccordo",
    neutral: "Neutro",
    agree: "D'accordo",
    stronglyAgree: "Completamente d'accordo"
  }
};

interface DemographicQuestion {
  id: string;
  text: string;
  options: { value: string; label: string }[];
}

interface RatingQuestion {
  id: string;
  text: string;
  section: string;
  feedbackPrompt: string;
}

interface MultiSelectQuestion {
  id: string;
  text: string;
  section: string;
  options: { value: string; label: string }[];
}

const multiSelectQuestions: MultiSelectQuestion[] = [
  {
    id: "communication-preferences",
    text: "Which communication styles do you prefer?",
    section: "Leadership & Communication",
    options: [
      { value: "companywide-emails", label: "Companywide emails" },
      { value: "quarterly-town-halls", label: "Quarterly Town halls" },
      { value: "company-intranet", label: "Company Intranet" },
      { value: "digital-signage", label: "Digital Signage" },
      { value: "printed-signage", label: "Printed Signage" },
      { value: "team-meetings", label: "Team meetings" }
    ]
  },
  {
    id: "motivation-factors",
    text: "What motivates you to stay with the company?",
    section: "Collaboration & Cross-Functional Work",
    options: [
      { value: "compensation", label: "Compensation" },
      { value: "benefits-package", label: "Benefits package" },
      { value: "job-satisfaction", label: "Job satisfaction" },
      { value: "the-people", label: "The people" },
      { value: "growth-opportunities", label: "Growth opportunities" },
      { value: "company-future", label: "Company's future" }
    ]
  },
  {
    id: "information-preferences",
    text: "What information would you like to receive more from the company?",
    section: "Workplace Experience",
    options: [
      { value: "communication-transparency", label: "Communication and transparency" },
      { value: "strategic-direction", label: "Strategic direction" },
      { value: "financial-incentives", label: "Financial incentives" },
      { value: "operational-updates", label: "Operational updates" },
      { value: "interdepartmental-knowledge", label: "Interdepartmental knowledge" },
      { value: "career-development", label: "Career development" },
      { value: "it-systems", label: "IT systems" }
    ]
  }
];

const getMultiSelectQuestions = (language: string) => [
  {
    id: "motivation-factors",
    text: languageContent[language].motivationFactorsQuestion,
    section: "Collaboration & Cross-Functional Work",
    options: [
      { value: "compensation", label: languageContent[language].compensation },
      { value: "benefits-package", label: languageContent[language].benefitsPackage },
      { value: "job-satisfaction", label: languageContent[language].jobSatisfactionOpt },
      { value: "the-people", label: languageContent[language].thePeople },
      { value: "growth-opportunities", label: languageContent[language].growthOpportunities },
      { value: "company-future", label: languageContent[language].companyFuture },
      { value: "recognition", label: languageContent[language].recognition },
      { value: "other", label: languageContent[language].otherOption }
    ]
  }
];

// Updated rating questions based on new document
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
    id: "division",
    text: languageContent[language].locationQuestion,
    options: [
      { value: "magnetics", label: languageContent[language].magnetics },
      { value: "equipment", label: languageContent[language].equipment },
      { value: "other", label: languageContent[language].other }
    ]
  },
  {
    id: "role",
    text: languageContent[language].roleQuestion,
    options: [
      { value: "operations-distribution", label: languageContent[language].operationsDistribution },
      { value: "engineering-services", label: languageContent[language].engineeringServices },
      { value: "sales-finance", label: languageContent[language].salesFinance },
      { value: "admin-management", label: languageContent[language].adminManagement }
    ]
  }
];

const demographicQuestions: DemographicQuestion[] = [
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
      { value: "magnets", label: "Magnets" },
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

type SurveySection = "demographics" | "ratings" | "complete";

export function EmployeeSurvey({ onViewResults }: { onViewResults?: () => void }) {
  const [currentSection, setCurrentSection] = useState<SurveySection>("demographics");
  const [currentDemographicIndex, setCurrentDemographicIndex] = useState(0);
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
  const { toast } = useToast();

  useEffect(() => {
    const count = parseInt(localStorage.getItem("survey-submissions") || "0");
    setSubmissionCount(count);
  }, []);

  // Reset function for testing purposes
  const resetSurveyData = () => {
    localStorage.removeItem("survey-submissions");
    localStorage.removeItem("survey-data");
    setSubmissionCount(0);
    setIsComplete(false);
    setResponses({});
    setRatingResponses({});
    setFeedbackResponses({});
    setCollaborationFeedback("");
    setAdditionalComments("");
    setCurrentSection("demographics");
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

  const getCurrentQuestionNumber = () => {
    if (currentSection === "demographics") {
      return currentDemographicIndex + 1;
    } else if (currentSection === "ratings") {
      const ratingCount = Object.keys(ratingResponses).length;
      const multiSelectCount = Object.keys(multiSelectResponses).length;
      return getDemographicQuestions(language).length + ratingCount + multiSelectCount + 1;
    }
    return getTotalQuestions();
  };

  const progress = (getCurrentQuestionNumber() / getTotalQuestions()) * 100;

  const handleDemographicResponse = (value: string) => {
    const questionId = getDemographicQuestions(language)[currentDemographicIndex].id;
    setResponses(prev => ({ ...prev, [questionId]: value }));
    
    if (currentDemographicIndex < getDemographicQuestions(language).length - 1) {
      setCurrentDemographicIndex(prev => prev + 1);
    } else {
      setCurrentSection("ratings");
    }
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
    const allRatingsAnswered = Object.keys(ratingResponses).length === getRatingQuestions(language).length;
    const allMultiSelectAnswered = Object.keys(multiSelectResponses).length === getMultiSelectQuestions(language).length;
    
    // Check that all low ratings (1 or 2) have feedback
    const lowRatingQuestions = Object.entries(ratingResponses).filter(([_, rating]) => rating <= 2);
    const allLowRatingsHaveFeedback = lowRatingQuestions.every(([questionId, _]) => {
      const feedback = feedbackResponses[questionId];
      return feedback && feedback.trim().length > 0;
    });
    
    return allRatingsAnswered && allMultiSelectAnswered && allLowRatingsHaveFeedback;
  };

  const handleSubmit = async () => {
    if (submissionCount >= 1) {
      toast({
        title: "Submission limit reached",
        description: "You have already submitted this survey.",
        variant: "destructive"
      });
      return;
    }

    if (!isAllQuestionsAnswered()) {
      toast({
        title: "Incomplete survey",
        description: "Please answer all questions before submitting.",
        variant: "destructive"
      });
      return;
    }

    setIsSubmitting(true);

    try {
      // Generate unique session ID
      const sessionId = crypto.randomUUID();

      // Map responses to database columns with updated question IDs
      const surveyData = {
        session_id: sessionId,
        continent: 'N/A', // No longer collecting continent
        division: responses.division === 'magnetics' ? 'Magnetics' : 
                  responses.division === 'equipment' ? 'Equipment' : 'Other',
        role: responses.role === 'operations-distribution' ? 'Operations & Distribution' :
              responses.role === 'engineering-services' ? 'Engineering & Services' :
              responses.role === 'sales-finance' ? 'Sales & Finance' : 'Admin & Management',
        
        // Rating responses - map new question IDs to database columns
        job_satisfaction: ratingResponses['job-satisfaction'],
        training_satisfaction: ratingResponses['training'],
        work_life_balance: ratingResponses['work-life-balance'],
        communication_clarity: ratingResponses['expectations'],
        leadership_openness: ratingResponses['management-feedback'],
        manager_alignment: ratingResponses['performance-awareness'],
        us_uk_collaboration: null, // No longer in survey
        cross_functional_collaboration: ratingResponses['cooperation'],
        strategic_confidence: ratingResponses['company-satisfaction'],
        advancement_opportunities: ratingResponses['opportunities'],
        workplace_safety: ratingResponses['safety-focus'],
        recommend_company: ratingResponses['company-satisfaction'],
        
        // Process efficiency
        manual_processes_focus: ratingResponses['processes'],
        comfortable_suggesting_improvements: ratingResponses['safety-reporting'],
        failed_experiments_learning: null,
        
        // Multi-select responses
        communication_preferences: [],
        motivation_factors: multiSelectResponses['motivation-factors'] || [],
        information_preferences: [],
        
        // Follow-up responses
        follow_up_responses: feedbackResponses,
        collaboration_feedback: collaborationFeedback || null,
        additional_comments: additionalComments || null
      };

      const { error } = await supabase
        .from('employee_survey_responses')
        .insert(surveyData);

      if (error) {
        console.error('Error submitting survey:', error);
        toast({
          title: "Submission failed",
          description: "Please try again later.",
          variant: "destructive"
        });
        return;
      }

      // Update local storage for submission tracking
      const newCount = submissionCount + 1;
      localStorage.setItem("survey-submissions", newCount.toString());
      
      setIsComplete(true);
      
      toast({
        title: "Survey submitted successfully",
        description: "Thank you for your valuable feedback!",
      });

    } catch (error) {
      console.error('Error submitting survey:', error);
      toast({
        title: "Submission failed",
        description: "Please try again later.",
        variant: "destructive"
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  if (submissionCount >= 1 && !isComplete) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center p-4">
        <Card className="w-full max-w-md">
          <CardContent className="text-center p-8">
            <AlertTriangleIcon className="h-12 w-12 text-warning mx-auto mb-4" />
            <h2 className="text-xl font-semibold mb-2">Survey Already Submitted</h2>
            <p className="text-muted-foreground">
              You have already completed this survey. Thank you for your participation!
            </p>
          </CardContent>
        </Card>
      </div>
    );
  }

  if (isComplete) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center p-4">
        <Card className="w-full max-w-md">
          <CardContent className="text-center p-8">
            <CheckIcon className="h-12 w-12 text-success mx-auto mb-4" />
            <h2 className="text-xl font-semibold mb-2">Thank You!</h2>
            <p className="text-muted-foreground mb-4">
              Your feedback has been submitted successfully and will help improve our workplace.
            </p>
            <p className="text-sm text-muted-foreground mb-6">
              As a thank you for participating, you can now explore what everyone else shared!
            </p>
            <Button 
              onClick={onViewResults}
              className="w-full"
              size="lg"
            >
              View Survey Results
            </Button>
          </CardContent>
        </Card>
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
        {/* Language Selector and Reset Button */}
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
          <Button 
            variant="destructive" 
            size="sm" 
            onClick={resetSurveyData}
          >
            Reset Survey
          </Button>
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
              <span>Question {getCurrentQuestionNumber()} of {getTotalQuestions()}</span>
              <span>{Math.round(progress)}% complete</span>
            </div>
            <Progress value={progress} className="h-2" />
          </div>
        </div>

        {currentSection === "demographics" && (
          <DemographicSection 
            question={getDemographicQuestions(language)[currentDemographicIndex]}
            onResponse={handleDemographicResponse}
            canGoBack={currentDemographicIndex > 0}
            onGoBack={() => setCurrentDemographicIndex(prev => prev - 1)}
          />
        )}

        {currentSection === "ratings" && (
          <RatingsSection 
            questions={getRatingQuestions(language)}
            multiSelectQuestions={getMultiSelectQuestions(language)}
            responses={ratingResponses}
            feedbackResponses={feedbackResponses}
            multiSelectResponses={multiSelectResponses}
            collaborationFeedback={collaborationFeedback}
            additionalComments={additionalComments}
            onRatingChange={handleRatingResponse}
            onFeedbackChange={handleFeedbackResponse}
            onMultiSelectChange={handleMultiSelectResponse}
            onCollaborationFeedbackChange={setCollaborationFeedback}
            onAdditionalCommentsChange={setAdditionalComments}
            onSubmit={handleSubmit}
            canSubmit={isAllQuestionsAnswered()}
            isSubmitting={isSubmitting}
            language={language}
            onGoBack={() => {
              setCurrentDemographicIndex(getDemographicQuestions(language).length - 1);
              setCurrentSection("demographics");
            }}
          />
        )}
      </div>
    </div>
  );
}

// Section Components
interface DemographicSectionProps {
  question: DemographicQuestion;
  onResponse: (value: string) => void;
  canGoBack: boolean;
  onGoBack: () => void;
}

function DemographicSection({ question, onResponse, canGoBack, onGoBack }: DemographicSectionProps) {
  const isDivisionQuestion = question.id === "division";
  const isContinentQuestion = question.id === "continent";
  
  return (
    <Card>
      <CardHeader>
        <CardTitle>{question.text}</CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <RadioGroup onValueChange={onResponse}>
          {question.options.map((option) => (
            <div key={option.value} className="flex items-center space-x-4 p-4 rounded-lg hover:bg-muted/50 transition-colors touch-manipulation border">
              <RadioGroupItem value={option.value} id={option.value} className="min-w-[20px] min-h-[20px]" />
              
              {isDivisionQuestion && (option.value === "equipment" || option.value === "magnets") && (
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
        {canGoBack && (
          <Button variant="outline" onClick={onGoBack} className="touch-manipulation min-h-[48px]">
            Previous
          </Button>
        )}
      </CardContent>
    </Card>
  );
}

interface RatingsSectionProps {
  questions: RatingQuestion[];
  multiSelectQuestions: MultiSelectQuestion[];
  responses: Record<string, number>;
  feedbackResponses: Record<string, string>;
  multiSelectResponses: Record<string, string[]>;
  collaborationFeedback: string;
  additionalComments: string;
  onRatingChange: (questionId: string, rating: number) => void;
  onFeedbackChange: (questionId: string, feedback: string) => void;
  onMultiSelectChange: (questionId: string, selectedOptions: string[]) => void;
  onCollaborationFeedbackChange: (feedback: string) => void;
  onAdditionalCommentsChange: (comments: string) => void;
  onSubmit: () => void;
  canSubmit: boolean;
  onGoBack: () => void;
  isSubmitting?: boolean;
  language: 'en' | 'es' | 'fr' | 'it';
}

function RatingsSection({ 
  questions, 
  multiSelectQuestions,
  responses, 
  feedbackResponses,
  multiSelectResponses,
  collaborationFeedback,
  additionalComments,
  onRatingChange, 
  onFeedbackChange,
  onMultiSelectChange,
  onCollaborationFeedbackChange,
  onAdditionalCommentsChange,
  onSubmit,
  canSubmit,
  onGoBack,
  isSubmitting = false,
  language
}: RatingsSectionProps) {
  // Define the desired section order
  const sectionOrder = [
    "Engagement & Job Satisfaction",
    "Leadership & Communication",
    "Training & Development",
    "Teamwork & Culture",
    "Safety & Work Environment",
    "Collaboration & Cross-Functional Work",
    "Scheduling & Workload",
    "Tools, Equipment & Processes"
  ];

  // Combine rating questions and multi-select questions by section
  const allQuestions = [...questions, ...multiSelectQuestions];
  const groupedQuestions = allQuestions.reduce((acc, question) => {
    if (!acc[question.section]) {
      acc[question.section] = [];
    }
    acc[question.section].push(question);
    return acc;
  }, {} as Record<string, (RatingQuestion | MultiSelectQuestion)[]>);

  // Sort sections based on the defined order
  const sortedSections = sectionOrder.filter(section => groupedQuestions[section]);

  return (
    <div className="space-y-8">
      {sortedSections.map((section) => {
        const sectionQuestions = groupedQuestions[section];
        return (
          <Card key={section}>
            <CardHeader>
              <CardTitle className="text-xl">{section}</CardTitle>
            </CardHeader>
            <CardContent className="space-y-6">
              {sectionQuestions.map((question) => (
              <div key={question.id} className="space-y-4">
                {'feedbackPrompt' in question ? (
                  // Rating Question
                  <div>
                    <h3 className="font-medium mb-4">{question.text}</h3>
                    
                    {/* Rating Scale with Emojis */}
                    <div className="flex justify-center space-x-2 md:space-x-4 mb-4">
                      {[1, 2, 3, 4, 5].map((rating) => {
                        const currentRatingLabels = getRatingLabels(language);
                        
                        return (
                          <button
                            key={rating}
                            onClick={() => onRatingChange(question.id, rating)}
                            className={cn(
                              "flex flex-col items-center p-2 md:p-3 rounded-lg border-2 transition-all touch-manipulation",
                              "select-none focus:outline-none focus:ring-2 focus:ring-primary min-h-[80px] min-w-[60px]",
                              "active:scale-95 hover:scale-105",
                              responses[question.id] === rating
                                ? "border-primary bg-primary/10 ring-2 ring-primary"
                                : "border-border hover:border-primary/50 active:bg-muted/70"
                            )}
                            onTouchStart={(e) => e.preventDefault()}
                          >
                            <span className="text-xl md:text-2xl mb-1 select-none">{ratingEmojis[rating as keyof typeof ratingEmojis]}</span>
                            <span className="text-xs font-medium select-none">{rating}</span>
                            <span className="text-xs text-muted-foreground text-center select-none leading-tight">
                              {currentRatingLabels[rating as keyof typeof currentRatingLabels]}
                            </span>
                          </button>
                        );
                      })}
                    </div>

                    {/* Feedback box for low scores - REQUIRED for all 1-2 ratings */}
                    {responses[question.id] && responses[question.id] <= 2 && (
                      <div className="space-y-2">
                        <Label htmlFor={`feedback-${question.id}`} className="text-sm font-medium text-destructive">
                          {languageContent[language].lowRatingFeedback} *
                        </Label>
                        <Textarea
                          id={`feedback-${question.id}`}
                          placeholder={languageContent[language].lowRatingFeedback}
                          value={feedbackResponses[question.id] || ""}
                          onChange={(e) => onFeedbackChange(question.id, e.target.value)}
                          className="min-h-[100px] touch-manipulation border-destructive/50"
                          required
                        />
                      </div>
                    )}
                  </div>
                ) : (
                  // Multi-Select Question
                  <div>
                    <h3 className="font-medium mb-4">{question.text}</h3>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                      {question.options?.map((option) => (
                        <div key={option.value} className="flex items-center space-x-2 p-3 rounded-lg border hover:bg-muted/50 transition-colors touch-manipulation">
                          <input
                            type="checkbox"
                            id={`${question.id}-${option.value}`}
                            checked={multiSelectResponses[question.id]?.includes(option.value) || false}
                            onChange={(e) => {
                              const currentSelections = multiSelectResponses[question.id] || [];
                              if (e.target.checked) {
                                onMultiSelectChange(question.id, [...currentSelections, option.value]);
                              } else {
                                onMultiSelectChange(question.id, currentSelections.filter(v => v !== option.value));
                              }
                            }}
                            className="min-w-[20px] min-h-[20px] rounded border-2 border-muted-foreground checked:bg-primary checked:border-primary focus:ring-2 focus:ring-primary"
                          />
                          <Label htmlFor={`${question.id}-${option.value}`} className="flex-1 cursor-pointer select-none">
                            {option.label}
                          </Label>
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            ))}
          </CardContent>
        </Card>
      )}))}

      {/* Additional Comments Section */}
      <Card>
        <CardHeader>
          <CardTitle className="text-xl">Additional Comments</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            <h3 className="font-medium">Please feel free to share any other thoughts or comments you would like to share.</h3>
            <Textarea
              placeholder="Your additional thoughts and comments..."
              value={additionalComments}
              onChange={(e) => onAdditionalCommentsChange(e.target.value)}
              className="min-h-[120px] touch-manipulation"
            />
          </div>
        </CardContent>
      </Card>

      <div className="flex flex-col sm:flex-row gap-4 mt-8">
        <Button variant="outline" onClick={onGoBack} disabled={isSubmitting} className="touch-manipulation min-h-[48px]">
          Previous
        </Button>
        <Button 
          onClick={onSubmit} 
          disabled={!canSubmit || isSubmitting}
          className="flex-1 min-h-[48px] touch-manipulation"
        >
          {isSubmitting ? (
            <div className="flex items-center gap-2">
              <LoaderIcon className="h-4 w-4 animate-spin" />
              Submitting...
            </div>
          ) : (
            "Submit Survey"
          )}
        </Button>
      </div>
    </div>
  );
}