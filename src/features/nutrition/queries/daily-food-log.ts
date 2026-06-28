import { getSupabaseClient } from "@/supabase/client";
import { createIngredientSnapshot } from "../utils/snapshot";
import { getActiveMealTemplate } from "./meal-templates";
import { getActiveProduct } from "./products";
import {
  mapDailyFoodEntry,
  throwIfError,
  type DailyFoodEntryRow
} from "./query-utils";

const DAILY_FOOD_ENTRY_SELECT = `
  id,
  entry_date,
  entry_type,
  name_snapshot,
  daily_food_entry_ingredients(
    id,
    daily_food_entry_id,
    product_id,
    product_name_snapshot,
    nutrition_basis_snapshot,
    calories_snapshot,
    protein_snapshot,
    carbs_snapshot,
    fat_snapshot,
    unit_name_snapshot,
    quantity
  )
`;

async function createDailyFoodEntry(date: string, entryType: "meal" | "product", name: string) {
  const supabase = getSupabaseClient();
  const { data, error } = await supabase
    .from("daily_food_entries")
    .insert({
      entry_date: date,
      entry_type: entryType,
      name_snapshot: name
    })
    .select("id")
    .single();

  throwIfError(error);
  if (!data) {
    throw new Error("Daily food entry was not created.");
  }

  return data.id;
}

export async function listDailyFoodEntries(date: string) {
  const supabase = getSupabaseClient();
  const { data, error } = await supabase
    .from("daily_food_entries")
    .select(DAILY_FOOD_ENTRY_SELECT)
    .eq("entry_date", date)
    .order("id", { ascending: true });

  throwIfError(error);
  return ((data ?? []) as unknown as DailyFoodEntryRow[]).map(mapDailyFoodEntry);
}

export async function addProductEntryToDay(input: {
  date: string;
  productId: string;
  quantity: number;
}) {
  const product = await getActiveProduct(input.productId);
  const entryId = await createDailyFoodEntry(input.date, "product", product.name);
  const supabase = getSupabaseClient();

  try {
    const { error } = await supabase.from("daily_food_entry_ingredients").insert({
      daily_food_entry_id: entryId,
      ...createIngredientSnapshot(product, input.quantity)
    });
    throwIfError(error);
  } catch (error) {
    await supabase.from("daily_food_entries").delete().eq("id", entryId);
    throw error;
  }

  return entryId;
}

export async function addMealEntryToDay(input: { date: string; mealTemplateId: string }) {
  const mealTemplate = await getActiveMealTemplate(input.mealTemplateId);
  if (mealTemplate.ingredients.length === 0) {
    throw new Error("A meal needs at least one product before it can be added to a day.");
  }

  const entryId = await createDailyFoodEntry(input.date, "meal", mealTemplate.name);
  const supabase = getSupabaseClient();

  try {
    const { error } = await supabase.from("daily_food_entry_ingredients").insert(
      mealTemplate.ingredients.map((ingredient) => ({
        daily_food_entry_id: entryId,
        ...createIngredientSnapshot(ingredient.product, ingredient.quantity)
      }))
    );
    throwIfError(error);
  } catch (error) {
    await supabase.from("daily_food_entries").delete().eq("id", entryId);
    throw error;
  }

  return entryId;
}

export async function updateDailyFoodEntryIngredientQuantity(
  ingredientId: string,
  quantity: number
) {
  const supabase = getSupabaseClient();
  const { error } = await supabase
    .from("daily_food_entry_ingredients")
    .update({ quantity })
    .eq("id", ingredientId);

  throwIfError(error);
}

export async function addProductToDailyMealEntry(input: {
  entryId: string;
  productId: string;
  quantity: number;
}) {
  const product = await getActiveProduct(input.productId);
  const supabase = getSupabaseClient();
  const { data: entry, error: entryError } = await supabase
    .from("daily_food_entries")
    .select("entry_type")
    .eq("id", input.entryId)
    .single();

  throwIfError(entryError);
  if (entry?.entry_type !== "meal") {
    throw new Error("Products can only be added to daily meal entries.");
  }

  const { error } = await supabase.from("daily_food_entry_ingredients").insert({
    daily_food_entry_id: input.entryId,
    ...createIngredientSnapshot(product, input.quantity)
  });

  throwIfError(error);
}

export async function removeDailyFoodEntryIngredient(entryId: string, ingredientId: string) {
  const supabase = getSupabaseClient();
  const { count, error: countError } = await supabase
    .from("daily_food_entry_ingredients")
    .select("id", { count: "exact", head: true })
    .eq("daily_food_entry_id", entryId);

  throwIfError(countError);
  if ((count ?? 0) <= 1) {
    throw new Error("A food entry needs at least one ingredient. Delete the entry instead.");
  }

  const { error } = await supabase
    .from("daily_food_entry_ingredients")
    .delete()
    .eq("id", ingredientId);

  throwIfError(error);
}

export async function deleteDailyFoodEntry(entryId: string) {
  const supabase = getSupabaseClient();
  const { error } = await supabase.from("daily_food_entries").delete().eq("id", entryId);
  throwIfError(error);
}
