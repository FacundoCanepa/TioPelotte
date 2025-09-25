"use client";

import { useQuery } from "@tanstack/react-query";

export const useGetSuppliers = () => {
  return useQuery({
    queryKey: ["suppliers"],
    queryFn: async () => {
      const res = await fetch("/api/admin/suppliers");
      if (!res.ok) {
        throw new Error("Failed to fetch suppliers");
      }
      return res.json();
    },
  });
};
