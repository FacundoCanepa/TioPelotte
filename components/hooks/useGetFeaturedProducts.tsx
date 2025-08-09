import { useFetch } from "./useFetch";
import type { ProductType } from "@/types/product";

export function useGetFeaturedProducts() {
  const url = `${process.env.NEXT_PUBLIC_BACKEND_URL}/api/products?filters[isFeatured][$eq]=true&populate=*`;
  const { data, loading, error } = useFetch<ProductType[]>(url);
  return { loading, result: data, error };
}