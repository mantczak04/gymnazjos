"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { Check, Pencil, Trash2, X } from "lucide-react";
import { useMemo, useState } from "react";
import { useForm } from "react-hook-form";
import { isSupabaseConfigured } from "@/supabase/client";
import { PageShell } from "@/shared/components/page-shell";
import { Badge } from "@/shared/components/ui/badge";
import { Button } from "@/shared/components/ui/button";
import { Input } from "@/shared/components/ui/input";
import { Label } from "@/shared/components/ui/label";
import { mealTemplatesQueryKey } from "../hooks/use-meal-templates";
import { productsQueryKey, useProducts } from "../hooks/use-products";
import {
  createProduct,
  deactivateProduct,
  updateProduct
} from "../queries/products";
import { productFormSchema, type ProductFormValues } from "../schemas/product.schema";
import type { Product } from "../types/nutrition.types";
import {
  formatNutritionBasis,
  formatNutritionSummary,
  formatProductBasisLabel
} from "../utils/nutrition-formatting";
import { NutritionNav } from "./nutrition-nav";
import { ProductFormFields } from "./product-form-fields";
import { SetupAlert } from "./setup-alert";

const defaultProductValues: ProductFormValues = {
  name: "",
  nutritionBasis: "per_100g",
  calories: 0,
  protein: 0,
  carbs: 0,
  fat: 0,
  unitName: ""
};

function productFormValues(product: Product): ProductFormValues {
  return {
    name: product.name,
    nutritionBasis: product.nutritionBasis,
    calories: product.calories,
    protein: product.protein,
    carbs: product.carbs,
    fat: product.fat,
    unitName: product.unitName ?? ""
  };
}

function ProductEditRow({ product }: { product: Product }) {
  const queryClient = useQueryClient();
  const [editing, setEditing] = useState(false);
  const form = useForm<ProductFormValues>({
    resolver: zodResolver(productFormSchema),
    defaultValues: productFormValues(product)
  });

  const invalidateProducts = async () => {
    await Promise.all([
      queryClient.invalidateQueries({ queryKey: productsQueryKey }),
      queryClient.invalidateQueries({ queryKey: mealTemplatesQueryKey })
    ]);
  };

  const updateMutation = useMutation({
    mutationFn: (values: ProductFormValues) => updateProduct(product.id, values),
    onSuccess: async () => {
      setEditing(false);
      await invalidateProducts();
    }
  });

  const deactivateMutation = useMutation({
    mutationFn: () => deactivateProduct(product.id),
    onSuccess: invalidateProducts
  });

  if (!editing) {
    return (
      <div className="grid gap-3 rounded-lg border border-border bg-card p-4 sm:grid-cols-[1fr_auto] sm:items-center">
        <div className="min-w-0">
          <div className="flex flex-wrap items-center gap-2">
            <h2 className="truncate text-base font-semibold">{product.name}</h2>
            <Badge>{formatNutritionBasis(product.nutritionBasis)}</Badge>
          </div>
          <p className="mt-2 text-sm text-muted-foreground">
            {formatNutritionSummary(product)} {formatProductBasisLabel(product)}
          </p>
        </div>
        <div className="flex gap-2">
          <Button
            type="button"
            variant="outline"
            size="icon"
            aria-label="Edit product"
            onClick={() => setEditing(true)}
          >
            <Pencil className="size-4" aria-hidden="true" />
          </Button>
          <Button
            type="button"
            variant="destructive"
            size="icon"
            aria-label="Deactivate product"
            disabled={deactivateMutation.isPending}
            onClick={() => {
              if (window.confirm(`Deactivate ${product.name}?`)) {
                deactivateMutation.mutate();
              }
            }}
          >
            <Trash2 className="size-4" aria-hidden="true" />
          </Button>
        </div>
      </div>
    );
  }

  return (
    <form
      className="grid gap-3 rounded-lg border border-border bg-card p-4"
      onSubmit={form.handleSubmit((values) => updateMutation.mutate(values))}
    >
      <ProductFormFields form={form} idPrefix={`product-${product.id}`} />
      {updateMutation.error ? (
        <p className="text-sm text-destructive">{updateMutation.error.message}</p>
      ) : null}
      <div className="flex gap-2">
        <Button type="submit" disabled={updateMutation.isPending}>
          <Check className="size-4" aria-hidden="true" />
          Save
        </Button>
        <Button
          type="button"
          variant="outline"
          onClick={() => {
            form.reset(productFormValues(product));
            setEditing(false);
          }}
        >
          <X className="size-4" aria-hidden="true" />
          Cancel
        </Button>
      </div>
    </form>
  );
}

export function ProductLibraryPage() {
  const configured = isSupabaseConfigured();
  const queryClient = useQueryClient();
  const [search, setSearch] = useState("");
  const form = useForm<ProductFormValues>({
    resolver: zodResolver(productFormSchema),
    defaultValues: defaultProductValues
  });

  const productsQuery = useProducts(configured);

  const createMutation = useMutation({
    mutationFn: createProduct,
    onSuccess: async () => {
      form.reset(defaultProductValues);
      await Promise.all([
        queryClient.invalidateQueries({ queryKey: productsQueryKey }),
        queryClient.invalidateQueries({ queryKey: mealTemplatesQueryKey })
      ]);
    }
  });

  const filteredProducts = useMemo(() => {
    const normalizedSearch = search.trim().toLowerCase();
    if (!normalizedSearch) {
      return productsQuery.data ?? [];
    }

    return (productsQuery.data ?? []).filter((product) =>
      product.name.toLowerCase().includes(normalizedSearch)
    );
  }, [productsQuery.data, search]);

  return (
    <PageShell title="Product Library">
      <NutritionNav />
      <SetupAlert />

      <form
        className="grid gap-3 rounded-lg border border-border bg-card p-4 shadow-sm"
        onSubmit={form.handleSubmit((values) => createMutation.mutate(values))}
      >
        <ProductFormFields form={form} idPrefix="create-product" />
        {createMutation.error ? (
          <p className="text-sm text-destructive">{createMutation.error.message}</p>
        ) : null}
        <Button type="submit" disabled={createMutation.isPending}>
          Create product
        </Button>
      </form>

      <div className="grid gap-2">
        <Label htmlFor="product-search">Search products</Label>
        <Input
          id="product-search"
          value={search}
          onChange={(event) => setSearch(event.target.value)}
          placeholder="Cottage Cheese"
        />
      </div>

      {productsQuery.isLoading ? <p className="text-sm text-muted-foreground">Loading products...</p> : null}
      {productsQuery.error ? (
        <p className="text-sm text-destructive">{productsQuery.error.message}</p>
      ) : null}

      <div className="grid gap-3">
        {filteredProducts.map((product) => (
          <ProductEditRow key={product.id} product={product} />
        ))}
      </div>

      {configured && productsQuery.data?.length === 0 ? (
        <div className="rounded-lg border border-border bg-card p-4">
          <p className="text-sm text-muted-foreground">Create a product before logging food.</p>
        </div>
      ) : null}
    </PageShell>
  );
}
