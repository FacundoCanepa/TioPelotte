
import { useSearchParams } from "next/navigation";
import { useQuery } from "@tanstack/react-query";
import { listIngredients } from "@/lib/admin/ingredients-api";

export function useGetIngredients() {
  const searchParams = useSearchParams();
  const page = Number(searchParams.get("page") || "1");
  const pageSize = Number(searchParams.get("pageSize") || "50");
  const q = searchParams.get("q") || "";

  const queryKey = ["ingredients", { page, pageSize, q }];

  const { data, isLoading, isError, error, refetch } = useQuery({
    queryKey: queryKey,
    queryFn: () => listIngredients({ page, pageSize, q }),
  });

  return { 
    data, 
    isLoading, 
    isError, 
    error, 
    refetch, 
    page, 
    pageSize, 
    q 
  };
}
