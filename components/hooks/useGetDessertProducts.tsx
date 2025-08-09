import { useFetch } from "./useFetch";
import type { ProductType } from "@/types/product";

export function useGetDessertProducts() {
  const url = `${process.env.NEXT_PUBLIC_BACKEND_URL}/api/products?populate=*&filters[category][slug][$eq]=postres&filters[active][$eq]=true`;
  const { data, loading, error } = useFetch<ProductType[]>(url);
  return { loading, result: data, error };
}