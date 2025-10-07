import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Progress } from "@/components/ui/progress";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, PieChart, Pie, Cell } from "recharts";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Globe } from "lucide-react";

// Enhanced color palette using design system tokens
const CHART_COLORS = [
  'hsl(var(--chart-primary))',
  'hsl(var(--chart-secondary))',  
  'hsl(var(--chart-tertiary))',
  'hsl(var(--chart-quaternary))',
  'hsl(var(--chart-quinary))',
  'hsl(var(--chart-senary))',
  'hsl(var(--chart-septenary))',
  'hsl(var(--chart-octonary))',
];
import { ChevronLeftIcon, ChevronDownIcon, ChevronRightIcon, UsersIcon, TrendingUpIcon, AlertTriangleIcon, LockIcon, UnlockIcon, BrainIcon, LoaderIcon } from "lucide-react";
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from "@/components/ui/collapsible";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import buntingLogo from "@/assets/bunting-logo-2.png";
import magnetApplicationsLogo from "@/assets/magnet-applications-logo-2.png";

interface SurveyResponse {
  id: string;
  continent: string;
  division: string;
  role: string;
  job_satisfaction?: number;
  training_satisfaction?: number;
  work_life_balance?: number;
  communication_clarity?: number;
  manager_alignment?: number;
  leadership_openness?: number;
  performance_awareness?: number;
  cross_functional_collaboration?: number;
  strategic_confidence?: number;
  advancement_opportunities?: number;
  workplace_safety?: number;
  safety_reporting_comfort?: number;
  recommend_company?: number;
  manual_processes_focus?: number;
  comfortable_suggesting_improvements?: number;
  workload_manageability?: number;
  tools_equipment_quality?: number;
  company_value_alignment?: number;
  team_morale?: number;
  pride_in_work?: number;
  communication_preferences?: string[];
  motivation_factors?: string[];
  information_preferences?: string[];
  follow_up_responses?: any;
  collaboration_feedback?: string;
  additional_comments?: string;
  submitted_at: string;
}

const COLORS = ['hsl(var(--primary))', 'hsl(var(--secondary))', 'hsl(var(--accent))', 'hsl(var(--muted))', 'hsl(var(--success))', 'hsl(var(--warning))'];

