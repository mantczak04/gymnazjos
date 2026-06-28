"use client";

import { activeWorkoutDraftSchema } from "../schemas/active-workout-draft.schema";
import type { ActiveWorkoutDraft } from "../types/workout.types";

export const ACTIVE_WORKOUT_DRAFT_KEY = "gym-tracker.active-workout-draft";

function canUseStorage() {
  return typeof window !== "undefined" && Boolean(window.localStorage);
}

export function readActiveWorkoutDraft() {
  if (!canUseStorage()) {
    return null;
  }

  const raw = window.localStorage.getItem(ACTIVE_WORKOUT_DRAFT_KEY);
  if (!raw) {
    return null;
  }

  try {
    const parsed = JSON.parse(raw) as unknown;
    const result = activeWorkoutDraftSchema.safeParse(parsed);
    if (!result.success) {
      return null;
    }

    return result.data;
  } catch {
    return null;
  }
}

export function writeActiveWorkoutDraft(draft: ActiveWorkoutDraft) {
  if (!canUseStorage()) {
    return;
  }

  window.localStorage.setItem(ACTIVE_WORKOUT_DRAFT_KEY, JSON.stringify(draft));
}

export function clearActiveWorkoutDraft() {
  if (!canUseStorage()) {
    return;
  }

  window.localStorage.removeItem(ACTIVE_WORKOUT_DRAFT_KEY);
}
