"use client";

import { useMutation, useQuery } from "@tanstack/react-query";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { Plus, Trash2 } from "lucide-react";
import { useMemo, useState } from "react";
import { isSupabaseConfigured } from "@/supabase/client";
import { PageShell } from "@/shared/components/page-shell";
import { Badge } from "@/shared/components/ui/badge";
import { Button } from "@/shared/components/ui/button";
import { Dialog } from "@/shared/components/ui/dialog";
import { Input } from "@/shared/components/ui/input";
import { Label } from "@/shared/components/ui/label";
import { Select } from "@/shared/components/ui/select";
import { formatLoggingType, formatTime, formatWeight } from "@/shared/utils/format";
import type { PostWorkoutFeeling } from "../types/workout.types";
import { useActiveWorkoutDraft } from "../hooks/use-active-workout-draft";
import { listActiveExercises } from "../queries/exercises";
import { finishWorkout, getLastPerformedSetsByExerciseIds } from "../queries/sessions";
import { hasAtLeastOneValidSet } from "../utils/volume";
import { SetupAlert } from "./setup-alert";
import { WorkoutNav } from "./workout-nav";

function numberOrNull(value: string) {
  if (value.trim() === "") {
    return null;
  }

  const parsed = Number(value);
  return Number.isFinite(parsed) ? parsed : null;
}

