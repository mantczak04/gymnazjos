import { getSupabaseClient } from "@/supabase/client";
import type { DailyTargetsFormValues } from "../schemas/daily-targets.schema";
import type { DailyNutritionTargets } from "../types/nutrition.types";
import {
  mapDailyNutritionTargets,
  throwIfError,
  type DailyNutritionTargetsRow
} from "./query-utils";

export const EMPTY_DAILY_TARGETS: DailyNutritionTargets = {
  caloriesTarget: 0,
  proteinTarget: 0,
  carbsTarget: 0,
  fatTarget: 0
};

export async function getDailyTargets(): Promise<DailyNutritionTargets> {
  const supabase = getSupabaseClient();
  const { data, error } = await supabase
    .from("daily_nutrition_targets")
    .select("calories_target,protein_target,carbs_target,fat_target")
    .eq("id", 1)
    .maybeSingle();

  throwIfError(error);
  return data ? mapDailyNutritionTargets(data as DailyNutritionTargetsRow) : EMPTY_DAILY_TARGETS;
}

export async function upsertDailyTargets(values: DailyTargetsFormValues) {
  const supabase = getSupabaseClient();
  const { data, error } = await supabase
    .from("daily_nutrition_targets")
    .upsert({
      id: 1,
      calories_target: values.caloriesTarget,
      protein_target: values.proteinTarget,
      carbs_target: values.carbsTarget,
      fat_target: values.fatTarget
    })
    .select("calories_target,protein_target,carbs_target,fat_target")
    .single();

  throwIfError(error);
  return mapDailyNutritionTargets(data as DailyNutritionTargetsRow);
}
