"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import Link from "next/link";
import { ArrowLeft, Plus, Save, Trash2 } from "lucide-react";
import { useForm } from "react-hook-form";
import { PageShell } from "@/shared/components/page-shell";
import { Badge } from "@/shared/components/ui/badge";
import { Button } from "@/shared/components/ui/button";
import { Input } from "@/shared/components/ui/input";
import { Label } from "@/shared/components/ui/label";
import {
  formatDateTime,
  formatDuration,
  formatFeeling,
  formatLoggingType
} from "@/shared/utils/format";
import {
  addWorkoutSet,
  deleteWorkoutSet,
  getSessionDetails,
  updateSessionFeeling,
  updateWorkoutSet
} from "../queries/sessions";
import {
  postWorkoutFeelingSchema,
  savedSetSchema,
  type SavedSetValues
} from "../schemas/session.schema";
import type {
  LoggingType,
  PostWorkoutFeeling,
  SavedWorkoutSet,
  SessionExerciseDetails
} from "../types/workout.types";
import { SetupAlert } from "./setup-alert";
import { WorkoutNav } from "./workout-nav";

function SavedSetEditor({
  set,
  loggingType,
  sessionId
}: {
  set: SavedWorkoutSet;
  loggingType: LoggingType;
  sessionId: string;
}) {
  const queryClient = useQueryClient();
  const form = useForm<SavedSetValues>({
    resolver: zodResolver(savedSetSchema),
    defaultValues: {
      reps: set.reps,
      weight: set.weight
    }
  });

  const invalidate = () => queryClient.invalidateQueries({ queryKey: ["workout-session", sessionId] });

  const updateMutation = useMutation({
    mutationFn: (values: SavedSetValues) =>
      updateWorkoutSet(set.id, {
        reps: values.reps,
        weight: loggingType === "weighted_reps" ? values.weight : null
      }),
    onSuccess: invalidate
  });

  const deleteMutation = useMutation({
    mutationFn: () => deleteWorkoutSet(set.id, set.sessionExerciseId),
    onSuccess: invalidate
  });

  return (
    <form
      className="grid grid-cols-[2rem_1fr_1fr_2.5rem_2.5rem] items-end gap-2"
      onSubmit={form.handleSubmit((values) => updateMutation.mutate(values))}
    >
      <span className="pb-2 text-sm font-medium text-muted-foreground">{set.setIndex + 1}</span>
      {loggingType === "weighted_reps" ? (
        <div className="grid gap-1">
          <Label htmlFor={`${set.id}-weight`}>kg</Label>
          <Input
            id={`${set.id}-weight`}
            type="number"
            inputMode="decimal"
            min="0"
            step="0.25"
            {...form.register("weight", { valueAsNumber: true })}
          />
        </div>
      ) : (
        <div />
      )}
      <div className="grid gap-1">
        <Label htmlFor={`${set.id}-reps`}>Reps</Label>
        <Input
          id={`${set.id}-reps`}
          type="number"
          inputMode="numeric"
          min="1"
          step="1"
          {...form.register("reps", { valueAsNumber: true })}
        />
      </div>
      <Button type="submit" variant="outline" size="icon" aria-label="Save set" disabled={updateMutation.isPending}>
        <Save className="size-4" aria-hidden="true" />
      </Button>
      <Button
        type="button"
        variant="ghost"
        size="icon"
        aria-label="Delete set"
        disabled={deleteMutation.isPending}
        onClick={() => deleteMutation.mutate()}
      >
        <Trash2 className="size-4" aria-hidden="true" />
      </Button>
    </form>
  );
}

function AddSavedSetForm({
  exercise,
  sessionId
}: {
  exercise: SessionExerciseDetails;
  sessionId: string;
}) {
  const queryClient = useQueryClient();
  const lastSet = exercise.sets.at(-1);
  const form = useForm<SavedSetValues>({
    resolver: zodResolver(savedSetSchema),
    defaultValues: {
      reps: 1,
      weight: exercise.loggingType === "weighted_reps" ? lastSet?.weight ?? 0 : null
    }
  });

  const mutation = useMutation({
    mutationFn: (values: SavedSetValues) =>
      addWorkoutSet(exercise.id, {
        reps: values.reps,
        weight: exercise.loggingType === "weighted_reps" ? values.weight : null
      }),
    onSuccess: async () => {
      form.reset({
        reps: 1,
        weight: exercise.loggingType === "weighted_reps" ? form.getValues("weight") : null
      });
      await queryClient.invalidateQueries({ queryKey: ["workout-session", sessionId] });
    }
  });

  return (
    <form
      className="grid gap-2 rounded-md border border-border p-2 sm:grid-cols-[1fr_1fr_auto]"
      onSubmit={form.handleSubmit((values) => mutation.mutate(values))}
    >
      {exercise.loggingType === "weighted_reps" ? (
        <div className="grid gap-1">
          <Label htmlFor={`${exercise.id}-new-weight`}>kg</Label>
          <Input
            id={`${exercise.id}-new-weight`}
            type="number"
            inputMode="decimal"
            min="0"
            step="0.25"
            {...form.register("weight", { valueAsNumber: true })}
          />
        </div>
      ) : null}
      <div className="grid gap-1">
        <Label htmlFor={`${exercise.id}-new-reps`}>Reps</Label>
        <Input
          id={`${exercise.id}-new-reps`}
          type="number"
          inputMode="numeric"
          min="1"
          step="1"
          {...form.register("reps", { valueAsNumber: true })}
        />
      </div>
      <Button type="submit" disabled={mutation.isPending}>
        <Plus className="size-4" aria-hidden="true" />
        Add set
      </Button>
    </form>
  );
}

