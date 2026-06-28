import { z } from "zod";

export const postWorkoutFeelingSchema = z.union([
  z.literal(1),
  z.literal(2),
  z.literal(3),
  z.literal(4),
  z.literal(5)
]);

export const savedSetSchema = z.object({
  reps: z.number().int().positive(),
  weight: z.number().nonnegative().nullable()
});

export type SavedSetValues = z.infer<typeof savedSetSchema>;
