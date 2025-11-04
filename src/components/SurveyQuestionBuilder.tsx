import { useState, useEffect } from "react";
import { Checkbox } from "@/components/ui/checkbox";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import { Save } from "lucide-react";

interface SurveyQuestionBuilderProps {
  selectedDemographics: string[];
  selectedRatingQuestions: string[];
  selectedMultiselectQuestions: string[];
  onUpdate: (
    demographics: string[],
    ratingQuestions: string[],
    multiselectQuestions: string[]
  ) => void;
}

const DEMOGRAPHIC_QUESTIONS = [
  { id: "continent", label: "Continent", description: "Which Continent is your primary work location?" },
  { id: "division", label: "Division", description: "Which Division of Bunting do you work in?" },
  { id: "role", label: "Role", description: "Which best explains your role?" },
];

const RATING_QUESTIONS = [
  { id: "job_satisfaction", label: "Job Satisfaction", section: "Engagement & Job Satisfaction" },
  { id: "recommend_company", label: "Company Recommendation", section: "Engagement & Job Satisfaction" },
  { id: "strategic_confidence", label: "Future View (2 years)", section: "Engagement & Job Satisfaction" },
  { id: "manager_alignment", label: "Clear Expectations", section: "Leadership & Communication" },
  { id: "performance_awareness", label: "Performance Awareness", section: "Leadership & Communication" },
  { id: "communication_clarity", label: "Information Relay", section: "Leadership & Communication" },
  { id: "leadership_openness", label: "Management Feedback", section: "Leadership & Communication" },
  { id: "training_satisfaction", label: "Training Adequacy", section: "Training & Development" },
  { id: "advancement_opportunities", label: "Advancement Opportunities", section: "Training & Development" },
  { id: "cross_functional_collaboration", label: "Cooperation", section: "Teamwork & Culture" },
  { id: "team_morale", label: "Team Morale", section: "Teamwork & Culture" },
  { id: "pride_in_work", label: "Pride in Work", section: "Teamwork & Culture" },
  { id: "workplace_safety", label: "Safety Focus", section: "Safety & Work Environment" },
  { id: "safety_reporting_comfort", label: "Safety Reporting Comfort", section: "Safety & Work Environment" },
  { id: "workload_manageability", label: "Workload Manageability", section: "Scheduling & Workload" },
  { id: "work_life_balance", label: "Work-Life Balance", section: "Scheduling & Workload" },
  { id: "tools_equipment_quality", label: "Tools & Equipment", section: "Tools, Equipment & Processes" },
  { id: "manual_processes_focus", label: "Process Efficiency", section: "Tools, Equipment & Processes" },
  { id: "company_value_alignment", label: "Company Values Contributions", section: "Tools, Equipment & Processes" },
  { id: "comfortable_suggesting_improvements", label: "Change Management", section: "Tools, Equipment & Processes" },
];

const MULTISELECT_QUESTIONS = [
  { id: "communication_preferences", label: "Communication Preferences", description: "Which communication styles do you prefer?" },
  { id: "motivation_factors", label: "Motivation Factors", description: "What motivates you to stay with the company?" },
  { id: "information_preferences", label: "Information Preferences", description: "What information would you like to receive more?" },
];

