"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { Check, Pencil, Plus, Trash2, X } from "lucide-react";
import { useEffect, useMemo, useState } from "react";
import { useForm } from "react-hook-form";
import { isSupabaseConfigured } from "@/supabase/client";
import { PageShell } from "@/shared/components/page-shell";
import { Button } from "@/shared/components/ui/button";
import { Input } from "@/shared/components/ui/input";
import { Label } from "@/shared/components/ui/label";
import { Select } from "@/shared/components/ui/select";
import { mealTemplatesQueryKey, useMealTemplates } from "../hooks/use-meal-templates";
import { productsQueryKey, useProducts } from "../hooks/use-products";
import {
  addProductToMealTemplate,
  createMealTemplate,
  deactivateMealTemplate,
  removeMealTemplateIngredient,
  updateMealTemplateIngredientQuantity,
  updateMealTemplateName
} from "../queries/meal-templates";
import {
  mealTemplateFormSchema,
  mealTemplateIngredientFormSchema,
  type MealTemplateFormValues,
  type MealTemplateIngredientFormValues
} from "../schemas/meal-template.schema";
import type { MealTemplate, MealTemplateIngredient, Product } from "../types/nutrition.types";
import { calculateMealTemplateTotals } from "../utils/nutrition-calculations";
import {
  formatNutritionSummary,
  formatQuantity
} from "../utils/nutrition-formatting";
import { NutritionNav } from "./nutrition-nav";
import { ProductCreateDialog } from "./product-create-dialog";
import { SetupAlert } from "./setup-alert";

function IngredientRow({
  ingredient
}: {
  ingredient: MealTemplateIngredient;
}) {
  const queryClient = useQueryClient();
  const [quantity, setQuantity] = useState(String(ingredient.quantity));

  useEffect(() => {
    setQuantity(String(ingredient.quantity));
  }, [ingredient.quantity]);

  const invalidateMeals = () =>
    queryClient.invalidateQueries({ queryKey: mealTemplatesQueryKey });

  const updateMutation = useMutation({
    mutationFn: () => updateMealTemplateIngredientQuantity(ingredient.id, Number(quantity)),
    onSuccess: invalidateMeals
  });

  const removeMutation = useMutation({
    mutationFn: () => removeMealTemplateIngredient(ingredient.id),
    onSuccess: invalidateMeals
  });

  const product = ingredient.product;

  return (
    <div className="grid gap-2 rounded-md border border-border p-2 sm:grid-cols-[1fr_120px_auto] sm:items-center">
      <div className="min-w-0">
        <p className="truncate text-sm font-medium">{product.name}</p>
        <p className="text-xs text-muted-foreground">
          {formatQuantity(ingredient.quantity, product.nutritionBasis, product.unitName)}
        </p>
      </div>
      <Input
        type="number"
        step="0.1"
        min="0"
        inputMode="decimal"
        aria-label={`${product.name} quantity`}
        value={quantity}
        onChange={(event) => setQuantity(event.target.value)}
      />
      <div className="flex gap-1">
        <Button
          type="button"
          variant="ghost"
          size="icon"
          aria-label="Save ingredient quantity"
          disabled={updateMutation.isPending || Number(quantity) <= 0}
          onClick={() => updateMutation.mutate()}
        >
          <Check className="size-4" aria-hidden="true" />
        </Button>
        <Button
          type="button"
          variant="ghost"
          size="icon"
          aria-label="Remove ingredient"
          disabled={removeMutation.isPending}
          onClick={() => removeMutation.mutate()}
        >
          <X className="size-4" aria-hidden="true" />
        </Button>
      </div>
      {updateMutation.error ? (
        <p className="text-sm text-destructive sm:col-span-3">{updateMutation.error.message}</p>
      ) : null}
      {removeMutation.error ? (
        <p className="text-sm text-destructive sm:col-span-3">{removeMutation.error.message}</p>
      ) : null}
    </div>
  );
}

