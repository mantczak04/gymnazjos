"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { CalendarDays, ChevronLeft, ChevronRight, Pencil, Plus, Trash2 } from "lucide-react";
import { useEffect, useMemo, useState } from "react";
import { useForm } from "react-hook-form";
import { isSupabaseConfigured } from "@/supabase/client";
import { PageShell } from "@/shared/components/page-shell";
import { Button } from "@/shared/components/ui/button";
import { Dialog } from "@/shared/components/ui/dialog";
import { Input } from "@/shared/components/ui/input";
import { Label } from "@/shared/components/ui/label";
import { Select } from "@/shared/components/ui/select";
import { dailyFoodLogQueryKey, useDailyFoodLog } from "../hooks/use-daily-food-log";
import { dailyTargetsQueryKey, useDailyTargets } from "../hooks/use-daily-targets";
import { useMealTemplates } from "../hooks/use-meal-templates";
import { productsQueryKey, useProducts } from "../hooks/use-products";
import {
  addMealEntryToDay,
  addProductEntryToDay,
  addProductToDailyMealEntry,
  deleteDailyFoodEntry,
  removeDailyFoodEntryIngredient,
  updateDailyFoodEntryIngredientQuantity
} from "../queries/daily-food-log";
import { EMPTY_DAILY_TARGETS, upsertDailyTargets } from "../queries/daily-targets";
import {
  addMealToDayFormSchema,
  addProductToDayFormSchema,
  dailyIngredientQuantityFormSchema,
  type AddMealToDayFormValues,
  type AddProductToDayFormValues,
  type DailyIngredientQuantityFormValues
} from "../schemas/daily-food-entry.schema";
import { dailyTargetsFormSchema, type DailyTargetsFormValues } from "../schemas/daily-targets.schema";
import type {
  DailyFoodEntry,
  DailyFoodEntryIngredient,
  DailyNutritionTargets,
  MealTemplate,
  NutritionValues,
  Product
} from "../types/nutrition.types";
import {
  calculateDailyEntryTotals,
  calculateDailyTotals,
  calculateSnapshotIngredientNutrition,
  EMPTY_NUTRITION_VALUES
} from "../utils/nutrition-calculations";
import { shiftDateInputValue, todayDateInputValue } from "../utils/date";
import {
  formatNutritionNumber,
  formatNutritionSummary,
  formatProductEntryName,
  formatQuantity
} from "../utils/nutrition-formatting";
import { NutritionNav } from "./nutrition-nav";
import { ProductCreateDialog } from "./product-create-dialog";
import { SetupAlert } from "./setup-alert";

function TargetProgress({
  label,
  value,
  target,
  unit
}: {
  label: string;
  value: number;
  target: number;
  unit: string;
}) {
  const percent = target > 0 ? Math.min(100, (value / target) * 100) : 0;

  return (
    <div className="grid gap-1">
      <div className="flex items-center justify-between gap-3 text-sm">
        <span className="font-medium">{label}</span>
        <span className="text-muted-foreground">
          {formatNutritionNumber(value)} / {formatNutritionNumber(target)} {unit}
        </span>
      </div>
      <div className="h-2 overflow-hidden rounded-full bg-muted">
        <div className="h-full rounded-full bg-primary" style={{ width: `${percent}%` }} />
      </div>
    </div>
  );
}

function DailyTotalsCard({
  totals,
  targets,
  onEditTargets
}: {
  totals: NutritionValues;
  targets: DailyNutritionTargets;
  onEditTargets: () => void;
}) {
  return (
    <section className="grid gap-4 rounded-lg border border-border bg-card p-4 shadow-sm">
      <div className="flex items-center justify-between gap-3">
        <div>
          <h2 className="text-lg font-semibold">Daily totals</h2>
          <p className="text-sm text-muted-foreground">{formatNutritionSummary(totals)}</p>
        </div>
        <Button type="button" variant="outline" size="sm" onClick={onEditTargets}>
          <Pencil className="size-4" aria-hidden="true" />
          Targets
        </Button>
      </div>
      <div className="grid gap-3">
        <TargetProgress
          label="Calories"
          value={totals.calories}
          target={targets.caloriesTarget}
          unit="kcal"
        />
        <TargetProgress
          label="Protein"
          value={totals.protein}
          target={targets.proteinTarget}
          unit="g"
        />
        <TargetProgress label="Carbs" value={totals.carbs} target={targets.carbsTarget} unit="g" />
        <TargetProgress label="Fat" value={totals.fat} target={targets.fatTarget} unit="g" />
      </div>
    </section>
  );
}