export function SurveyQuestionBuilder({
  selectedDemographics,
  selectedRatingQuestions,
  selectedMultiselectQuestions,
  onUpdate,
}: SurveyQuestionBuilderProps) {
  const [demographics, setDemographics] = useState<string[]>(selectedDemographics);
  const [ratingQuestions, setRatingQuestions] = useState<string[]>(selectedRatingQuestions);
  const [multiselectQuestions, setMultiselectQuestions] = useState<string[]>(selectedMultiselectQuestions);
  const [hasChanges, setHasChanges] = useState(false);

  useEffect(() => {
    setDemographics(selectedDemographics);
    setRatingQuestions(selectedRatingQuestions);
    setMultiselectQuestions(selectedMultiselectQuestions);
    setHasChanges(false);
  }, [selectedDemographics, selectedRatingQuestions, selectedMultiselectQuestions]);

  const toggleDemographic = (id: string) => {
    setDemographics(prev =>
      prev.includes(id) ? prev.filter(q => q !== id) : [...prev, id]
    );
    setHasChanges(true);
  };

  const toggleRatingQuestion = (id: string) => {
    setRatingQuestions(prev =>
      prev.includes(id) ? prev.filter(q => q !== id) : [...prev, id]
    );
    setHasChanges(true);
  };

  const toggleMultiselectQuestion = (id: string) => {
    setMultiselectQuestions(prev =>
      prev.includes(id) ? prev.filter(q => q !== id) : [...prev, id]
    );
    setHasChanges(true);
  };

  const handleSave = () => {
    onUpdate(demographics, ratingQuestions, multiselectQuestions);
    setHasChanges(false);
  };

  const totalQuestions = demographics.length + ratingQuestions.length + multiselectQuestions.length;
  const estimatedTime = Math.ceil(totalQuestions * 0.25); // ~15 seconds per question

  // Group rating questions by section
  const ratingQuestionsBySection = RATING_QUESTIONS.reduce((acc, q) => {
    if (!acc[q.section]) acc[q.section] = [];
    acc[q.section].push(q);
    return acc;
  }, {} as Record<string, typeof RATING_QUESTIONS>);

  return (
    <div className="space-y-6">
      {/* Summary */}
      <Card className="bg-muted/50">
        <CardContent className="pt-6">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-center">
            <div>
              <div className="text-2xl font-bold">{totalQuestions}</div>
              <div className="text-sm text-muted-foreground">Total Questions</div>
            </div>
            <div>
              <div className="text-2xl font-bold">{demographics.length}</div>
              <div className="text-sm text-muted-foreground">Demographics</div>
            </div>
            <div>
              <div className="text-2xl font-bold">{ratingQuestions.length}</div>
              <div className="text-sm text-muted-foreground">Rating Questions</div>
            </div>
            <div>
              <div className="text-2xl font-bold">~{estimatedTime} min</div>
              <div className="text-sm text-muted-foreground">Est. Time</div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Demographics */}
      <Card>
        <CardHeader>
          <CardTitle>Demographics ({demographics.length}/3)</CardTitle>
          <CardDescription>Background information to segment responses</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          {DEMOGRAPHIC_QUESTIONS.map((q) => (
            <div key={q.id} className="flex items-start space-x-3">
              <Checkbox
                id={`demo-${q.id}`}
                checked={demographics.includes(q.id)}
                onCheckedChange={() => toggleDemographic(q.id)}
              />
              <div className="flex-1">
                <Label htmlFor={`demo-${q.id}`} className="font-medium">
                  {q.label}
                </Label>
                <p className="text-sm text-muted-foreground">{q.description}</p>
              </div>
            </div>
          ))}
        </CardContent>
      </Card>

      {/* Rating Questions */}
      <Card>
        <CardHeader>
          <CardTitle>Rating Questions ({ratingQuestions.length}/20)</CardTitle>
          <CardDescription>1-5 scale agreement statements</CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          {Object.entries(ratingQuestionsBySection).map(([section, questions]) => (
            <div key={section}>
              <h4 className="font-semibold mb-3">{section}</h4>
              <div className="space-y-3 pl-4">
                {questions.map((q) => (
                  <div key={q.id} className="flex items-center space-x-3">
                    <Checkbox
                      id={`rating-${q.id}`}
                      checked={ratingQuestions.includes(q.id)}
                      onCheckedChange={() => toggleRatingQuestion(q.id)}
                    />
                    <Label htmlFor={`rating-${q.id}`} className="font-normal">
                      {q.label}
                    </Label>
                  </div>
                ))}
              </div>
              {section !== Object.keys(ratingQuestionsBySection)[Object.keys(ratingQuestionsBySection).length - 1] && (
                <Separator className="mt-4" />
              )}
            </div>
          ))}
        </CardContent>
      </Card>

      {/* Multi-Select Questions */}
      <Card>
        <CardHeader>
          <CardTitle>Multi-Select Questions ({multiselectQuestions.length}/3)</CardTitle>
          <CardDescription>Questions with multiple choice answers</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          {MULTISELECT_QUESTIONS.map((q) => (
            <div key={q.id} className="flex items-start space-x-3">
              <Checkbox
                id={`multi-${q.id}`}
                checked={multiselectQuestions.includes(q.id)}
                onCheckedChange={() => toggleMultiselectQuestion(q.id)}
              />
              <div className="flex-1">
                <Label htmlFor={`multi-${q.id}`} className="font-medium">
                  {q.label}
                </Label>
                <p className="text-sm text-muted-foreground">{q.description}</p>
              </div>
            </div>
          ))}
        </CardContent>
      </Card>

      {/* Save button */}
      <div className="flex justify-end">
        <Button onClick={handleSave} disabled={!hasChanges}>
          <Save className="w-4 h-4 mr-2" />
          Save Configuration
        </Button>
      </div>
    </div>
  );
}
