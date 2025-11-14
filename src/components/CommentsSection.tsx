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

export const CommentsSection = ({ configurationId }: CommentsSectionProps) => {
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
      
      // Get all text-type question responses with metadata
      const { data: textResponses, error: textError } = await supabase
        .from('survey_question_responses')
        .select(`
          id,
          response_id,
          question_id,
          answer_value,
          created_at,
        survey_question_config!inner(
          labels,
          question_type
        ),
          employee_survey_responses!inner(
            continent,
            division,
            role,
            is_draft
          )
        `)
        .eq('survey_question_config.question_type', 'text')
        .eq('employee_survey_responses.is_draft', false);

      if (textError) {
        console.error('Error loading text responses:', textError);
        setLoading(false);
        return;
      }

      // Also get rating responses with follow-ups (low scores 1-3)
      const { data: ratingResponses, error: ratingError } = await supabase
        .from('survey_question_responses')
        .select(`
          id,
          response_id,
          question_id,
          answer_value,
          created_at,
        survey_question_config!inner(
          labels,
          question_type
        ),
          employee_survey_responses!inner(
            continent,
            division,
            role,
            is_draft
          )
        `)
        .eq('survey_question_config.question_type', 'rating')
        .eq('employee_survey_responses.is_draft', false);

      if (ratingError) {
        console.error('Error loading rating responses:', ratingError);
      }

      const comments: any[] = [];

      // Process text responses
      if (textResponses) {
        textResponses.forEach((response: any) => {
          // Handle both new text structure and legacy feedback structure
          const textValue = response.answer_value?.text || response.answer_value?.feedback;
          if (textValue && textValue.trim()) {
            comments.push({
              id: response.id,
              response_id: response.response_id,
              comment_type: response.survey_question_config.labels?.en || 'Text Response',
              comment_text: textValue,
              created_at: response.created_at,
              continent: response.employee_survey_responses.continent,
              division: response.employee_survey_responses.division,
              role: response.employee_survey_responses.role,
            });
          }
        });
      }

      // Process rating responses with follow-ups
      if (ratingResponses) {
        ratingResponses.forEach((response: any) => {
          const followUp = response.answer_value?.follow_up;
          const rating = response.answer_value?.rating;
          if (followUp && followUp.trim()) {
            // Only include follow-ups if rating is 1-3 (low score)
            if (rating && rating <= 3) {
              comments.push({
                id: response.id,
                response_id: response.response_id,
                comment_type: `Low Score Follow-up: ${response.survey_question_config.question_labels?.en || 'Rating Question'}`,
                comment_text: followUp,
                score: rating,
                created_at: response.created_at,
                continent: response.employee_survey_responses.continent,
                division: response.employee_survey_responses.division,
                role: response.employee_survey_responses.role,
              });
            }
          }
        });
      }

      setAllComments(comments);
      setLoading(false);
    };

    loadTextResponses();
  }, [configurationId]);

  // Filter comments based on search and filters
  const filteredComments = allComments.filter((comment: any) => {
    const searchLower = searchTerm.toLowerCase();
    const matchesSearch = !searchTerm || 
      comment.comment_text?.toLowerCase().includes(searchLower) ||
      comment.continent?.toLowerCase().includes(searchLower) ||
      comment.division?.toLowerCase().includes(searchLower) ||
      comment.role?.toLowerCase().includes(searchLower);
    
    const matchesCommentType = commentTypeFilter === 'all' || 
      comment.comment_type === commentTypeFilter ||
      (commentTypeFilter === 'followup' && comment.comment_type?.startsWith('Low Score Follow-up'));
    
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
    const csv = [
      ['Date', 'Type', 'Continent', 'Division', 'Role', 'Score', 'Comment'],
      ...filteredComments.map((c: any) => [
        new Date(c.created_at).toLocaleDateString(),
        c.comment_type,
        c.continent || '',
        c.division || '',
        c.role || '',
        c.score || '',
        `"${c.comment_text?.replace(/"/g, '""') || ''}"`
      ])
    ].map(row => row.join(',')).join('\n');

    const blob = new Blob([csv], { type: 'text/csv' });
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
    followup: allComments.filter((c: any) => c.comment_type.startsWith('Low Score Follow-up')).length,
  };

  return (
    <Card className="w-full">
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
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="space-y-2">
              <Label htmlFor="search">Search</Label>
              <div className="relative">
                <SearchIcon className="absolute left-2 top-2.5 h-4 w-4 text-muted-foreground" />
                <Input
                  id="search"
                  placeholder="Search comments..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-8"
                />
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="commentType">Comment Type</Label>
              <Select value={commentTypeFilter} onValueChange={setCommentTypeFilter}>
                <SelectTrigger>
                  <SelectValue placeholder="All Types" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Types</SelectItem>
                  {uniqueCommentTypes.map((type) => (
                    <SelectItem key={type} value={type}>{type}</SelectItem>
                  ))}
                  <SelectItem value="followup">Low Score Follow-ups</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label htmlFor="continent">Continent</Label>
              <Select value={continentFilter} onValueChange={setContinentFilter}>
                <SelectTrigger>
                  <SelectValue placeholder="All Continents" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Continents</SelectItem>
                  {uniqueContinents.map((continent) => (
                    <SelectItem key={continent} value={continent as string}>{continent}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="space-y-2">
              <Label htmlFor="division">Division</Label>
              <Select value={divisionFilter} onValueChange={setDivisionFilter}>
                <SelectTrigger>
                  <SelectValue placeholder="All Divisions" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Divisions</SelectItem>
                  {uniqueDivisions.map((division) => (
                    <SelectItem key={division} value={division as string}>{division}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label htmlFor="role">Role</Label>
              <Select value={roleFilter} onValueChange={setRoleFilter}>
                <SelectTrigger>
                  <SelectValue placeholder="All Roles" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Roles</SelectItem>
                  {uniqueRoles.map((role) => (
                    <SelectItem key={role} value={role as string}>{role}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="flex items-end">
              <Button onClick={clearFilters} variant="outline" className="w-full">
                <FilterIcon className="h-4 w-4 mr-2" />
                Clear Filters
              </Button>
            </div>
          </div>
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
              {loading ? (
                <TableRow>
                  <TableCell colSpan={4} className="text-center py-8">
                    Loading comments...
                  </TableCell>
                </TableRow>
              ) : filteredComments.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={4} className="text-center py-8 text-muted-foreground">
                    No comments match your filters
                  </TableCell>
                </TableRow>
              ) : (
                filteredComments.map((comment: any, index: number) => (
                  <TableRow key={comment.id || index}>
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
                      {comment.score && (
                        <Badge variant={comment.score <= 2 ? "destructive" : "secondary"}>
                          {comment.score}/5
                        </Badge>
                      )}
                    </TableCell>
                    <TableCell className="max-w-md">
                      <p className="text-sm whitespace-pre-wrap">{comment.comment_text}</p>
                    </TableCell>
                  </TableRow>
                ))
              )}
            </TableBody>
          </Table>
        </ScrollArea>
      </CardContent>
    </Card>
  );
};
