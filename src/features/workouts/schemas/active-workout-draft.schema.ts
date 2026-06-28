import { z } from "zod";
import { loggingTypeSchema } from "./exercise.schema";

export const activeWorkoutDraftSetSchema = z.object({
  localId: z.string().min(1),
  setIndex: z.number().int().min(0),
  reps: z.number().int().positive().nullable(),
  weight: z.number().nonnegative().nullable()
});

export const activeWorkoutDraftExerciseSchema = z.object({
  exerciseId: z.string().min(1),
  exerciseName: z.string().min(1),
  loggingType: loggingTypeSchema,
  orderIndex: z.number().int().min(0),
  source: z.enum(["template", "ad_hoc"]),
  sets: z.array(activeWorkoutDraftSetSchema)
});

export const activeWorkoutDraftSchema = z.object({
  templateId: z.string().min(1),
  templateName: z.string().min(1),
  startedAt: z.string().datetime(),
  exercises: z.array(activeWorkoutDraftExerciseSchema)
});
