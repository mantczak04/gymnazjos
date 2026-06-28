import { getSupabaseClient } from "@/supabase/client";
import type { TemplateFormValues } from "../schemas/template.schema";
import type { WorkoutTemplate } from "../types/workout.types";
import {
  mapExercise,
  singleRelation,
  throwIfError,
  type TemplateRow,
  type TemplateExerciseRow
} from "./query-utils";

const TEMPLATE_SELECT = `
  id,
  name,
  is_active,
  workout_template_exercises(
    id,
    order_index,
    exercise:exercises(id,name,logging_type,is_active)
  )
`;

function mapTemplate(row: TemplateRow): WorkoutTemplate {
  const exercises = (row.workout_template_exercises ?? [])
    .map((templateExercise: TemplateExerciseRow) => {
      const exercise = singleRelation(templateExercise.exercise);
      if (!exercise) {
        return null;
      }

      return {
        id: templateExercise.id,
        exercise: mapExercise(exercise),
        orderIndex: templateExercise.order_index
      };
    })
    .filter((value): value is NonNullable<typeof value> => Boolean(value))
    .sort((a, b) => a.orderIndex - b.orderIndex);

  return {
    id: row.id,
    name: row.name,
    isActive: row.is_active,
    exercises
  };
}

export async function listActiveTemplatesWithExercises(): Promise<WorkoutTemplate[]> {
  const supabase = getSupabaseClient();
  const { data, error } = await supabase
    .from("workout_templates")
    .select(TEMPLATE_SELECT)
    .eq("is_active", true)
    .order("name", { ascending: true });

  throwIfError(error);
  return ((data ?? []) as unknown as TemplateRow[]).map(mapTemplate);
}

export async function getTemplateWithExercises(templateId: string) {
  const supabase = getSupabaseClient();
  const { data, error } = await supabase
    .from("workout_templates")
    .select(TEMPLATE_SELECT)
    .eq("id", templateId)
    .eq("is_active", true)
    .single();

  throwIfError(error);
  return mapTemplate(data as unknown as TemplateRow);
}

export async function createTemplate(values: TemplateFormValues) {
  const supabase = getSupabaseClient();
  const { data, error } = await supabase
    .from("workout_templates")
    .insert({ name: values.name.trim() })
    .select(TEMPLATE_SELECT)
    .single();

  throwIfError(error);
  return mapTemplate(data as unknown as TemplateRow);
}

export async function updateTemplateName(templateId: string, values: TemplateFormValues) {
  const supabase = getSupabaseClient();
  const { data, error } = await supabase
    .from("workout_templates")
    .update({ name: values.name.trim() })
    .eq("id", templateId)
    .select(TEMPLATE_SELECT)
    .single();

  throwIfError(error);
  return mapTemplate(data as unknown as TemplateRow);
}

export async function deactivateTemplate(templateId: string) {
  const supabase = getSupabaseClient();
  const { error } = await supabase
    .from("workout_templates")
    .update({ is_active: false })
    .eq("id", templateId);

  throwIfError(error);
}

export async function addExerciseToTemplate(templateId: string, exerciseId: string) {
  const supabase = getSupabaseClient();
  const template = await getTemplateWithExercises(templateId);

  const { error } = await supabase.from("workout_template_exercises").insert({
    template_id: templateId,
    exercise_id: exerciseId,
    order_index: template.exercises.length
  });

  throwIfError(error);
}

async function reindexTemplateExercises(templateId: string) {
  const template = await getTemplateWithExercises(templateId);
  const supabase = getSupabaseClient();

  for (const [index, templateExercise] of template.exercises.entries()) {
    if (templateExercise.orderIndex !== index) {
      const { error } = await supabase
        .from("workout_template_exercises")
        .update({ order_index: index })
        .eq("id", templateExercise.id);
      throwIfError(error);
    }
  }
}

export async function removeExerciseFromTemplate(templateId: string, templateExerciseId: string) {
  const supabase = getSupabaseClient();
  const { error } = await supabase
    .from("workout_template_exercises")
    .delete()
    .eq("id", templateExerciseId);

  throwIfError(error);
  await reindexTemplateExercises(templateId);
}

export async function moveTemplateExercise(
  templateId: string,
  templateExerciseId: string,
  direction: "up" | "down"
) {
  const template = await getTemplateWithExercises(templateId);
  const currentIndex = template.exercises.findIndex((item) => item.id === templateExerciseId);
  if (currentIndex === -1) {
    throw new Error("Template exercise was not found.");
  }

  const targetIndex = direction === "up" ? currentIndex - 1 : currentIndex + 1;
  if (targetIndex < 0 || targetIndex >= template.exercises.length) {
    return;
  }

  const current = template.exercises[currentIndex];
  const target = template.exercises[targetIndex];
  const temporaryIndex = template.exercises.length + 100;
  const supabase = getSupabaseClient();

  for (const update of [
    { id: current.id, order_index: temporaryIndex },
    { id: target.id, order_index: current.orderIndex },
    { id: current.id, order_index: target.orderIndex }
  ]) {
    const { error } = await supabase
      .from("workout_template_exercises")
      .update({ order_index: update.order_index })
      .eq("id", update.id);
    throwIfError(error);
  }
}
