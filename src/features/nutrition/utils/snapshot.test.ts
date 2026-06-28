import { describe, expect, it } from "vitest";
import type { Product } from "../types/nutrition.types";
import { createIngredientSnapshot } from "./snapshot";

describe("createIngredientSnapshot", () => {
  it("copies product values into a stable daily ingredient snapshot", () => {
    const product: Product = {
      id: "product-1",
      name: "Banana",
      nutritionBasis: "per_unit",
      calories: 105,
      protein: 1.3,
      carbs: 27,
      fat: 0.3,
      unitName: "banana",
      isActive: true
    };

    expect(createIngredientSnapshot(product, 1.5)).toEqual({
      product_id: "product-1",
      product_name_snapshot: "Banana",
      nutrition_basis_snapshot: "per_unit",
      calories_snapshot: 105,
      protein_snapshot: 1.3,
      carbs_snapshot: 27,
      fat_snapshot: 0.3,
      unit_name_snapshot: "banana",
      quantity: 1.5
    });
  });

  it("does not store unit names for weight-based products", () => {
    const product: Product = {
      id: "product-2",
      name: "Pasta",
      nutritionBasis: "per_100g",
      calories: 350,
      protein: 12,
      carbs: 70,
      fat: 1,
      unitName: null,
      isActive: true
    };

    expect(createIngredientSnapshot(product, 120).unit_name_snapshot).toBeNull();
  });
});
