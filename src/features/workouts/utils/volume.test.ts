import { describe, expect, it } from "vitest";
import {
  calculateRepsVolume,
  calculateWeightedVolume,
  hasAtLeastOneValidSet
} from "./volume";
import type { ActiveWorkoutDraft } from "../types/workout.types";

describe("volume utilities", () => {
  it("calculates weighted volume from weight and reps", () => {
    expect(
      calculateWeightedVolume([
        { weight: 60, reps: 8 },
        { weight: 55, reps: 10 }
      ])
    ).toBe(1030);
  });

  it("calculates reps-only volume", () => {
    expect(
      calculateRepsVolume([
        { weight: null, reps: 12 },
        { weight: null, reps: 10 }
      ])
    ).toBe(22);
  });

  it("requires at least one complete set before finishing", () => {
    const draft: ActiveWorkoutDraft = {
      templateId: "template-1",
      templateName: "Upper",
      startedAt: new Date().toISOString(),
      exercises: [
        {
          exerciseId: "exercise-1",
          exerciseName: "Bench Press",
          loggingType: "weighted_reps",
          orderIndex: 0,
          source: "template",
          sets: [{ localId: "set-1", setIndex: 0, reps: 8, weight: null }]
        },
        {
          exerciseId: "exercise-2",
          exerciseName: "Push-up",
          loggingType: "reps_only",
          orderIndex: 1,
          source: "template",
          sets: [{ localId: "set-2", setIndex: 0, reps: 12, weight: null }]
        }
      ]
    };

    expect(hasAtLeastOneValidSet(draft)).toBe(true);
  });
});
