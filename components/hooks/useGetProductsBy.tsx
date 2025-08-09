import { useMemo } from "react";
import { useFetch } from "./useFetch";
import type { ProductType } from "@/types/product";

interface ProductsResult {
  products: ProductType[];
  total: number;
  loading: boolean;
}

export function useGetProductsBy(filter: Record<string, unknown>): ProductsResult {
  const query = useMemo(() => {
    return new URLSearchParams(
      Object.entries(filter).map(([k, v]) => [k, String(v)])
    ).toString();
  }, [filter]);

  const url = `${process.env.NEXT_PUBLIC_BACKEND_URL}/api/products?${query}`;

  const { data, loading } = useFetch<any>(url, undefined, (json) => json);

  return {
    products: data?.data || [],
    total: data?.meta?.pagination?.total || 0,
    loading,
  };
}