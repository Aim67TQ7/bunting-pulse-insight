import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { CheckIcon, AlertTriangleIcon } from "lucide-react";
import { cn } from "@/lib/utils";
import { useToast } from "@/hooks/use-toast";

interface Question {
  id: string;
  text: string;
  type: "radio" | "multiSelect";
  options: { value: string; label: string }[];
  followUpPrompt?: string;
}

const questions: Question[] = [
  {
    id: "continent",
    text: "Which Continent is your primary work location?",
    type: "radio",
    options: [
      { value: "north-america", label: "North America" },
      { value: "europe", label: "Europe" }
    ]
  },
  {
    id: "division",
    text: "Which Division of Bunting do you work in?",
    type: "radio",
    options: [
      { value: "equipment", label: "Equipment" },
      { value: "magnets", label: "Magnets" },
      { value: "both", label: "Both" }
    ]
  },
  {
    id: "role",
    text: "Which best explains your role?",
    type: "radio",
    options: [
      { value: "sales-marketing", label: "Sales/Marketing/Product" },
      { value: "operations", label: "Operations/Engineering/Production" },
      { value: "admin", label: "Admin/HR/Finance" }
    ]
  },
  {
    id: "job-satisfaction",
    text: "How satisfied are you with your job?",
    type: "radio",
    options: [
      { value: "1", label: "1 - Least satisfied" },
      { value: "2", label: "2" },
      { value: "3", label: "3" },
      { value: "4", label: "4" },
      { value: "5", label: "5 - Extremely satisfied" }
    ],
    followUpPrompt: "Could you share what aspects of your job contribute to this rating?"
  },
  {
    id: "communication-clarity",
    text: "How clear is the communication you receive from leadership regarding company goals and objectives?",
    type: "radio",
    options: [
      { value: "1", label: "1 - Very unclear" },
      { value: "2", label: "2" },
      { value: "3", label: "3" },
      { value: "4", label: "4" },
      { value: "5", label: "5 - Very clear" }
    ],
    followUpPrompt: "What would help improve communication clarity from leadership?"
  },
  {
    id: "communication-style",
    text: "Which communication styles do you prefer?",
    type: "multiSelect",
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
    id: "safety",
    text: "How safe do you feel in your work environment?",
    type: "radio",
    options: [
      { value: "1", label: "1 - Very unsafe" },
      { value: "2", label: "2" },
      { value: "3", label: "3" },
      { value: "4", label: "4" },
      { value: "5", label: "5 - Very safe" }
    ],
    followUpPrompt: "What safety concerns do you have, or what improvements would you suggest?"
  },
  {
    id: "training",
    text: "How satisfied are you with the training provided for your current role?",
    type: "radio",
    options: [
      { value: "1", label: "1 - Very dissatisfied" },
      { value: "2", label: "2" },
      { value: "3", label: "3" },
      { value: "4", label: "4" },
      { value: "5", label: "5 - Very satisfied" }
    ],
    followUpPrompt: "What additional training or support would be most valuable for your role?"
  },
  {
    id: "work-life-balance",
    text: "How would you rate your current work-life balance?",
    type: "radio",
    options: [
      { value: "1", label: "1 - Very poor" },
      { value: "2", label: "2" },
      { value: "3", label: "3" },
      { value: "4", label: "4" },
      { value: "5", label: "5 - Excellent" }
    ],
    followUpPrompt: "What changes would help improve your work-life balance?"
  },
  {
    id: "cross-office-communication",
    text: "How are the overall communication and collaboration between the US and UK offices?",
    type: "radio",
    options: [
      { value: "1", label: "1 - Very poor" },
      { value: "2", label: "2" },
      { value: "3", label: "3" },
      { value: "4", label: "4" },
      { value: "5", label: "5 - Excellent" }
    ],
    followUpPrompt: "What would improve communication and collaboration between offices?"
  },
  {
    id: "motivation",
    text: "What motivates you to stay with the company?",
    type: "multiSelect",
    options: [
      { value: "compensation", label: "Compensation" },
      { value: "benefits", label: "Benefits package" },
      { value: "job-satisfaction", label: "Job satisfaction" }
    ]
  }
];

