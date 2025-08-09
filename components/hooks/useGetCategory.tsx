import { useFetch } from "./useFetch";
import type { Category } from "@/types/category";

export function useGetCategory() {
  const url = `${process.env.NEXT_PUBLIC_BACKEND_URL}/api/categories?populate=*`;
  const { data, loading, error } = useFetch<Category[]>(url);
  return { loading, result: data || [], error };
}