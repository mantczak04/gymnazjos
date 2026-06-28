import { z } from "zod";

export const nutritionBasisSchema = z.enum(["per_100g", "per_100ml", "per_unit"]);

const nonnegativeDecimalSchema = (label: string) =>
  z.coerce
    .number({ invalid_type_error: `${label} is required` })
    .finite(`${label} must be a valid number`)
    .nonnegative(`${label} cannot be negative`);

export const productFormSchema = z
  .object({
    name: z.string().trim().min(1, "Product name is required"),
    nutritionBasis: nutritionBasisSchema,
    calories: nonnegativeDecimalSchema("Calories"),
    protein: nonnegativeDecimalSchema("Protein"),
    carbs: nonnegativeDecimalSchema("Carbs"),
    fat: nonnegativeDecimalSchema("Fat"),
    unitName: z.string().default("")
  })
  .superRefine((value, context) => {
    if (value.nutritionBasis === "per_unit" && value.unitName.trim().length === 0) {
      context.addIssue({
        code: z.ZodIssueCode.custom,
        path: ["unitName"],
        message: "Unit name is required for per-unit products"
      });
    }
  });

export type ProductFormValues = z.infer<typeof productFormSchema>;
