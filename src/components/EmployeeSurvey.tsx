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
    continentQuestion: "Which Continent is your primary work location?",
    divisionQuestion: "Which Division of Bunting do you work in?",
    roleQuestion: "Which best explains your role?",
    northAmerica: "North America",
    europe: "Europe",
    equipment: "Equipment",
    magnets: "Magnets",
    both: "Both",
    salesMarketing: "Sales/Marketing/Product",
    operations: "Operations/Engineering/Production",
    admin: "Admin/HR/Finance",
    // Rating questions
    jobSatisfaction: "How satisfied are you with your job?",
    trainingSatisfaction: "How satisfied are you with the training provided for your current role?",
    workLifeBalance: "How would you rate your current work-life balance?",
    communicationClarity: "How clear is the communication you receive from leadership regarding company goals and objectives?",
    managerAlignment: "Does your manager help connect your work to business outcomes?",
    usUkCollaboration: "How are the overall communication and collaboration between the US and UK offices?",
    crossFunctionalCollaboration: "Rate the quality of cross-functional collaboration in your work environment.",
    strategicConfidence: "Rate your confidence in the company's 3-year strategic direction.",
    advancementOpportunities: "Do you see clear advancement opportunities aligned with emerging skill needs?",
    workplaceSafety: "How safe do you feel in your work environment?",
    recommendCompany: "How likely are you to recommend this company as a place to work?",
    manualProcessesFocus: "I am able to focus on higher-impact work rather than spending time on manual processes.",
    processImprovementComfort: "I feel comfortable proposing process improvements.",
    // Multi-select questions
    communicationPreferences: "Which communication styles do you prefer?",
    motivationFactors: "What motivates you to stay with the company?",
    informationPreferences: "What information would you like to receive more from the company?",
    // Options
    companywideEmails: "Companywide emails",
    quarterlyTownHalls: "Quarterly Town halls",
    companyIntranet: "Company Intranet",
    digitalSignage: "Digital Signage",
    printedSignage: "Printed Signage",
    teamMeetings: "Team meetings",
    compensation: "Compensation",
    benefitsPackage: "Benefits package",
    jobSatisfactionOpt: "Job satisfaction",
    thePeople: "The people",
    growthOpportunities: "Growth opportunities",
    companyFuture: "Company's future",
    communicationTransparency: "Communication and transparency",
    strategicDirection: "Strategic direction",
    financialIncentives: "Financial incentives",
    operationalUpdates: "Operational updates",
    interdepartmentalKnowledge: "Interdepartmental knowledge",
    careerDevelopment: "Career development",
    itSystems: "IT systems",
    // Submit
    submitSurvey: "Submit Survey",
    next: "Next",
    // Ratings
    veryDissatisfied: "Very Dissatisfied",
    dissatisfied: "Dissatisfied",
    neutral: "Neutral",
    satisfied: "Satisfied",
    verySatisfied: "Very Satisfied",
    stronglyDisagree: "Strongly Disagree",
    disagree: "Disagree",
    agree: "Agree",
    stronglyAgree: "Strongly Agree",
    veryUnclear: "Very Unclear",
    unclear: "Unclear",
    clear: "Clear",
    veryClear: "Very Clear",
    never: "Never",
    rarely: "Rarely",
    sometimes: "Sometimes",
    often: "Often",
    always: "Always",
    veryPoor: "Very Poor",
    poor: "Poor",
    good: "Good",
    excellent: "Excellent",
    noConfidence: "No Confidence",
    lowConfidence: "Low Confidence",
    confident: "Confident",
    veryConfident: "Very Confident",
    notAtAll: "Not at All",
    veryUnsafe: "Very unsafe",
    unsafe: "Unsafe",
    safe: "Safe",
    verySafe: "Very safe",
    veryUnlikely: "Very Unlikely",
    unlikely: "Unlikely",
    likely: "Likely",
    veryLikely: "Very Likely"
  },
  es: {
    title: "Encuesta de Compromiso del Empleado",
    subtitle: "Sus comentarios nos ayudan a mejorar nuestra cultura laboral",
    languageLabel: "Idioma",
    getStarted: "Comenzar",
    privacyNotice: "Aviso de Privacidad",
    // Demographics
    continentQuestion: "¿En qué continente se encuentra su lugar de trabajo principal?",
    divisionQuestion: "¿En qué división de Bunting trabajas?",
    roleQuestion: "¿Cuál describe mejor su papel?",
    northAmerica: "América del Norte",
    europe: "Europa",
    equipment: "Equipo",
    magnets: "Imanes",
    both: "Ambos",
    salesMarketing: "Ventas/Marketing/Producto",
    operations: "Operaciones/Ingeniería/Producción",
    admin: "Administración/RRHH/Finanzas",
    // Rating questions
    jobSatisfaction: "¿Qué tan satisfecho está con su trabajo?",
    trainingSatisfaction: "¿Qué tan satisfecho está con la capacitación proporcionada para su rol actual?",
    workLifeBalance: "¿Cómo calificaría su equilibrio actual entre trabajo y vida personal?",
    communicationClarity: "¿Qué tan clara es la comunicación que recibe del liderazgo sobre los objetivos y metas de la empresa?",
    managerAlignment: "¿Su gerente le ayuda a conectar su trabajo con los resultados del negocio?",
    usUkCollaboration: "¿Cómo es la comunicación y colaboración general entre las oficinas de EE.UU. y Reino Unido?",
    crossFunctionalCollaboration: "Califique la calidad de la colaboración interfuncional en su ambiente de trabajo.",
    strategicConfidence: "Califique su confianza en la dirección estratégica de 3 años de la empresa.",
    advancementOpportunities: "¿Ve oportunidades claras de avance alineadas con las necesidades de habilidades emergentes?",
    workplaceSafety: "¿Qué tan seguro se siente en su ambiente de trabajo?",
    recommendCompany: "¿Qué tan probable es que recomiende esta empresa como lugar de trabajo?",
    manualProcessesFocus: "Puedo enfocarme en trabajo de mayor impacto en lugar de pasar tiempo en procesos manuales.",
    processImprovementComfort: "Me siento cómodo proponiendo mejoras de procesos.",
    // Multi-select questions
    communicationPreferences: "¿Qué estilos de comunicación prefiere?",
    motivationFactors: "¿Qué lo motiva a permanecer en la empresa?",
    informationPreferences: "¿Qué información le gustaría recibir más de la empresa?",
    // Options
    companywideEmails: "Correos electrónicos para toda la empresa",
    quarterlyTownHalls: "Reuniones trimestrales generales",
    companyIntranet: "Intranet de la empresa",
    digitalSignage: "Señalización digital",
    printedSignage: "Señalización impresa",
    teamMeetings: "Reuniones de equipo",
    compensation: "Compensación",
    benefitsPackage: "Paquete de beneficios",
    jobSatisfactionOpt: "Satisfacción laboral",
    thePeople: "La gente",
    growthOpportunities: "Oportunidades de crecimiento",
    companyFuture: "Futuro de la empresa",
    communicationTransparency: "Comunicación y transparencia",
    strategicDirection: "Dirección estratégica",
    financialIncentives: "Incentivos financieros",
    operationalUpdates: "Actualizaciones operativas",
    interdepartmentalKnowledge: "Conocimiento interdepartamental",
    careerDevelopment: "Desarrollo profesional",
    itSystems: "Sistemas de TI",
    // Submit
    submitSurvey: "Enviar Encuesta",
    next: "Siguiente",
    // Ratings
    veryDissatisfied: "Muy Insatisfecho",
    dissatisfied: "Insatisfecho",
    neutral: "Neutral",
    satisfied: "Satisfecho",
    verySatisfied: "Muy Satisfecho",
    stronglyDisagree: "Totalmente en Desacuerdo",
    disagree: "En Desacuerdo",
    agree: "De Acuerdo",
    stronglyAgree: "Totalmente de Acuerdo",
    veryUnclear: "Muy Poco Claro",
    unclear: "Poco Claro",
    clear: "Claro",
    veryClear: "Muy Claro",
    never: "Nunca",
    rarely: "Raramente",
    sometimes: "A veces",
    often: "A menudo",
    always: "Siempre",
    veryPoor: "Muy Malo",
    poor: "Malo",
    good: "Bueno",
    excellent: "Excelente",
    noConfidence: "Sin Confianza",
    lowConfidence: "Baja Confianza",
    confident: "Confiado",
    veryConfident: "Muy Confiado",
    notAtAll: "Para Nada",
    veryUnsafe: "Muy inseguro",
    unsafe: "Inseguro",
    safe: "Seguro",
    verySafe: "Muy seguro",
    veryUnlikely: "Muy Poco Probable",
    unlikely: "Poco Probable",
    likely: "Probable",
    veryLikely: "Muy Probable"
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
    section: "Collaboration & Cross-Functional Work",
    options: [
      { value: "compensation", label: languageContent[language].compensation },
      { value: "benefits-package", label: languageContent[language].benefitsPackage },
      { value: "job-satisfaction", label: languageContent[language].jobSatisfactionOpt },
      { value: "the-people", label: languageContent[language].thePeople },
      { value: "growth-opportunities", label: languageContent[language].growthOpportunities },
      { value: "company-future", label: languageContent[language].companyFuture }
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
      { value: "operational-updates", label: languageContent[language].operationalUpdates },
      { value: "interdepartmental-knowledge", label: languageContent[language].interdepartmentalKnowledge },
      { value: "career-development", label: languageContent[language].careerDevelopment },
      { value: "it-systems", label: languageContent[language].itSystems }
    ]
  }
];

