import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { SearchIcon, DownloadIcon, FilterIcon } from "lucide-react";
import { ScrollArea } from "@/components/ui/scroll-area";

interface SurveyResponse {
  id: string;
  continent: string;
  division: string;
  role: string;
  additional_comments?: string;
  collaboration_feedback?: string;
  follow_up_responses?: Record<string, string>;
  submitted_at: string;
  // All score fields
  job_satisfaction?: number;
  work_life_balance?: number;
  workplace_safety?: number;
  tools_equipment_quality?: number;
  training_satisfaction?: number;
  advancement_opportunities?: number;
  communication_clarity?: number;
  workload_manageability?: number;
  performance_awareness?: number;
  leadership_openness?: number;
  company_value_alignment?: number;
  manager_alignment?: number;
  team_morale?: number;
  pride_in_work?: number;
  recommend_company?: number;
  strategic_confidence?: number;
  comfortable_suggesting_improvements?: number;
  safety_reporting_comfort?: number;
  manual_processes_focus?: number;
  cross_functional_collaboration?: number;
}

interface CommentsSectionProps {
  responses: SurveyResponse[];
}

export const CommentsSection = ({ responses }: CommentsSectionProps) => {
  const [searchTerm, setSearchTerm] = useState("");
  const [commentTypeFilter, setCommentTypeFilter] = useState("all");
  const [continentFilter, setContinentFilter] = useState("all");
  const [divisionFilter, setDivisionFilter] = useState("all");
  const [roleFilter, setRoleFilter] = useState("all");

  // Flatten all comments including follow-ups
  const allComments = responses.flatMap(r => {
    const comments = [];
    
    // Add additional comments
    if (r.additional_comments) {
      comments.push({
        ...r,
        comment_type: 'Additional Comments',
        comment_text: r.additional_comments,
      });
    }
    
    // Add collaboration feedback
    if (r.collaboration_feedback) {
      comments.push({
        ...r,
        comment_type: 'Collaboration Feedback',
        comment_text: r.collaboration_feedback,
      });
    }
    
    // Add follow-up responses ONLY for actual low scores (1-3)
    if (r.follow_up_responses && typeof r.follow_up_responses === 'object') {
      Object.entries(r.follow_up_responses).forEach(([key, value]) => {
        if (value) {
          // Check if the actual score for this question is low (1-3)
          const scoreValue = r[key as keyof SurveyResponse] as number | undefined;
          
          // Only include if the score is 1, 2, or 3 (low scores)
          if (scoreValue !== undefined && scoreValue <= 3) {
            const questionLabels: Record<string, string> = {
              job_satisfaction: 'Job Satisfaction',
              work_life_balance: 'Work-Life Balance',
              workplace_safety: 'Workplace Safety',
              tools_equipment_quality: 'Tools & Equipment Quality',
              training_satisfaction: 'Training Satisfaction',
              advancement_opportunities: 'Advancement Opportunities',
              communication_clarity: 'Communication Clarity',
              workload_manageability: 'Workload Manageability',
              performance_awareness: 'Performance Awareness',
              leadership_openness: 'Leadership Openness',
              company_value_alignment: 'Company Value Alignment',
              manager_alignment: 'Manager Alignment',
              team_morale: 'Team Morale',
              pride_in_work: 'Pride in Work',
              recommend_company: 'Recommend Company',
              strategic_confidence: 'Strategic Confidence',
              comfortable_suggesting_improvements: 'Comfortable Suggesting Improvements',
              safety_reporting_comfort: 'Safety Reporting Comfort',
              manual_processes_focus: 'Manual Processes Focus',
              cross_functional_collaboration: 'Cross-Functional Collaboration',
            };
            
            comments.push({
              ...r,
              comment_type: `Low Score Follow-up: ${questionLabels[key] || key} (${scoreValue}/5)`,
              comment_text: value,
            });
          }
        }
      });
    }
    
    return comments;
  });

  const responsesWithComments = allComments;

  // Apply filters
  const filteredComments = responsesWithComments.filter((response: any) => {
    const searchLower = searchTerm.toLowerCase();
    const matchesSearch = !searchTerm || 
      response.comment_text?.toLowerCase().includes(searchLower) ||
      response.continent.toLowerCase().includes(searchLower) ||
      response.division.toLowerCase().includes(searchLower) ||
      response.role.toLowerCase().includes(searchLower);
    
    const matchesCommentType = commentTypeFilter === 'all' || 
      (commentTypeFilter === 'additional' && response.comment_type === 'Additional Comments') ||
      (commentTypeFilter === 'collaboration' && response.comment_type === 'Collaboration Feedback') ||
      (commentTypeFilter === 'followup' && response.comment_type.startsWith('Low Score Follow-up'));
    
    const matchesContinent = continentFilter === 'all' || response.continent === continentFilter;
    const matchesDivision = divisionFilter === 'all' || response.division === divisionFilter;
    const matchesRole = roleFilter === 'all' || response.role === roleFilter;
    
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
    const csvContent = [
      // Header
      ['ID', 'Date', 'Continent', 'Division', 'Role', 'Job Satisfaction', 'Comment Type', 'Comment Text'],
      // Data rows
      ...filteredComments.map((response: any) => [
        response.id,
        new Date(response.submitted_at).toLocaleDateString(),
        response.continent,
        response.division,
        response.role,
        response.job_satisfaction?.toString() || 'N/A',
        response.comment_type,
        response.comment_text
      ])
    ].map(row => row.map(cell => `"${cell?.replace(/"/g, '""') || ''}"`).join(','))
     .join('\n');

    const blob = new Blob([csvContent], { type: 'text/csv' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'survey-comments.csv';
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  };

  return (
    <Card className="mb-8">
      <CardHeader>
        <div className="flex items-center justify-between">
          <CardTitle className="flex items-center gap-2">
            Comments & Feedback
            <Badge variant="secondary">{filteredComments.length} comments</Badge>
          </CardTitle>
          <Button onClick={exportComments} variant="outline" size="sm">
            <DownloadIcon className="h-4 w-4 mr-2" />
            Export CSV
          </Button>
        </div>
      </CardHeader>
      <CardContent>
        {/* Filters */}
        <div className="space-y-4 mb-6">
          <div className="flex items-center gap-2 mb-4">
            <FilterIcon className="h-4 w-4" />
            <span className="text-sm font-medium">Filters</span>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-3 lg:grid-cols-6 gap-4">
            {/* Search */}
            <div className="lg:col-span-2">
              <Label htmlFor="search">Search Comments</Label>
              <div className="relative">
                <SearchIcon className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                <Input
                  id="search"
                  placeholder="Search in comments..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-10"
                />
              </div>
            </div>

            {/* Comment Type */}
            <div>
              <Label htmlFor="commentType">Comment Type</Label>
              <Select value={commentTypeFilter} onValueChange={setCommentTypeFilter}>
                <SelectTrigger>
                  <SelectValue placeholder="All Types" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Types</SelectItem>
                  <SelectItem value="additional">Additional Comments</SelectItem>
                  <SelectItem value="collaboration">Collaboration Feedback</SelectItem>
                  <SelectItem value="followup">Low Score Follow-ups</SelectItem>
                </SelectContent>
              </Select>
            </div>

            {/* Continent */}
            <div>
              <Label htmlFor="continent">Continent</Label>
              <Select value={continentFilter} onValueChange={setContinentFilter}>
                <SelectTrigger>
                  <SelectValue placeholder="All" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All</SelectItem>
                  <SelectItem value="North America">North America</SelectItem>
                  <SelectItem value="Europe">Europe</SelectItem>
                </SelectContent>
              </Select>
            </div>

            {/* Division */}
            <div>
              <Label htmlFor="division">Division</Label>
              <Select value={divisionFilter} onValueChange={setDivisionFilter}>
                <SelectTrigger>
                  <SelectValue placeholder="All" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All</SelectItem>
                  <SelectItem value="Equipment">Equipment</SelectItem>
                  <SelectItem value="Magnets">Magnets</SelectItem>
                  <SelectItem value="Both">Both</SelectItem>
                </SelectContent>
              </Select>
            </div>

            {/* Clear Filters */}
            <div className="flex items-end">
              <Button variant="outline" onClick={clearFilters} size="sm">
                Clear Filters
              </Button>
            </div>
          </div>
        </div>

        {/* Comments Table */}
        <div className="border rounded-lg">
          <ScrollArea className="h-[600px]">
            <Table>
              <TableHeader className="sticky top-0 bg-background">
                <TableRow>
                  <TableHead className="w-[100px]">Date</TableHead>
                  <TableHead className="w-[120px]">Demographics</TableHead>
                  <TableHead className="w-[80px]">Satisfaction</TableHead>
                  <TableHead>Comment</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredComments.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={4} className="text-center text-muted-foreground py-8">
                      No comments found matching your filters.
                    </TableCell>
                  </TableRow>
                ) : (
                  <TableBody>
                    {filteredComments.map((response: any, idx: number) => (
                      <TableRow key={`${response.id}-${idx}`}>
                        <TableCell className="text-sm text-muted-foreground">
                          {new Date(response.submitted_at).toLocaleDateString()}
                        </TableCell>
                        <TableCell className="text-sm">
                          <div className="space-y-1">
                            <div>{response.continent}</div>
                            <div className="text-muted-foreground">{response.division}</div>
                            <div className="text-muted-foreground">{response.role}</div>
                          </div>
                        </TableCell>
                        <TableCell className="text-center">
                          {response.job_satisfaction ? (
                            <Badge variant={
                              response.job_satisfaction >= 4 ? "default" : 
                              response.job_satisfaction >= 3 ? "secondary" : 
                              "destructive"
                            }>
                              {response.job_satisfaction}/5
                            </Badge>
                          ) : (
                            <span className="text-muted-foreground">N/A</span>
                          )}
                        </TableCell>
                        <TableCell>
                          <div>
                            <Badge 
                              variant={response.comment_type.startsWith('Low Score') ? "destructive" : "outline"} 
                              className="mb-1"
                            >
                              {response.comment_type}
                            </Badge>
                            <p className="text-sm">{response.comment_text}</p>
                          </div>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                )}
              </TableBody>
            </Table>
          </ScrollArea>
        </div>

        {/* Summary Statistics */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mt-6">
          <Card>
            <CardContent className="pt-6">
              <div className="text-2xl font-bold text-primary">{filteredComments.length}</div>
              <p className="text-sm text-muted-foreground">Total Comments</p>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="pt-6">
              <div className="text-2xl font-bold text-primary">
                {filteredComments.filter((r: any) => r.comment_type === 'Additional Comments').length}
              </div>
              <p className="text-sm text-muted-foreground">Additional Comments</p>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="pt-6">
              <div className="text-2xl font-bold text-primary">
                {filteredComments.filter((r: any) => r.comment_type === 'Collaboration Feedback').length}
              </div>
              <p className="text-sm text-muted-foreground">Collaboration Feedback</p>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="pt-6">
              <div className="text-2xl font-bold text-primary">
                {filteredComments.filter((r: any) => r.comment_type.startsWith('Low Score Follow-up')).length}
              </div>
              <p className="text-sm text-muted-foreground">Low Score Follow-ups</p>
            </CardContent>
          </Card>
        </div>
      </CardContent>
    </Card>
  );
};