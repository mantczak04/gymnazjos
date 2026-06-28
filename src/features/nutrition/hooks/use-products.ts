"use client";

import { useQuery } from "@tanstack/react-query";
import { listActiveProducts } from "../queries/products";

export const productsQueryKey = ["nutrition-products"] as const;

export function useProducts(enabled: boolean) {
  return useQuery({
    queryKey: productsQueryKey,
    queryFn: listActiveProducts,
    enabled
  });
}