function AddIngredientForm({
  mealTemplate,
  products
}: {
  mealTemplate: MealTemplate;
  products: Product[];
}) {
  const queryClient = useQueryClient();
  const [creatingProduct, setCreatingProduct] = useState(false);
  const form = useForm<MealTemplateIngredientFormValues>({
    resolver: zodResolver(mealTemplateIngredientFormSchema),
    defaultValues: { productId: "", quantity: 100 }
  });

  const usedProductIds = useMemo(
    () => new Set(mealTemplate.ingredients.map((ingredient) => ingredient.product.id)),
    [mealTemplate.ingredients]
  );
  const availableProducts = products.filter((product) => !usedProductIds.has(product.id));

  const addMutation = useMutation({
    mutationFn: (values: MealTemplateIngredientFormValues) =>
      addProductToMealTemplate(mealTemplate.id, values),
    onSuccess: async () => {
      form.reset({ productId: "", quantity: 100 });
      await queryClient.invalidateQueries({ queryKey: mealTemplatesQueryKey });
    }
  });

  return (
    <>
      <form
        className="mt-3 grid gap-2 sm:grid-cols-[1fr_120px_auto_auto]"
        onSubmit={form.handleSubmit((values) => addMutation.mutate(values))}
      >
        <Select
          aria-label="Product"
          disabled={availableProducts.length === 0}
          {...form.register("productId")}
        >
          <option value="">Add product</option>
          {availableProducts.map((product) => (
            <option key={product.id} value={product.id}>
              {product.name}
            </option>
          ))}
        </Select>
        <Input
          type="number"
          step="0.1"
          min="0"
          inputMode="decimal"
          aria-label="Quantity"
          {...form.register("quantity")}
        />
        <Button type="submit" variant="outline" disabled={addMutation.isPending}>
          <Plus className="size-4" aria-hidden="true" />
          Add
        </Button>
        <Button type="button" variant="outline" onClick={() => setCreatingProduct(true)}>
          <Plus className="size-4" aria-hidden="true" />
          Product
        </Button>
        {form.formState.errors.productId ? (
          <p className="text-sm text-destructive sm:col-span-4">
            {form.formState.errors.productId.message}
          </p>
        ) : null}
        {form.formState.errors.quantity ? (
          <p className="text-sm text-destructive sm:col-span-4">
            {form.formState.errors.quantity.message}
          </p>
        ) : null}
        {addMutation.error ? (
          <p className="text-sm text-destructive sm:col-span-4">{addMutation.error.message}</p>
        ) : null}
      </form>
      <ProductCreateDialog
        open={creatingProduct}
        onClose={() => setCreatingProduct(false)}
        onCreated={async () => {
          await Promise.all([
            queryClient.invalidateQueries({ queryKey: productsQueryKey }),
            queryClient.invalidateQueries({ queryKey: mealTemplatesQueryKey })
          ]);
        }}
      />
    </>
  );
}

function MealTemplateItem({ mealTemplate, products }: { mealTemplate: MealTemplate; products: Product[] }) {
  const queryClient = useQueryClient();
  const [editingName, setEditingName] = useState(false);
  const form = useForm<MealTemplateFormValues>({
    resolver: zodResolver(mealTemplateFormSchema),
    defaultValues: { name: mealTemplate.name }
  });
  const totals = calculateMealTemplateTotals(mealTemplate);

  const invalidateMeals = () =>
    queryClient.invalidateQueries({ queryKey: mealTemplatesQueryKey });

  const updateNameMutation = useMutation({
    mutationFn: (values: MealTemplateFormValues) => updateMealTemplateName(mealTemplate.id, values),
    onSuccess: async () => {
      setEditingName(false);
      await invalidateMeals();
    }
  });

  const deactivateMutation = useMutation({
    mutationFn: () => deactivateMealTemplate(mealTemplate.id),
    onSuccess: invalidateMeals
  });

  return (
    <section className="rounded-lg border border-border bg-card p-4 shadow-sm">
      {editingName ? (
        <form
          className="mb-4 grid gap-3"
          onSubmit={form.handleSubmit((values) => updateNameMutation.mutate(values))}
        >
          <div className="grid gap-2">
            <Label htmlFor={`${mealTemplate.id}-name`}>Meal name</Label>
            <Input id={`${mealTemplate.id}-name`} {...form.register("name")} />
            {form.formState.errors.name ? (
              <p className="text-sm text-destructive">{form.formState.errors.name.message}</p>
            ) : null}
          </div>
          {updateNameMutation.error ? (
            <p className="text-sm text-destructive">{updateNameMutation.error.message}</p>
          ) : null}
          <div className="flex gap-2">
            <Button type="submit" disabled={updateNameMutation.isPending}>
              <Check className="size-4" aria-hidden="true" />
              Save
            </Button>
            <Button
              type="button"
              variant="outline"
              onClick={() => {
                form.reset({ name: mealTemplate.name });
                setEditingName(false);
              }}
            >
              <X className="size-4" aria-hidden="true" />
              Cancel
            </Button>
          </div>
        </form>
      ) : (
        <div className="mb-4 flex items-start justify-between gap-3">
          <div className="min-w-0">
            <h2 className="truncate text-lg font-semibold">{mealTemplate.name}</h2>
            <p className="text-sm text-muted-foreground">{formatNutritionSummary(totals)}</p>
          </div>
          <div className="flex gap-2">
            <Button
              type="button"
              variant="outline"
              size="icon"
              aria-label="Edit meal"
              onClick={() => setEditingName(true)}
            >
              <Pencil className="size-4" aria-hidden="true" />
            </Button>
            <Button
              type="button"
              variant="destructive"
              size="icon"
              aria-label="Deactivate meal"
              disabled={deactivateMutation.isPending}
              onClick={() => {
                if (window.confirm(`Deactivate ${mealTemplate.name}?`)) {
                  deactivateMutation.mutate();
                }
              }}
            >
              <Trash2 className="size-4" aria-hidden="true" />
            </Button>
          </div>
        </div>
      )}

      <div className="grid gap-2">
        {mealTemplate.ingredients.map((ingredient) => (
          <IngredientRow key={ingredient.id} ingredient={ingredient} />
        ))}
      </div>

      {mealTemplate.ingredients.length === 0 ? (
        <p className="text-sm text-muted-foreground">
          Add products before using this meal in the daily log.
        </p>
      ) : null}

      <AddIngredientForm mealTemplate={mealTemplate} products={products} />
    </section>
  );
}

