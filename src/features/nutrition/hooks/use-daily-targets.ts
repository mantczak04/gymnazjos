"use client";

import { useQuery } from "@tanstack/react-query";
import { getDailyTargets } from "../queries/daily-targets";

export const dailyTargetsQueryKey = ["daily-nutrition-targets"] as const;

export function useDailyTargets(enabled: boolean) {
  return useQuery({
    queryKey: dailyTargetsQueryKey,
    queryFn: getDailyTargets,
    enabled
  });
}