function TargetsDialog({
  open,
  targets,
  onClose
}: {
  open: boolean;
  targets: DailyNutritionTargets;
  onClose: () => void;
}) {
  const queryClient = useQueryClient();
  const form = useForm<DailyTargetsFormValues>({
    resolver: zodResolver(dailyTargetsFormSchema),
    defaultValues: targets
  });

  useEffect(() => {
    if (open) {
      form.reset(targets);
    }
  }, [form, open, targets]);

  const mutation = useMutation({
    mutationFn: upsertDailyTargets,
    onSuccess: async () => {
      await queryClient.invalidateQueries({ queryKey: dailyTargetsQueryKey });
      onClose();
    }
  });

  return (
    <Dialog open={open} title="Daily targets" onClose={onClose}>
      <form className="grid gap-3" onSubmit={form.handleSubmit((values) => mutation.mutate(values))}>
        <div className="grid grid-cols-2 gap-3">
          <div className="grid gap-2">
            <Label htmlFor="target-calories">Calories</Label>
            <Input
              id="target-calories"
              type="number"
              step="0.1"
              min="0"
              inputMode="decimal"
              {...form.register("caloriesTarget")}
            />
          </div>
          <div className="grid gap-2">
            <Label htmlFor="target-protein">Protein</Label>
            <Input
              id="target-protein"
              type="number"
              step="0.1"
              min="0"
              inputMode="decimal"
              {...form.register("proteinTarget")}
            />
          </div>
          <div className="grid gap-2">
            <Label htmlFor="target-carbs">Carbs</Label>
            <Input
              id="target-carbs"
              type="number"
              step="0.1"
              min="0"
              inputMode="decimal"
              {...form.register("carbsTarget")}
            />
          </div>
          <div className="grid gap-2">
            <Label htmlFor="target-fat">Fat</Label>
            <Input
              id="target-fat"
              type="number"
              step="0.1"
              min="0"
              inputMode="decimal"
              {...form.register("fatTarget")}
            />
          </div>
        </div>
        {Object.values(form.formState.errors)[0]?.message ? (
          <p className="text-sm text-destructive">
            {Object.values(form.formState.errors)[0]?.message}
          </p>
        ) : null}
        {mutation.error ? <p className="text-sm text-destructive">{mutation.error.message}</p> : null}
        <Button type="submit" disabled={mutation.isPending}>
          Save targets
        </Button>
      </form>
    </Dialog>
  );
}

