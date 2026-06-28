import { z } from "zod";

export const loggingTypeSchema = z.enum(["weighted_reps", "reps_only"]);

export const exerciseFormSchema = z.object({
  name: z.string().trim().min(1, "Exercise name is required"),
  loggingType: loggingTypeSchema
});

export type ExerciseFormValues = z.infer<typeof exerciseFormSchema>;