// Remove the old static array and replace with function
const getRatingQuestions = (language: string): RatingQuestion[] => [
  // 1. Job & Role Satisfaction (3 questions)
  {
    id: "job-satisfaction",
    text: languageContent[language].jobSatisfaction,
    section: "Job & Role Satisfaction",
    feedbackPrompt: "Please explain why you feel dissatisfied with your job."
  },
  {
    id: "training-satisfaction",
    text: languageContent[language].trainingSatisfaction,
    section: "Job & Role Satisfaction",
    feedbackPrompt: "Please describe gaps in training or support you've experienced."
  },
  {
    id: "work-life-balance",
    text: languageContent[language].workLifeBalance,
    section: "Job & Role Satisfaction",
    feedbackPrompt: "Please explain what affects your work-life balance."
  },
  
  // 2. Leadership & Communication (2 questions)
  {
    id: "leadership-communication-clarity",
    text: languageContent[language].communicationClarity,
    section: "Leadership & Communication",
    feedbackPrompt: "Please describe how communication could be improved."
  },
  {
    id: "manager-business-connection",
    text: languageContent[language].managerAlignment,
    section: "Leadership & Communication",
    feedbackPrompt: "Please explain how your work could be better aligned with outcomes."
  },
  
  // 3. Collaboration & Cross-Functional Work (2 questions)
  {
    id: "us-uk-collaboration",
    text: languageContent[language].usUkCollaboration,
    section: "Collaboration & Cross-Functional Work",
    feedbackPrompt: "Please describe the main obstacles to collaboration between offices."
  },
  {
    id: "cross-functional-collaboration",
    text: languageContent[language].crossFunctionalCollaboration,
    section: "Collaboration & Cross-Functional Work",
    feedbackPrompt: "Please provide examples of where cross-functional work could be improved."
  },
  
  // 4. Growth & Strategic Alignment (2 questions)
  {
    id: "strategic-direction-confidence",
    text: languageContent[language].strategicConfidence,
    section: "Growth & Strategic Alignment",
    feedbackPrompt: "Please explain your concerns about the strategic direction."
  },
  {
    id: "advancement-opportunities",
    text: languageContent[language].advancementOpportunities,
    section: "Growth & Strategic Alignment",
    feedbackPrompt: "Please describe what's missing in career growth or skill development."
  },
  
  // 5. Workplace Experience (2 questions)
  {
    id: "workplace-safety",
    text: languageContent[language].workplaceSafety,
    section: "Workplace Experience",
    feedbackPrompt: "Please explain any safety concerns you have."
  },
  {
    id: "company-recommendation",
    text: languageContent[language].recommendCompany,
    section: "Workplace Experience",
    feedbackPrompt: "Please share reasons you wouldn't recommend the company."
  },
  
  // 6. Process Efficiency & Innovation (2 questions) - Moved to bottom with agreement scale
  {
    id: "manual-processes-impact",
    text: languageContent[language].manualProcessesFocus,
    section: "Process Efficiency & Innovation",
    feedbackPrompt: "Please describe the manual processes or tasks that slow your work."
  },
  {
    id: "process-improvement-comfort",
    text: languageContent[language].processImprovementComfort,
    section: "Process Efficiency & Innovation",
    feedbackPrompt: "Please explain what prevents you from suggesting improvements."
  }
];