function AddProductDialog({
  open,
  date,
  products,
  onClose
}: {
  open: boolean;
  date: string;
  products: Product[];
  onClose: () => void;
}) {
  const queryClient = useQueryClient();
  const [creatingProduct, setCreatingProduct] = useState(false);
  const form = useForm<AddProductToDayFormValues>({
    resolver: zodResolver(addProductToDayFormSchema),
    defaultValues: { productId: "", quantity: 100 }
  });

  const mutation = useMutation({
    mutationFn: (values: AddProductToDayFormValues) =>
      addProductEntryToDay({ date, productId: values.productId, quantity: values.quantity }),
    onSuccess: async () => {
      form.reset({ productId: "", quantity: 100 });
      await queryClient.invalidateQueries({ queryKey: dailyFoodLogQueryKey(date) });
      onClose();
    }
  });

  return (
    <>
      <Dialog open={open} title="Add product" onClose={onClose}>
        <form className="grid gap-3" onSubmit={form.handleSubmit((values) => mutation.mutate(values))}>
          <div className="grid gap-2">
            <Label htmlFor="daily-product">Product</Label>
            <div className="grid gap-2 sm:grid-cols-[1fr_auto]">
              <Select id="daily-product" {...form.register("productId")}>
                <option value="">Choose product</option>
                {products.map((product) => (
                  <option key={product.id} value={product.id}>
                    {product.name}
                  </option>
                ))}
              </Select>
              <Button type="button" variant="outline" onClick={() => setCreatingProduct(true)}>
                <Plus className="size-4" aria-hidden="true" />
                Product
              </Button>
            </div>
            {form.formState.errors.productId ? (
              <p className="text-sm text-destructive">{form.formState.errors.productId.message}</p>
            ) : null}
          </div>
          <div className="grid gap-2">
            <Label htmlFor="daily-product-quantity">Quantity</Label>
            <Input
              id="daily-product-quantity"
              type="number"
              step="0.1"
              min="0"
              inputMode="decimal"
              {...form.register("quantity")}
            />
            {form.formState.errors.quantity ? (
              <p className="text-sm text-destructive">{form.formState.errors.quantity.message}</p>
            ) : null}
          </div>
          {mutation.error ? <p className="text-sm text-destructive">{mutation.error.message}</p> : null}
          <Button type="submit" disabled={mutation.isPending}>
            Add product
          </Button>
        </form>
      </Dialog>
      <ProductCreateDialog
        open={creatingProduct}
        onClose={() => setCreatingProduct(false)}
        onCreated={(product) => {
          form.setValue("productId", product.id);
          queryClient.invalidateQueries({ queryKey: productsQueryKey });
        }}
      />
    </>
  );
}

function AddMealTemplateDialog({
  open,
  date,
  meals,
  onClose
}: {
  open: boolean;
  date: string;
  meals: MealTemplate[];
  onClose: () => void;
}) {
  const queryClient = useQueryClient();
  const form = useForm<AddMealToDayFormValues>({
    resolver: zodResolver(addMealToDayFormSchema),
    defaultValues: { mealTemplateId: "" }
  });

  const mutation = useMutation({
    mutationFn: (values: AddMealToDayFormValues) =>
      addMealEntryToDay({ date, mealTemplateId: values.mealTemplateId }),
    onSuccess: async () => {
      form.reset({ mealTemplateId: "" });
      await queryClient.invalidateQueries({ queryKey: dailyFoodLogQueryKey(date) });
      onClose();
    }
  });

  return (
    <Dialog open={open} title="Add meal" onClose={onClose}>
      <form className="grid gap-3" onSubmit={form.handleSubmit((values) => mutation.mutate(values))}>
        <div className="grid gap-2">
          <Label htmlFor="daily-meal">Meal</Label>
          <Select id="daily-meal" {...form.register("mealTemplateId")}>
            <option value="">Choose meal</option>
            {meals.map((meal) => (
              <option key={meal.id} value={meal.id} disabled={meal.ingredients.length === 0}>
                {meal.name}
              </option>
            ))}
          </Select>
          {form.formState.errors.mealTemplateId ? (
            <p className="text-sm text-destructive">{form.formState.errors.mealTemplateId.message}</p>
          ) : null}
        </div>
        {mutation.error ? <p className="text-sm text-destructive">{mutation.error.message}</p> : null}
        <Button type="submit" disabled={mutation.isPending}>
          Add meal
        </Button>
      </form>
    </Dialog>
  );
}

