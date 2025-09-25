"use client";

import { useQuery } from "@tanstack/react-query";

export const useGetIngredientCategories = () => {
  return useQuery({
    queryKey: ["ingredient-categories"],
    queryFn: async () => {
      const res = await fetch("/api/admin/ingredient-categories");
      if (!res.ok) {
        throw new Error("Failed to fetch ingredient categories");
      }
      return res.json();
    },
  });
};
