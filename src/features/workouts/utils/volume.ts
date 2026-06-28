import type {
  ActiveWorkoutDraft,
  ActiveWorkoutDraftExercise,
  SavedWorkoutSet,
  SessionExerciseDetails
} from "../types/workout.types";

type VolumeSet = Pick<SavedWorkoutSet, "reps" | "weight">;

export function calculateWeightedVolume(sets: VolumeSet[]) {
  return sets.reduce((total, set) => total + (set.weight ?? 0) * set.reps, 0);
}

export function calculateRepsVolume(sets: VolumeSet[]) {
  return sets.reduce((total, set) => total + set.reps, 0);
}

export function calculateSessionWeightedVolume(exercises: SessionExerciseDetails[]) {
  return exercises.reduce((total, exercise) => {
    if (exercise.loggingType !== "weighted_reps") {
      return total;
    }

    return total + calculateWeightedVolume(exercise.sets);
  }, 0);
}

export function calculateSessionRepsVolume(exercises: SessionExerciseDetails[]) {
  return exercises.reduce((total, exercise) => {
    if (exercise.loggingType !== "reps_only") {
      return total;
    }

    return total + calculateRepsVolume(exercise.sets);
  }, 0);
}

export function hasValidSet(exercise: Pick<ActiveWorkoutDraftExercise, "loggingType" | "sets">) {
  return exercise.sets.some((set) => {
    if (exercise.loggingType === "weighted_reps") {
      return set.reps !== null && set.reps > 0 && set.weight !== null && set.weight >= 0;
    }

    return set.reps !== null && set.reps > 0;
  });
}

export function hasAtLeastOneValidSet(draft: ActiveWorkoutDraft) {
  return draft.exercises.some(hasValidSet);
}
