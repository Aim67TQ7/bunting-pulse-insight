import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Switch } from "@/components/ui/switch";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Edit, Save, X } from "lucide-react";

interface QuestionConfig {
  id: string;
  question_id: string;
  question_type: string;
  section: string;
  display_order: number;
  labels: { en: string; es: string; fr: string; it: string };
  allow_na: boolean;
  is_required: boolean;
  is_enabled: boolean;
}

export const SurveyQuestionManager = () => {
  const [questions, setQuestions] = useState<QuestionConfig[]>([]);
  const [loading, setLoading] = useState(true);
  const [editingQuestion, setEditingQuestion] = useState<QuestionConfig | null>(null);
  const { toast } = useToast();

  useEffect(() => { loadQuestions(); }, []);

  const loadQuestions = async () => {
    setLoading(true);
    try {
      const { data, error } = await supabase.from('survey_question_config').select('*').order('display_order');
      if (error) throw error;
      setQuestions((data || []).map(item => ({
        id: item.id,
        question_id: item.question_id,
        question_type: item.question_type,
        section: item.section,
        display_order: item.display_order,
        labels: typeof item.labels === 'object' && item.labels ? item.labels as any : { en: '', es: '', fr: '', it: '' },
        allow_na: item.allow_na,
        is_required: item.is_required,
        is_enabled: item.is_enabled
      })));
    } catch (error: any) {
      toast({ title: "Error", description: error.message, variant: "destructive" });
    } finally {
      setLoading(false);
    }
  };

  const updateQuestion = async (questionId: string, updates: Partial<QuestionConfig>) => {
    try {
      const { error } = await supabase.from('survey_question_config').update(updates).eq('question_id', questionId);
      if (error) throw error;
      toast({ title: "Updated", description: "Changes saved" });
      loadQuestions();
    } catch (error: any) {
      toast({ title: "Failed", description: error.message, variant: "destructive" });
    }
  };

  const toggleField = async (q: QuestionConfig, field: 'allow_na' | 'is_required' | 'is_enabled') => {
    await updateQuestion(q.question_id, { ...q, [field]: !q[field] });
  };

  if (loading) return <div className="p-8">Loading...</div>;

  return (
    <Table>
      <TableHeader>
        <TableRow>
          <TableHead>Order</TableHead>
          <TableHead>Type</TableHead>
          <TableHead>Question</TableHead>
          <TableHead>N/A</TableHead>
          <TableHead>Required</TableHead>
          <TableHead>Enabled</TableHead>
          <TableHead>Actions</TableHead>
        </TableRow>
      </TableHeader>
      <TableBody>
        {questions.map(q => (
          <TableRow key={q.id}>
            <TableCell>{q.display_order}</TableCell>
            <TableCell><Badge>{q.question_type}</Badge></TableCell>
            <TableCell className="max-w-md truncate">{q.labels.en}</TableCell>
            <TableCell><Switch checked={q.allow_na} onCheckedChange={() => toggleField(q, 'allow_na')} /></TableCell>
            <TableCell><Switch checked={q.is_required} onCheckedChange={() => toggleField(q, 'is_required')} /></TableCell>
            <TableCell><Switch checked={q.is_enabled} onCheckedChange={() => toggleField(q, 'is_enabled')} /></TableCell>
            <TableCell>
              <Dialog>
                <DialogTrigger asChild><Button variant="ghost" size="sm" onClick={() => setEditingQuestion(q)}><Edit className="h-4 w-4" /></Button></DialogTrigger>
                <DialogContent className="max-w-2xl">
                  <DialogHeader><DialogTitle>Edit Question</DialogTitle></DialogHeader>
                  {editingQuestion && (
                    <div className="space-y-4">
                      <div><Label>Order</Label><Input type="number" value={editingQuestion.display_order} onChange={e => setEditingQuestion({...editingQuestion, display_order: parseInt(e.target.value)})} /></div>
                      <Tabs defaultValue="en">
                        <TabsList className="grid w-full grid-cols-4">
                          <TabsTrigger value="en">English</TabsTrigger>
                          <TabsTrigger value="es">Spanish</TabsTrigger>
                          <TabsTrigger value="fr">French</TabsTrigger>
                          <TabsTrigger value="it">Italian</TabsTrigger>
                        </TabsList>
                        {(['en', 'es', 'fr', 'it'] as const).map(lang => (
                          <TabsContent key={lang} value={lang}><Textarea value={editingQuestion.labels[lang]} onChange={e => setEditingQuestion({...editingQuestion, labels: {...editingQuestion.labels, [lang]: e.target.value}})} rows={3} /></TabsContent>
                        ))}
                      </Tabs>
                      <div className="flex justify-end gap-2">
                        <Button variant="outline" onClick={() => setEditingQuestion(null)}><X className="h-4 w-4 mr-2" />Cancel</Button>
                        <Button onClick={() => { updateQuestion(editingQuestion.question_id, editingQuestion); setEditingQuestion(null); }}><Save className="h-4 w-4 mr-2" />Save</Button>
                      </div>
                    </div>
                  )}
                </DialogContent>
              </Dialog>
            </TableCell>
          </TableRow>
        ))}
      </TableBody>
    </Table>
  );
};
