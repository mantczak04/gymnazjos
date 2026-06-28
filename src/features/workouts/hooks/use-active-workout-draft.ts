"use client";

import { useCallback, useEffect, useState } from "react";
import type {
  ActiveWorkoutDraft,
  ActiveWorkoutDraftSet,
  Exercise,
  WorkoutTemplate
} from "../types/workout.types";
import {
  clearActiveWorkoutDraft,
  readActiveWorkoutDraft,
  writeActiveWorkoutDraft
} from "../utils/draft-storage";
import { createNextDraftSet, reindexDraftSets } from "../utils/set-ordering";

type DraftUpdater = ActiveWorkoutDraft | null | ((draft: ActiveWorkoutDraft | null) => ActiveWorkoutDraft | null);

export function useActiveWorkoutDraft() {
  const [draft, setDraft] = useState<ActiveWorkoutDraft | null>(null);
  const [hydrated, setHydrated] = useState(false);

  useEffect(() => {
    setDraft(readActiveWorkoutDraft());
    setHydrated(true);
  }, []);

  const saveDraft = useCallback((updater: DraftUpdater) => {
    setDraft((currentDraft) => {
      const nextDraft = typeof updater === "function" ? updater(currentDraft) : updater;

      if (nextDraft) {
        writeActiveWorkoutDraft(nextDraft);
      } else {
        clearActiveWorkoutDraft();
      }

      return nextDraft;
    });
  }, []);

  const startWorkout = useCallback(
    (template: WorkoutTemplate) => {
      const nextDraft: ActiveWorkoutDraft = {
        templateId: template.id,
        templateName: template.name,
        startedAt: new Date().toISOString(),
        exercises: template.exercises.map((templateExercise, index) => ({
          exerciseId: templateExercise.exercise.id,
          exerciseName: templateExercise.exercise.name,
          loggingType: templateExercise.exercise.loggingType,
          orderIndex: index,
          source: "template",
          sets: []
        }))
      };

      saveDraft(nextDraft);
      return nextDraft;
    },
    [saveDraft]
  );

  const addSet = useCallback(
    (exerciseId: string) => {
      saveDraft((currentDraft) => {
        if (!currentDraft) {
          return currentDraft;
        }

        return {
          ...currentDraft,
          exercises: currentDraft.exercises.map((exercise) => {
            if (exercise.exerciseId !== exerciseId) {
              return exercise;
            }

            return {
              ...exercise,
              sets: [...exercise.sets, createNextDraftSet(exercise)]
            };
          })
        };
      });
    },
    [saveDraft]
  );

  const updateSet = useCallback(
    (exerciseId: string, localId: string, values: Partial<Pick<ActiveWorkoutDraftSet, "reps" | "weight">>) => {
      saveDraft((currentDraft) => {
        if (!currentDraft) {
          return currentDraft;
        }

        return {
          ...currentDraft,
          exercises: currentDraft.exercises.map((exercise) => {
            if (exercise.exerciseId !== exerciseId) {
              return exercise;
            }

            return {
              ...exercise,
              sets: exercise.sets.map((set) =>
                set.localId === localId
                  ? {
                      ...set,
                      ...values
                    }
                  : set
              )
            };
          })
        };
      });
    },
    [saveDraft]
  );

  const deleteSet = useCallback(
    (exerciseId: string, localId: string) => {
      saveDraft((currentDraft) => {
        if (!currentDraft) {
          return currentDraft;
        }

        return {
          ...currentDraft,
          exercises: currentDraft.exercises.map((exercise) => {
            if (exercise.exerciseId !== exerciseId) {
              return exercise;
            }

            return {
              ...exercise,
              sets: reindexDraftSets(exercise.sets.filter((set) => set.localId !== localId))
            };
          })
        };
      });
    },
    [saveDraft]
  );

  const addAdHocExercise = useCallback(
    (exercise: Exercise) => {
      saveDraft((currentDraft) => {
        if (!currentDraft || currentDraft.exercises.some((item) => item.exerciseId === exercise.id)) {
          return currentDraft;
        }

        return {
          ...currentDraft,
          exercises: [
            ...currentDraft.exercises,
            {
              exerciseId: exercise.id,
              exerciseName: exercise.name,
              loggingType: exercise.loggingType,
              orderIndex: currentDraft.exercises.length,
              source: "ad_hoc",
              sets: []
            }
          ]
        };
      });
    },
    [saveDraft]
  );

  const discardWorkout = useCallback(() => {
    saveDraft(null);
  }, [saveDraft]);

  return {
    draft,
    hydrated,
    startWorkout,
    addSet,
    updateSet,
    deleteSet,
    addAdHocExercise,
    discardWorkout
  };
}
