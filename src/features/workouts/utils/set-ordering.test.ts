import { describe, expect, it } from "vitest";
import { createNextDraftSet, reindexDraftSets } from "./set-ordering";

describe("set ordering utilities", () => {
  it("copies the previous weight for weighted exercises", () => {
    const set = createNextDraftSet({
      loggingType: "weighted_reps",
      sets: [{ localId: "set-1", setIndex: 0, reps: 8, weight: 60 }]
    });

    expect(set.setIndex).toBe(1);
    expect(set.reps).toBeNull();
    expect(set.weight).toBe(60);
  });

  it("keeps reps-only sets empty", () => {
    const set = createNextDraftSet({
      loggingType: "reps_only",
      sets: [{ localId: "set-1", setIndex: 0, reps: 10, weight: null }]
    });

    expect(set.setIndex).toBe(1);
    expect(set.reps).toBeNull();
    expect(set.weight).toBeNull();
  });

  it("reindexes sets after deletion", () => {
    expect(
      reindexDraftSets([
        { localId: "a", setIndex: 0, reps: 8, weight: 50 },
        { localId: "c", setIndex: 2, reps: 6, weight: 50 }
      ])
    ).toEqual([
      { localId: "a", setIndex: 0, reps: 8, weight: 50 },
      { localId: "c", setIndex: 1, reps: 6, weight: 50 }
    ]);
  });
});
