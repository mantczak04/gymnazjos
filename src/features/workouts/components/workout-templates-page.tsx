"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { ArrowDown, ArrowUp, Check, Pencil, Plus, Trash2, X } from "lucide-react";
import { useMemo, useState } from "react";
import { useForm } from "react-hook-form";
import { isSupabaseConfigured } from "@/supabase/client";
import { PageShell } from "@/shared/components/page-shell";
import { Badge } from "@/shared/components/ui/badge";
import { Button } from "@/shared/components/ui/button";
import { Input } from "@/shared/components/ui/input";
import { Label } from "@/shared/components/ui/label";
import { Select } from "@/shared/components/ui/select";
import { formatLoggingType } from "@/shared/utils/format";
import { listActiveExercises } from "../queries/exercises";
import {
  addExerciseToTemplate,
  createTemplate,
  deactivateTemplate,
  listActiveTemplatesWithExercises,
  moveTemplateExercise,
  removeExerciseFromTemplate,
  updateTemplateName
} from "../queries/templates";
import { templateFormSchema, type TemplateFormValues } from "../schemas/template.schema";
import type { WorkoutTemplate } from "../types/workout.types";
import { SetupAlert } from "./setup-alert";
import { WorkoutNav } from "./workout-nav";

function TemplateItem({ template }: { template: WorkoutTemplate }) {
  const queryClient = useQueryClient();
  const [editingName, setEditingName] = useState(false);
  const [selectedExerciseId, setSelectedExerciseId] = useState("");
  const form = useForm<TemplateFormValues>({
    resolver: zodResolver(templateFormSchema),
    defaultValues: { name: template.name }
  });

  const exercisesQuery = useQuery({
    queryKey: ["exercises"],
    queryFn: listActiveExercises
  });

  const invalidateTemplates = () => queryClient.invalidateQueries({ queryKey: ["workout-templates"] });

  const updateNameMutation = useMutation({
    mutationFn: (values: TemplateFormValues) => updateTemplateName(template.id, values),
    onSuccess: async () => {
      setEditingName(false);
      await invalidateTemplates();
    }
  });

  const deactivateMutation = useMutation({
    mutationFn: () => deactivateTemplate(template.id),
    onSuccess: invalidateTemplates
  });

  const addExerciseMutation = useMutation({
    mutationFn: (exerciseId: string) => addExerciseToTemplate(template.id, exerciseId),
    onSuccess: async () => {
      setSelectedExerciseId("");
      await invalidateTemplates();
    }
  });

  const removeExerciseMutation = useMutation({
    mutationFn: (templateExerciseId: string) =>
      removeExerciseFromTemplate(template.id, templateExerciseId),
    onSuccess: invalidateTemplates
  });

  const moveMutation = useMutation({
    mutationFn: (input: { templateExerciseId: string; direction: "up" | "down" }) =>
      moveTemplateExercise(template.id, input.templateExerciseId, input.direction),
    onSuccess: invalidateTemplates
  });

  const availableExercises = useMemo(() => {
    const usedIds = new Set(template.exercises.map((item) => item.exercise.id));
    return (exercisesQuery.data ?? []).filter((exercise) => !usedIds.has(exercise.id));
  }, [exercisesQuery.data, template.exercises]);

  return (
    <section className="rounded-lg border border-border bg-card p-4 shadow-sm">
      {editingName ? (
        <form
          className="mb-4 grid gap-3"
          onSubmit={form.handleSubmit((values) => updateNameMutation.mutate(values))}
        >
          <div className="grid gap-2">
            <Label htmlFor={`${template.id}-name`}>Template name</Label>
            <Input id={`${template.id}-name`} {...form.register("name")} />
          </div>
          {updateNameMutation.error ? (
            <p className="text-sm text-destructive">{updateNameMutation.error.message}</p>
          ) : null}
          <div className="flex gap-2">
            <Button type="submit" disabled={updateNameMutation.isPending}>
              <Check className="size-4" aria-hidden="true" />
              Save
            </Button>
            <Button type="button" variant="outline" onClick={() => setEditingName(false)}>
              <X className="size-4" aria-hidden="true" />
              Cancel
            </Button>
          </div>
        </form>
      ) : (
        <div className="mb-4 flex items-start justify-between gap-3">
          <div className="min-w-0">
            <h2 className="truncate text-lg font-semibold">{template.name}</h2>
            <p className="text-sm text-muted-foreground">
              {template.exercises.length} exercise{template.exercises.length === 1 ? "" : "s"}
            </p>
          </div>
          <div className="flex gap-2">
            <Button type="button" variant="outline" size="icon" aria-label="Edit template" onClick={() => setEditingName(true)}>
              <Pencil className="size-4" aria-hidden="true" />
            </Button>
            <Button
              type="button"
              variant="destructive"
              size="icon"
              aria-label="Deactivate template"
              disabled={deactivateMutation.isPending}
              onClick={() => {
                if (window.confirm(`Deactivate ${template.name}?`)) {
                  deactivateMutation.mutate();
                }
              }}
            >
              <Trash2 className="size-4" aria-hidden="true" />
            </Button>
          </div>
        </div>
      )}

      <div className="grid gap-2">
        {template.exercises.map((templateExercise, index) => (
          <div
            key={templateExercise.id}
            className="grid grid-cols-[1fr_auto] items-center gap-2 rounded-md border border-border p-2"
          >
            <div className="min-w-0">
              <p className="truncate text-sm font-medium">{templateExercise.exercise.name}</p>
              <Badge className="mt-1">{formatLoggingType(templateExercise.exercise.loggingType)}</Badge>
            </div>
            <div className="flex gap-1">
              <Button
                type="button"
                variant="ghost"
                size="icon"
                aria-label="Move up"
                disabled={index === 0 || moveMutation.isPending}
                onClick={() =>
                  moveMutation.mutate({
                    templateExerciseId: templateExercise.id,
                    direction: "up"
                  })
                }
              >
                <ArrowUp className="size-4" aria-hidden="true" />
              </Button>
              <Button
                type="button"
                variant="ghost"
                size="icon"
                aria-label="Move down"
                disabled={index === template.exercises.length - 1 || moveMutation.isPending}
                onClick={() =>
                  moveMutation.mutate({
                    templateExerciseId: templateExercise.id,
                    direction: "down"
                  })
                }
              >
                <ArrowDown className="size-4" aria-hidden="true" />
              </Button>
              <Button
                type="button"
                variant="ghost"
                size="icon"
                aria-label="Remove exercise"
                disabled={removeExerciseMutation.isPending}
                onClick={() => removeExerciseMutation.mutate(templateExercise.id)}
              >
                <X className="size-4" aria-hidden="true" />
              </Button>
            </div>
          </div>
        ))}
      </div>

      <div className="mt-3 grid gap-2 sm:grid-cols-[1fr_auto]">
        <Select
          value={selectedExerciseId}
          disabled={availableExercises.length === 0}
          onChange={(event) => setSelectedExerciseId(event.target.value)}
        >
          <option value="">Add exercise</option>
          {availableExercises.map((exercise) => (
            <option key={exercise.id} value={exercise.id}>
              {exercise.name}
            </option>
          ))}
        </Select>
        <Button
          type="button"
          variant="outline"
          disabled={!selectedExerciseId || addExerciseMutation.isPending}
          onClick={() => addExerciseMutation.mutate(selectedExerciseId)}
        >
          <Plus className="size-4" aria-hidden="true" />
          Add
        </Button>
      </div>
    </section>
  );
}