export function ActiveWorkoutPage() {
  const router = useRouter();
  const configured = isSupabaseConfigured();
  const {
    draft,
    hydrated,
    addSet,
    updateSet,
    deleteSet,
    addAdHocExercise,
    discardWorkout
  } = useActiveWorkoutDraft();
  const [selectedExerciseId, setSelectedExerciseId] = useState("");
  const [finishOpen, setFinishOpen] = useState(false);
  const [feeling, setFeeling] = useState<PostWorkoutFeeling | null>(null);

  const exerciseIds = useMemo(
    () => draft?.exercises.map((exercise) => exercise.exerciseId) ?? [],
    [draft]
  );

  const lastSetsQuery = useQuery({
    queryKey: ["last-performed-sets", exerciseIds],
    queryFn: () => getLastPerformedSetsByExerciseIds(exerciseIds),
    enabled: configured && exerciseIds.length > 0
  });

  const exercisesQuery = useQuery({
    queryKey: ["exercises"],
    queryFn: listActiveExercises,
    enabled: configured
  });

  const finishMutation = useMutation({
    mutationFn: async () => {
      if (!draft || !feeling) {
        throw new Error("Select a post-workout feeling first.");
      }

      return finishWorkout(draft, feeling);
    },
    onSuccess: (sessionId) => {
      discardWorkout();
      router.replace(`/workouts/history/${sessionId}`);
    }
  });

  if (!hydrated) {
    return null;
  }

  if (!draft) {
    return (
      <PageShell title="Active workout">
        <WorkoutNav />
        <div className="rounded-lg border border-border bg-card p-4">
          <p className="mb-3 text-sm text-muted-foreground">No active workout draft.</p>
          <Button asChild>
            <Link href="/workouts">Start workout</Link>
          </Button>
        </div>
      </PageShell>
    );
  }

  const availableAdHocExercises = (exercisesQuery.data ?? []).filter(
    (exercise) => !draft.exercises.some((draftExercise) => draftExercise.exerciseId === exercise.id)
  );
  const canFinish = hasAtLeastOneValidSet(draft);

  return (
    <PageShell
      title={draft.templateName}
      actions={<Badge>Started {formatTime(draft.startedAt)}</Badge>}
    >
      <WorkoutNav />
      <SetupAlert />

      <div className="grid gap-4">
        {draft.exercises.map((exercise) => {
          const lastSets = lastSetsQuery.data?.[exercise.exerciseId] ?? [];

          return (
            <section
              key={exercise.exerciseId}
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
                <Button type="button" variant="outline" size="sm" onClick={() => addSet(exercise.exerciseId)}>
                  <Plus className="size-4" aria-hidden="true" />
                  Set
                </Button>
              </div>

              {lastSets.length > 0 ? (
                <div className="mb-3 rounded-md bg-muted p-3">
                  <p className="mb-2 text-xs font-medium uppercase text-muted-foreground">Last time</p>
                  <div className="grid gap-1 text-sm">
                    {lastSets.map((set) => (
                      <p key={set.setIndex}>
                        {exercise.loggingType === "weighted_reps" && set.weight !== null
                          ? `${formatWeight(set.weight)} × ${set.reps}`
                          : `${set.reps} reps`}
                      </p>
                    ))}
                  </div>
                </div>
              ) : null}

              <div className="grid gap-2">
                {exercise.sets.map((set) => (
                  <div
                    key={set.localId}
                    className="grid grid-cols-[2rem_1fr_1fr_2.5rem] items-end gap-2"
                  >
                    <span className="pb-2 text-sm font-medium text-muted-foreground">
                      {set.setIndex + 1}
                    </span>
                    {exercise.loggingType === "weighted_reps" ? (
                      <div className="grid gap-1">
                        <Label htmlFor={`${set.localId}-weight`}>kg</Label>
                        <Input
                          id={`${set.localId}-weight`}
                          type="number"
                          inputMode="decimal"
                          min="0"
                          step="0.25"
                          value={set.weight ?? ""}
                          onChange={(event) =>
                            updateSet(exercise.exerciseId, set.localId, {
                              weight: numberOrNull(event.target.value)
                            })
                          }
                        />
                      </div>
                    ) : (
                      <div />
                    )}
                    <div className="grid gap-1">
                      <Label htmlFor={`${set.localId}-reps`}>Reps</Label>
                      <Input
                        id={`${set.localId}-reps`}
                        type="number"
                        inputMode="numeric"
                        min="1"
                        step="1"
                        value={set.reps ?? ""}
                        onChange={(event) =>
                          updateSet(exercise.exerciseId, set.localId, {
                            reps: numberOrNull(event.target.value)
                          })
                        }
                      />
                    </div>
                    <Button
                      type="button"
                      variant="ghost"
                      size="icon"
                      aria-label="Delete set"
                      onClick={() => deleteSet(exercise.exerciseId, set.localId)}
                    >
                      <Trash2 className="size-4" aria-hidden="true" />
                    </Button>
                  </div>
                ))}
                {exercise.sets.length === 0 ? (
                  <p className="text-sm text-muted-foreground">No sets added.</p>
                ) : null}
              </div>
            </section>
          );
        })}
      </div>

      <section className="rounded-lg border border-border bg-card p-4">
        <div className="grid gap-2 sm:grid-cols-[1fr_auto]">
          <Select
            value={selectedExerciseId}
            onChange={(event) => setSelectedExerciseId(event.target.value)}
            disabled={availableAdHocExercises.length === 0}
          >
            <option value="">Add ad-hoc exercise</option>
            {availableAdHocExercises.map((exercise) => (
              <option key={exercise.id} value={exercise.id}>
                {exercise.name}
              </option>
            ))}
          </Select>
          <Button
            type="button"
            variant="outline"
            disabled={!selectedExerciseId}
            onClick={() => {
              const exercise = availableAdHocExercises.find((item) => item.id === selectedExerciseId);
              if (exercise) {
                addAdHocExercise(exercise);
                setSelectedExerciseId("");
              }
            }}
          >
            <Plus className="size-4" aria-hidden="true" />
            Add
          </Button>
        </div>
      </section>

      <div className="grid gap-2 sm:grid-cols-2">
        <Button type="button" disabled={!canFinish} onClick={() => setFinishOpen(true)}>
          Finish workout
        </Button>
        <Button
          type="button"
          variant="destructive"
          onClick={() => {
            if (window.confirm("Discard this active workout?")) {
              discardWorkout();
              router.replace("/workouts");
            }
          }}
        >
          Discard workout
        </Button>
      </div>

      {!canFinish ? (
        <p className="text-sm text-muted-foreground">
          Add at least one complete set before finishing the workout.
        </p>
      ) : null}

      {finishMutation.error ? (
        <p className="text-sm text-destructive">{finishMutation.error.message}</p>
      ) : null}

      <Dialog open={finishOpen} title="Post-workout feeling" onClose={() => setFinishOpen(false)}>
        <div className="grid gap-4">
          <div className="grid grid-cols-5 gap-2">
            {([1, 2, 3, 4, 5] as PostWorkoutFeeling[]).map((value) => (
              <Button
                key={value}
                type="button"
                variant={feeling === value ? "default" : "outline"}
                onClick={() => setFeeling(value)}
              >
                {value}
              </Button>
            ))}
          </div>
          <Button
            type="button"
            disabled={!feeling || finishMutation.isPending}
            onClick={() => finishMutation.mutate()}
          >
            Save workout
          </Button>
        </div>
      </Dialog>
    </PageShell>
  );
}