function IngredientQuantityRow({
  entry,
  ingredient
}: {
  entry: DailyFoodEntry;
  ingredient: DailyFoodEntryIngredient;
}) {
  const queryClient = useQueryClient();
  const [quantity, setQuantity] = useState(String(ingredient.quantity));
  const totals = calculateSnapshotIngredientNutrition(ingredient);

  useEffect(() => {
    setQuantity(String(ingredient.quantity));
  }, [ingredient.quantity]);

  const updateMutation = useMutation({
    mutationFn: (values: DailyIngredientQuantityFormValues) =>
      updateDailyFoodEntryIngredientQuantity(ingredient.id, values.quantity),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: dailyFoodLogQueryKey(entry.date) })
  });

  const removeMutation = useMutation({
    mutationFn: () => removeDailyFoodEntryIngredient(entry.id, ingredient.id),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: dailyFoodLogQueryKey(entry.date) })
  });

  const parsed = dailyIngredientQuantityFormSchema.safeParse({ quantity });
  const canRemove = entry.entryType === "meal" && entry.ingredients.length > 1;

  return (
    <div className="grid gap-2 rounded-md border border-border p-2">
      <div className="flex items-start justify-between gap-3">
        <div className="min-w-0">
          <p className="truncate text-sm font-medium">{ingredient.productNameSnapshot}</p>
          <p className="text-xs text-muted-foreground">{formatNutritionSummary(totals)}</p>
        </div>
        <p className="shrink-0 text-xs text-muted-foreground">
          {formatQuantity(
            ingredient.quantity,
            ingredient.nutritionBasisSnapshot,
            ingredient.unitNameSnapshot
          )}
        </p>
      </div>
      <div className="grid grid-cols-[1fr_auto] gap-2">
        <Input
          type="number"
          step="0.1"
          min="0"
          inputMode="decimal"
          aria-label={`${ingredient.productNameSnapshot} quantity`}
          value={quantity}
          onChange={(event) => setQuantity(event.target.value)}
        />
        <div className="flex gap-1">
          <Button
            type="button"
            variant="ghost"
            size="icon"
            aria-label="Save quantity"
            disabled={updateMutation.isPending || !parsed.success}
            onClick={() => {
              if (parsed.success) {
                updateMutation.mutate(parsed.data);
              }
            }}
          >
            <Pencil className="size-4" aria-hidden="true" />
          </Button>
          {canRemove ? (
            <Button
              type="button"
              variant="ghost"
              size="icon"
              aria-label="Remove ingredient"
              disabled={removeMutation.isPending}
              onClick={() => removeMutation.mutate()}
            >
              <Trash2 className="size-4" aria-hidden="true" />
            </Button>
          ) : null}
        </div>
      </div>
      {!parsed.success ? (
        <p className="text-sm text-destructive">{parsed.error.issues[0]?.message}</p>
      ) : null}
      {updateMutation.error ? (
        <p className="text-sm text-destructive">{updateMutation.error.message}</p>
      ) : null}
      {removeMutation.error ? (
        <p className="text-sm text-destructive">{removeMutation.error.message}</p>
      ) : null}
    </div>
  );
}

