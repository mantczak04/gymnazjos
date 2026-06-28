import type {
  NutritionBasis,
  NutritionValues,
  Product
} from "../types/nutrition.types";

export function formatNutritionNumber(value: number) {
  const rounded = Math.round(value * 10) / 10;
  return Number.isInteger(rounded) ? String(rounded) : rounded.toFixed(1);
}

export function formatCalories(value: number) {
  return formatNutritionNumber(value);
}

export function formatNutritionSummary(values: NutritionValues) {
  return `${formatCalories(values.calories)} kcal | ${formatNutritionNumber(
    values.protein
  )}P | ${formatNutritionNumber(values.carbs)}C | ${formatNutritionNumber(values.fat)}F`;
}

export function formatNutritionBasis(basis: NutritionBasis) {
  if (basis === "per_100g") {
    return "Per 100 g";
  }

  if (basis === "per_100ml") {
    return "Per 100 ml";
  }

  return "Per unit";
}

export function formatProductBasisLabel(product: Pick<Product, "nutritionBasis" | "unitName">) {
  if (product.nutritionBasis === "per_100g") {
    return "/ 100 g";
  }

  if (product.nutritionBasis === "per_100ml") {
    return "/ 100 ml";
  }

  return `/ ${product.unitName ?? "unit"}`;
}

export function formatQuantity(
  quantity: number,
  basis: NutritionBasis,
  unitName: string | null = null
) {
  if (basis === "per_100g") {
    return `${formatNutritionNumber(quantity)} g`;
  }

  if (basis === "per_100ml") {
    return `${formatNutritionNumber(quantity)} ml`;
  }

  return `${formatNutritionNumber(quantity)} ${unitName ?? "unit"}`;
}

export function formatProductEntryName(
  name: string,
  quantity: number,
  basis: NutritionBasis,
  unitName: string | null
) {
  if (basis === "per_unit") {
    return `${name} x ${formatNutritionNumber(quantity)}`;
  }

  return `${name} ${formatQuantity(quantity, basis, unitName)}`;
}
