import type { LoggingType, PostWorkoutFeeling } from "@/features/workouts/types/workout.types";

const dateTimeFormatter = new Intl.DateTimeFormat("en-GB", {
  day: "2-digit",
  month: "2-digit",
  year: "numeric",
  hour: "2-digit",
  minute: "2-digit",
  hour12: false
});

const timeFormatter = new Intl.DateTimeFormat("en-GB", {
  hour: "2-digit",
  minute: "2-digit",
  hour12: false
});

export function formatDateTime(value: string) {
  return dateTimeFormatter.format(new Date(value));
}

export function formatTime(value: string) {
  return timeFormatter.format(new Date(value));
}

export function formatDuration(minutes: number) {
  const hours = Math.floor(minutes / 60);
  const remainingMinutes = minutes % 60;

  if (hours === 0) {
    return `${remainingMinutes} min`;
  }

  return `${hours} h ${remainingMinutes.toString().padStart(2, "0")} min`;
}

export function formatFeeling(feeling: PostWorkoutFeeling) {
  const labels: Record<PostWorkoutFeeling, string> = {
    1: "Very bad",
    2: "Bad",
    3: "Okay",
    4: "Good",
    5: "Very good"
  };

  return labels[feeling];
}

export function formatLoggingType(loggingType: LoggingType) {
  return loggingType === "weighted_reps" ? "Weight + reps" : "Reps only";
}

export function formatWeight(value: number) {
  return Number.isInteger(value) ? `${value} kg` : `${value.toFixed(2)} kg`;
}