const getDemographicQuestions = (language: string): DemographicQuestion[] => [
  {
    id: "continent",
    text: languageContent[language].continentQuestion,
    options: [
      { value: "north-america", label: languageContent[language].northAmerica },
      { value: "europe", label: languageContent[language].europe }
    ]
  },
  {
    id: "division",
    text: languageContent[language].divisionQuestion,
    options: [
      { value: "equipment", label: languageContent[language].equipment },
      { value: "magnets", label: languageContent[language].magnets },
      { value: "both", label: languageContent[language].both }
    ]
  },
  {
    id: "role",
    text: languageContent[language].roleQuestion,
    options: [
      { value: "sales-marketing", label: languageContent[language].salesMarketing },
      { value: "operations", label: languageContent[language].operations },
      { value: "admin", label: languageContent[language].admin }
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

// Emojis for 1-5 scale
const ratingEmojis = {
  satisfaction: {
    1: "😢",
    2: "😕", 
    3: "😐",
    4: "😊",
    5: "😃"
  },
  agreement: {
    1: "😤",
    2: "😑", 
    3: "😐",
    4: "😊",
    5: "😃"
  }
};

const getRatingLabels = (language: string) => ({
  satisfaction: {
    1: languageContent[language].veryDissatisfied,
    2: languageContent[language].dissatisfied, 
    3: languageContent[language].neutral,
    4: languageContent[language].satisfied,
    5: languageContent[language].verySatisfied
  },
  agreement: {
    1: languageContent[language].stronglyDisagree,
    2: languageContent[language].disagree, 
    3: languageContent[language].neutral,
    4: languageContent[language].agree,
    5: languageContent[language].stronglyAgree
  },
  leadership: {
    "leadership-communication-clarity": {
      1: languageContent[language].veryUnclear,
      2: languageContent[language].unclear,
      3: languageContent[language].neutral, 
      4: languageContent[language].clear,
      5: languageContent[language].veryClear
    },
    "manager-business-connection": {
      1: languageContent[language].never,
      2: languageContent[language].rarely,
      3: languageContent[language].sometimes,
      4: languageContent[language].often,
      5: languageContent[language].always
    }
  },
  collaboration: {
    "us-uk-collaboration": {
      1: languageContent[language].veryPoor,
      2: languageContent[language].poor,
      3: languageContent[language].neutral,
      4: languageContent[language].good, 
      5: languageContent[language].excellent
    },
    "cross-functional-collaboration": {
      1: languageContent[language].veryPoor,
      2: languageContent[language].poor, 
      3: languageContent[language].neutral,
      4: languageContent[language].good,
      5: languageContent[language].excellent
    }
  },
  growth: {
    "strategic-direction-confidence": {
      1: languageContent[language].noConfidence,
      2: languageContent[language].lowConfidence,
      3: languageContent[language].neutral,
      4: languageContent[language].confident,
      5: languageContent[language].veryConfident
    },
    "advancement-opportunities": {
      1: languageContent[language].notAtAll,
      2: languageContent[language].rarely,
      3: languageContent[language].sometimes, 
      4: languageContent[language].often,
      5: languageContent[language].always
    }
  },
  workplace: {
    "workplace-safety": {
      1: languageContent[language].veryUnsafe,
      2: languageContent[language].unsafe,
      3: languageContent[language].neutral,
      4: languageContent[language].safe,
      5: languageContent[language].verySafe
    },
    "company-recommendation": {
      1: languageContent[language].veryUnlikely,
      2: languageContent[language].unlikely,
      3: languageContent[language].neutral,
      4: languageContent[language].likely,
      5: languageContent[language].veryLikely
    }
  }
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
  const [language, setLanguage] = useState<'en' | 'es'>('en');
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
    return allRatingsAnswered && allMultiSelectAnswered;
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

      // Map responses to database columns
      const surveyData = {
        session_id: sessionId,
        continent: responses.continent === 'north-america' ? 'North America' : 'Europe',
        division: responses.division === 'equipment' ? 'Equipment' : 
                  responses.division === 'magnets' ? 'Magnets' : 'Both',
        role: responses.role === 'sales-marketing' ? 'Sales/Marketing/Product' :
              responses.role === 'operations' ? 'Operations/Engineering/Production' : 'Admin/HR/Finance',
        
        // Rating responses - updated to remove leadership-openness
        job_satisfaction: ratingResponses['job-satisfaction'],
        training_satisfaction: ratingResponses['training-satisfaction'],
        work_life_balance: ratingResponses['work-life-balance'],
        communication_clarity: ratingResponses['leadership-communication-clarity'],
        leadership_openness: null, // Removed question
        manager_alignment: ratingResponses['manager-business-connection'],
        us_uk_collaboration: ratingResponses['us-uk-collaboration'],
        cross_functional_collaboration: ratingResponses['cross-functional-collaboration'],
        strategic_confidence: ratingResponses['strategic-direction-confidence'],
        advancement_opportunities: ratingResponses['advancement-opportunities'],
        workplace_safety: ratingResponses['workplace-safety'],
        recommend_company: ratingResponses['company-recommendation'],
        
        // Process efficiency (agreement scale) - now only 2 questions
        manual_processes_focus: ratingResponses['manual-processes-impact'],
        comfortable_suggesting_improvements: ratingResponses['process-improvement-comfort'],
        failed_experiments_learning: null, // Removed question
        
        // Multi-select responses
        communication_preferences: multiSelectResponses['communication-preferences'] || [],
        motivation_factors: multiSelectResponses['motivation-factors'] || [],
        information_preferences: multiSelectResponses['information-preferences'] || [],
        
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
                English
              </Button>
              <Button
                variant={language === 'es' ? 'default' : 'outline'}
                size="sm"
                onClick={() => setLanguage('es')}
              >
                Español
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
  language: 'en' | 'es';
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
  // Combine rating questions and multi-select questions by section
  const allQuestions = [...questions, ...multiSelectQuestions];
  const groupedQuestions = allQuestions.reduce((acc, question) => {
    if (!acc[question.section]) {
      acc[question.section] = [];
    }
    acc[question.section].push(question);
    return acc;
  }, {} as Record<string, (RatingQuestion | MultiSelectQuestion)[]>);

  return (
    <div className="space-y-8">
      {Object.entries(groupedQuestions).map(([section, sectionQuestions]) => (
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
                        const isAgreementScale = question.section === "Process Efficiency & Innovation";
                        const isLeadershipQuestion = question.section === "Leadership & Communication";
                        const isCollaborationQuestion = question.section === "Collaboration & Cross-Functional Work";
                        const isGrowthQuestion = question.section === "Growth & Strategic Alignment";
                        const isWorkplaceQuestion = question.section === "Workplace Experience";
                        
                        const currentRatingLabels = getRatingLabels(language);
                        
                        let emojiSet, labelSet;
                        
                        if (isLeadershipQuestion) {
                          emojiSet = ratingEmojis.satisfaction;
                          labelSet = currentRatingLabels.leadership[question.id as 'leadership1'] || currentRatingLabels.satisfaction;
                        } else if (isCollaborationQuestion) {
                          emojiSet = ratingEmojis.satisfaction;
                          labelSet = currentRatingLabels.collaboration[question.id as 'collaboration1'] || currentRatingLabels.satisfaction;
                        } else if (isGrowthQuestion) {
                          emojiSet = ratingEmojis.satisfaction;
                          labelSet = currentRatingLabels.growth[question.id as 'growth1'] || currentRatingLabels.satisfaction;
                        } else if (isWorkplaceQuestion) {
                          emojiSet = ratingEmojis.satisfaction;
                          labelSet = currentRatingLabels.workplace[question.id as 'workplace1'] || currentRatingLabels.satisfaction;
                        } else if (isAgreementScale) {
                          emojiSet = ratingEmojis.agreement;
                          labelSet = currentRatingLabels.agreement;
                        } else {
                          emojiSet = ratingEmojis.satisfaction;
                          labelSet = currentRatingLabels.satisfaction;
                        }
                        
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
                            <span className="text-xl md:text-2xl mb-1 select-none">{emojiSet[rating as keyof typeof emojiSet]}</span>
                            <span className="text-xs font-medium select-none">{rating}</span>
                            <span className="text-xs text-muted-foreground text-center select-none leading-tight">
                              {(isLeadershipQuestion || isCollaborationQuestion || isGrowthQuestion || isWorkplaceQuestion) ? labelSet[rating as keyof typeof labelSet] : labelSet[rating as keyof typeof labelSet]}
                            </span>
                          </button>
                        );
                      })}
                    </div>

                    {/* Feedback box for low scores */}
                    {responses[question.id] && (
                      (question.section === "Process Efficiency & Innovation" ? responses[question.id] <= 2 : responses[question.id] <= 2)
                    ) && (
                      <div className="space-y-2">
                        <Label htmlFor={`feedback-${question.id}`} className="text-sm font-medium">
                          {question.feedbackPrompt}
                        </Label>
                        <Textarea
                          id={`feedback-${question.id}`}
                          placeholder="Your feedback helps us improve..."
                          value={feedbackResponses[question.id] || ""}
                          onChange={(e) => onFeedbackChange(question.id, e.target.value)}
                          className="min-h-[100px] touch-manipulation"
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
      ))}

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