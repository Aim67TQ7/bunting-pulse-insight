import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { SearchIcon, DownloadIcon, FilterIcon } from "lucide-react";
import { ScrollArea } from "@/components/ui/scroll-area";
interface CommentsSectionProps {
  configurationId?: string;
}
export const CommentsSection = ({
  configurationId
}: CommentsSectionProps) => {
  const [searchTerm, setSearchTerm] = useState("");
  const [commentTypeFilter, setCommentTypeFilter] = useState("all");
  const [continentFilter, setContinentFilter] = useState("all");
  const [divisionFilter, setDivisionFilter] = useState("all");
  const [roleFilter, setRoleFilter] = useState("all");
  const [allComments, setAllComments] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  // Load text responses dynamically from database
  useEffect(() => {
    const loadTextResponses = async () => {
      setLoading(true);

      // Get all surveys from single table
      const {
        data: surveys,
        error
      } = await supabase.from('employee_survey_responses').select('id, responses_jsonb, continent, division, role, submitted_at').eq('is_draft', false);
      if (error) {
        console.error('Error loading survey responses:', error);
        setLoading(false);
        return;
      }
      const comments: any[] = [];

      // Process each survey's responses_jsonb
      (surveys || []).forEach((survey: any) => {
        const responses = survey.responses_jsonb as any[] || [];
        responses.forEach((answer: any) => {
          // Process text questions
          if (answer.question_type === 'text') {
            const textValue = answer.answer_value?.text;
            if (textValue && textValue.trim()) {
              comments.push({
                id: `${survey.id}-${answer.question_id}`,
                response_id: survey.id,
                comment_type: getQuestionLabel(answer.question_id),
                comment_text: textValue,
                created_at: survey.submitted_at,
                continent: survey.continent,
                division: survey.division,
                role: survey.role
              });
            }
          }

          // Process rating questions with feedback
          if (answer.question_type === 'rating') {
            const feedback = answer.answer_value?.feedback;
            const rating = answer.answer_value?.rating;
            if (feedback && feedback.trim() && rating && rating <= 3) {
              comments.push({
                id: `${survey.id}-${answer.question_id}-feedback`,
                response_id: survey.id,
                comment_type: `Low Score Follow-up: ${getQuestionLabel(answer.question_id)}`,
                comment_text: feedback,
                rating: rating,
                created_at: survey.submitted_at,
                continent: survey.continent,
                division: survey.division,
                role: survey.role
              });
            }
          }
        });
      });
      setAllComments(comments);
      setLoading(false);
    };
    loadTextResponses();
  }, [configurationId]);
  const getQuestionLabel = (questionId: string): string => {
    const labels: Record<string, string> = {
      'additional-comments': 'Additional Comments',
      'collaboration-feedback': 'Collaboration Feedback',
      'job-satisfaction': 'Job Satisfaction',
      'company-satisfaction': 'Company Recommendation',
      'work-life-balance': 'Work-Life Balance',
      'team-morale': 'Team Morale',
      'performance-awareness': 'Performance Awareness',
      'advancement-opportunities': 'Advancement Opportunities',
      'training-satisfaction': 'Training Satisfaction',
      'tools-equipment-quality': 'Tools & Equipment',
      'workplace-safety': 'Workplace Safety',
      'safety-reporting-comfort': 'Safety Reporting Comfort',
      'communication-clarity': 'Communication Clarity',
      'leadership-openness': 'Leadership Openness',
      'manager-alignment': 'Manager Alignment',
      'cross-functional-collaboration': 'Cross-Functional Collaboration',
      'strategic-confidence': 'Strategic Confidence',
      'company-value-alignment': 'Company Values Alignment',
      'comfortable-suggesting-improvements': 'Comfort Suggesting Improvements',
      'workload-manageability': 'Workload Manageability',
      'manual-processes-focus': 'Manual Processes Focus',
      'pride-in-work': 'Pride in Work'
    };
    return labels[questionId] || questionId;
  };

  // Filter comments based on search and filters
  const filteredComments = allComments.filter((comment: any) => {
    const searchLower = searchTerm.toLowerCase();
    const matchesSearch = !searchTerm || comment.comment_text?.toLowerCase().includes(searchLower) || comment.continent?.toLowerCase().includes(searchLower) || comment.division?.toLowerCase().includes(searchLower) || comment.role?.toLowerCase().includes(searchLower);
    const matchesCommentType = commentTypeFilter === 'all' || comment.comment_type === commentTypeFilter || commentTypeFilter === 'followup' && comment.comment_type?.startsWith('Low Score Follow-up');
    const matchesContinent = continentFilter === 'all' || comment.continent === continentFilter;
    const matchesDivision = divisionFilter === 'all' || comment.division === divisionFilter;
    const matchesRole = roleFilter === 'all' || comment.role === roleFilter;
    return matchesSearch && matchesCommentType && matchesContinent && matchesDivision && matchesRole;
  });
  const clearFilters = () => {
    setSearchTerm("");
    setCommentTypeFilter("all");
    setContinentFilter("all");
    setDivisionFilter("all");
    setRoleFilter("all");
  };
  const exportComments = () => {
    const csv = [['Date', 'Type', 'Continent', 'Division', 'Role', 'Score', 'Comment'], ...filteredComments.map((c: any) => [new Date(c.created_at).toLocaleDateString(), c.comment_type, c.continent || '', c.division || '', c.role || '', c.score || '', `"${c.comment_text?.replace(/"/g, '""') || ''}"`])].map(row => row.join(',')).join('\n');
    const blob = new Blob([csv], {
      type: 'text/csv'
    });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `survey-comments-${new Date().toISOString().split('T')[0]}.csv`;
    a.click();
  };

  // Get unique values for filters
  const uniqueCommentTypes = [...new Set(allComments.map((c: any) => c.comment_type))];
  const uniqueContinents = [...new Set(allComments.map((c: any) => c.continent).filter(Boolean))];
  const uniqueDivisions = [...new Set(allComments.map((c: any) => c.division).filter(Boolean))];
  const uniqueRoles = [...new Set(allComments.map((c: any) => c.role).filter(Boolean))];
  const commentTypeCounts = {
    total: allComments.length,
    text: allComments.filter((c: any) => !c.comment_type.startsWith('Low Score Follow-up')).length,
    followup: allComments.filter((c: any) => c.comment_type.startsWith('Low Score Follow-up')).length
  };
  return <Card className="w-full">
      <CardHeader className="flex flex-row items-center justify-between">
        <div>
          <CardTitle>Survey Comments & Feedback</CardTitle>
          <p className="text-muted-foreground text-sm mt-1">
            Showing {filteredComments.length} of {allComments.length} comments
          </p>
        </div>
        <Button onClick={exportComments} variant="outline" size="sm">
          <DownloadIcon className="h-4 w-4 mr-2" />
          Export CSV
        </Button>
      </CardHeader>
      <CardContent>
        {/* Filters Section */}
        <div className="space-y-4 mb-6">
          

          
        </div>

        {/* Summary Cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
          <Card>
            <CardContent className="pt-6">
              <div className="text-2xl font-bold">{commentTypeCounts.total}</div>
              <p className="text-sm text-muted-foreground">Total Comments</p>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="pt-6">
              <div className="text-2xl font-bold">{commentTypeCounts.text}</div>
              <p className="text-sm text-muted-foreground">Text Responses</p>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="pt-6">
              <div className="text-2xl font-bold">{commentTypeCounts.followup}</div>
              <p className="text-sm text-muted-foreground">Low Score Follow-ups</p>
            </CardContent>
          </Card>
        </div>

        {/* Comments Table */}
        <ScrollArea className="h-[600px] rounded-md border">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead className="w-[120px]">Date</TableHead>
                <TableHead className="w-[250px]">Demographics</TableHead>
                <TableHead className="w-[100px]">Score</TableHead>
                <TableHead>Comment</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {loading ? <TableRow>
                  <TableCell colSpan={4} className="text-center py-8">
                    Loading comments...
                  </TableCell>
                </TableRow> : filteredComments.length === 0 ? <TableRow>
                  <TableCell colSpan={4} className="text-center py-8 text-muted-foreground">
                    No comments match your filters
                  </TableCell>
                </TableRow> : filteredComments.map((comment: any, index: number) => <TableRow key={comment.id || index}>
                    <TableCell className="text-sm">
                      {new Date(comment.created_at).toLocaleDateString()}
                    </TableCell>
                    <TableCell>
                      <div className="space-y-1">
                        <Badge variant="outline" className="mr-1">
                          {comment.comment_type}
                        </Badge>
                        <div className="text-xs text-muted-foreground">
                          {comment.continent && <div>{comment.continent}</div>}
                          {comment.division && <div>{comment.division}</div>}
                          {comment.role && <div>{comment.role}</div>}
                        </div>
                      </div>
                    </TableCell>
                    <TableCell>
                      {comment.score && <Badge variant={comment.score <= 2 ? "destructive" : "secondary"}>
                          {comment.score}/5
                        </Badge>}
                    </TableCell>
                    <TableCell className="max-w-md">
                      <p className="text-sm whitespace-pre-wrap">{comment.comment_text}</p>
                    </TableCell>
                  </TableRow>)}
            </TableBody>
          </Table>
        </ScrollArea>
      </CardContent>
    </Card>;
};