// Translations
const translations = {
  en: {
    backToSurvey: "Back to Survey",
    totalResponses: "Total Responses",
    avgJobSatisfaction: "Avg. Job Satisfaction",
    comments: "Comments",
    completionRate: "Completion Rate",
    noSurveyData: "No Survey Data",
    noResponsesYet: "No survey responses have been submitted yet. Complete the survey to see analytics.",
    language: "Language",
    viewComments: "View Comments",
    generateAIAnalysis: "Generate AI Analysis",
    adminPasscode: "Admin Passcode",
    enterPasscode: "Enter the admin passcode to access comments and AI analysis",
    unlock: "Unlock",
    cancel: "Cancel",
    invalidPasscode: "Invalid passcode",
    checkPasscode: "Please check your admin passcode",
    adminAccessGranted: "Admin access granted",
    canViewComments: "You can now view comments and generate AI analysis",
    insufficientData: "Insufficient data",
    aiRequires10: "AI analysis requires at least 10 responses. Currently have",
    responses: "responses",
    excellent: "Excellent",
    good: "Good",
    neutral: "Neutral",
    poor: "Poor",
    critical: "Critical",
    // Demographics
    demographics: "Demographics Breakdown",
    byContinent: "By Continent",
    byDivision: "By Division",
    byRole: "By Role",
    northAmerica: "North America",
    europe: "Europe",
    magnetics: "Magnetics",
    equipment: "Equipment",
    other: "Other",
    both: "Both",
    salesMarketing: "Sales/Marketing/Product",
    operations: "Operations/Engineering/Production",
    adminHR: "Admin/HR/Finance",
    operationsDistribution: "Operations & Distribution",
    engineeringServices: "Engineering & Services",
    salesFinance: "Sales & Finance",
    adminManagement: "Admin & Management",
    // Sections
    engagementSatisfaction: "Engagement & Job Satisfaction",
    engagementDesc: "Overall satisfaction and engagement with the company",
    leadershipCommunication: "Leadership & Communication",
    leadershipDesc: "Management effectiveness and communication quality",
    trainingDevelopment: "Training & Development",
    trainingDesc: "Professional growth and learning opportunities",
    teamworkCulture: "Teamwork & Culture",
    teamworkDesc: "Collaboration and workplace culture",
    safetyEnvironment: "Safety & Work Environment",
    safetyDesc: "Workplace safety and environmental conditions",
    schedulingWorkload: "Scheduling & Workload",
    schedulingDesc: "Work-life balance and workload management",
    toolsProcesses: "Tools, Equipment & Processes",
    toolsDesc: "Resources and continuous improvement",
    preferencesMotivation: "Preferences & Motivation",
    preferencesDesc: "Communication styles and motivational factors",
    // Questions
    jobSatisfaction: "Job Satisfaction",
    recommendCompany: "Would Recommend Company",
    confidenceFuture: "Confidence in Future Direction",
    clearExpectations: "Clear Expectations from Leadership",
    performanceAwareness: "Awareness of Performance",
    infoQuality: "Information Communication Quality",
    managerFeedback: "Manager Feedback & Alignment",
    trainingQuality: "Training & Development Quality",
    growthOpportunities: "Growth Opportunities",
    crossFunctional: "Cross-Functional Cooperation",
    teamMorale: "Team Morale",
    prideInWork: "Pride in Work",
    workplaceSafety: "Workplace Safety Focus",
    safetyReporting: "Safety Concern Reporting Comfort",
    workloadManage: "Workload Manageability",
    workLifeBalance: "Work-Life Balance",
    toolsEquipment: "Tools & Equipment Quality",
    processImprovement: "Process Improvement Focus",
    feelingValued: "Feeling Valued by Company",
    comfortSuggesting: "Comfort Suggesting Changes",
    communicationPrefs: "Communication Preferences",
    motivationFactors: "Motivation Factors",
    informationPrefs: "Information Preferences",
    commentsAndFeedback: "Comments & Feedback (Admin Only)",
    response: "Response",
    collaborationFeedback: "Collaboration Feedback:",
    additionalCommentsLabel: "Additional Comments:",
    aiAnalysisReport: "AI Analysis Report"
  },
  es: {
    backToSurvey: "Volver a la Encuesta",
    totalResponses: "Respuestas Totales",
    avgJobSatisfaction: "Satisfacción Laboral Promedio",
    comments: "Comentarios",
    completionRate: "Tasa de Finalización",
    noSurveyData: "Sin Datos de Encuesta",
    noResponsesYet: "Aún no se han enviado respuestas de encuestas. Complete la encuesta para ver análisis.",
    language: "Idioma",
    viewComments: "Ver Comentarios",
    generateAIAnalysis: "Generar Análisis AI",
    adminPasscode: "Código de Administrador",
    enterPasscode: "Ingrese el código de administrador para acceder a comentarios y análisis AI",
    unlock: "Desbloquear",
    cancel: "Cancelar",
    invalidPasscode: "Código inválido",
    checkPasscode: "Por favor verifique su código de administrador",
    adminAccessGranted: "Acceso de administrador concedido",
    canViewComments: "Ahora puede ver comentarios y generar análisis AI",
    insufficientData: "Datos insuficientes",
    aiRequires10: "El análisis AI requiere al menos 10 respuestas. Actualmente tiene",
    responses: "respuestas",
    excellent: "Excelente",
    good: "Bueno",
    neutral: "Neutral",
    poor: "Pobre",
    critical: "Crítico",
    // Demographics
    demographics: "Desglose Demográfico",
    byContinent: "Por Continente",
    byDivision: "Por División",
    byRole: "Por Rol",
    northAmerica: "América del Norte",
    europe: "Europa",
    magnetics: "Magnéticos",
    equipment: "Equipo",
    other: "Otro",
    both: "Ambos",
    salesMarketing: "Ventas/Marketing/Producto",
    operations: "Operaciones/Ingeniería/Producción",
    adminHR: "Administración/RRHH/Finanzas",
    operationsDistribution: "Operaciones y Distribución",
    engineeringServices: "Ingeniería y Servicios",
    salesFinance: "Ventas y Finanzas",
    adminManagement: "Administración y Gestión",
    // Sections
    engagementSatisfaction: "Compromiso y Satisfacción Laboral",
    engagementDesc: "Satisfacción general y compromiso con la empresa",
    leadershipCommunication: "Liderazgo y Comunicación",
    leadershipDesc: "Efectividad de gestión y calidad de comunicación",
    trainingDevelopment: "Capacitación y Desarrollo",
    trainingDesc: "Crecimiento profesional y oportunidades de aprendizaje",
    teamworkCulture: "Trabajo en Equipo y Cultura",
    teamworkDesc: "Colaboración y cultura laboral",
    safetyEnvironment: "Seguridad y Entorno Laboral",
    safetyDesc: "Seguridad laboral y condiciones ambientales",
    schedulingWorkload: "Programación y Carga de Trabajo",
    schedulingDesc: "Equilibrio trabajo-vida y gestión de carga laboral",
    toolsProcesses: "Herramientas, Equipo y Procesos",
    toolsDesc: "Recursos y mejora continua",
    preferencesMotivation: "Preferencias y Motivación",
    preferencesDesc: "Estilos de comunicación y factores motivacionales",
    // Questions
    jobSatisfaction: "Satisfacción Laboral",
    recommendCompany: "Recomendaría la Empresa",
    confidenceFuture: "Confianza en la Dirección Futura",
    clearExpectations: "Expectativas Claras del Liderazgo",
    performanceAwareness: "Conocimiento del Desempeño",
    infoQuality: "Calidad de Comunicación de Información",
    managerFeedback: "Retroalimentación y Alineación del Gerente",
    trainingQuality: "Calidad de Capacitación y Desarrollo",
    growthOpportunities: "Oportunidades de Crecimiento",
    crossFunctional: "Cooperación Interfuncional",
    teamMorale: "Moral del Equipo",
    prideInWork: "Orgullo en el Trabajo",
    workplaceSafety: "Enfoque en Seguridad Laboral",
    safetyReporting: "Comodidad para Reportar Preocupaciones de Seguridad",
    workloadManage: "Gestión de Carga de Trabajo",
    workLifeBalance: "Equilibrio Trabajo-Vida",
    toolsEquipment: "Calidad de Herramientas y Equipo",
    processImprovement: "Enfoque en Mejora de Procesos",
    feelingValued: "Sentirse Valorado por la Empresa",
    comfortSuggesting: "Comodidad Sugiriendo Cambios",
    communicationPrefs: "Preferencias de Comunicación",
    motivationFactors: "Factores de Motivación",
    informationPrefs: "Preferencias de Información",
    commentsAndFeedback: "Comentarios y Retroalimentación (Solo Admin)",
    response: "Respuesta",
    collaborationFeedback: "Retroalimentación sobre Colaboración:",
    additionalCommentsLabel: "Comentarios Adicionales:",
    aiAnalysisReport: "Informe de Análisis AI"
  },
  fr: {
    backToSurvey: "Retour à l'Enquête",
    totalResponses: "Réponses Totales",
    avgJobSatisfaction: "Satisfaction au Travail Moyenne",
    comments: "Commentaires",
    completionRate: "Taux de Complétion",
    noSurveyData: "Aucune Donnée d'Enquête",
    noResponsesYet: "Aucune réponse à l'enquête n'a encore été soumise. Complétez l'enquête pour voir les analyses.",
    language: "Langue",
    viewComments: "Voir les Commentaires",
    generateAIAnalysis: "Générer une Analyse AI",
    adminPasscode: "Code Administrateur",
    enterPasscode: "Entrez le code administrateur pour accéder aux commentaires et à l'analyse AI",
    unlock: "Déverrouiller",
    cancel: "Annuler",
    invalidPasscode: "Code invalide",
    checkPasscode: "Veuillez vérifier votre code administrateur",
    adminAccessGranted: "Accès administrateur accordé",
    canViewComments: "Vous pouvez maintenant voir les commentaires et générer une analyse AI",
    insufficientData: "Données insuffisantes",
    aiRequires10: "L'analyse AI nécessite au moins 10 réponses. Actuellement",
    responses: "réponses",
    excellent: "Excellent",
    good: "Bon",
    neutral: "Neutre",
    poor: "Pauvre",
    critical: "Critique",
    // Demographics
    demographics: "Répartition Démographique",
    byContinent: "Par Continent",
    byDivision: "Par Division",
    byRole: "Par Rôle",
    northAmerica: "Amérique du Nord",
    europe: "Europe",
    magnetics: "Magnétiques",
    equipment: "Équipement",
    other: "Autre",
    both: "Les deux",
    salesMarketing: "Ventes/Marketing/Produit",
    operations: "Opérations/Ingénierie/Production",
    adminHR: "Administration/RH/Finance",
    operationsDistribution: "Opérations et Distribution",
    engineeringServices: "Ingénierie et Services",
    salesFinance: "Ventes et Finance",
    adminManagement: "Administration et Gestion",
    // Sections
    engagementSatisfaction: "Engagement et Satisfaction au Travail",
    engagementDesc: "Satisfaction globale et engagement envers l'entreprise",
    leadershipCommunication: "Leadership et Communication",
    leadershipDesc: "Efficacité de la gestion et qualité de la communication",
    trainingDevelopment: "Formation et Développement",
    trainingDesc: "Croissance professionnelle et opportunités d'apprentissage",
    teamworkCulture: "Travail d'Équipe et Culture",
    teamworkDesc: "Collaboration et culture d'entreprise",
    safetyEnvironment: "Sécurité et Environnement de Travail",
    safetyDesc: "Sécurité au travail et conditions environnementales",
    schedulingWorkload: "Planification et Charge de Travail",
    schedulingDesc: "Équilibre travail-vie et gestion de la charge de travail",
    toolsProcesses: "Outils, Équipement et Processus",
    toolsDesc: "Ressources et amélioration continue",
    preferencesMotivation: "Préférences et Motivation",
    preferencesDesc: "Styles de communication et facteurs de motivation",
    // Questions
    jobSatisfaction: "Satisfaction au Travail",
    recommendCompany: "Recommanderait l'Entreprise",
    confidenceFuture: "Confiance dans la Direction Future",
    clearExpectations: "Attentes Claires du Leadership",
    performanceAwareness: "Conscience de la Performance",
    infoQuality: "Qualité de la Communication d'Information",
    managerFeedback: "Retour et Alignement du Manager",
    trainingQuality: "Qualité de la Formation et du Développement",
    growthOpportunities: "Opportunités de Croissance",
    crossFunctional: "Coopération Interfonctionnelle",
    teamMorale: "Moral de l'Équipe",
    prideInWork: "Fierté au Travail",
    workplaceSafety: "Focus sur la Sécurité au Travail",
    safetyReporting: "Confort pour Signaler des Préoccupations de Sécurité",
    workloadManage: "Gestion de la Charge de Travail",
    workLifeBalance: "Équilibre Travail-Vie",
    toolsEquipment: "Qualité des Outils et de l'Équipement",
    processImprovement: "Focus sur l'Amélioration des Processus",
    feelingValued: "Se Sentir Valorisé par l'Entreprise",
    comfortSuggesting: "Confort pour Suggérer des Changements",
    communicationPrefs: "Préférences de Communication",
    motivationFactors: "Facteurs de Motivation",
    informationPrefs: "Préférences d'Information",
    commentsAndFeedback: "Commentaires et Retours (Admin Uniquement)",
    response: "Réponse",
    collaborationFeedback: "Retour sur la Collaboration:",
    additionalCommentsLabel: "Commentaires Supplémentaires:",
    aiAnalysisReport: "Rapport d'Analyse AI"
  },
  it: {
    backToSurvey: "Torna al Sondaggio",
    totalResponses: "Risposte Totali",
    avgJobSatisfaction: "Soddisfazione Lavorativa Media",
    comments: "Commenti",
    completionRate: "Tasso di Completamento",
    noSurveyData: "Nessun Dato del Sondaggio",
    noResponsesYet: "Non sono ancora state inviate risposte al sondaggio. Completa il sondaggio per vedere le analisi.",
    language: "Lingua",
    viewComments: "Visualizza Commenti",
    generateAIAnalysis: "Genera Analisi AI",
    adminPasscode: "Codice Amministratore",
    enterPasscode: "Inserisci il codice amministratore per accedere ai commenti e all'analisi AI",
    unlock: "Sblocca",
    cancel: "Annulla",
    invalidPasscode: "Codice non valido",
    checkPasscode: "Per favore controlla il tuo codice amministratore",
    adminAccessGranted: "Accesso amministratore concesso",
    canViewComments: "Ora puoi visualizzare i commenti e generare analisi AI",
    insufficientData: "Dati insufficienti",
    aiRequires10: "L'analisi AI richiede almeno 10 risposte. Attualmente hai",
    responses: "risposte",
    excellent: "Eccellente",
    good: "Buono",
    neutral: "Neutrale",
    poor: "Scarso",
    critical: "Critico",
    // Demographics
    demographics: "Ripartizione Demografica",
    byContinent: "Per Continente",
    byDivision: "Per Divisione",
    byRole: "Per Ruolo",
    northAmerica: "Nord America",
    europe: "Europa",
    magnetics: "Magnetici",
    equipment: "Attrezzatura",
    other: "Altro",
    both: "Entrambi",
    salesMarketing: "Vendite/Marketing/Prodotto",
    operations: "Operazioni/Ingegneria/Produzione",
    adminHR: "Amministrazione/HR/Finanza",
    operationsDistribution: "Operazioni e Distribuzione",
    engineeringServices: "Ingegneria e Servizi",
    salesFinance: "Vendite e Finanza",
    adminManagement: "Amministrazione e Gestione",
    // Sections
    engagementSatisfaction: "Coinvolgimento e Soddisfazione Lavorativa",
    engagementDesc: "Soddisfazione complessiva e coinvolgimento con l'azienda",
    leadershipCommunication: "Leadership e Comunicazione",
    leadershipDesc: "Efficacia della gestione e qualità della comunicazione",
    trainingDevelopment: "Formazione e Sviluppo",
    trainingDesc: "Crescita professionale e opportunità di apprendimento",
    teamworkCulture: "Lavoro di Squadra e Cultura",
    teamworkDesc: "Collaborazione e cultura aziendale",
    safetyEnvironment: "Sicurezza e Ambiente di Lavoro",
    safetyDesc: "Sicurezza sul lavoro e condizioni ambientali",
    schedulingWorkload: "Pianificazione e Carico di Lavoro",
    schedulingDesc: "Equilibrio vita-lavoro e gestione del carico di lavoro",
    toolsProcesses: "Strumenti, Attrezzature e Processi",
    toolsDesc: "Risorse e miglioramento continuo",
    preferencesMotivation: "Preferenze e Motivazione",
    preferencesDesc: "Stili di comunicazione e fattori motivazionali",
    // Questions
    jobSatisfaction: "Soddisfazione Lavorativa",
    recommendCompany: "Raccomanderebbe l'Azienda",
    confidenceFuture: "Fiducia nella Direzione Futura",
    clearExpectations: "Aspettative Chiare dalla Leadership",
    performanceAwareness: "Consapevolezza della Performance",
    infoQuality: "Qualità della Comunicazione delle Informazioni",
    managerFeedback: "Feedback e Allineamento del Manager",
    trainingQuality: "Qualità della Formazione e dello Sviluppo",
    growthOpportunities: "Opportunità di Crescita",
    crossFunctional: "Cooperazione Interfunzionale",
    teamMorale: "Morale del Team",
    prideInWork: "Orgoglio nel Lavoro",
    workplaceSafety: "Focus sulla Sicurezza sul Lavoro",
    safetyReporting: "Comfort nel Segnalare Preoccupazioni di Sicurezza",
    workloadManage: "Gestione del Carico di Lavoro",
    workLifeBalance: "Equilibrio Vita-Lavoro",
    toolsEquipment: "Qualità degli Strumenti e dell'Attrezzatura",
    processImprovement: "Focus sul Miglioramento dei Processi",
    feelingValued: "Sentirsi Valorizzati dall'Azienda",
    comfortSuggesting: "Comfort nel Suggerire Cambiamenti",
    communicationPrefs: "Preferenze di Comunicazione",
    motivationFactors: "Fattori di Motivazione",
    informationPrefs: "Preferenze di Informazione",
    commentsAndFeedback: "Commenti e Feedback (Solo Admin)",
    response: "Risposta",
    collaborationFeedback: "Feedback sulla Collaborazione:",
    additionalCommentsLabel: "Commenti Aggiuntivi:",
    aiAnalysisReport: "Rapporto di Analisi AI"
  }
};

