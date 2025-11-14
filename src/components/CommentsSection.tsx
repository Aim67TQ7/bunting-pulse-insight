import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Button } from "@/components/ui/button";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { DownloadIcon } from "lucide-react";
import { ScrollArea } from "@/components/ui/scroll-area";

interface CommentsSectionProps {
  configurationId?: string;
}

export const CommentsSection = ({ configurationId }: CommentsSectionProps) => {
  const [searchTerm, setSearchTerm] = useState("");
  const [continentFilter, setContinentFilter] = useState("all");
  const [divisionFilter, setDivisionFilter] = useState("all");
  const [roleFilter, setRoleFilter] = useState("all");
  const [allComments, setAllComments] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const loadTextResponses = async () => {
      setLoading(true);
      const { data: surveys, error } = await supabase
        .from('employee_survey_responses')
        .select('id, responses_jsonb, continent, division, role, submitted_at')
        .eq('is_draft', false);
      
      if (error) {
        console.error('Error loading survey responses:', error);
        setLoading(false);
        return;
      }

      const comments: any[] = [];
      (surveys || []).forEach((survey: any) => {
        const responses = survey.responses_jsonb as any[] || [];
        responses.forEach((answer: any) => {
          if (answer.question_type === 'text' && answer.question_id === 'additional-comments') {
            const textValue = answer.answer_value?.text;
            if (textValue && textValue.trim()) {
              comments.push({
                id: `${survey.id}-${answer.question_id}`,
                response_id: survey.id,
                comment_text: textValue,
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

  const filteredComments = allComments.filter((comment: any) => {
    const searchLower = searchTerm.toLowerCase();
    const matchesSearch = !searchTerm || comment.comment_text?.toLowerCase().includes(searchLower);
    const matchesContinent = continentFilter === 'all' || comment.continent === continentFilter;
    const matchesDivision = divisionFilter === 'all' || comment.division === divisionFilter;
    const matchesRole = roleFilter === 'all' || comment.role === roleFilter;
    return matchesSearch && matchesContinent && matchesDivision && matchesRole;
  });

  const exportComments = () => {
    const csv = [
      ['Date', 'Continent', 'Division', 'Role', 'Comment'],
      ...filteredComments.map((c: any) => [
        new Date(c.created_at).toLocaleDateString(),
        c.continent || '',
        c.division || '',
        c.role || '',
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

  const uniqueContinents = [...new Set(allComments.map((c: any) => c.continent).filter(Boolean))];
  const uniqueDivisions = [...new Set(allComments.map((c: any) => c.division).filter(Boolean))];
  const uniqueRoles = [...new Set(allComments.map((c: any) => c.role).filter(Boolean))];

  return (
    <Card className="w-full">
      <CardHeader className="flex flex-row items-center justify-between">
        <div>
          <CardTitle>Final Comments from Employees</CardTitle>
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
        <div className="mb-6">
          <Card>
            <CardContent className="pt-6">
              <div className="text-2xl font-bold">{allComments.length}</div>
              <p className="text-sm text-muted-foreground">Employees who provided additional feedback</p>
            </CardContent>
          </Card>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
          <div className="space-y-2">
            <Label>Search</Label>
            <Input placeholder="Search comments..." value={searchTerm} onChange={(e) => setSearchTerm(e.target.value)} />
          </div>
          <div className="space-y-2">
            <Label>Continent</Label>
            <Select value={continentFilter} onValueChange={setContinentFilter}>
              <SelectTrigger><SelectValue placeholder="All Continents" /></SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Continents</SelectItem>
                {uniqueContinents.map((continent) => <SelectItem key={continent} value={continent}>{continent}</SelectItem>)}
              </SelectContent>
            </Select>
          </div>
          <div className="space-y-2">
            <Label>Division</Label>
            <Select value={divisionFilter} onValueChange={setDivisionFilter}>
              <SelectTrigger><SelectValue placeholder="All Divisions" /></SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Divisions</SelectItem>
                {uniqueDivisions.map((division) => <SelectItem key={division} value={division}>{division}</SelectItem>)}
              </SelectContent>
            </Select>
          </div>
          <div className="space-y-2">
            <Label>Role</Label>
            <Select value={roleFilter} onValueChange={setRoleFilter}>
              <SelectTrigger><SelectValue placeholder="All Roles" /></SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Roles</SelectItem>
                {uniqueRoles.map((role) => <SelectItem key={role} value={role}>{role}</SelectItem>)}
              </SelectContent>
            </Select>
          </div>
        </div>

        <ScrollArea className="h-[600px] rounded-md border">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead className="w-[120px]">Date</TableHead>
                <TableHead className="w-[250px]">Demographics</TableHead>
                <TableHead>Comment</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {loading ? (
                <TableRow><TableCell colSpan={3} className="text-center py-8">Loading comments...</TableCell></TableRow>
              ) : filteredComments.length === 0 ? (
                <TableRow><TableCell colSpan={3} className="text-center py-8 text-muted-foreground">No comments match your filters</TableCell></TableRow>
              ) : (
                filteredComments.map((comment: any, index: number) => (
                  <TableRow key={comment.id || index}>
                    <TableCell className="text-sm">{new Date(comment.created_at).toLocaleDateString()}</TableCell>
                    <TableCell>
                      <div className="space-y-1 text-xs text-muted-foreground">
                        {comment.continent && <div>Location: {comment.continent}</div>}
                        {comment.division && <div>Division: {comment.division}</div>}
                        {comment.role && <div>Role: {comment.role}</div>}
                      </div>
                    </TableCell>
                    <TableCell className="max-w-md"><p className="text-sm whitespace-pre-wrap">{comment.comment_text}</p></TableCell>
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
