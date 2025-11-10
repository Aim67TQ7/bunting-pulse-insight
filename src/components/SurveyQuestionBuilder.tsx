import { useState, useEffect } from "react";
import { Checkbox } from "@/components/ui/checkbox";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import { Save, Loader2 } from "lucide-react";
import { useSurveyQuestions } from "@/hooks/useSurveyQuestions";

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

// Questions now loaded from database

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

  const { data: allQuestions, isLoading } = useSurveyQuestions();

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

  // Filter questions by type from database
  const demographicQuestions = allQuestions?.filter(q => q.question_type === 'demographic') || [];
  const ratingQuestionsData = allQuestions?.filter(q => q.question_type === 'rating') || [];
  const multiselectQuestionsData = allQuestions?.filter(q => q.question_type === 'multiselect') || [];

  // Group rating questions by section
  const ratingQuestionsBySection = ratingQuestionsData.reduce((acc, q) => {
    const section = q.section || 'Other';
    if (!acc[section]) acc[section] = [];
    acc[section].push(q);
    return acc;
  }, {} as Record<string, typeof ratingQuestionsData>);

  if (isLoading) {
    return (
      <div className="flex items-center justify-center p-8">
        <Loader2 className="w-6 h-6 animate-spin" />
      </div>
    );
  }

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
          <CardTitle>Demographics ({demographics.length}/{demographicQuestions.length})</CardTitle>
          <CardDescription>Background information to segment responses</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          {demographicQuestions.map((q) => (
            <div key={q.question_id} className="flex items-start space-x-3">
              <Checkbox
                id={`demo-${q.question_id}`}
                checked={demographics.includes(q.question_id)}
                onCheckedChange={() => toggleDemographic(q.question_id)}
              />
              <div className="flex-1">
                <Label htmlFor={`demo-${q.question_id}`} className="font-medium">
                  {q.labels.en}
                </Label>
                <p className="text-sm text-muted-foreground">
                  {q.options?.map(opt => opt.labels.en).join(', ')}
                </p>
              </div>
            </div>
          ))}
        </CardContent>
      </Card>

      {/* Rating Questions */}
      <Card>
        <CardHeader>
          <CardTitle>Rating Questions ({ratingQuestions.length}/{ratingQuestionsData.length})</CardTitle>
          <CardDescription>1-5 scale agreement statements</CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          {Object.entries(ratingQuestionsBySection).map(([section, questions]) => (
            <div key={section}>
              <h4 className="font-semibold mb-3">{section}</h4>
              <div className="space-y-3 pl-4">
                {questions.map((q) => (
                  <div key={q.question_id} className="flex items-center space-x-3">
                    <Checkbox
                      id={`rating-${q.question_id}`}
                      checked={ratingQuestions.includes(q.question_id)}
                      onCheckedChange={() => toggleRatingQuestion(q.question_id)}
                    />
                    <Label htmlFor={`rating-${q.question_id}`} className="font-normal">
                      {q.labels.en}
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
          <CardTitle>Multi-Select Questions ({multiselectQuestions.length}/{multiselectQuestionsData.length})</CardTitle>
          <CardDescription>Questions with multiple choice answers</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          {multiselectQuestionsData.map((q) => (
            <div key={q.question_id} className="flex items-start space-x-3">
              <Checkbox
                id={`multi-${q.question_id}`}
                checked={multiselectQuestions.includes(q.question_id)}
                onCheckedChange={() => toggleMultiselectQuestion(q.question_id)}
              />
              <div className="flex-1">
                <Label htmlFor={`multi-${q.question_id}`} className="font-medium">
                  {q.labels.en}
                </Label>
                <p className="text-sm text-muted-foreground">
                  {q.options?.map(opt => opt.labels.en).join(', ')}
                </p>
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