export function EmployeeSurvey() {
  const [currentQuestion, setCurrentQuestion] = useState(0);
  const [responses, setResponses] = useState<Record<string, string | string[]>>({});
  const [followUpResponses, setFollowUpResponses] = useState<Record<string, string>>({});
  const [showFollowUp, setShowFollowUp] = useState(false);
  const [isComplete, setIsComplete] = useState(false);
  const [submissionCount, setSubmissionCount] = useState(0);
  const { toast } = useToast();

  useEffect(() => {
    const count = parseInt(localStorage.getItem("survey-submissions") || "0");
    setSubmissionCount(count);
  }, []);

  const progress = ((currentQuestion + 1) / questions.length) * 100;
  const question = questions[currentQuestion];

  const handleResponse = (value: string | string[]) => {
    setResponses(prev => ({ ...prev, [question.id]: value }));
    
    // Check if we need to show follow-up for unfavorable ratings
    if (question.followUpPrompt && typeof value === "string") {
      const rating = parseInt(value);
      if (rating <= 3) {
        setShowFollowUp(true);
        return;
      }
    }
    
    proceedToNext();
  };

  const handleFollowUpResponse = (value: string) => {
    setFollowUpResponses(prev => ({ ...prev, [question.id]: value }));
    setShowFollowUp(false);
    proceedToNext();
  };

  const proceedToNext = () => {
    if (currentQuestion < questions.length - 1) {
      setCurrentQuestion(prev => prev + 1);
    } else {
      handleSubmit();
    }
  };

  const handleSubmit = () => {
    if (submissionCount >= 2) {
      toast({
        title: "Submission limit reached",
        description: "You have already submitted this survey twice.",
        variant: "destructive"
      });
      return;
    }

    // Store responses (in a real app, this would go to a backend)
    const surveyData = {
      responses,
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

  if (submissionCount >= 2 && !isComplete) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center p-4">
        <Card className="w-full max-w-md">
          <CardContent className="text-center p-8">
            <AlertTriangleIcon className="h-12 w-12 text-warning mx-auto mb-4" />
            <h2 className="text-xl font-semibold mb-2">Survey Limit Reached</h2>
            <p className="text-muted-foreground">
              You have already completed this survey twice. Thank you for your participation!
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
              Submissions remaining: {2 - submissionCount - 1}
            </p>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background p-4">
      <div className="max-w-2xl mx-auto">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-center mb-2">Employee Satisfaction Survey</h1>
          <p className="text-center text-muted-foreground mb-6">
            Your feedback is anonymous and valuable to us
          </p>
          <div className="space-y-2">
            <div className="flex justify-between text-sm text-muted-foreground">
              <span>Question {currentQuestion + 1} of {questions.length}</span>
              <span>{Math.round(progress)}% complete</span>
            </div>
            <Progress value={progress} className="h-2" />
          </div>
        </div>

        <Card className="mb-6">
          <CardHeader>
            <CardTitle className="text-lg font-medium">
              {question.text}
            </CardTitle>
          </CardHeader>
          <CardContent>
            {!showFollowUp ? (
              question.type === "radio" ? (
                <RadioGroup
                  value={responses[question.id] as string || ""}
                  onValueChange={handleResponse}
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
              ) : (
                <div className="space-y-3">
                  {question.options.map((option) => (
                    <div key={option.value} className="flex items-center space-x-2">
                      <input
                        type="checkbox"
                        id={option.value}
                        checked={(responses[question.id] as string[] || []).includes(option.value)}
                        onChange={(e) => {
                          const currentValues = (responses[question.id] as string[]) || [];
                          if (e.target.checked) {
                            handleResponse([...currentValues, option.value]);
                          } else {
                            handleResponse(currentValues.filter(v => v !== option.value));
                          }
                        }}
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
                  {(responses[question.id] as string[] || []).length > 0 && (
                    <Button onClick={() => proceedToNext()} className="mt-4">
                      Continue
                    </Button>
                  )}
                </div>
              )
            ) : (
              <div className="space-y-4">
                <div className="p-4 bg-warning/10 border border-warning/20 rounded-md">
                  <p className="text-sm font-medium text-warning-foreground mb-2">
                    {question.followUpPrompt}
                  </p>
                  <Textarea
                    placeholder="Please share your thoughts..."
                    value={followUpResponses[question.id] || ""}
                    onChange={(e) => setFollowUpResponses(prev => ({ 
                      ...prev, 
                      [question.id]: e.target.value 
                    }))}
                    className="min-h-[100px]"
                  />
                </div>
                <div className="flex gap-2">
                  <Button
                    onClick={() => handleFollowUpResponse(followUpResponses[question.id] || "")}
                    disabled={!followUpResponses[question.id]?.trim()}
                  >
                    Continue
                  </Button>
                  <Button 
                    variant="outline" 
                    onClick={() => {
                      setShowFollowUp(false);
                      proceedToNext();
                    }}
                  >
                    Skip
                  </Button>
                </div>
              </div>
            )}
          </CardContent>
        </Card>

        {currentQuestion > 0 && !showFollowUp && (
          <Button
            variant="outline"
            onClick={() => setCurrentQuestion(prev => prev - 1)}
            className="mb-4"
          >
            Previous Question
          </Button>
        )}
      </div>
    </div>
  );
}