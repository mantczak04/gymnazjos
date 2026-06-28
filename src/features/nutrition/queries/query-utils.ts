import type { PostgrestError } from "@supabase/supabase-js";
import type {
  DailyFoodEntry,
  DailyFoodEntryIngredient,
  DailyFoodEntryType,
  DailyNutritionTargets,
  MealTemplate,
  MealTemplateIngredient,
  NutritionBasis,
  Product
} from "../types/nutrition.types";

type DbNumber = number | string;

export type ProductRow = {
  id: string;
  name: string;
  nutrition_basis: NutritionBasis;
  calories: DbNumber;
  protein: DbNumber;
  carbs: DbNumber;
  fat: DbNumber;
  unit_name: string | null;
  is_active: boolean;
};

export type MealTemplateIngredientRow = {
  id: string;
  quantity: DbNumber;
  product: ProductRow | ProductRow[] | null;
};

export type MealTemplateRow = {
  id: string;
  name: string;
  is_active: boolean;
  meal_template_ingredients?: MealTemplateIngredientRow[] | null;
};

export type DailyFoodEntryIngredientRow = {
  id: string;
  daily_food_entry_id: string;
  product_id: string | null;
  product_name_snapshot: string;
  nutrition_basis_snapshot: NutritionBasis;
  calories_snapshot: DbNumber;
  protein_snapshot: DbNumber;
  carbs_snapshot: DbNumber;
  fat_snapshot: DbNumber;
  unit_name_snapshot: string | null;
  quantity: DbNumber;
};

export type DailyFoodEntryRow = {
  id: string;
  entry_date: string;
  entry_type: DailyFoodEntryType;
  name_snapshot: string;
  daily_food_entry_ingredients?: DailyFoodEntryIngredientRow[] | null;
};

export type DailyNutritionTargetsRow = {
  calories_target: DbNumber;
  protein_target: DbNumber;
  carbs_target: DbNumber;
  fat_target: DbNumber;
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

export function numberFromDb(value: DbNumber) {
  return typeof value === "number" ? value : Number(value);
}

export function mapProduct(row: ProductRow): Product {
  return {
    id: row.id,
    name: row.name,
    nutritionBasis: row.nutrition_basis,
    calories: numberFromDb(row.calories),
    protein: numberFromDb(row.protein),
    carbs: numberFromDb(row.carbs),
    fat: numberFromDb(row.fat),
    unitName: row.unit_name,
    isActive: row.is_active
  };
}

export function mapMealTemplateIngredient(
  row: MealTemplateIngredientRow
): MealTemplateIngredient | null {
  const product = singleRelation(row.product);
  if (!product) {
    return null;
  }

  return {
    id: row.id,
    product: mapProduct(product),
    quantity: numberFromDb(row.quantity)
  };
}

export function mapMealTemplate(row: MealTemplateRow): MealTemplate {
  const ingredients = (row.meal_template_ingredients ?? [])
    .map(mapMealTemplateIngredient)
    .filter((value): value is MealTemplateIngredient => Boolean(value))
    .sort((a, b) => a.product.name.localeCompare(b.product.name));

  return {
    id: row.id,
    name: row.name,
    isActive: row.is_active,
    ingredients
  };
}

export function mapDailyFoodEntryIngredient(
  row: DailyFoodEntryIngredientRow
): DailyFoodEntryIngredient {
  return {
    id: row.id,
    dailyFoodEntryId: row.daily_food_entry_id,
    productId: row.product_id,
    productNameSnapshot: row.product_name_snapshot,
    nutritionBasisSnapshot: row.nutrition_basis_snapshot,
    caloriesSnapshot: numberFromDb(row.calories_snapshot),
    proteinSnapshot: numberFromDb(row.protein_snapshot),
    carbsSnapshot: numberFromDb(row.carbs_snapshot),
    fatSnapshot: numberFromDb(row.fat_snapshot),
    unitNameSnapshot: row.unit_name_snapshot,
    quantity: numberFromDb(row.quantity)
  };
}

export function mapDailyFoodEntry(row: DailyFoodEntryRow): DailyFoodEntry {
  return {
    id: row.id,
    date: row.entry_date,
    entryType: row.entry_type,
    nameSnapshot: row.name_snapshot,
    ingredients: (row.daily_food_entry_ingredients ?? []).map(mapDailyFoodEntryIngredient)
  };
}

export function mapDailyNutritionTargets(row: DailyNutritionTargetsRow): DailyNutritionTargets {
  return {
    caloriesTarget: numberFromDb(row.calories_target),
    proteinTarget: numberFromDb(row.protein_target),
    carbsTarget: numberFromDb(row.carbs_target),
    fatTarget: numberFromDb(row.fat_target)
  };
}
