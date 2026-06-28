"use client";

import type { UseFormReturn } from "react-hook-form";
import { Input } from "@/shared/components/ui/input";
import { Label } from "@/shared/components/ui/label";
import { Select } from "@/shared/components/ui/select";
import type { ProductFormValues } from "../schemas/product.schema";

type ProductFormFieldsProps = {
  form: UseFormReturn<ProductFormValues>;
  idPrefix: string;
};

export function ProductFormFields({ form, idPrefix }: ProductFormFieldsProps) {
  const basis = form.watch("nutritionBasis");

  return (
    <>
      <div className="grid gap-2">
        <Label htmlFor={`${idPrefix}-name`}>Product name</Label>
        <Input id={`${idPrefix}-name`} {...form.register("name")} />
        {form.formState.errors.name ? (
          <p className="text-sm text-destructive">{form.formState.errors.name.message}</p>
        ) : null}
      </div>

      <div className="grid gap-2">
        <Label htmlFor={`${idPrefix}-basis`}>Nutrition basis</Label>
        <Select id={`${idPrefix}-basis`} {...form.register("nutritionBasis")}>
          <option value="per_100g">Per 100 g</option>
          <option value="per_100ml">Per 100 ml</option>
          <option value="per_unit">Per unit</option>
        </Select>
      </div>

      {basis === "per_unit" ? (
        <div className="grid gap-2">
          <Label htmlFor={`${idPrefix}-unit-name`}>Unit name</Label>
          <Input id={`${idPrefix}-unit-name`} placeholder="egg" {...form.register("unitName")} />
          {form.formState.errors.unitName ? (
            <p className="text-sm text-destructive">{form.formState.errors.unitName.message}</p>
          ) : null}
        </div>
      ) : null}

      <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
        <div className="grid gap-2">
          <Label htmlFor={`${idPrefix}-calories`}>Calories</Label>
          <Input
            id={`${idPrefix}-calories`}
            type="number"
            step="0.1"
            min="0"
            inputMode="decimal"
            {...form.register("calories")}
          />
          {form.formState.errors.calories ? (
            <p className="text-sm text-destructive">{form.formState.errors.calories.message}</p>
          ) : null}
        </div>
        <div className="grid gap-2">
          <Label htmlFor={`${idPrefix}-protein`}>Protein</Label>
          <Input
            id={`${idPrefix}-protein`}
            type="number"
            step="0.1"
            min="0"
            inputMode="decimal"
            {...form.register("protein")}
          />
          {form.formState.errors.protein ? (
            <p className="text-sm text-destructive">{form.formState.errors.protein.message}</p>
          ) : null}
        </div>
        <div className="grid gap-2">
          <Label htmlFor={`${idPrefix}-carbs`}>Carbs</Label>
          <Input
            id={`${idPrefix}-carbs`}
            type="number"
            step="0.1"
            min="0"
            inputMode="decimal"
            {...form.register("carbs")}
          />
          {form.formState.errors.carbs ? (
            <p className="text-sm text-destructive">{form.formState.errors.carbs.message}</p>
          ) : null}
        </div>
        <div className="grid gap-2">
          <Label htmlFor={`${idPrefix}-fat`}>Fat</Label>
          <Input
            id={`${idPrefix}-fat`}
            type="number"
            step="0.1"
            min="0"
            inputMode="decimal"
            {...form.register("fat")}
          />
          {form.formState.errors.fat ? (
            <p className="text-sm text-destructive">{form.formState.errors.fat.message}</p>
          ) : null}
        </div>
      </div>
    </>
  );
}
