import { z } from "zod";

export const mealTemplateFormSchema = z.object({
  name: z.string().trim().min(1, "Meal name is required")
});

export const mealTemplateIngredientFormSchema = z.object({
  productId: z.string().min(1, "Choose a product"),
  quantity: z.coerce
    .number({ invalid_type_error: "Quantity is required" })
    .finite("Quantity must be a valid number")
    .positive("Quantity must be greater than 0")
});

export type MealTemplateFormValues = z.infer<typeof mealTemplateFormSchema>;
export type MealTemplateIngredientFormValues = z.infer<typeof mealTemplateIngredientFormSchema>;
