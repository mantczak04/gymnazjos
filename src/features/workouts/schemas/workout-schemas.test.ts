import { describe, expect, it } from "vitest";
import { activeWorkoutDraftSchema } from "./active-workout-draft.schema";
import { exerciseFormSchema } from "./exercise.schema";
import { postWorkoutFeelingSchema } from "./session.schema";
import { templateFormSchema } from "./template.schema";

describe("workout schemas", () => {
  it("validates exercise forms", () => {
    expect(
      exerciseFormSchema.parse({
        name: "Bench Press",
        loggingType: "weighted_reps"
      })
    ).toEqual({
      name: "Bench Press",
      loggingType: "weighted_reps"
    });
  });

  it("rejects empty template names", () => {
    expect(() => templateFormSchema.parse({ name: "" })).toThrow();
  });

  it("validates post-workout feeling values", () => {
    expect(postWorkoutFeelingSchema.safeParse(5).success).toBe(true);
    expect(postWorkoutFeelingSchema.safeParse(6).success).toBe(false);
  });

  it("validates active workout drafts", () => {
    expect(
      activeWorkoutDraftSchema.safeParse({
        templateId: "template-1",
        templateName: "Upper",
        startedAt: new Date().toISOString(),
        exercises: []
      }).success
    ).toBe(true);
  });
});
