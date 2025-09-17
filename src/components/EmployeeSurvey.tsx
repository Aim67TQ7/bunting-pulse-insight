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
  section: string;
  feedbackPrompt: string;
}

// New 14 rating questions based on user's requirements
const ratingQuestions: RatingQuestion[] = [
  // 1. Job & Role Satisfaction (3 questions)
  {
    id: "job-satisfaction",
    text: "How satisfied are you with your job?",
    section: "Job & Role Satisfaction",
    feedbackPrompt: "Please explain why you feel dissatisfied with your job."
  },
  {
    id: "training-satisfaction",
    text: "How satisfied are you with the training provided for your current role?",
    section: "Job & Role Satisfaction",
    feedbackPrompt: "Please describe gaps in training or support you've experienced."
  },
  {
    id: "work-life-balance",
    text: "How would you rate your current work-life balance?",
    section: "Job & Role Satisfaction",
    feedbackPrompt: "Please explain what affects your work-life balance."
  },
  
  // 2. Leadership & Communication (3 questions)
  {
    id: "leadership-communication-clarity",
    text: "How clear is the communication you receive from leadership regarding company goals and objectives?",
    section: "Leadership & Communication",
    feedbackPrompt: "Please describe how communication could be improved."
  },
  {
    id: "leadership-openness",
    text: "Rate leadership's openness to challenging traditional approaches.",
    section: "Leadership & Communication",
    feedbackPrompt: "Please share examples where innovative ideas were blocked or ignored."
  },
  {
    id: "manager-business-connection",
    text: "Does your manager help connect your work to business outcomes?",
    section: "Leadership & Communication",
    feedbackPrompt: "Please explain how your work could be better aligned with outcomes."
  },
  
  // 3. Collaboration & Cross-Functional Work (2 questions)
  {
    id: "us-uk-collaboration",
    text: "How are the overall communication and collaboration between the US and UK offices?",
    section: "Collaboration & Cross-Functional Work",
    feedbackPrompt: "Please describe the main obstacles to collaboration between offices."
  },
  {
    id: "cross-functional-collaboration",
    text: "Rate the quality of cross-functional collaboration.",
    section: "Collaboration & Cross-Functional Work",
    feedbackPrompt: "Please provide examples of where cross-functional work could be improved."
  },
  
  // 4. Growth & Strategic Alignment (2 questions)
  {
    id: "strategic-direction-confidence",
    text: "Rate your confidence in the company's 3-year strategic direction.",
    section: "Growth & Strategic Alignment",
    feedbackPrompt: "Please explain your concerns about the strategic direction."
  },
  {
    id: "advancement-opportunities",
    text: "Do you see clear advancement opportunities aligned with emerging skill needs?",
    section: "Growth & Strategic Alignment",
    feedbackPrompt: "Please describe what's missing in career growth or skill development."
  },
  
  // 5. Workplace Experience (2 questions)
  {
    id: "workplace-safety",
    text: "How safe do you feel in your work environment?",
    section: "Workplace Experience",
    feedbackPrompt: "Please explain any safety concerns you have."
  },
  {
    id: "company-recommendation",
    text: "How likely are you to recommend this company as a place to work?",
    section: "Workplace Experience",
    feedbackPrompt: "Please share reasons you wouldn't recommend the company."
  },
  
  // 6. Process Efficiency & Innovation (3 questions) - Moved to bottom with agreement scale
  {
    id: "manual-processes-impact",
    text: "I rarely spend time on manual processes, allowing me to focus on higher-impact work.",
    section: "Process Efficiency & Innovation",
    feedbackPrompt: "Please describe the manual processes or tasks that slow your work."
  },
  {
    id: "process-improvement-comfort",
    text: "How comfortable do you feel proposing process improvements?",
    section: "Process Efficiency & Innovation",
    feedbackPrompt: "Please explain what prevents you from suggesting improvements."
  },
  {
    id: "learning-from-failures",
    text: "Are failed experiments treated as learning opportunities?",
    section: "Process Efficiency & Innovation",
    feedbackPrompt: "Please provide examples of failed experiments that were not treated as learning opportunities."
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

const ratingLabels = {
  satisfaction: {
    1: "Poor",
    2: "Below Average", 
    3: "Average",
    4: "Good",
    5: "Excellent"
  },
  agreement: {
    1: "Strongly Disagree",
    2: "Disagree", 
    3: "Neutral",
    4: "Agree",
    5: "Strongly Agree"
  }
};

type SurveySection = "demographics" | "ratings" | "complete";

export function EmployeeSurvey() {
  const [currentSection, setCurrentSection] = useState<SurveySection>("demographics");
  const [currentDemographicIndex, setCurrentDemographicIndex] = useState(0);
  const [responses, setResponses] = useState<Record<string, string>>({});
  const [ratingResponses, setRatingResponses] = useState<Record<string, number>>({});
  const [feedbackResponses, setFeedbackResponses] = useState<Record<string, string>>({});
  const [collaborationFeedback, setCollaborationFeedback] = useState("");
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
    setFeedbackResponses({});
    setCollaborationFeedback("");
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
    return demographicQuestions.length + ratingQuestions.length;
  };

  const getCurrentQuestionNumber = () => {
    if (currentSection === "demographics") {
      return currentDemographicIndex + 1;
    } else if (currentSection === "ratings") {
      return demographicQuestions.length + Object.keys(ratingResponses).length + 1;
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

  const handleFeedbackResponse = (questionId: string, feedback: string) => {
    setFeedbackResponses(prev => ({ ...prev, [questionId]: feedback }));
  };

  const isAllQuestionsAnswered = () => {
    return Object.keys(ratingResponses).length === ratingQuestions.length;
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

    if (!isAllQuestionsAnswered()) {
      toast({
        title: "Incomplete survey",
        description: "Please answer all 15 questions before submitting.",
        variant: "destructive"
      });
      return;
    }

    const surveyData = {
      responses,
      ratingResponses,
      feedbackResponses,
      collaborationFeedback,
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
            feedbackResponses={feedbackResponses}
            collaborationFeedback={collaborationFeedback}
            onRatingChange={handleRatingResponse}
            onFeedbackChange={handleFeedbackResponse}
            onCollaborationFeedbackChange={setCollaborationFeedback}
            onSubmit={handleSubmit}
            canSubmit={isAllQuestionsAnswered()}
            onGoBack={() => {
              setCurrentDemographicIndex(demographicQuestions.length - 1);
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
  return (
    <Card>
      <CardHeader>
        <CardTitle>{question.text}</CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <RadioGroup onValueChange={onResponse}>
          {question.options.map((option) => (
            <div key={option.value} className="flex items-center space-x-2">
              <RadioGroupItem value={option.value} id={option.value} />
              <Label htmlFor={option.value}>{option.label}</Label>
            </div>
          ))}
        </RadioGroup>
        {canGoBack && (
          <Button variant="outline" onClick={onGoBack}>
            Previous
          </Button>
        )}
      </CardContent>
    </Card>
  );
}

interface RatingsSectionProps {
  questions: RatingQuestion[];
  responses: Record<string, number>;
  feedbackResponses: Record<string, string>;
  collaborationFeedback: string;
  onRatingChange: (questionId: string, rating: number) => void;
  onFeedbackChange: (questionId: string, feedback: string) => void;
  onCollaborationFeedbackChange: (feedback: string) => void;
  onSubmit: () => void;
  canSubmit: boolean;
  onGoBack: () => void;
}

function RatingsSection({ 
  questions, 
  responses, 
  feedbackResponses,
  collaborationFeedback,
  onRatingChange, 
  onFeedbackChange,
  onCollaborationFeedbackChange,
  onSubmit,
  canSubmit,
  onGoBack 
}: RatingsSectionProps) {
  const groupedQuestions = questions.reduce((acc, question) => {
    if (!acc[question.section]) {
      acc[question.section] = [];
    }
    acc[question.section].push(question);
    return acc;
  }, {} as Record<string, RatingQuestion[]>);

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
                <div>
                  <h3 className="font-medium mb-4">{question.text}</h3>
                  
                  {/* Rating Scale with Emojis */}
                  <div className="flex justify-center space-x-4 mb-4">
                    {[1, 2, 3, 4, 5].map((rating) => {
                      const isAgreementScale = question.section === "Process Efficiency & Innovation";
                      const emojiSet = isAgreementScale ? ratingEmojis.agreement : ratingEmojis.satisfaction;
                      const labelSet = isAgreementScale ? ratingLabels.agreement : ratingLabels.satisfaction;
                      
                      return (
                        <button
                          key={rating}
                          onClick={() => onRatingChange(question.id, rating)}
                          className={cn(
                            "flex flex-col items-center p-3 rounded-lg border-2 transition-all",
                            responses[question.id] === rating
                              ? "border-primary bg-primary/10"
                              : "border-border hover:border-primary/50"
                          )}
                        >
                          <span className="text-2xl mb-1">{emojiSet[rating as keyof typeof emojiSet]}</span>
                          <span className="text-xs font-medium">{rating}</span>
                          <span className="text-xs text-muted-foreground">{labelSet[rating as keyof typeof labelSet]}</span>
                        </button>
                      );
                    })}
                  </div>
                </div>

                {/* Feedback box for low scores (1-2) */}
                {responses[question.id] && responses[question.id] <= 2 && (
                  <div className="space-y-2">
                    <Label htmlFor={`feedback-${question.id}`} className="text-sm font-medium">
                      {question.feedbackPrompt}
                    </Label>
                    <Textarea
                      id={`feedback-${question.id}`}
                      placeholder="Please provide details..."
                      value={feedbackResponses[question.id] || ""}
                      onChange={(e) => onFeedbackChange(question.id, e.target.value)}
                      rows={3}
                    />
                  </div>
                )}
              </div>
            ))}
          </CardContent>
        </Card>
      ))}

      {/* Optional collaboration feedback */}
      <Card>
        <CardHeader>
          <CardTitle>Additional Feedback</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-2">
            <Label htmlFor="collaboration-feedback">
              What would improve communication and collaboration between offices? (Optional)
            </Label>
            <Textarea
              id="collaboration-feedback"
              placeholder="Share your thoughts on improving collaboration..."
              value={collaborationFeedback}
              onChange={(e) => onCollaborationFeedbackChange(e.target.value)}
              rows={4}
            />
          </div>
        </CardContent>
      </Card>

      <div className="flex justify-between">
        <Button variant="outline" onClick={onGoBack}>
          Previous
        </Button>
        <Button 
          onClick={onSubmit} 
          disabled={!canSubmit}
          className="bg-primary text-primary-foreground hover:bg-primary/90"
        >
          {canSubmit ? "Submit Survey" : `Answer All Questions (${Object.keys(responses).length}/${questions.length})`}
        </Button>
      </div>
    </div>
  );
}