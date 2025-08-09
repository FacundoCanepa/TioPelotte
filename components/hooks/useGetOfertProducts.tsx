import { useFetch } from "./useFetch";
import type { ProductType } from "@/types/product";

export function useGetOfferProducts() {
  const url = `${process.env.NEXT_PUBLIC_BACKEND_URL}/api/products?filters[isOffer][$eq]=true&filters[active][$eq]=true&populate=*`;
  const { data, loading, error } = useFetch<ProductType[]>(url);
  return { loading, result: data, error };
}