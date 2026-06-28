import { describe, expect, it } from "vitest";
import type { DailyFoodEntry, MealTemplate, Product } from "../types/nutrition.types";
import {
  calculateDailyEntryTotals,
  calculateDailyTotals,
  calculateMealTemplateTotals,
  calculateProductNutrition
} from "./nutrition-calculations";

const cottageCheese: Product = {
  id: "product-1",
  name: "Cottage Cheese",
  nutritionBasis: "per_100g",
  calories: 133,
  protein: 18,
  carbs: 4,
  fat: 7,
  unitName: null,
  isActive: true
};

const oatMilk: Product = {
  id: "product-2",
  name: "Oat Milk",
  nutritionBasis: "per_100ml",
  calories: 45,
  protein: 1,
  carbs: 7,
  fat: 1.5,
  unitName: null,
  isActive: true
};

const egg: Product = {
  id: "product-3",
  name: "Egg",
  nutritionBasis: "per_unit",
  calories: 78,
  protein: 6.5,
  carbs: 0.6,
  fat: 5.3,
  unitName: "egg",
  isActive: true
};

describe("nutrition calculations", () => {
  it("calculates product nutrition by basis", () => {
    expect(calculateProductNutrition(cottageCheese, 250)).toEqual({
      calories: 332.5,
      protein: 45,
      carbs: 10,
      fat: 17.5
    });
    expect(calculateProductNutrition(oatMilk, 600)).toEqual({
      calories: 270,
      protein: 6,
      carbs: 42,
      fat: 9
    });
    expect(calculateProductNutrition(egg, 2)).toEqual({
      calories: 156,
      protein: 13,
      carbs: 1.2,
      fat: 10.6
    });
  });

  it("sums meal template totals", () => {
    const meal: MealTemplate = {
      id: "meal-1",
      name: "Breakfast",
      isActive: true,
      ingredients: [
        { id: "ingredient-1", product: cottageCheese, quantity: 200 },
        { id: "ingredient-2", product: egg, quantity: 2 }
      ]
    };

    expect(calculateMealTemplateTotals(meal)).toEqual({
      calories: 422,
      protein: 49,
      carbs: 9.2,
      fat: 24.6
    });
  });

  it("sums daily snapshot totals without product references", () => {
    const entry: DailyFoodEntry = {
      id: "entry-1",
      date: "2026-06-28",
      entryType: "meal",
      nameSnapshot: "Breakfast",
      ingredients: [
        {
          id: "daily-ingredient-1",
          dailyFoodEntryId: "entry-1",
          productId: null,
          productNameSnapshot: "Old Product",
          nutritionBasisSnapshot: "per_unit",
          caloriesSnapshot: 100,
          proteinSnapshot: 10,
          carbsSnapshot: 5,
          fatSnapshot: 2,
          unitNameSnapshot: "unit",
          quantity: 1.5
        }
      ]
    };

    expect(calculateDailyEntryTotals(entry)).toEqual({
      calories: 150,
      protein: 15,
      carbs: 7.5,
      fat: 3
    });
    expect(calculateDailyTotals([entry, entry])).toEqual({
      calories: 300,
      protein: 30,
      carbs: 15,
      fat: 6
    });
  });
});
