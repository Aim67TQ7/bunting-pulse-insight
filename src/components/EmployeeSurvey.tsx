import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { CheckIcon, AlertTriangleIcon } from "lucide-react";
import { cn } from "@/lib/utils";
import { useToast } from "@/hooks/use-toast";
import { PrivacyNotice } from "./PrivacyNotice";
import buntingLogo from "@/assets/bunting-logo-2.png";
import magnetApplicationsLogo from "@/assets/magnet-applications-logo-2.png";

interface DemographicQuestion {
  id: string;
  text: string;
  options: { value: string; label: string }[];
}

interface RatingQuestion {
  id: string;
  text: string;
  followUpPrompt: string;
}

interface PreferenceQuestion {
  id: string;
  text: string;
  options: { value: string; label: string }[];
}

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

const ratingQuestions: RatingQuestion[] = [
  {
    id: "job-satisfaction",
    text: "How satisfied are you with your job?",
    followUpPrompt: "Could you share what aspects of your job contribute to this rating?"
  },
  {
    id: "communication-clarity",
    text: "How clear is the communication you receive from leadership regarding company goals and objectives?",
    followUpPrompt: "What would help improve communication clarity from leadership?"
  },
  {
    id: "safety",
    text: "How safe do you feel in your work environment?",
    followUpPrompt: "What safety concerns do you have, or what improvements would you suggest?"
  },
  {
    id: "training",
    text: "How satisfied are you with the training provided for your current role?",
    followUpPrompt: "What additional training or support would be most valuable for your role?"
  },
  {
    id: "work-life-balance",
    text: "How would you rate your current work-life balance?",
    followUpPrompt: "What changes would help improve your work-life balance?"
  },
  {
    id: "cross-office-communication",
    text: "How are the overall communication and collaboration between the US and UK offices?",
    followUpPrompt: "What would improve communication and collaboration between offices?"
  },
  // Productivity & Value Creation
  {
    id: "manual-processes-impact",
    text: "How often do manual processes prevent you from higher-impact work?",
    followUpPrompt: "Which manual processes create the biggest barriers to your productivity?"
  },
  // Retention Risk Indicators
  {
    id: "company-recommendation",
    text: "How likely are you to recommend this company as a place to work?",
    followUpPrompt: "What would make you more likely to recommend this company?"
  },
  {
    id: "strategic-direction-confidence",
    text: "Rate your confidence in the company's 3-year strategic direction",
    followUpPrompt: "What concerns do you have about the company's strategic direction?"
  },
  {
    id: "advancement-opportunities",
    text: "Do you see clear advancement opportunities aligned with emerging skill needs?",
    followUpPrompt: "What advancement opportunities would be most valuable to you?"
  },
  // Innovation Culture
  {
    id: "process-improvement-comfort",
    text: "How comfortable do you feel proposing process improvements?",
    followUpPrompt: "What would make you more comfortable proposing improvements?"
  },
  {
    id: "learning-from-failures",
    text: "Are failed experiments treated as learning opportunities?",
    followUpPrompt: "How could the company better support learning from failures?"
  },
  {
    id: "leadership-openness",
    text: "Rate leadership's openness to challenging traditional approaches",
    followUpPrompt: "What examples have you seen of leadership resistance to new approaches?"
  },
  // Leadership Effectiveness
  {
    id: "manager-business-connection",
    text: "Does your manager help connect your work to business outcomes?",
    followUpPrompt: "How could your manager better connect your work to business outcomes?"
  },
  {
    id: "strategic-priorities-communication",
    text: "How effectively does leadership communicate strategic priorities?",
    followUpPrompt: "How could leadership improve communication of strategic priorities?"
  },
  {
    id: "cross-functional-collaboration",
    text: "Rate the quality of cross-functional collaboration",
    followUpPrompt: "What would improve cross-functional collaboration in your experience?"
  }
];

