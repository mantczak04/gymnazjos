import type {
  ActiveWorkoutDraftExercise,
  ActiveWorkoutDraftSet,
  LoggingType
} from "../types/workout.types";

function createLocalId() {
  if (typeof crypto !== "undefined" && "randomUUID" in crypto) {
    return crypto.randomUUID();
  }

  return `${Date.now()}-${Math.random().toString(16).slice(2)}`;
}

export function reindexDraftSets(sets: ActiveWorkoutDraftSet[]) {
  return sets.map((set, index) => ({ ...set, setIndex: index }));
}

export function createNextDraftSet(
  exercise: Pick<ActiveWorkoutDraftExercise, "loggingType" | "sets">
): ActiveWorkoutDraftSet {
  const previousSet = exercise.sets.at(-1);
  const shouldCopyWeight = exercise.loggingType === "weighted_reps" && previousSet?.weight != null;

  return {
    localId: createLocalId(),
    setIndex: exercise.sets.length,
    reps: null,
    weight: shouldCopyWeight ? previousSet.weight : null
  };
}

export function isDraftSetValid(loggingType: LoggingType, set: ActiveWorkoutDraftSet) {
  if (loggingType === "weighted_reps") {
    return set.reps !== null && set.reps > 0 && set.weight !== null && set.weight >= 0;
  }

  return set.reps !== null && set.reps > 0;
}
