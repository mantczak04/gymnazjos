import type { Product } from "../types/nutrition.types";

export type IngredientSnapshot = {
  product_id: string | null;
  product_name_snapshot: string;
  nutrition_basis_snapshot: Product["nutritionBasis"];
  calories_snapshot: number;
  protein_snapshot: number;
  carbs_snapshot: number;
  fat_snapshot: number;
  unit_name_snapshot: string | null;
  quantity: number;
};

export function createIngredientSnapshot(product: Product, quantity: number): IngredientSnapshot {
  return {
    product_id: product.id,
    product_name_snapshot: product.name,
    nutrition_basis_snapshot: product.nutritionBasis,
    calories_snapshot: product.calories,
    protein_snapshot: product.protein,
    carbs_snapshot: product.carbs,
    fat_snapshot: product.fat,
    unit_name_snapshot: product.nutritionBasis === "per_unit" ? product.unitName : null,
    quantity
  };
}