function AddProductToMealEntryForm({
  entry,
  products
}: {
  entry: DailyFoodEntry;
  products: Product[];
}) {
  const queryClient = useQueryClient();
  const [creatingProduct, setCreatingProduct] = useState(false);
  const form = useForm<AddProductToDayFormValues>({
    resolver: zodResolver(addProductToDayFormSchema),
    defaultValues: { productId: "", quantity: 100 }
  });

  const mutation = useMutation({
    mutationFn: (values: AddProductToDayFormValues) =>
      addProductToDailyMealEntry({
        entryId: entry.id,
        productId: values.productId,
        quantity: values.quantity
      }),
    onSuccess: async () => {
      form.reset({ productId: "", quantity: 100 });
      await queryClient.invalidateQueries({ queryKey: dailyFoodLogQueryKey(entry.date) });
    }
  });

  return (
    <>
      <form
        className="grid gap-2 sm:grid-cols-[1fr_100px_auto_auto]"
        onSubmit={form.handleSubmit((values) => mutation.mutate(values))}
      >
        <Select aria-label="Product" {...form.register("productId")}>
          <option value="">Add product</option>
          {products.map((product) => (
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
        <Button type="submit" variant="outline" disabled={mutation.isPending}>
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
        {mutation.error ? (
          <p className="text-sm text-destructive sm:col-span-4">{mutation.error.message}</p>
        ) : null}
      </form>
      <ProductCreateDialog
        open={creatingProduct}
        onClose={() => setCreatingProduct(false)}
        onCreated={(product) => {
          form.setValue("productId", product.id);
          queryClient.invalidateQueries({ queryKey: productsQueryKey });
        }}
      />
    </>
  );
}

function EntryEditDialog({
  entry,
  products,
  onClose
}: {
  entry: DailyFoodEntry | null;
  products: Product[];
  onClose: () => void;
}) {
  const queryClient = useQueryClient();
  const deleteMutation = useMutation({
    mutationFn: (entryId: string) => deleteDailyFoodEntry(entryId),
    onSuccess: async () => {
      if (entry) {
        await queryClient.invalidateQueries({ queryKey: dailyFoodLogQueryKey(entry.date) });
      }
      onClose();
    }
  });

  if (!entry) {
    return null;
  }

  const totals = calculateDailyEntryTotals(entry);

  return (
    <Dialog open={Boolean(entry)} title={entry.nameSnapshot} onClose={onClose}>
      <div className="grid gap-4">
        <p className="text-sm text-muted-foreground">{formatNutritionSummary(totals)}</p>
        <div className="grid gap-2">
          {entry.ingredients.map((ingredient) => (
            <IngredientQuantityRow key={ingredient.id} entry={entry} ingredient={ingredient} />
          ))}
        </div>
        {entry.entryType === "meal" ? (
          <AddProductToMealEntryForm entry={entry} products={products} />
        ) : null}
        {deleteMutation.error ? (
          <p className="text-sm text-destructive">{deleteMutation.error.message}</p>
        ) : null}
        <Button
          type="button"
          variant="destructive"
          disabled={deleteMutation.isPending}
          onClick={() => {
            if (window.confirm(`Delete ${entry.nameSnapshot}?`)) {
              deleteMutation.mutate(entry.id);
            }
          }}
        >
          <Trash2 className="size-4" aria-hidden="true" />
          Delete entry
        </Button>
      </div>
    </Dialog>
  );
}

function FoodEntryCard({
  entry,
  onEdit
}: {
  entry: DailyFoodEntry;
  onEdit: (entryId: string) => void;
}) {
  const totals = calculateDailyEntryTotals(entry);
  const firstIngredient = entry.ingredients[0];
  const title =
    entry.entryType === "product" && firstIngredient
      ? formatProductEntryName(
          firstIngredient.productNameSnapshot,
          firstIngredient.quantity,
          firstIngredient.nutritionBasisSnapshot,
          firstIngredient.unitNameSnapshot
        )
      : entry.nameSnapshot;

  return (
    <section className="rounded-lg border border-border bg-card p-4 shadow-sm">
      <div className="flex items-start justify-between gap-3">
        <div className="min-w-0">
          <h2 className="truncate text-base font-semibold">{title}</h2>
          <p className="mt-1 text-sm text-muted-foreground">{formatNutritionSummary(totals)}</p>
        </div>
        <Button type="button" variant="outline" size="icon" aria-label="Edit entry" onClick={() => onEdit(entry.id)}>
          <Pencil className="size-4" aria-hidden="true" />
        </Button>
      </div>

      {entry.entryType === "meal" && entry.ingredients.length > 0 ? (
        <details className="mt-3 text-sm">
          <summary className="cursor-pointer text-muted-foreground">Ingredients</summary>
          <div className="mt-2 grid gap-1">
            {entry.ingredients.map((ingredient) => (
              <div key={ingredient.id} className="flex justify-between gap-3 text-muted-foreground">
                <span className="min-w-0 truncate">{ingredient.productNameSnapshot}</span>
                <span className="shrink-0">
                  {formatQuantity(
                    ingredient.quantity,
                    ingredient.nutritionBasisSnapshot,
                    ingredient.unitNameSnapshot
                  )}
                </span>
              </div>
            ))}
          </div>
        </details>
      ) : null}
    </section>
  );
}

export function DailyFoodLogPage() {
  const configured = isSupabaseConfigured();
  const [selectedDate, setSelectedDate] = useState(todayDateInputValue);
  const [addingProduct, setAddingProduct] = useState(false);
  const [addingMeal, setAddingMeal] = useState(false);
  const [editingTargets, setEditingTargets] = useState(false);
  const [editingEntryId, setEditingEntryId] = useState<string | null>(null);

  const foodLogQuery = useDailyFoodLog(selectedDate, configured);
  const targetsQuery = useDailyTargets(configured);
  const productsQuery = useProducts(configured);
  const mealTemplatesQuery = useMealTemplates(configured);

  const entries = useMemo(() => foodLogQuery.data ?? [], [foodLogQuery.data]);
  const targets = targetsQuery.data ?? EMPTY_DAILY_TARGETS;
  const totals = useMemo(() => calculateDailyTotals(entries), [entries]);
  const editingEntry = entries.find((entry) => entry.id === editingEntryId) ?? null;

  useEffect(() => {
    if (editingEntryId && !editingEntry) {
      setEditingEntryId(null);
    }
  }, [editingEntry, editingEntryId]);

  return (
    <PageShell title="Daily Food Log">
      <NutritionNav />
      <SetupAlert />

      <div className="grid gap-2 rounded-lg border border-border bg-card p-4 shadow-sm sm:grid-cols-[auto_1fr_auto] sm:items-end">
        <Button
          type="button"
          variant="outline"
          onClick={() => setSelectedDate((value) => shiftDateInputValue(value, -1))}
        >
          <ChevronLeft className="size-4" aria-hidden="true" />
          Previous
        </Button>
        <div className="grid gap-2">
          <Label htmlFor="food-log-date">Date</Label>
          <div className="relative">
            <CalendarDays className="pointer-events-none absolute left-3 top-1/2 size-4 -translate-y-1/2 text-muted-foreground" />
            <Input
              id="food-log-date"
              type="date"
              className="pl-9"
              value={selectedDate}
              onChange={(event) => setSelectedDate(event.target.value || todayDateInputValue())}
            />
          </div>
        </div>
        <Button
          type="button"
          variant="outline"
          onClick={() => setSelectedDate((value) => shiftDateInputValue(value, 1))}
        >
          Next
          <ChevronRight className="size-4" aria-hidden="true" />
        </Button>
      </div>

      <DailyTotalsCard
        totals={foodLogQuery.data ? totals : EMPTY_NUTRITION_VALUES}
        targets={targets}
        onEditTargets={() => setEditingTargets(true)}
      />

      <div className="grid grid-cols-2 gap-3">
        <Button type="button" onClick={() => setAddingMeal(true)}>
          <Plus className="size-4" aria-hidden="true" />
          Add meal
        </Button>
        <Button type="button" variant="outline" onClick={() => setAddingProduct(true)}>
          <Plus className="size-4" aria-hidden="true" />
          Add product
        </Button>
      </div>

      {foodLogQuery.isLoading ? <p className="text-sm text-muted-foreground">Loading food log...</p> : null}
      {foodLogQuery.error ? (
        <p className="text-sm text-destructive">{foodLogQuery.error.message}</p>
      ) : null}
      {targetsQuery.error ? (
        <p className="text-sm text-destructive">{targetsQuery.error.message}</p>
      ) : null}
      {productsQuery.error ? (
        <p className="text-sm text-destructive">{productsQuery.error.message}</p>
      ) : null}
      {mealTemplatesQuery.error ? (
        <p className="text-sm text-destructive">{mealTemplatesQuery.error.message}</p>
      ) : null}

      <div className="grid gap-3">
        {entries.map((entry) => (
          <FoodEntryCard key={entry.id} entry={entry} onEdit={setEditingEntryId} />
        ))}
      </div>

      {configured && foodLogQuery.data?.length === 0 ? (
        <div className="rounded-lg border border-border bg-card p-4">
          <p className="text-sm text-muted-foreground">No food entries for this date.</p>
        </div>
      ) : null}

      <AddProductDialog
        open={addingProduct}
        date={selectedDate}
        products={productsQuery.data ?? []}
        onClose={() => setAddingProduct(false)}
      />
      <AddMealTemplateDialog
        open={addingMeal}
        date={selectedDate}
        meals={mealTemplatesQuery.data ?? []}
        onClose={() => setAddingMeal(false)}
      />
      <TargetsDialog
        open={editingTargets}
        targets={targets}
        onClose={() => setEditingTargets(false)}
      />
      <EntryEditDialog
        entry={editingEntry}
        products={productsQuery.data ?? []}
        onClose={() => setEditingEntryId(null)}
      />
    </PageShell>
  );
}
