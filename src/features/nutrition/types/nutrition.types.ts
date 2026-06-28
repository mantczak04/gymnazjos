export type NutritionBasis = "per_100g" | "per_100ml" | "per_unit";
export type DailyFoodEntryType = "meal" | "product";

export type NutritionValues = {
  calories: number;
  protein: number;
  carbs: number;
  fat: number;
};

export type Product = NutritionValues & {
  id: string;
  name: string;
  nutritionBasis: NutritionBasis;
  unitName: string | null;
  isActive: boolean;
};

export type MealTemplateIngredient = {
  id: string;
  product: Product;
  quantity: number;
};

export type MealTemplate = {
  id: string;
  name: string;
  isActive: boolean;
  ingredients: MealTemplateIngredient[];
};

export type DailyFoodEntryIngredient = {
  id: string;
  dailyFoodEntryId: string;
  productId: string | null;
  productNameSnapshot: string;
  nutritionBasisSnapshot: NutritionBasis;
  caloriesSnapshot: number;
  proteinSnapshot: number;
  carbsSnapshot: number;
  fatSnapshot: number;
  unitNameSnapshot: string | null;
  quantity: number;
};

export type DailyFoodEntry = {
  id: string;
  date: string;
  entryType: DailyFoodEntryType;
  nameSnapshot: string;
  ingredients: DailyFoodEntryIngredient[];
};

export type DailyNutritionTargets = {
  caloriesTarget: number;
  proteinTarget: number;
  carbsTarget: number;
  fatTarget: number;
};
