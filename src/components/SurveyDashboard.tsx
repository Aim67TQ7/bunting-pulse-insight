import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, PieChart, Pie, Cell } from "recharts";
import { ChevronLeftIcon, UsersIcon, TrendingUpIcon, AlertTriangleIcon, LockIcon, UnlockIcon } from "lucide-react";

interface SurveyResponse {
  responses: Record<string, string | string[]>;
  followUpResponses: Record<string, string>;
  timestamp: string;
}

const COLORS = ['hsl(var(--primary))', 'hsl(var(--secondary))', 'hsl(var(--accent))', 'hsl(var(--muted))', 'hsl(var(--success))', 'hsl(var(--warning))'];

export function SurveyDashboard({ onBack }: { onBack: () => void }) {
  const [surveyData, setSurveyData] = useState<SurveyResponse[]>([]);
  const [selectedQuestion, setSelectedQuestion] = useState<string | null>(null);
  const [isAdminAuthenticated, setIsAdminAuthenticated] = useState(false);
  const [adminPasscode, setAdminPasscode] = useState("");
  const [showAdminDialog, setShowAdminDialog] = useState(false);

  useEffect(() => {
    const data = JSON.parse(localStorage.getItem("survey-data") || "[]");
    setSurveyData(data);
  }, []);

  const handleAdminAuth = () => {
    if (adminPasscode === "4155") {
      setIsAdminAuthenticated(true);
      setShowAdminDialog(false);
      setAdminPasscode("");
    } else {
      alert("Invalid passcode");
    }
  };

  const totalResponses = surveyData.length;

  const getQuestionStats = (questionId: string) => {
    const responses = surveyData.map(survey => survey.responses[questionId]).filter(Boolean);
    const stats: Record<string, number> = {};
    
    responses.forEach(response => {
      if (Array.isArray(response)) {
        response.forEach(value => {
          stats[value] = (stats[value] || 0) + 1;
        });
      } else {
        stats[response] = (stats[response] || 0) + 1;
      }
    });
    
    return Object.entries(stats).map(([key, value]) => ({
      name: key,
      value,
      percentage: Math.round((value / responses.length) * 100)
    }));
  };

  const getRatingStats = () => {
    const ratingQuestions = [
      'job-satisfaction',
      'communication-clarity', 
      'safety',
      'training',
      'work-life-balance',
      'cross-office-communication'
    ];
    
    return ratingQuestions.map(questionId => {
      const responses = surveyData.map(survey => survey.responses[questionId])
        .filter(Boolean)
        .map(response => parseInt(response as string));
      
      const average = responses.length > 0 
        ? responses.reduce((sum, rating) => sum + rating, 0) / responses.length 
        : 0;
      
      const unfavorableCount = responses.filter(rating => rating <= 3).length;
      
      return {
        question: questionId,
        average: Math.round(average * 10) / 10,
        total: responses.length,
        unfavorableCount,
        unfavorablePercentage: responses.length > 0 ? Math.round((unfavorableCount / responses.length) * 100) : 0
      };
    });
  };

  const getFollowUpComments = () => {
    const comments: Array<{ question: string; comment: string; timestamp: string }> = [];
    
    surveyData.forEach(survey => {
      Object.entries(survey.followUpResponses).forEach(([questionId, comment]) => {
        if (comment.trim()) {
          comments.push({
            question: questionId,
            comment,
            timestamp: survey.timestamp
          });
        }
      });
    });
    
    return comments;
  };

  const ratingStats = getRatingStats();
  const followUpComments = getFollowUpComments();
  const averageOverallSatisfaction = ratingStats.find(stat => stat.question === 'job-satisfaction')?.average || 0;

  if (totalResponses === 0) {
    return (
      <div className="min-h-screen bg-background p-4">
        <div className="max-w-6xl mx-auto">
          <div className="flex items-center gap-4 mb-8">
            <Button variant="outline" onClick={onBack}>
              <ChevronLeftIcon className="h-4 w-4 mr-2" />
              Back to Survey
            </Button>
            <h1 className="text-3xl font-bold">Survey Dashboard</h1>
          </div>
          
          <Card>
            <CardContent className="text-center p-12">
              <UsersIcon className="h-16 w-16 text-muted-foreground mx-auto mb-4" />
              <h2 className="text-xl font-semibold mb-2">No responses yet</h2>
              <p className="text-muted-foreground">
                Survey responses will appear here once employees start submitting their feedback.
              </p>
            </CardContent>
          </Card>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background p-4">
      <div className="max-w-6xl mx-auto">
        <div className="flex items-center gap-4 mb-8">
          <Button variant="outline" onClick={onBack}>
            <ChevronLeftIcon className="h-4 w-4 mr-2" />
            Back to Survey
          </Button>
          <h1 className="text-3xl font-bold">Survey Dashboard</h1>
        </div>

        {/* Overview Cards */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
          <Card>
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-muted-foreground">Total Responses</p>
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
                  <p className="text-sm font-medium text-muted-foreground">Avg Job Satisfaction</p>
                  <p className="text-2xl font-bold">{averageOverallSatisfaction}/5</p>
                </div>
                <TrendingUpIcon className="h-8 w-8 text-success" />
              </div>
            </CardContent>
          </Card>
          
          <Card>
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-muted-foreground">Comments</p>
                  <p className="text-2xl font-bold">{followUpComments.length}</p>
                </div>
                <div className="flex items-center gap-2">
                  {isAdminAuthenticated ? (
                    <UnlockIcon className="h-8 w-8 text-success" />
                  ) : (
                    <LockIcon className="h-8 w-8 text-warning" />
                  )}
                </div>
              </div>
            </CardContent>
          </Card>
          
          <Card>
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-muted-foreground">Response Rate</p>
                  <p className="text-2xl font-bold">N/A</p>
                </div>
                <div className="h-8 w-8 bg-muted rounded-full" />
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Rating Analysis */}
        <Card className="mb-8">
          <CardHeader>
            <CardTitle>Rating Questions Analysis</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-6">
              {ratingStats.map((stat) => (
                <div key={stat.question} className="space-y-2">
                  <div className="flex items-center justify-between">
                    <h4 className="font-medium capitalize">
                      {stat.question.replace(/-/g, ' ')}
                    </h4>
                    <div className="flex items-center gap-2">
                      <Badge variant="outline">
                        Avg: {stat.average}/5
                      </Badge>
                      {stat.unfavorablePercentage > 30 && (
                        <Badge variant="destructive">
                          {stat.unfavorablePercentage}% unfavorable
                        </Badge>
                      )}
                    </div>
                  </div>
                  <div className="w-full bg-muted rounded-full h-2">
                    <div
                      className="bg-primary h-2 rounded-full transition-all duration-300"
                      style={{ width: `${(stat.average / 5) * 100}%` }}
                    />
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        {/* Demographic Breakdown */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
          <Card>
            <CardHeader>
              <CardTitle>Work Location</CardTitle>
            </CardHeader>
            <CardContent>
              <ResponsiveContainer width="100%" height={300}>
                <PieChart>
                  <Pie
                    data={getQuestionStats('continent')}
                    cx="50%"
                    cy="50%"
                    labelLine={false}
                    label={({ name, percentage }) => `${name}: ${percentage}%`}
                    outerRadius={80}
                    fill="#8884d8"
                    dataKey="value"
                  >
                    {getQuestionStats('continent').map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                    ))}
                  </Pie>
                  <Tooltip />
                </PieChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Division</CardTitle>
            </CardHeader>
            <CardContent>
              <ResponsiveContainer width="100%" height={300}>
                <BarChart data={getQuestionStats('division')}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="name" />
                  <YAxis />
                  <Tooltip />
                  <Bar dataKey="value" fill="hsl(var(--primary))" />
                </BarChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>
        </div>

        {/* Comments Section - Admin Only */}
        <div className="mb-8">
          {!isAdminAuthenticated ? (
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <LockIcon className="h-5 w-5" />
                  Comments Section - Admin Access Required
                </CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-muted-foreground mb-4">
                  Comments and feedback require admin authentication to view.
                </p>
                <Button onClick={() => setShowAdminDialog(true)}>
                  <UnlockIcon className="h-4 w-4 mr-2" />
                  Admin Access
                </Button>
              </CardContent>
            </Card>
          ) : (
            followUpComments.length > 0 && (
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <UnlockIcon className="h-5 w-5 text-success" />
                    Follow-up Comments ({followUpComments.length})
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4 max-h-96 overflow-y-auto">
                    {followUpComments.map((comment, index) => (
                      <div key={index} className="border-l-4 border-warning pl-4 py-2">
                        <div className="flex items-center gap-2 mb-1">
                          <Badge variant="outline" className="text-xs">
                            {comment.question.replace(/-/g, ' ')}
                          </Badge>
                          <span className="text-xs text-muted-foreground">
                            {new Date(comment.timestamp).toLocaleDateString()}
                          </span>
                        </div>
                        <p className="text-sm">{comment.comment}</p>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            )
          )}
        </div>

        {/* Admin Authentication Dialog */}
        <Dialog open={showAdminDialog} onOpenChange={setShowAdminDialog}>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Admin Authentication</DialogTitle>
            </DialogHeader>
            <div className="space-y-4">
              <p className="text-sm text-muted-foreground">
                Enter the admin passcode to view employee comments and feedback.
              </p>
              <Input
                type="password"
                placeholder="Enter admin passcode"
                value={adminPasscode}
                onChange={(e) => setAdminPasscode(e.target.value)}
                onKeyPress={(e) => e.key === 'Enter' && handleAdminAuth()}
              />
              <div className="flex gap-2">
                <Button onClick={handleAdminAuth} className="flex-1">
                  Authenticate
                </Button>
                <Button variant="outline" onClick={() => setShowAdminDialog(false)}>
                  Cancel
                </Button>
              </div>
            </div>
          </DialogContent>
        </Dialog>

        <div className="mt-8 p-4 bg-muted/50 rounded-lg">
          <p className="text-sm text-muted-foreground text-center">
            💡 <strong>Note:</strong> For complete analytics and AI-powered insights, connect this application to a backend database. 
            This will enable advanced reporting, trend analysis, and executive summaries.
          </p>
        </div>
      </div>
    </div>
  );
}