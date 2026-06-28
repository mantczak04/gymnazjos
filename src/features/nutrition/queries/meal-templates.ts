import { getSupabaseClient } from "@/supabase/client";
import type {
  MealTemplateFormValues,
  MealTemplateIngredientFormValues
} from "../schemas/meal-template.schema";
import type { MealTemplate } from "../types/nutrition.types";
import {
  mapMealTemplate,
  throwIfError,
  type MealTemplateRow
} from "./query-utils";

const MEAL_TEMPLATE_SELECT = `
  id,
  name,
  is_active,
  meal_template_ingredients(
    id,
    quantity,
    product:products(id,name,nutrition_basis,calories,protein,carbs,fat,unit_name,is_active)
  )
`;

export async function listActiveMealTemplates(): Promise<MealTemplate[]> {
  const supabase = getSupabaseClient();
  const { data, error } = await supabase
    .from("meal_templates")
    .select(MEAL_TEMPLATE_SELECT)
    .eq("is_active", true)
    .order("name", { ascending: true });

  throwIfError(error);
  return ((data ?? []) as unknown as MealTemplateRow[]).map(mapMealTemplate);
}

export async function getActiveMealTemplate(mealTemplateId: string) {
  const supabase = getSupabaseClient();
  const { data, error } = await supabase
    .from("meal_templates")
    .select(MEAL_TEMPLATE_SELECT)
    .eq("id", mealTemplateId)
    .eq("is_active", true)
    .single();

  throwIfError(error);
  return mapMealTemplate(data as unknown as MealTemplateRow);
}

export async function createMealTemplate(values: MealTemplateFormValues) {
  const supabase = getSupabaseClient();
  const { data, error } = await supabase
    .from("meal_templates")
    .insert({ name: values.name.trim() })
    .select(MEAL_TEMPLATE_SELECT)
    .single();

  throwIfError(error);
  return mapMealTemplate(data as unknown as MealTemplateRow);
}

export async function updateMealTemplateName(
  mealTemplateId: string,
  values: MealTemplateFormValues
) {
  const supabase = getSupabaseClient();
  const { data, error } = await supabase
    .from("meal_templates")
    .update({ name: values.name.trim() })
    .eq("id", mealTemplateId)
    .select(MEAL_TEMPLATE_SELECT)
    .single();

  throwIfError(error);
  return mapMealTemplate(data as unknown as MealTemplateRow);
}

export async function deactivateMealTemplate(mealTemplateId: string) {
  const supabase = getSupabaseClient();
  const { error } = await supabase
    .from("meal_templates")
    .update({ is_active: false })
    .eq("id", mealTemplateId);

  throwIfError(error);
}

export async function addProductToMealTemplate(
  mealTemplateId: string,
  values: MealTemplateIngredientFormValues
) {
  const supabase = getSupabaseClient();
  const { error } = await supabase.from("meal_template_ingredients").insert({
    meal_template_id: mealTemplateId,
    product_id: values.productId,
    quantity: values.quantity
  });

  throwIfError(error);
}

export async function updateMealTemplateIngredientQuantity(
  ingredientId: string,
  quantity: number
) {
  const supabase = getSupabaseClient();
  const { error } = await supabase
    .from("meal_template_ingredients")
    .update({ quantity })
    .eq("id", ingredientId);

  throwIfError(error);
}

export async function removeMealTemplateIngredient(ingredientId: string) {
  const supabase = getSupabaseClient();
  const { error } = await supabase
    .from("meal_template_ingredients")
    .delete()
    .eq("id", ingredientId);

  throwIfError(error);
}
