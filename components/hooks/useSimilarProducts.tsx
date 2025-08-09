import { useMemo } from "react";
import { useFetch } from "./useFetch";
import type { ProductType } from "@/types/product";

interface Props {
  categorySlug: string;
  excludeProductId: number;
}

export function useGetSimilarProducts({ categorySlug, excludeProductId }: Props) {
  const url = useMemo(() => {
    if (!categorySlug || !excludeProductId) return undefined;
    return `https://loved-ducks-790a0f88b6.strapiapp.com/api/products?populate=*&filters[category][slug][$eq]=${categorySlug}&filters[id][$ne]=${excludeProductId}`;
  }, [categorySlug, excludeProductId]);

  const { data, loading, error } = useFetch<ProductType[]>(url);

  return {
    similarProducts: data,
    loading,
    error,
  };
}