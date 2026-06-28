import { beforeEach, describe, expect, it } from "vitest";
import {
  ACTIVE_WORKOUT_DRAFT_KEY,
  clearActiveWorkoutDraft,
  readActiveWorkoutDraft,
  writeActiveWorkoutDraft
} from "./draft-storage";
import type { ActiveWorkoutDraft } from "../types/workout.types";

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
      sets: [{ localId: "set-1", setIndex: 0, reps: 8, weight: 60 }]
    }
  ]
};

describe("draft storage", () => {
  beforeEach(() => {
    window.localStorage.clear();
  });

  it("writes and reads a valid draft", () => {
    writeActiveWorkoutDraft(draft);

    expect(readActiveWorkoutDraft()).toEqual(draft);
  });

  it("returns null for malformed draft JSON", () => {
    window.localStorage.setItem(ACTIVE_WORKOUT_DRAFT_KEY, "{bad");

    expect(readActiveWorkoutDraft()).toBeNull();
  });

  it("returns null for invalid draft shape", () => {
    window.localStorage.setItem(ACTIVE_WORKOUT_DRAFT_KEY, JSON.stringify({ templateId: "x" }));

    expect(readActiveWorkoutDraft()).toBeNull();
  });

  it("clears the draft", () => {
    writeActiveWorkoutDraft(draft);
    clearActiveWorkoutDraft();

    expect(readActiveWorkoutDraft()).toBeNull();
  });
});
