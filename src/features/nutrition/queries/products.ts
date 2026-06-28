import { getSupabaseClient } from "@/supabase/client";
import type { ProductFormValues } from "../schemas/product.schema";
import type { Product } from "../types/nutrition.types";
import { mapProduct, throwIfError, type ProductRow } from "./query-utils";

const PRODUCT_SELECT = "id,name,nutrition_basis,calories,protein,carbs,fat,unit_name,is_active";

function productPayload(values: ProductFormValues) {
  return {
    name: values.name.trim(),
    nutrition_basis: values.nutritionBasis,
    calories: values.calories,
    protein: values.protein,
    carbs: values.carbs,
    fat: values.fat,
    unit_name: values.nutritionBasis === "per_unit" ? values.unitName.trim() : null
  };
}

export async function listActiveProducts(): Promise<Product[]> {
  const supabase = getSupabaseClient();
  const { data, error } = await supabase
    .from("products")
    .select(PRODUCT_SELECT)
    .eq("is_active", true)
    .order("name", { ascending: true });

  throwIfError(error);
  return ((data ?? []) as ProductRow[]).map(mapProduct);
}

export async function getActiveProduct(productId: string): Promise<Product> {
  const supabase = getSupabaseClient();
  const { data, error } = await supabase
    .from("products")
    .select(PRODUCT_SELECT)
    .eq("id", productId)
    .eq("is_active", true)
    .single();

  throwIfError(error);
  return mapProduct(data as ProductRow);
}

export async function createProduct(values: ProductFormValues) {
  const supabase = getSupabaseClient();
  const { data, error } = await supabase
    .from("products")
    .insert(productPayload(values))
    .select(PRODUCT_SELECT)
    .single();

  throwIfError(error);
  return mapProduct(data as ProductRow);
}

export async function updateProduct(productId: string, values: ProductFormValues) {
  const supabase = getSupabaseClient();
  const { data, error } = await supabase
    .from("products")
    .update(productPayload(values))
    .eq("id", productId)
    .select(PRODUCT_SELECT)
    .single();

  throwIfError(error);
  return mapProduct(data as ProductRow);
}

export async function deactivateProduct(productId: string) {
  const supabase = getSupabaseClient();
  const { error } = await supabase
    .from("products")
    .update({ is_active: false })
    .eq("id", productId);

  throwIfError(error);
}
