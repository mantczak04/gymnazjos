import { describe, expect, it } from "vitest";
import { addProductToDayFormSchema } from "./daily-food-entry.schema";
import { productFormSchema } from "./product.schema";

describe("nutrition schemas", () => {
  it("requires unit names for per-unit products", () => {
    expect(
      productFormSchema.safeParse({
        name: "Egg",
        nutritionBasis: "per_unit",
        calories: 78,
        protein: 6.5,
        carbs: 0.6,
        fat: 5.3,
        unitName: ""
      }).success
    ).toBe(false);
  });

  it("accepts decimal product nutrition", () => {
    expect(
      productFormSchema.safeParse({
        name: "Oat Milk",
        nutritionBasis: "per_100ml",
        calories: "45",
        protein: "1",
        carbs: "7",
        fat: "1.5",
        unitName: ""
      }).success
    ).toBe(true);
  });

  it("requires positive daily quantities", () => {
    expect(addProductToDayFormSchema.safeParse({ productId: "product-1", quantity: 0 }).success).toBe(
      false
    );
    expect(
      addProductToDayFormSchema.safeParse({ productId: "product-1", quantity: 1.5 }).success
    ).toBe(true);
  });
});
