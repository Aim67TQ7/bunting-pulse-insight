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
  additional_comments: string;
  collaboration_feedback: string;
  submitted_at: string;
  job_satisfaction?: number;
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

  // Get responses with comments
  const responsesWithComments = responses.filter(r => 
    r.additional_comments || r.collaboration_feedback
  );

  // Apply filters
  const filteredComments = responsesWithComments.filter(response => {
    // Search filter
    const searchMatch = !searchTerm || 
      (response.additional_comments?.toLowerCase().includes(searchTerm.toLowerCase())) ||
      (response.collaboration_feedback?.toLowerCase().includes(searchTerm.toLowerCase()));

    // Comment type filter
    const commentTypeMatch = commentTypeFilter === "all" ||
      (commentTypeFilter === "additional" && response.additional_comments) ||
      (commentTypeFilter === "collaboration" && response.collaboration_feedback) ||
      (commentTypeFilter === "both" && response.additional_comments && response.collaboration_feedback);

    // Demographic filters
    const continentMatch = continentFilter === "all" || response.continent === continentFilter;
    const divisionMatch = divisionFilter === "all" || response.division === divisionFilter;
    const roleMatch = roleFilter === "all" || response.role === roleFilter;

    return searchMatch && commentTypeMatch && continentMatch && divisionMatch && roleMatch;
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
      ...filteredComments.flatMap(response => {
        const baseData = [
          response.id,
          new Date(response.submitted_at).toLocaleDateString(),
          response.continent,
          response.division,
          response.role,
          response.job_satisfaction?.toString() || 'N/A'
        ];

        const rows = [];
        if (response.additional_comments) {
          rows.push([...baseData, 'Additional Comments', response.additional_comments]);
        }
        if (response.collaboration_feedback) {
          rows.push([...baseData, 'Collaboration Feedback', response.collaboration_feedback]);
        }
        return rows;
      })
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
                  <SelectItem value="both">Both Types</SelectItem>
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
                  <TableHead className="w-[120px]">Type</TableHead>
                  <TableHead>Comment</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredComments.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={5} className="text-center text-muted-foreground py-8">
                      No comments found matching your filters.
                    </TableCell>
                  </TableRow>
                ) : (
                  filteredComments.flatMap(response => {
                    const baseRow = (
                      <div className="text-xs space-y-1">
                        <div><strong>Date:</strong> {new Date(response.submitted_at).toLocaleDateString()}</div>
                        <div><strong>Continent:</strong> {response.continent}</div>
                        <div><strong>Division:</strong> {response.division}</div>
                        <div><strong>Role:</strong> {response.role}</div>
                      </div>
                    );

                    const satisfactionBadge = (
                      <Badge 
                        variant={
                          !response.job_satisfaction ? "secondary" :
                          response.job_satisfaction >= 4 ? "default" : 
                          response.job_satisfaction >= 3 ? "secondary" : 
                          "destructive"
                        }
                      >
                        {response.job_satisfaction ? `${response.job_satisfaction}/5` : 'N/A'}
                      </Badge>
                    );

                    const rows = [];

                    if (response.additional_comments) {
                      rows.push(
                        <TableRow key={`${response.id}-additional`}>
                          <TableCell>{new Date(response.submitted_at).toLocaleDateString()}</TableCell>
                          <TableCell>{baseRow}</TableCell>
                          <TableCell>{satisfactionBadge}</TableCell>
                          <TableCell>
                            <Badge variant="outline">Additional Comments</Badge>
                          </TableCell>
                          <TableCell>
                            <div className="max-w-md text-sm leading-relaxed">
                              {response.additional_comments}
                            </div>
                          </TableCell>
                        </TableRow>
                      );
                    }

                    if (response.collaboration_feedback) {
                      rows.push(
                        <TableRow key={`${response.id}-collaboration`}>
                          <TableCell>{new Date(response.submitted_at).toLocaleDateString()}</TableCell>
                          <TableCell>{baseRow}</TableCell>
                          <TableCell>{satisfactionBadge}</TableCell>
                          <TableCell>
                            <Badge variant="outline">Collaboration Feedback</Badge>
                          </TableCell>
                          <TableCell>
                            <div className="max-w-md text-sm leading-relaxed">
                              {response.collaboration_feedback}
                            </div>
                          </TableCell>
                        </TableRow>
                      );
                    }

                    return rows;
                  })
                )}
              </TableBody>
            </Table>
          </ScrollArea>
        </div>

        {/* Summary Statistics */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mt-6">
          <div className="text-center">
            <div className="text-2xl font-bold">{responsesWithComments.length}</div>
            <div className="text-sm text-muted-foreground">Total Comments</div>
          </div>
          <div className="text-center">
            <div className="text-2xl font-bold">
              {responses.filter(r => r.additional_comments).length}
            </div>
            <div className="text-sm text-muted-foreground">Additional Comments</div>
          </div>
          <div className="text-center">
            <div className="text-2xl font-bold">
              {responses.filter(r => r.collaboration_feedback).length}
            </div>
            <div className="text-sm text-muted-foreground">Collaboration Feedback</div>
          </div>
          <div className="text-center">
            <div className="text-2xl font-bold">
              {((responsesWithComments.length / responses.length) * 100).toFixed(0)}%
            </div>
            <div className="text-sm text-muted-foreground">Response Rate</div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
};