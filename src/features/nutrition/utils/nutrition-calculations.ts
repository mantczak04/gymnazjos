import type {
  DailyFoodEntry,
  DailyFoodEntryIngredient,
  MealTemplate,
  NutritionBasis,
  NutritionValues,
  Product
} from "../types/nutrition.types";

export const EMPTY_NUTRITION_VALUES: NutritionValues = {
  calories: 0,
  protein: 0,
  carbs: 0,
  fat: 0
};

export function getNutritionMultiplier(basis: NutritionBasis, quantity: number) {
  if (basis === "per_100g" || basis === "per_100ml") {
    return quantity / 100;
  }

  return quantity;
}

export function calculateProductNutrition(
  product: Pick<Product, "nutritionBasis" | "calories" | "protein" | "carbs" | "fat">,
  quantity: number
): NutritionValues {
  const multiplier = getNutritionMultiplier(product.nutritionBasis, quantity);

  return {
    calories: product.calories * multiplier,
    protein: product.protein * multiplier,
    carbs: product.carbs * multiplier,
    fat: product.fat * multiplier
  };
}

export function calculateSnapshotIngredientNutrition(
  ingredient: Pick<
    DailyFoodEntryIngredient,
    | "nutritionBasisSnapshot"
    | "caloriesSnapshot"
    | "proteinSnapshot"
    | "carbsSnapshot"
    | "fatSnapshot"
    | "quantity"
  >
): NutritionValues {
  const multiplier = getNutritionMultiplier(ingredient.nutritionBasisSnapshot, ingredient.quantity);

  return {
    calories: ingredient.caloriesSnapshot * multiplier,
    protein: ingredient.proteinSnapshot * multiplier,
    carbs: ingredient.carbsSnapshot * multiplier,
    fat: ingredient.fatSnapshot * multiplier
  };
}

export function sumNutritionValues(values: NutritionValues[]): NutritionValues {
  return values.reduce<NutritionValues>(
    (total, value) => ({
      calories: total.calories + value.calories,
      protein: total.protein + value.protein,
      carbs: total.carbs + value.carbs,
      fat: total.fat + value.fat
    }),
    EMPTY_NUTRITION_VALUES
  );
}

export function calculateMealTemplateTotals(template: MealTemplate): NutritionValues {
  return sumNutritionValues(
    template.ingredients.map((ingredient) =>
      calculateProductNutrition(ingredient.product, ingredient.quantity)
    )
  );
}

export function calculateDailyEntryTotals(entry: DailyFoodEntry): NutritionValues {
  return sumNutritionValues(entry.ingredients.map(calculateSnapshotIngredientNutrition));
}

export function calculateDailyTotals(entries: DailyFoodEntry[]): NutritionValues {
  return sumNutritionValues(entries.map(calculateDailyEntryTotals));
}
