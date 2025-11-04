import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Switch } from "@/components/ui/switch";
import { toast } from "sonner";
import { Plus, Trash2, Eye, Save } from "lucide-react";
import { SurveyQuestionBuilder } from "@/components/SurveyQuestionBuilder";

interface SurveyConfiguration {
  id: string;
  name: string;
  description: string;
  is_active: boolean;
  enabled_demographics: string[];
  enabled_rating_questions: string[];
  enabled_multiselect_questions: string[];
  require_low_score_feedback: boolean;
  languages_enabled: string[];
  created_at: string;
  updated_at: string;
}

export default function SurveyConfig() {
  const [selectedConfig, setSelectedConfig] = useState<SurveyConfiguration | null>(null);
  const [isCreating, setIsCreating] = useState(false);
  const [formData, setFormData] = useState({
    name: "",
    description: "",
  });
  const queryClient = useQueryClient();

  // Fetch all configurations
  const { data: configurations, isLoading } = useQuery({
    queryKey: ["survey-configurations"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("survey_configurations")
        .select("*")
        .order("created_at", { ascending: false });
      
      if (error) throw error;
      return data as SurveyConfiguration[];
    },
  });

  // Create configuration mutation
  const createConfig = useMutation({
    mutationFn: async (config: { name: string; description?: string; is_active?: boolean }) => {
      const { data, error } = await supabase
        .from("survey_configurations")
        .insert([config])
        .select()
        .single();
      
      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["survey-configurations"] });
      toast.success("Configuration created successfully");
      setIsCreating(false);
      setFormData({ name: "", description: "" });
    },
    onError: (error) => {
      toast.error("Failed to create configuration: " + error.message);
    },
  });

  // Update configuration mutation
  const updateConfig = useMutation({
    mutationFn: async (config: Partial<SurveyConfiguration>) => {
      const { id, ...updates } = config;
      const { data, error } = await supabase
        .from("survey_configurations")
        .update(updates)
        .eq("id", id)
        .select()
        .single();
      
      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["survey-configurations"] });
      toast.success("Configuration updated successfully");
    },
    onError: (error) => {
      toast.error("Failed to update configuration: " + error.message);
    },
  });

  // Delete configuration mutation
  const deleteConfig = useMutation({
    mutationFn: async (id: string) => {
      const { error } = await supabase
        .from("survey_configurations")
        .delete()
        .eq("id", id);
      
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["survey-configurations"] });
      toast.success("Configuration deleted successfully");
      setSelectedConfig(null);
    },
    onError: (error) => {
      toast.error("Failed to delete configuration: " + error.message);
    },
  });

  // Toggle active status
  const toggleActive = async (config: SurveyConfiguration) => {
    // If activating this config, deactivate all others first
    if (!config.is_active) {
      const { error: deactivateError } = await supabase
        .from("survey_configurations")
        .update({ is_active: false })
        .neq("id", config.id);
      
      if (deactivateError) {
        toast.error("Failed to deactivate other configurations");
        return;
      }
    }
    
    updateConfig.mutate({ id: config.id, is_active: !config.is_active });
  };

  const handleCreate = () => {
    if (!formData.name.trim()) {
      toast.error("Please enter a configuration name");
      return;
    }

    createConfig.mutate({
      name: formData.name,
      description: formData.description,
      is_active: false,
    });
  };

  const handleUpdateQuestions = (
    demographics: string[],
    ratingQuestions: string[],
    multiselectQuestions: string[]
  ) => {
    if (!selectedConfig) return;
    
    updateConfig.mutate({
      id: selectedConfig.id,
      enabled_demographics: demographics,
      enabled_rating_questions: ratingQuestions,
      enabled_multiselect_questions: multiselectQuestions,
    });
  };

  if (isLoading) {
    return (
      <div className="container mx-auto p-6">
        <p className="text-muted-foreground">Loading configurations...</p>
      </div>
    );
  }

  return (
    <div className="container mx-auto p-6 space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">Survey Configurations</h1>
          <p className="text-muted-foreground">
            Manage survey questions and configurations
          </p>
        </div>
        <Button onClick={() => setIsCreating(true)} disabled={isCreating}>
          <Plus className="w-4 h-4 mr-2" />
          New Configuration
        </Button>
      </div>

      {/* Create new configuration */}
      {isCreating && (
        <Card>
          <CardHeader>
            <CardTitle>Create New Configuration</CardTitle>
            <CardDescription>
              Define a new survey configuration with custom questions
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="name">Configuration Name</Label>
              <Input
                id="name"
                value={formData.name}
                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                placeholder="e.g., Q1 Pulse Survey"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="description">Description</Label>
              <Textarea
                id="description"
                value={formData.description}
                onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                placeholder="Brief description of this survey configuration"
              />
            </div>
            <div className="flex gap-2">
              <Button onClick={handleCreate}>Create</Button>
              <Button variant="outline" onClick={() => {
                setIsCreating(false);
                setFormData({ name: "", description: "" });
              }}>
                Cancel
              </Button>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Configuration list */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
        {configurations?.map((config) => (
          <Card key={config.id} className={selectedConfig?.id === config.id ? "ring-2 ring-primary" : ""}>
            <CardHeader>
              <div className="flex items-start justify-between">
                <div className="flex-1">
                  <CardTitle className="text-lg">{config.name}</CardTitle>
                  <CardDescription className="mt-1">
                    {config.description || "No description"}
                  </CardDescription>
                </div>
                {config.is_active && (
                  <span className="px-2 py-1 text-xs bg-primary text-primary-foreground rounded-md">
                    Active
                  </span>
                )}
              </div>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2 text-sm">
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Demographics:</span>
                  <span className="font-medium">{config.enabled_demographics?.length || 0}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Rating Questions:</span>
                  <span className="font-medium">{config.enabled_rating_questions?.length || 0}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Multi-Select:</span>
                  <span className="font-medium">{config.enabled_multiselect_questions?.length || 0}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Languages:</span>
                  <span className="font-medium">{config.languages_enabled?.length || 0}</span>
                </div>
              </div>
              
              <div className="flex items-center justify-between pt-2 border-t">
                <div className="flex items-center space-x-2">
                  <Switch
                    checked={config.is_active}
                    onCheckedChange={() => toggleActive(config)}
                  />
                  <Label className="text-sm">Active</Label>
                </div>
                <div className="flex gap-2">
                  <Button
                    size="sm"
                    variant="outline"
                    onClick={() => setSelectedConfig(config)}
                  >
                    <Eye className="w-4 h-4" />
                  </Button>
                  <Button
                    size="sm"
                    variant="destructive"
                    onClick={() => deleteConfig.mutate(config.id)}
                  >
                    <Trash2 className="w-4 h-4" />
                  </Button>
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Question builder */}
      {selectedConfig && (
        <Card>
          <CardHeader>
            <div className="flex items-center justify-between">
              <div>
                <CardTitle>Edit: {selectedConfig.name}</CardTitle>
                <CardDescription>
                  Select which questions to include in this survey
                </CardDescription>
              </div>
              <Button
                variant="outline"
                onClick={() => setSelectedConfig(null)}
              >
                Close
              </Button>
            </div>
          </CardHeader>
          <CardContent>
            <SurveyQuestionBuilder
              selectedDemographics={selectedConfig.enabled_demographics || []}
              selectedRatingQuestions={selectedConfig.enabled_rating_questions || []}
              selectedMultiselectQuestions={selectedConfig.enabled_multiselect_questions || []}
              onUpdate={handleUpdateQuestions}
            />
          </CardContent>
        </Card>
      )}
    </div>
  );
}