export function WorkoutSessionDetailsPage({ sessionId }: { sessionId: string }) {
  const queryClient = useQueryClient();
  const sessionQuery = useQuery({
    queryKey: ["workout-session", sessionId],
    queryFn: () => getSessionDetails(sessionId)
  });

  const feelingMutation = useMutation({
    mutationFn: (feeling: PostWorkoutFeeling) => updateSessionFeeling(sessionId, feeling),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ["workout-session", sessionId] })
  });

  const session = sessionQuery.data;

  return (
    <PageShell
      title="Workout details"
      actions={
        <Button asChild variant="outline" size="sm">
          <Link href="/workouts/history">
            <ArrowLeft className="size-4" aria-hidden="true" />
            History
          </Link>
        </Button>
      }
    >
      <WorkoutNav />
      <SetupAlert />

      {sessionQuery.isLoading ? <p className="text-sm text-muted-foreground">Loading workout...</p> : null}
      {sessionQuery.error ? (
        <p className="text-sm text-destructive">{sessionQuery.error.message}</p>
      ) : null}

      {session ? (
        <>
          <section className="rounded-lg border border-border bg-card p-4 shadow-sm">
            <h2 className="text-xl font-semibold">{session.templateName}</h2>
            <p className="mt-1 text-sm text-muted-foreground">
              {formatDateTime(session.startedAt)} - {formatDateTime(session.finishedAt)}
            </p>
            <div className="mt-3 flex flex-wrap gap-2">
              <Badge>{formatDuration(session.durationMinutes)}</Badge>
              <Badge>{Math.round(session.totalWeightedVolume)} kg volume</Badge>
              <Badge>{session.totalRepsVolume} reps</Badge>
              <Badge>{formatFeeling(session.postWorkoutFeeling)}</Badge>
            </div>
            <div className="mt-4 grid grid-cols-5 gap-2">
              {([1, 2, 3, 4, 5] as PostWorkoutFeeling[]).map((value) => (
                <Button
                  key={value}
                  type="button"
                  variant={session.postWorkoutFeeling === value ? "default" : "outline"}
                  disabled={feelingMutation.isPending || !postWorkoutFeelingSchema.safeParse(value).success}
                  onClick={() => feelingMutation.mutate(value)}
                >
                  {value}
                </Button>
              ))}
            </div>
          </section>

          <div className="grid gap-4">
            {session.exercises.map((exercise) => (
              <section
                key={exercise.id}
                className="rounded-lg border border-border bg-card p-4 shadow-sm"
              >
                <div className="mb-3 flex items-start justify-between gap-3">
                  <div className="min-w-0">
                    <h2 className="truncate text-lg font-semibold">{exercise.exerciseName}</h2>
                    <div className="mt-1 flex flex-wrap gap-2">
                      <Badge>{formatLoggingType(exercise.loggingType)}</Badge>
                      {exercise.source === "ad_hoc" ? <Badge>Ad-hoc</Badge> : null}
                    </div>
                  </div>
                </div>

                <div className="grid gap-2">
                  {exercise.sets.map((set) => (
                    <SavedSetEditor
                      key={set.id}
                      set={set}
                      loggingType={exercise.loggingType}
                      sessionId={session.id}
                    />
                  ))}
                  {exercise.sets.length === 0 ? (
                    <p className="text-sm text-muted-foreground">No sets saved for this exercise.</p>
                  ) : null}
                </div>

                <div className="mt-3">
                  <AddSavedSetForm exercise={exercise} sessionId={session.id} />
                </div>
              </section>
            ))}
          </div>
        </>
      ) : null}
    </PageShell>
  );
}
