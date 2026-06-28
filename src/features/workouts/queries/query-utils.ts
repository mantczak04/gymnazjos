import type { PostgrestError } from "@supabase/supabase-js";
import type {
  Exercise,
  LoggingType,
  PostWorkoutFeeling,
  WorkoutSessionExerciseSource
} from "../types/workout.types";

export type ExerciseRow = {
  id: string;
  name: string;
  logging_type: LoggingType;
  is_active: boolean;
};

export type TemplateExerciseRow = {
  id: string;
  order_index: number;
  exercise: ExerciseRow | ExerciseRow[] | null;
};

export type TemplateRow = {
  id: string;
  name: string;
  is_active: boolean;
  workout_template_exercises?: TemplateExerciseRow[] | null;
};

export type SetRow = {
  id: string;
  session_exercise_id: string;
  set_index: number;
  reps: number;
  weight: number | string | null;
};

export type SessionExerciseRow = {
  id: string;
  exercise_id: string;
  order_index: number;
  source: WorkoutSessionExerciseSource;
  exercise: ExerciseRow | ExerciseRow[] | null;
  workout_sets?: SetRow[] | null;
};

export type SessionRow = {
  id: string;
  template_id: string;
  started_at: string;
  finished_at: string;
  post_workout_feeling: number;
  template: { id: string; name: string } | { id: string; name: string }[] | null;
  workout_session_exercises?: SessionExerciseRow[] | null;
};

export function throwIfError(error: PostgrestError | null) {
  if (error) {
    throw new Error(error.message);
  }
}

export function singleRelation<T>(relation: T | T[] | null | undefined) {
  if (Array.isArray(relation)) {
    return relation[0] ?? null;
  }

  return relation ?? null;
}

export function mapExercise(row: ExerciseRow): Exercise {
  return {
    id: row.id,
    name: row.name,
    loggingType: row.logging_type,
    isActive: row.is_active
  };
}

export function toFeeling(value: number): PostWorkoutFeeling {
  if (value >= 1 && value <= 5) {
    return value as PostWorkoutFeeling;
  }

  throw new Error("Invalid post-workout feeling value from database.");
}

export function numberFromDb(value: number | string | null) {
  if (value === null) {
    return null;
  }

  return typeof value === "number" ? value : Number(value);
}