export function MealLibraryPage() {
  const configured = isSupabaseConfigured();
  const queryClient = useQueryClient();
  const [search, setSearch] = useState("");
  const form = useForm<MealTemplateFormValues>({
    resolver: zodResolver(mealTemplateFormSchema),
    defaultValues: { name: "" }
  });

  const mealTemplatesQuery = useMealTemplates(configured);
  const productsQuery = useProducts(configured);

  const createMutation = useMutation({
    mutationFn: createMealTemplate,
    onSuccess: async () => {
      form.reset({ name: "" });
      await queryClient.invalidateQueries({ queryKey: mealTemplatesQueryKey });
    }
  });

  const filteredMeals = useMemo(() => {
    const normalizedSearch = search.trim().toLowerCase();
    if (!normalizedSearch) {
      return mealTemplatesQuery.data ?? [];
    }

    return (mealTemplatesQuery.data ?? []).filter((mealTemplate) =>
      mealTemplate.name.toLowerCase().includes(normalizedSearch)
    );
  }, [mealTemplatesQuery.data, search]);

  return (
    <PageShell title="Meal Library">
      <NutritionNav />
      <SetupAlert />

      <form
        className="grid gap-3 rounded-lg border border-border bg-card p-4 shadow-sm"
        onSubmit={form.handleSubmit((values) => createMutation.mutate(values))}
      >
        <div className="grid gap-2">
          <Label htmlFor="meal-name">Meal name</Label>
          <Input id="meal-name" {...form.register("name")} />
          {form.formState.errors.name ? (
            <p className="text-sm text-destructive">{form.formState.errors.name.message}</p>
          ) : null}
        </div>
        {createMutation.error ? (
          <p className="text-sm text-destructive">{createMutation.error.message}</p>
        ) : null}
        <Button type="submit" disabled={createMutation.isPending}>
          Create meal
        </Button>
      </form>

      <div className="grid gap-2">
        <Label htmlFor="meal-search">Search meals</Label>
        <Input
          id="meal-search"
          value={search}
          onChange={(event) => setSearch(event.target.value)}
          placeholder="Mass Shake"
        />
      </div>

      {mealTemplatesQuery.isLoading || productsQuery.isLoading ? (
        <p className="text-sm text-muted-foreground">Loading meals...</p>
      ) : null}
      {mealTemplatesQuery.error ? (
        <p className="text-sm text-destructive">{mealTemplatesQuery.error.message}</p>
      ) : null}
      {productsQuery.error ? (
        <p className="text-sm text-destructive">{productsQuery.error.message}</p>
      ) : null}

      <div className="grid gap-3">
        {filteredMeals.map((mealTemplate) => (
          <MealTemplateItem
            key={mealTemplate.id}
            mealTemplate={mealTemplate}
            products={productsQuery.data ?? []}
          />
        ))}
      </div>

      {configured && mealTemplatesQuery.data?.length === 0 ? (
        <div className="rounded-lg border border-border bg-card p-4">
          <p className="text-sm text-muted-foreground">
            Create a meal template to quickly add reusable meals to a day.
          </p>
        </div>
      ) : null}
    </PageShell>
  );
}
