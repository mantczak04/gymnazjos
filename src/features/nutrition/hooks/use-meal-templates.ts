"use client";

import { useQuery } from "@tanstack/react-query";
import { listActiveMealTemplates } from "../queries/meal-templates";

export const mealTemplatesQueryKey = ["nutrition-meal-templates"] as const;

export function useMealTemplates(enabled: boolean) {
  return useQuery({
    queryKey: mealTemplatesQueryKey,
    queryFn: listActiveMealTemplates,
    enabled
  });
}
