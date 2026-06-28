"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { useForm } from "react-hook-form";
import { Dialog } from "@/shared/components/ui/dialog";
import { Button } from "@/shared/components/ui/button";
import { productsQueryKey } from "../hooks/use-products";
import { mealTemplatesQueryKey } from "../hooks/use-meal-templates";
import { createProduct } from "../queries/products";
import { productFormSchema, type ProductFormValues } from "../schemas/product.schema";
import type { Product } from "../types/nutrition.types";
import { ProductFormFields } from "./product-form-fields";

type ProductCreateDialogProps = {
  open: boolean;
  onClose: () => void;
  onCreated?: (product: Product) => void;
};

const defaultValues: ProductFormValues = {
  name: "",
  nutritionBasis: "per_100g",
  calories: 0,
  protein: 0,
  carbs: 0,
  fat: 0,
  unitName: ""
};

export function ProductCreateDialog({ open, onClose, onCreated }: ProductCreateDialogProps) {
  const queryClient = useQueryClient();
  const form = useForm<ProductFormValues>({
    resolver: zodResolver(productFormSchema),
    defaultValues
  });

  const createMutation = useMutation({
    mutationFn: createProduct,
    onSuccess: async (product) => {
      form.reset(defaultValues);
      await Promise.all([
        queryClient.invalidateQueries({ queryKey: productsQueryKey }),
        queryClient.invalidateQueries({ queryKey: mealTemplatesQueryKey })
      ]);
      onCreated?.(product);
      onClose();
    }
  });

  return (
    <Dialog open={open} title="Create product" onClose={onClose}>
      <form
        className="grid gap-3"
        onSubmit={form.handleSubmit((values) => createMutation.mutate(values))}
      >
        <ProductFormFields form={form} idPrefix="dialog-product" />
        {createMutation.error ? (
          <p className="text-sm text-destructive">{createMutation.error.message}</p>
        ) : null}
        <Button type="submit" disabled={createMutation.isPending}>
          Create product
        </Button>
      </form>
    </Dialog>
  );
}