const getSurveySections = (t: typeof translations.en) => [
  {
    id: "engagement-satisfaction",
    title: t.engagementSatisfaction,
    description: t.engagementDesc,
    questions: [
      { key: "job_satisfaction", label: t.jobSatisfaction },
      { key: "recommend_company", label: t.recommendCompany },
      { key: "strategic_confidence", label: t.confidenceFuture }
    ]
  },
  {
    id: "leadership-communication",
    title: t.leadershipCommunication,
    description: t.leadershipDesc,
    questions: [
      { key: "leadership_openness", label: t.clearExpectations },
      { key: "performance_awareness", label: t.performanceAwareness },
      { key: "communication_clarity", label: t.infoQuality },
      { key: "manager_alignment", label: t.managerFeedback }
    ],
    multiSelect: [
      { key: "communication_preferences", label: t.communicationPrefs }
    ]
  },
  {
    id: "training-development",
    title: t.trainingDevelopment,
    description: t.trainingDesc,
    questions: [
      { key: "training_satisfaction", label: t.trainingQuality },
      { key: "advancement_opportunities", label: t.growthOpportunities }
    ]
  },
  {
    id: "teamwork-culture",
    title: t.teamworkCulture,
    description: t.teamworkDesc,
    questions: [
      { key: "cross_functional_collaboration", label: t.crossFunctional },
      { key: "team_morale", label: t.teamMorale },
      { key: "pride_in_work", label: t.prideInWork }
    ]
  },
  {
    id: "safety-environment",
    title: t.safetyEnvironment,
    description: t.safetyDesc,
    questions: [
      { key: "workplace_safety", label: t.workplaceSafety },
      { key: "safety_reporting_comfort", label: t.safetyReporting }
    ]
  },
  {
    id: "scheduling-workload",
    title: t.schedulingWorkload,
    description: t.schedulingDesc,
    questions: [
      { key: "workload_manageability", label: t.workloadManage },
      { key: "work_life_balance", label: t.workLifeBalance }
    ]
  },
  {
    id: "tools-processes",
    title: t.toolsProcesses,
    description: t.toolsDesc,
    questions: [
      { key: "tools_equipment_quality", label: t.toolsEquipment },
      { key: "manual_processes_focus", label: t.processImprovement },
      { key: "company_value_alignment", label: t.feelingValued },
      { key: "comfortable_suggesting_improvements", label: t.comfortSuggesting }
    ]
  },
  {
    id: "preferences-motivation",
    title: t.preferencesMotivation,
    description: t.preferencesDesc,
    questions: [],
    multiSelect: [
      { key: "motivation_factors", label: t.motivationFactors },
      { key: "information_preferences", label: t.informationPrefs }
    ]
  }
];

