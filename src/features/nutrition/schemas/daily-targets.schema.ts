import { z } from "zod";

const targetSchema = (label: string) =>
  z.coerce
    .number({ invalid_type_error: `${label} is required` })
    .finite(`${label} must be a valid number`)
    .nonnegative(`${label} cannot be negative`);

export const dailyTargetsFormSchema = z.object({
  caloriesTarget: targetSchema("Calories target"),
  proteinTarget: targetSchema("Protein target"),
  carbsTarget: targetSchema("Carbs target"),
  fatTarget: targetSchema("Fat target")
});

export type DailyTargetsFormValues = z.infer<typeof dailyTargetsFormSchema>;