export function WorkoutTemplatesPage() {
  const configured = isSupabaseConfigured();
  const queryClient = useQueryClient();
  const form = useForm<TemplateFormValues>({
    resolver: zodResolver(templateFormSchema),
    defaultValues: { name: "" }
  });

  const templatesQuery = useQuery({
    queryKey: ["workout-templates"],
    queryFn: listActiveTemplatesWithExercises,
    enabled: configured
  });

  const createMutation = useMutation({
    mutationFn: createTemplate,
    onSuccess: async () => {
      form.reset({ name: "" });
      await queryClient.invalidateQueries({ queryKey: ["workout-templates"] });
    }
  });

  return (
    <PageShell title="Workout templates">
      <WorkoutNav />
      <SetupAlert />

      <form
        className="grid gap-3 rounded-lg border border-border bg-card p-4 shadow-sm"
        onSubmit={form.handleSubmit((values) => createMutation.mutate(values))}
      >
        <div className="grid gap-2">
          <Label htmlFor="template-name">Template name</Label>
          <Input id="template-name" {...form.register("name")} />
          {form.formState.errors.name ? (
            <p className="text-sm text-destructive">{form.formState.errors.name.message}</p>
          ) : null}
        </div>
        {createMutation.error ? (
          <p className="text-sm text-destructive">{createMutation.error.message}</p>
        ) : null}
        <Button type="submit" disabled={createMutation.isPending}>
          Create template
        </Button>
      </form>

      {templatesQuery.isLoading ? <p className="text-sm text-muted-foreground">Loading templates...</p> : null}
      {templatesQuery.error ? (
        <p className="text-sm text-destructive">{templatesQuery.error.message}</p>
      ) : null}

      <div className="grid gap-3">
        {(templatesQuery.data ?? []).map((template) => (
          <TemplateItem key={template.id} template={template} />
        ))}
      </div>
    </PageShell>
  );
}