const preferenceQuestions: PreferenceQuestion[] = [
  {
    id: "communication-style",
    text: "Which communication styles do you prefer? (Select all that apply)",
    options: [
      { value: "emails", label: "Company-wide emails" },
      { value: "town-halls", label: "Quarterly Town halls" },
      { value: "intranet", label: "Company Intranet" },
      { value: "digital-signage", label: "Digital Signage" },
      { value: "printed-signage", label: "Printed Signage" },
      { value: "team-meetings", label: "Team meetings" }
    ]
  },
  {
    id: "motivation",
    text: "What motivates you to stay with the company? (Select all that apply)",
    options: [
      { value: "compensation", label: "Compensation" },
      { value: "benefits", label: "Benefits package" },
      { value: "job-satisfaction", label: "Job satisfaction" },
      { value: "career-growth", label: "Career growth opportunities" },
      { value: "work-culture", label: "Work culture and environment" },
      { value: "flexibility", label: "Work flexibility" }
    ]
  }
];

interface StrategicQuestion {
  id: string;
  text: string;
  category: string;
  placeholder: string;
}

const strategicQuestions: StrategicQuestion[] = [
  // Productivity & Value Creation
  {
    id: "time-consuming-activities",
    text: "Which work activities consume time but add minimal value?",
    category: "Productivity & Value Creation",
    placeholder: "Describe activities that take time but don't add much value..."
  },
  {
    id: "strategic-value-contribution",
    text: "What would help you contribute 20% more strategic value?",
    category: "Productivity & Value Creation", 
    placeholder: "Share what would help you add more strategic value..."
  },
  // Skills Gap Intelligence
  {
    id: "capability-development-needs",
    text: "What capabilities do you need to develop to remain valuable?",
    category: "Skills Gap Intelligence",
    placeholder: "Describe the skills or capabilities you'd like to develop..."
  },
  {
    id: "customer-process-frustrations",
    text: "Which current company processes frustrate customers most?",
    category: "Skills Gap Intelligence",
    placeholder: "Share insights about processes that frustrate customers..."
  },
  {
    id: "competitive-threats",
    text: "Where do you see competitive threats that require new capabilities?",
    category: "Skills Gap Intelligence",
    placeholder: "Describe competitive threats and needed capabilities..."
  }
];

type SurveySection = "demographics" | "ratings" | "strategic" | "preferences" | "complete";

