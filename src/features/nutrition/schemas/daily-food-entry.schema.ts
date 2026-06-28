import { z } from "zod";

export const addProductToDayFormSchema = z.object({
  productId: z.string().min(1, "Choose a product"),
  quantity: z.coerce
    .number({ invalid_type_error: "Quantity is required" })
    .finite("Quantity must be a valid number")
    .positive("Quantity must be greater than 0")
});

export const addMealToDayFormSchema = z.object({
  mealTemplateId: z.string().min(1, "Choose a meal")
});

export const dailyIngredientQuantityFormSchema = z.object({
  quantity: z.coerce
    .number({ invalid_type_error: "Quantity is required" })
    .finite("Quantity must be a valid number")
    .positive("Quantity must be greater than 0")
});

export type AddProductToDayFormValues = z.infer<typeof addProductToDayFormSchema>;
export type AddMealToDayFormValues = z.infer<typeof addMealToDayFormSchema>;
export type DailyIngredientQuantityFormValues = z.infer<typeof dailyIngredientQuantityFormSchema>;
