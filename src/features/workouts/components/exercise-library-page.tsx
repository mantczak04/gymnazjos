"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { Check, Pencil, Trash2, X } from "lucide-react";
import { useState } from "react";
import { useForm } from "react-hook-form";
import { isSupabaseConfigured } from "@/supabase/client";
import { PageShell } from "@/shared/components/page-shell";
import { Badge } from "@/shared/components/ui/badge";
import { Button } from "@/shared/components/ui/button";
import { Input } from "@/shared/components/ui/input";
import { Label } from "@/shared/components/ui/label";
import { Select } from "@/shared/components/ui/select";
import { formatLoggingType } from "@/shared/utils/format";
import { exerciseFormSchema, type ExerciseFormValues } from "../schemas/exercise.schema";
import type { Exercise } from "../types/workout.types";
import {
  createExercise,
  deactivateExercise,
  listActiveExercises,
  updateExercise
} from "../queries/exercises";
import { SetupAlert } from "./setup-alert";

function ExerciseEditRow({ exercise }: { exercise: Exercise }) {
  const queryClient = useQueryClient();
  const [editing, setEditing] = useState(false);
  const form = useForm<ExerciseFormValues>({
    resolver: zodResolver(exerciseFormSchema),
    defaultValues: {
      name: exercise.name,
      loggingType: exercise.loggingType
    }
  });

  const updateMutation = useMutation({
    mutationFn: (values: ExerciseFormValues) => updateExercise(exercise.id, values),
    onSuccess: async () => {
      setEditing(false);
      await queryClient.invalidateQueries({ queryKey: ["exercises"] });
    }
  });

  const deactivateMutation = useMutation({
    mutationFn: () => deactivateExercise(exercise.id),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ["exercises"] })
  });

  if (!editing) {
    return (
      <div className="grid gap-3 rounded-lg border border-border bg-card p-4 sm:grid-cols-[1fr_auto] sm:items-center">
        <div className="min-w-0">
          <h2 className="truncate text-base font-semibold">{exercise.name}</h2>
          <Badge className="mt-2">{formatLoggingType(exercise.loggingType)}</Badge>
        </div>
        <div className="flex gap-2">
          <Button type="button" variant="outline" size="icon" aria-label="Edit exercise" onClick={() => setEditing(true)}>
            <Pencil className="size-4" aria-hidden="true" />
          </Button>
          <Button
            type="button"
            variant="destructive"
            size="icon"
            aria-label="Deactivate exercise"
            disabled={deactivateMutation.isPending}
            onClick={() => {
              if (window.confirm(`Deactivate ${exercise.name}?`)) {
                deactivateMutation.mutate();
              }
            }}
          >
            <Trash2 className="size-4" aria-hidden="true" />
          </Button>
        </div>
      </div>
    );
  }

  return (
    <form
      className="grid gap-3 rounded-lg border border-border bg-card p-4"
      onSubmit={form.handleSubmit((values) => updateMutation.mutate(values))}
    >
      <div className="grid gap-2">
        <Label htmlFor={`${exercise.id}-name`}>Exercise name</Label>
        <Input id={`${exercise.id}-name`} {...form.register("name")} />
        {form.formState.errors.name ? (
          <p className="text-sm text-destructive">{form.formState.errors.name.message}</p>
        ) : null}
      </div>
      <div className="grid gap-2">
        <Label htmlFor={`${exercise.id}-logging-type`}>Logging type</Label>
        <Select id={`${exercise.id}-logging-type`} {...form.register("loggingType")}>
          <option value="weighted_reps">Weight + reps</option>
          <option value="reps_only">Reps only</option>
        </Select>
      </div>
      {updateMutation.error ? (
        <p className="text-sm text-destructive">{updateMutation.error.message}</p>
      ) : null}
      <div className="flex gap-2">
        <Button type="submit" disabled={updateMutation.isPending}>
          <Check className="size-4" aria-hidden="true" />
          Save
        </Button>
        <Button type="button" variant="outline" onClick={() => setEditing(false)}>
          <X className="size-4" aria-hidden="true" />
          Cancel
        </Button>
      </div>
    </form>
  );
}

export function ExerciseLibraryPage() {
  const configured = isSupabaseConfigured();
  const queryClient = useQueryClient();
  const form = useForm<ExerciseFormValues>({
    resolver: zodResolver(exerciseFormSchema),
    defaultValues: {
      name: "",
      loggingType: "weighted_reps"
    }
  });

  const exercisesQuery = useQuery({
    queryKey: ["exercises"],
    queryFn: listActiveExercises,
    enabled: configured
  });

  const createMutation = useMutation({
    mutationFn: createExercise,
    onSuccess: async () => {
      form.reset({ name: "", loggingType: "weighted_reps" });
      await queryClient.invalidateQueries({ queryKey: ["exercises"] });
    }
  });

  return (
    <PageShell title="Exercise library">
      <SetupAlert />

      <form
        className="grid gap-3 rounded-lg border border-border bg-card p-4 shadow-sm"
        onSubmit={form.handleSubmit((values) => createMutation.mutate(values))}
      >
        <div className="grid gap-2">
          <Label htmlFor="exercise-name">Exercise name</Label>
          <Input id="exercise-name" {...form.register("name")} />
          {form.formState.errors.name ? (
            <p className="text-sm text-destructive">{form.formState.errors.name.message}</p>
          ) : null}
        </div>
        <div className="grid gap-2">
          <Label htmlFor="logging-type">Logging type</Label>
          <Select id="logging-type" {...form.register("loggingType")}>
            <option value="weighted_reps">Weight + reps</option>
            <option value="reps_only">Reps only</option>
          </Select>
        </div>
        {createMutation.error ? (
          <p className="text-sm text-destructive">{createMutation.error.message}</p>
        ) : null}
        <Button type="submit" disabled={createMutation.isPending}>
          Create exercise
        </Button>
      </form>

      {exercisesQuery.isLoading ? <p className="text-sm text-muted-foreground">Loading exercises...</p> : null}
      {exercisesQuery.error ? (
        <p className="text-sm text-destructive">{exercisesQuery.error.message}</p>
      ) : null}

      <div className="grid gap-3">
        {(exercisesQuery.data ?? []).map((exercise) => (
          <ExerciseEditRow key={exercise.id} exercise={exercise} />
        ))}
      </div>
    </PageShell>
  );
}