export function EmployeeSurvey() {
  const [currentSection, setCurrentSection] = useState<SurveySection>("demographics");
  const [currentDemographicIndex, setCurrentDemographicIndex] = useState(0);
  const [currentStrategicIndex, setCurrentStrategicIndex] = useState(0);
  const [currentPreferenceIndex, setCurrentPreferenceIndex] = useState(0);
  const [responses, setResponses] = useState<Record<string, string | string[]>>({});
  const [ratingResponses, setRatingResponses] = useState<Record<string, number>>({});
  const [strategicResponses, setStrategicResponses] = useState<Record<string, string>>({});
  const [followUpResponses, setFollowUpResponses] = useState<Record<string, string>>({});
  const [isComplete, setIsComplete] = useState(false);
  const [submissionCount, setSubmissionCount] = useState(0);
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
    setStrategicResponses({});
    setFollowUpResponses({});
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
    return demographicQuestions.length + 1 + strategicQuestions.length + preferenceQuestions.length; // +1 for ratings section
  };

  const getCurrentQuestionNumber = () => {
    if (currentSection === "demographics") {
      return currentDemographicIndex + 1;
    } else if (currentSection === "ratings") {
      return demographicQuestions.length + 1;
    } else if (currentSection === "strategic") {
      return demographicQuestions.length + 1 + currentStrategicIndex + 1;
    } else if (currentSection === "preferences") {
      return demographicQuestions.length + 1 + strategicQuestions.length + currentPreferenceIndex + 1;
    }
    return getTotalQuestions();
  };

  const progress = (getCurrentQuestionNumber() / getTotalQuestions()) * 100;

  const handleDemographicResponse = (value: string) => {
    const questionId = demographicQuestions[currentDemographicIndex].id;
    setResponses(prev => ({ ...prev, [questionId]: value }));
    
    if (currentDemographicIndex < demographicQuestions.length - 1) {
      setCurrentDemographicIndex(prev => prev + 1);
    } else {
      setCurrentSection("ratings");
    }
  };

  const handleRatingResponse = (questionId: string, rating: number) => {
    setRatingResponses(prev => ({ ...prev, [questionId]: rating }));
  };

  const handleRatingsComplete = () => {
    setCurrentSection("strategic");
  };

  const handleStrategicResponse = (value: string) => {
    const questionId = strategicQuestions[currentStrategicIndex].id;
    setStrategicResponses(prev => ({ ...prev, [questionId]: value }));
    
    if (currentStrategicIndex < strategicQuestions.length - 1) {
      setCurrentStrategicIndex(prev => prev + 1);
    } else {
      setCurrentSection("preferences");
    }
  };

  const handlePreferenceResponse = (value: string[]) => {
    const questionId = preferenceQuestions[currentPreferenceIndex].id;
    setResponses(prev => ({ ...prev, [questionId]: value }));
    
    if (currentPreferenceIndex < preferenceQuestions.length - 1) {
      setCurrentPreferenceIndex(prev => prev + 1);
    } else {
      handleSubmit();
    }
  };

  const handleFollowUpChange = (questionId: string, value: string) => {
    setFollowUpResponses(prev => ({ ...prev, [questionId]: value }));
  };

  const handleSubmit = () => {
    if (submissionCount >= 1) {
      toast({
        title: "Submission limit reached",
        description: "You have already submitted this survey.",
        variant: "destructive"
      });
      return;
    }

    const surveyData = {
      responses,
      ratingResponses,
      strategicResponses,
      followUpResponses,
      timestamp: new Date().toISOString()
    };
    
    const existingData = JSON.parse(localStorage.getItem("survey-data") || "[]");
    existingData.push(surveyData);
    localStorage.setItem("survey-data", JSON.stringify(existingData));
    
    const newCount = submissionCount + 1;
    localStorage.setItem("survey-submissions", newCount.toString());
    
    setIsComplete(true);
    
    toast({
      title: "Survey submitted successfully",
      description: "Thank you for your valuable feedback!",
    });
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
            <p className="text-sm text-muted-foreground">
              You can now view the survey results dashboard.
            </p>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background p-4">
      <PrivacyNotice />
      <div className="max-w-4xl mx-auto">
        {/* Company Logos */}
        <div className="flex items-center justify-center gap-8 mb-8">
          <img src={buntingLogo} alt="Bunting" className="h-12" />
          <img src={magnetApplicationsLogo} alt="Magnet Applications - A Division of Bunting" className="h-12" />
        </div>
        
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-center mb-2">Employee Satisfaction Survey</h1>
          <p className="text-center text-muted-foreground mb-6">
            Your feedback is anonymous and valuable to us
          </p>
          <div className="space-y-2">
            <div className="flex justify-between text-sm text-muted-foreground">
              <span>Section {getCurrentQuestionNumber()} of {getTotalQuestions()}</span>
              <span>{Math.round(progress)}% complete</span>
            </div>
            <Progress value={progress} className="h-2" />
          </div>
        </div>

        {currentSection === "demographics" && (
          <DemographicSection 
            question={demographicQuestions[currentDemographicIndex]}
            onResponse={handleDemographicResponse}
            canGoBack={currentDemographicIndex > 0}
            onGoBack={() => setCurrentDemographicIndex(prev => prev - 1)}
          />
        )}

        {currentSection === "ratings" && (
          <RatingsSection 
            questions={ratingQuestions}
            responses={ratingResponses}
            followUpResponses={followUpResponses}
            onRatingChange={handleRatingResponse}
            onFollowUpChange={handleFollowUpChange}
            onComplete={handleRatingsComplete}
            onGoBack={() => {
              setCurrentDemographicIndex(demographicQuestions.length - 1);
              setCurrentSection("demographics");
            }}
          />
        )}

        {currentSection === "strategic" && (
          <StrategicSection 
            question={strategicQuestions[currentStrategicIndex]}
            onResponse={handleStrategicResponse}
            canGoBack={currentStrategicIndex > 0 || currentSection !== "strategic"}
            onGoBack={() => {
              if (currentStrategicIndex > 0) {
                setCurrentStrategicIndex(prev => prev - 1);
              } else {
                setCurrentSection("ratings");
              }
            }}
          />
        )}

        {currentSection === "preferences" && (
          <PreferenceSection 
            question={preferenceQuestions[currentPreferenceIndex]}
            onResponse={handlePreferenceResponse}
            canGoBack={currentPreferenceIndex > 0 || currentSection !== "preferences"}
            onGoBack={() => {
              if (currentPreferenceIndex > 0) {
                setCurrentPreferenceIndex(prev => prev - 1);
              } else {
                setCurrentSection("ratings");
              }
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
  return (
    <Card className="mb-6">
      <CardHeader>
        <CardTitle className="text-lg font-medium">
          {question.text}
        </CardTitle>
      </CardHeader>
      <CardContent>
        <RadioGroup
          onValueChange={onResponse}
          className="space-y-3"
        >
          {question.options.map((option) => (
            <div key={option.value} className="flex items-center space-x-2">
              <RadioGroupItem value={option.value} id={option.value} />
              <Label
                htmlFor={option.value}
                className="text-sm font-normal cursor-pointer flex-1"
              >
                {option.label}
              </Label>
            </div>
          ))}
        </RadioGroup>
        
        {canGoBack && (
          <Button
            variant="outline"
            onClick={onGoBack}
            className="mt-4"
          >
            Previous Question
          </Button>
        )}
      </CardContent>
    </Card>
  );
}

interface RatingsSectionProps {
  questions: RatingQuestion[];
  responses: Record<string, number>;
  followUpResponses: Record<string, string>;
  onRatingChange: (questionId: string, rating: number) => void;
  onFollowUpChange: (questionId: string, value: string) => void;
  onComplete: () => void;
  onGoBack: () => void;
}

function RatingsSection({ 
  questions, 
  responses, 
  followUpResponses, 
  onRatingChange, 
  onFollowUpChange, 
  onComplete, 
  onGoBack 
}: RatingsSectionProps) {
  const allRatingsComplete = questions.every(q => responses[q.id] !== undefined);

  return (
    <Card className="mb-6">
      <CardHeader>
        <CardTitle className="text-xl font-semibold mb-2">
          Please rate your experience
        </CardTitle>
        <p className="text-sm text-muted-foreground">
          Rate each aspect from 1 (poor) to 5 (excellent)
        </p>
      </CardHeader>
      <CardContent className="space-y-6">
        {questions.map((question) => (
          <div key={question.id} className="space-y-3">
            <div className="space-y-3">
              <h3 className="text-sm font-medium">{question.text}</h3>
              <div className="flex items-center gap-2">
                <span className="text-xs text-muted-foreground min-w-[30px]">Poor</span>
                <div className="flex gap-1">
                  {[1, 2, 3, 4, 5].map((rating) => (
                    <button
                      key={rating}
                      onClick={() => onRatingChange(question.id, rating)}
                      className={cn(
                        "w-8 h-8 rounded-full border-2 flex items-center justify-center text-sm font-medium transition-colors",
                        responses[question.id] === rating
                          ? "bg-primary text-primary-foreground border-primary"
                          : "border-border hover:border-primary/50"
                      )}
                    >
                      {rating}
                    </button>
                  ))}
                </div>
                <span className="text-xs text-muted-foreground min-w-[50px]">Excellent</span>
              </div>
            </div>
            
            {responses[question.id] && responses[question.id] <= 3 && (
              <div className="mt-4 p-4 bg-accent/50 border border-accent/20 rounded-md">
                <div className="flex items-start gap-2 mb-3">
                  <div className="w-5 h-5 rounded-full bg-primary/20lex items-center justify-center flex-shrink-0 mt-0.5">
                    <span className="text-xs text-primary font-medium">💡</span>
                  </div>
                  <div>
                    <p className="text-sm font-medium text-foreground mb-1">
                      Help us improve!
                    </p>
                    <p className="text-xs text-muted-foreground mb-3">
                      {question.followUpPrompt} Your input helps us make work better for everyone.
                    </p>
                  </div>
                </div>
                <Textarea
                  placeholder="Your feedback is valuable to us (optional)..."
                  value={followUpResponses[question.id] || ""}
                  onChange={(e) => onFollowUpChange(question.id, e.target.value)}
                  className="min-h-[80px] text-sm"
                />
              </div>
            )}
          </div>
        ))}
        
        <div className="flex gap-2 pt-4">
          <Button variant="outline" onClick={onGoBack}>
            Previous
          </Button>
          <Button 
            onClick={onComplete}
            disabled={!allRatingsComplete}
            className="flex-1"
          >
            Continue to Preferences
          </Button>
        </div>
      </CardContent>
    </Card>
  );
}

interface PreferenceSectionProps {
  question: PreferenceQuestion;
  onResponse: (value: string[]) => void;
  canGoBack: boolean;
  onGoBack: () => void;
}

function PreferenceSection({ question, onResponse, canGoBack, onGoBack }: PreferenceSectionProps) {
  const [selectedValues, setSelectedValues] = useState<string[]>([]);

  const handleCheckboxChange = (value: string, checked: boolean) => {
    const newValues = checked 
      ? [...selectedValues, value]
      : selectedValues.filter(v => v !== value);
    setSelectedValues(newValues);
  };

  const handleContinue = () => {
    onResponse(selectedValues);
  };

  return (
    <Card className="mb-6">
      <CardHeader>
        <CardTitle className="text-lg font-medium">
          {question.text}
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="space-y-3 mb-6">
          {question.options.map((option) => (
            <div key={option.value} className="flex items-center space-x-2">
              <input
                type="checkbox"
                id={option.value}
                checked={selectedValues.includes(option.value)}
                onChange={(e) => handleCheckboxChange(option.value, e.target.checked)}
                className="rounded border-input"
              />
              <Label
                htmlFor={option.value}
                className="text-sm font-normal cursor-pointer flex-1"
              >
                {option.label}
              </Label>
            </div>
          ))}
        </div>
        
        <div className="flex gap-2">
          {canGoBack && (
            <Button variant="outline" onClick={onGoBack}>
              Previous
            </Button>
          )}
          <Button 
            onClick={handleContinue}
            disabled={selectedValues.length === 0}
            className="flex-1"
          >
            Continue
          </Button>
        </div>
      </CardContent>
    </Card>
  );
}

// Strategic Questions Section
interface StrategicSectionProps {
  question: StrategicQuestion;
  onResponse: (value: string) => void;
  canGoBack: boolean;
  onGoBack: () => void;
}

function StrategicSection({ question, onResponse, canGoBack, onGoBack }: StrategicSectionProps) {
  const [response, setResponse] = useState("");

  const handleContinue = () => {
    onResponse(response.trim());
  };

  return (
    <Card className="mb-6">
      <CardHeader>
        <div className="space-y-2">
          <Badge variant="outline" className="text-xs">
            {question.category}
          </Badge>
          <CardTitle className="text-lg font-medium">
            {question.text}
          </CardTitle>
          <p className="text-sm text-muted-foreground">
            Your strategic insights help us make work better for everyone.
          </p>
        </div>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          <Textarea
            placeholder={question.placeholder}
            value={response}
            onChange={(e) => setResponse(e.target.value)}
            className="min-h-[120px] text-sm"
          />
          
          <div className="flex gap-2">
            {canGoBack && (
              <Button variant="outline" onClick={onGoBack}>
                Previous
              </Button>
            )}
            <Button 
              onClick={handleContinue}
              disabled={!response.trim()}
              className="flex-1"
            >
              Continue
            </Button>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}