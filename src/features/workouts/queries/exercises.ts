import { getSupabaseClient } from "@/supabase/client";
import type { ExerciseFormValues } from "../schemas/exercise.schema";
import type { Exercise } from "../types/workout.types";
import { mapExercise, throwIfError, type ExerciseRow } from "./query-utils";

export async function listActiveExercises(): Promise<Exercise[]> {
  const supabase = getSupabaseClient();
  const { data, error } = await supabase
    .from("exercises")
    .select("id,name,logging_type,is_active")
    .eq("is_active", true)
    .order("name", { ascending: true });

  throwIfError(error);
  return ((data ?? []) as ExerciseRow[]).map(mapExercise);
}

export async function createExercise(values: ExerciseFormValues) {
  const supabase = getSupabaseClient();
  const { data, error } = await supabase
    .from("exercises")
    .insert({
      name: values.name.trim(),
      logging_type: values.loggingType
    })
    .select("id,name,logging_type,is_active")
    .single();

  throwIfError(error);
  return mapExercise(data as ExerciseRow);
}

export async function updateExercise(exerciseId: string, values: ExerciseFormValues) {
  const supabase = getSupabaseClient();
  const { data, error } = await supabase
    .from("exercises")
    .update({
      name: values.name.trim(),
      logging_type: values.loggingType
    })
    .eq("id", exerciseId)
    .select("id,name,logging_type,is_active")
    .single();

  throwIfError(error);
  return mapExercise(data as ExerciseRow);
}

export async function deactivateExercise(exerciseId: string) {
  const supabase = getSupabaseClient();
  const { error } = await supabase
    .from("exercises")
    .update({ is_active: false })
    .eq("id", exerciseId);

  throwIfError(error);
}
