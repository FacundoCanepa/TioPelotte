"use client";
import { useFetch } from "./useFetch";
import type { ProductType } from "@/types/product";

export function useGetProductBySlug(slug: string) {
  const base = process.env.NEXT_PUBLIC_BACKEND_URL;
  const url = base ? `${base}/api/products?filters[slug][$eq]=${slug}&populate=*` : undefined;
  const { data, loading, error } = useFetch<ProductType[]>(url);
  return { product: data ? data[0] : null, loading, error };
}