export function SurveyDashboardNew({ onBack, setCurrentView }: { onBack: () => void; setCurrentView: (view: string) => void }) {
  const [surveyData, setSurveyData] = useState<SurveyResponse[]>([]);
  const [language, setLanguage] = useState<'en' | 'es' | 'fr' | 'it'>('en');
  const t = translations[language];
  const surveySections = getSurveySections(t);
  const [expandedSections, setExpandedSections] = useState<Set<string>>(new Set());
  const [isAdminAuthenticated, setIsAdminAuthenticated] = useState(false);
  const [adminPasscode, setAdminPasscode] = useState("");
  const [showAdminDialog, setShowAdminDialog] = useState(false);
  const [showAIAnalysis, setShowAIAnalysis] = useState(false);
  const [aiAnalysis, setAIAnalysis] = useState<string>("");
  const [isLoadingAnalysis, setIsLoadingAnalysis] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const { toast } = useToast();

  useEffect(() => {
    loadSurveyData();
    
    // Set up real-time subscription
    const channel = supabase
      .channel('schema-db-changes')
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'employee_survey_responses'
        },
        () => {
          loadSurveyData();
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, []);

  const loadSurveyData = async () => {
    console.log('SurveyDashboardNew: Loading survey data...');
    try {
      const { data, error } = await supabase
        .from('employee_survey_responses')
        .select('*')
        .order('submitted_at', { ascending: false });

      if (error) {
        console.error('Error loading survey data:', error);
        toast({
          title: "Error loading data",
          description: "Failed to load survey responses",
          variant: "destructive"
        });
        return;
      }

      console.log('SurveyDashboardNew: Survey data loaded:', data);
      console.log('SurveyDashboardNew: Number of responses:', data?.length || 0);
      setSurveyData(data || []);
    } catch (error) {
      console.error('Error loading survey data:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleAdminAuth = () => {
    if (adminPasscode === "4155") {
      setIsAdminAuthenticated(true);
      setShowAdminDialog(false);
      toast({
        title: t.adminAccessGranted,
        description: t.canViewComments
      });
    } else {
      toast({
        title: t.invalidPasscode,
        description: t.checkPasscode,
        variant: "destructive"
      });
    }
  };

  const toggleSection = (sectionId: string) => {
    const newExpanded = new Set(expandedSections);
    if (newExpanded.has(sectionId)) {
      newExpanded.delete(sectionId);
    } else {
      newExpanded.add(sectionId);
    }
    setExpandedSections(newExpanded);
  };

  const calculateSectionAverage = (section: typeof surveySections[0]) => {
    if (surveyData.length === 0) return 0;
    
    // Handle sections without rating questions (e.g., only multiSelect items)
    if (!section.questions || section.questions.length === 0) {
      return 0;
    }
    
    const validResponses = section.questions
      .map(q => surveyData
        .map(response => response[q.key as keyof SurveyResponse] as number)
        .filter(value => value != null))
      .flat();
    
    if (validResponses.length === 0) return 0;
    return validResponses.reduce((sum, val) => sum + val, 0) / validResponses.length;
  };

  const getSectionStatus = (average: number) => {
    if (average >= 4) return { status: t.excellent.toLowerCase(), color: "bg-green-500", textColor: "text-green-700" };
    if (average >= 3.5) return { status: t.good.toLowerCase(), color: "bg-blue-500", textColor: "text-blue-700" };
    if (average >= 3) return { status: t.neutral.toLowerCase(), color: "bg-yellow-500", textColor: "text-yellow-700" };
    if (average >= 2) return { status: t.poor.toLowerCase(), color: "bg-orange-500", textColor: "text-orange-700" };
    return { status: t.critical.toLowerCase(), color: "bg-red-500", textColor: "text-red-700" };
  };

  const generateChartData = (questionKey: string) => {
    const counts = { 1: 0, 2: 0, 3: 0, 4: 0, 5: 0 };
    
    surveyData.forEach(response => {
      const value = response[questionKey as keyof SurveyResponse] as number;
      if (value && value >= 1 && value <= 5) {
        counts[value as keyof typeof counts]++;
      }
    });

    return Object.entries(counts).map(([rating, count]) => ({
      rating: `${rating}`,
      count,
      percentage: surveyData.length > 0 ? Math.round((count / surveyData.length) * 100) : 0
    }));
  };

  const generateMultiSelectData = (questionKey: string) => {
    const optionCounts: Record<string, number> = {};
    
    surveyData.forEach(response => {
      const values = response[questionKey as keyof SurveyResponse] as string[];
      if (Array.isArray(values)) {
        values.forEach(value => {
          optionCounts[value] = (optionCounts[value] || 0) + 1;
        });
      }
    });

    return Object.entries(optionCounts)
      .map(([option, count]) => ({
        option: option.replace(/-/g, ' ').replace(/\b\w/g, l => l.toUpperCase()),
        count,
        percentage: surveyData.length > 0 ? Math.round((count / surveyData.length) * 100) : 0
      }))
      .sort((a, b) => b.count - a.count);
  };

  const getDemographicData = () => {
    const continentData = surveyData.reduce((acc: Record<string, number>, response) => {
      acc[response.continent] = (acc[response.continent] || 0) + 1;
      return acc;
    }, {});

    const divisionData = surveyData.reduce((acc: Record<string, number>, response) => {
      acc[response.division] = (acc[response.division] || 0) + 1;
      return acc;
    }, {});

    const roleData = surveyData.reduce((acc: Record<string, number>, response) => {
      acc[response.role] = (acc[response.role] || 0) + 1;
      return acc;
    }, {});

    return { continentData, divisionData, roleData };
  };

  // Translate demographic values
  const translateDemographic = (value: string) => {
    const demographicMap: Record<string, keyof typeof translations.en> = {
      'North America': 'northAmerica',
      'Europe': 'europe',
      'Magnetics': 'magnetics',
      'Equipment': 'equipment',
      'Other': 'other',
      'Operations & Distribution': 'operationsDistribution',
      'Engineering & Services': 'engineeringServices',
      'Sales & Finance': 'salesFinance',
      'Admin & Management': 'adminManagement'
    };
    
    const key = demographicMap[value];
    return key ? t[key] : value;
  };

  const generateAIAnalysis = async () => {
    if (totalResponses < 10) {
      toast({
        title: t.insufficientData,
        description: `${t.aiRequires10} ${totalResponses} ${t.responses}.`,
        variant: "destructive"
      });
      return;
    }

    if (!isAdminAuthenticated) {
      setShowAdminDialog(true);
      return;
    }

    setIsLoadingAnalysis(true);
    // This would integrate with an AI service - placeholder for now
    setTimeout(() => {
      setAIAnalysis(`AI Analysis Report (Based on ${totalResponses} responses)

KEY INSIGHTS:
${surveySections.map(section => {
  const avg = calculateSectionAverage(section);
  const status = getSectionStatus(avg).status;
  return `• ${section.title}: ${avg.toFixed(1)}/5 (${status})`;
}).join('\n')}

RECOMMENDATIONS:
• Focus on areas scoring below 3.5/5
• Investigate low-scoring sections for improvement opportunities
• Monitor trends over time as more responses are collected

This is a placeholder analysis. In production, this would use AI to analyze the actual survey responses and provide detailed insights.`);
      setIsLoadingAnalysis(false);
      setShowAIAnalysis(true);
    }, 2000);
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <LoaderIcon className="h-8 w-8 animate-spin" />
      </div>
    );
  }

  if (surveyData.length === 0) {
    return (
      <div className="min-h-screen bg-background p-4">
        <div className="max-w-6xl mx-auto">
          <div className="flex items-center justify-between mb-8">
            <Button variant="outline" onClick={onBack} className="flex items-center gap-2">
              <ChevronLeftIcon className="h-4 w-4" />
              {t.backToSurvey}
            </Button>
            <Select value={language} onValueChange={(value: 'en' | 'es' | 'fr' | 'it') => setLanguage(value)}>
              <SelectTrigger className="w-[180px]">
                <Globe className="mr-2 h-4 w-4" />
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="en">English</SelectItem>
                <SelectItem value="es">Español</SelectItem>
                <SelectItem value="fr">Français</SelectItem>
                <SelectItem value="it">Italiano</SelectItem>
              </SelectContent>
            </Select>
          </div>
          <Card>
            <CardContent className="text-center p-8">
              <AlertTriangleIcon className="h-12 w-12 text-warning mx-auto mb-4" />
              <h2 className="text-xl font-semibold mb-2">{t.noSurveyData}</h2>
              <p className="text-muted-foreground">
                {t.noResponsesYet}
              </p>
            </CardContent>
          </Card>
        </div>
      </div>
    );
  }

  const { continentData, divisionData, roleData } = getDemographicData();
  const totalResponses = surveyData.length;

  return (
    <div className="min-h-screen bg-background p-4">
      <div className="max-w-6xl mx-auto">
        {/* Header */}
        <div className="flex items-center justify-between mb-8">
          <div className="flex items-center gap-4">
            <Button variant="outline" onClick={onBack} className="flex items-center gap-2">
              <ChevronLeftIcon className="h-4 w-4" />
              {t.backToSurvey}
            </Button>
            <div className="flex items-center gap-4">
              <img src={buntingLogo} alt="Bunting" className="h-8" />
              <img src={magnetApplicationsLogo} alt="Magnet Applications" className="h-8" />
            </div>
          </div>
          <Select value={language} onValueChange={(value: 'en' | 'es' | 'fr' | 'it') => setLanguage(value)}>
            <SelectTrigger className="w-[180px]">
              <Globe className="mr-2 h-4 w-4" />
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="en">English</SelectItem>
              <SelectItem value="es">Español</SelectItem>
              <SelectItem value="fr">Français</SelectItem>
              <SelectItem value="it">Italiano</SelectItem>
            </SelectContent>
          </Select>
        </div>

        {/* Overview Cards */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
          <Card>
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-muted-foreground">{t.totalResponses}</p>
                  <p className="text-2xl font-bold">{totalResponses}</p>
                </div>
                <UsersIcon className="h-8 w-8 text-primary" />
              </div>
            </CardContent>
          </Card>
          
          <Card>
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-muted-foreground">{t.avgJobSatisfaction}</p>
                  <p className="text-2xl font-bold">
                    {surveyData.filter(r => r.job_satisfaction).length > 0 
                      ? (surveyData.reduce((sum, r) => sum + (r.job_satisfaction || 0), 0) / 
                         surveyData.filter(r => r.job_satisfaction).length).toFixed(1)
                      : "N/A"}
                  </p>
                </div>
                <TrendingUpIcon className="h-8 w-8 text-success" />
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-muted-foreground">{t.comments}</p>
                  <p className="text-2xl font-bold">
                    {surveyData.filter(r => r.collaboration_feedback || r.additional_comments).length}
                  </p>
                </div>
                {isAdminAuthenticated ? <UnlockIcon className="h-8 w-8 text-success" /> : <LockIcon className="h-8 w-8 text-warning" />}
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-muted-foreground">{t.completionRate}</p>
                  <p className="text-2xl font-bold">100%</p>
                </div>
                <AlertTriangleIcon className="h-8 w-8 text-primary" />
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Survey Sections */}
        <div className="space-y-6">
          {surveySections.map((section) => {
            const average = calculateSectionAverage(section);
            const { status, color, textColor } = getSectionStatus(average);
            const isExpanded = expandedSections.has(section.id);

            return (
              <Card key={section.id} className="overflow-hidden">
                <Collapsible open={isExpanded} onOpenChange={() => toggleSection(section.id)}>
                  <CollapsibleTrigger asChild>
                    <CardHeader className="cursor-pointer hover:bg-muted/50 transition-colors">
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-6">
                          {/* Circular Progress Dial */}
                          <div className="relative w-16 h-16 flex-shrink-0">
                            <svg className="w-16 h-16 transform -rotate-90" viewBox="0 0 64 64">
                              <circle
                                cx="32"
                                cy="32"
                                r="28"
                                stroke="hsl(var(--muted))"
                                strokeWidth="6"
                                fill="none"
                              />
                              <circle
                                cx="32"
                                cy="32"
                                r="28"
                                stroke={average >= 4 ? "hsl(var(--success))" : average >= 3.5 ? "hsl(var(--primary))" : average >= 3 ? "hsl(var(--warning))" : average >= 2 ? "hsl(var(--destructive))" : "hsl(var(--destructive))"}
                                strokeWidth="6"
                                fill="none"
                                strokeDasharray={`${(average / 5) * 176} 176`}
                                strokeLinecap="round"
                                className="transition-all duration-700 ease-out"
                              />
                            </svg>
                            <div className="absolute inset-0 flex items-center justify-center">
                              <span className="text-sm font-bold">{average.toFixed(1)}</span>
                            </div>
                          </div>
                          <div>
                            <CardTitle className="text-lg">{section.title}</CardTitle>
                            <p className="text-sm text-muted-foreground">{section.description}</p>
                          </div>
                        </div>
                        <div className="flex items-center gap-4">
                          <Badge variant="outline" className={textColor}>
                            {status.charAt(0).toUpperCase() + status.slice(1)}
                          </Badge>
                          {isExpanded ? <ChevronDownIcon className="h-5 w-5" /> : <ChevronRightIcon className="h-5 w-5" />}
                        </div>
                      </div>
                    </CardHeader>
                  </CollapsibleTrigger>
                  
                   <CollapsibleContent>
                    <CardContent className="pt-6 space-y-4">
                      {/* Question Details */}
                      {section.questions && section.questions.length > 0 && (
                        <div className="space-y-3">
                          {section.questions.map((question) => {
                            const responses = surveyData
                              .map(r => r[question.key as keyof SurveyResponse])
                              .filter((v): v is number => typeof v === 'number');
                            const avg = responses.length > 0 
                              ? responses.reduce((a, b) => a + b, 0) / responses.length 
                              : 0;
                            const { color, textColor } = getSectionStatus(avg);
                            
                            return (
                              <div key={question.key} className="flex items-center justify-between p-4 bg-muted/30 rounded-lg">
                                <div className="flex-1">
                                  <p className="font-medium text-foreground">{question.label}</p>
                                  <p className="text-sm text-muted-foreground mt-1">
                                    {responses.length} responses
                                  </p>
                                </div>
                                <div className="flex items-center gap-3">
                                  <div className="text-right">
                                    <div className="text-2xl font-bold text-foreground">{avg.toFixed(1)}</div>
                                    <div className="text-xs text-muted-foreground">out of 5</div>
                                  </div>
                                  <Progress value={(avg / 5) * 100} className="w-24" />
                                </div>
                              </div>
                            );
                          })}
                        </div>
                      )}
                      
                      {/* Multi-Select Questions */}
                      {section.multiSelect && section.multiSelect.length > 0 && (
                        <div className="space-y-3 mt-6">
                          {section.multiSelect.map((multiQ) => {
                            const data = generateMultiSelectData(multiQ.key);
                            return (
                              <div key={multiQ.key} className="p-4 bg-muted/30 rounded-lg">
                                <p className="font-medium text-foreground mb-3">{multiQ.label}</p>
                                <div className="space-y-2">
                                  {data.map((item, idx) => (
                                    <div key={idx} className="flex items-center justify-between text-sm">
                                      <span className="text-foreground">{item.option}</span>
                                      <div className="flex items-center gap-2">
                                        <Progress value={(item.count / surveyData.length) * 100} className="w-32" />
                                        <span className="text-muted-foreground w-12 text-right">
                                          {item.percentage}%
                                        </span>
                                      </div>
                                    </div>
                                  ))}
                                </div>
                              </div>
                            );
                          })}
                        </div>
                      )}
                    </CardContent>
                  </CollapsibleContent>
                </Collapsible>
              </Card>
            );
          })}
        </div>

        {/* Demographics Section */}
        <Card className="mt-8">
          <CardHeader>
            <CardTitle>{t.demographics}</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              {/* Continent Distribution */}
              <div>
                <h4 className="font-medium mb-3">{t.byContinent}</h4>
                <div className="h-64">
                  <ResponsiveContainer width="100%" height="100%">
                    <PieChart>
                      <Pie
                        data={Object.entries(continentData).map(([key, value], index) => ({
                          name: translateDemographic(key),
                          value,
                          fill: COLORS[index % COLORS.length]
                        }))}
                        cx="50%"
                        cy="45%"
                        innerRadius={35}
                        outerRadius={55}
                        dataKey="value"
                        label={({ name, percent }) => {
                          const RADIAN = Math.PI / 180;
                          const radius = 55 + 30;
                          const x = 50 + radius * Math.cos(-percent * 360 * RADIAN);
                          const y = 45 + radius * Math.sin(-percent * 360 * RADIAN);
                          return `${name}: ${(percent * 100).toFixed(0)}%`;
                        }}
                        labelLine={false}
                        style={{ fill: 'hsl(var(--foreground))' }}
                      />
                      <Tooltip contentStyle={{ color: 'hsl(var(--foreground))' }} />
                    </PieChart>
                  </ResponsiveContainer>
                </div>
              </div>

              {/* Division Distribution */}
              <div>
                <h4 className="font-medium mb-3">{t.byDivision}</h4>
                <div className="h-64">
                  <ResponsiveContainer width="100%" height="100%">
                    <PieChart>
                      <Pie
                        data={Object.entries(divisionData).map(([key, value], index) => ({
                          name: translateDemographic(key),
                          value,
                          fill: COLORS[index % COLORS.length]
                        }))}
                        cx="50%"
                        cy="45%"
                        innerRadius={35}
                        outerRadius={55}
                        dataKey="value"
                        label={({ name, percent }) => {
                          const RADIAN = Math.PI / 180;
                          const radius = 55 + 30;
                          const x = 50 + radius * Math.cos(-percent * 360 * RADIAN);
                          const y = 45 + radius * Math.sin(-percent * 360 * RADIAN);
                          return `${name}: ${(percent * 100).toFixed(0)}%`;
                        }}
                        labelLine={false}
                        style={{ fill: 'hsl(var(--foreground))' }}
                      />
                      <Tooltip contentStyle={{ color: 'hsl(var(--foreground))' }} />
                    </PieChart>
                  </ResponsiveContainer>
                </div>
              </div>

              {/* Role Distribution */}
              <div>
                <h4 className="font-medium mb-3">{t.byRole}</h4>
                <div className="h-64">
                  <ResponsiveContainer width="100%" height="100%">
                    <PieChart>
                      <Pie
                        data={Object.entries(roleData).map(([key, value], index) => ({
                          name: translateDemographic(key),
                          value,
                          fill: COLORS[index % COLORS.length]
                        }))}
                        cx="50%"
                        cy="45%"
                        innerRadius={35}
                        outerRadius={55}
                        dataKey="value"
                        label={({ name, percent }) => {
                          const RADIAN = Math.PI / 180;
                          const radius = 55 + 30;
                          const x = 50 + radius * Math.cos(-percent * 360 * RADIAN);
                          const y = 45 + radius * Math.sin(-percent * 360 * RADIAN);
                          return `${name}: ${(percent * 100).toFixed(0)}%`;
                        }}
                        labelLine={false}
                        style={{ fill: 'hsl(var(--foreground))' }}
                      />
                      <Tooltip contentStyle={{ color: 'hsl(var(--foreground))' }} />
                    </PieChart>
                  </ResponsiveContainer>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Admin Comments Section */}
        {isAdminAuthenticated && (
          <Card className="mt-8">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <UnlockIcon className="h-5 w-5" />
                {t.commentsAndFeedback}
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {surveyData
                  .filter(response => response.collaboration_feedback || response.additional_comments)
                  .map((response, index) => (
                    <div key={response.id} className="border rounded-lg p-4">
                      <div className="flex items-center justify-between mb-2">
                        <Badge variant="outline">
                          {t.response} #{index + 1}
                        </Badge>
                        <span className="text-sm text-muted-foreground">
                          {new Date(response.submitted_at).toLocaleDateString()}
                        </span>
                      </div>
                      {response.collaboration_feedback && (
                        <div className="mb-2">
                          <p className="font-medium text-sm">{t.collaborationFeedback}</p>
                          <p className="text-sm">{response.collaboration_feedback}</p>
                        </div>
                      )}
                      {response.additional_comments && (
                        <div>
                          <p className="font-medium text-sm">{t.additionalCommentsLabel}</p>
                          <p className="text-sm">{response.additional_comments}</p>
                        </div>
                      )}
                    </div>
                  ))}
              </div>
            </CardContent>
          </Card>
        )}

        {/* Admin Dialog */}
        <Dialog open={showAdminDialog} onOpenChange={setShowAdminDialog}>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>{t.adminPasscode}</DialogTitle>
            </DialogHeader>
            <div className="space-y-4">
              <p className="text-sm text-muted-foreground">
                {t.enterPasscode}
              </p>
              <Input
                type="password"
                placeholder={t.adminPasscode}
                value={adminPasscode}
                onChange={(e) => setAdminPasscode(e.target.value)}
                onKeyPress={(e) => e.key === 'Enter' && handleAdminAuth()}
              />
              <div className="flex justify-end gap-2">
                <Button variant="outline" onClick={() => setShowAdminDialog(false)}>
                  {t.cancel}
                </Button>
                <Button onClick={handleAdminAuth}>
                  {t.unlock}
                </Button>
              </div>
            </div>
          </DialogContent>
        </Dialog>

        {/* AI Analysis Dialog */}
        <Dialog open={showAIAnalysis} onOpenChange={setShowAIAnalysis}>
          <DialogContent className="max-w-4xl max-h-[80vh] overflow-y-auto">
            <DialogHeader>
              <DialogTitle>{t.aiAnalysisReport}</DialogTitle>
            </DialogHeader>
            <div className="whitespace-pre-wrap text-sm">
              {aiAnalysis}
            </div>
          </DialogContent>
        </Dialog>
      </div>
    </div>
  );
}