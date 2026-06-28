"use client";

import { useQuery } from "@tanstack/react-query";
import { listDailyFoodEntries } from "../queries/daily-food-log";

export function dailyFoodLogQueryKey(date: string) {
  return ["daily-food-log", date] as const;
}

export function useDailyFoodLog(date: string, enabled: boolean) {
  return useQuery({
    queryKey: dailyFoodLogQueryKey(date),
    queryFn: () => listDailyFoodEntries(date),
    enabled
  });
}
