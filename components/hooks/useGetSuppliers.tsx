
import { useSearchParams } from "next/navigation";
import { useQuery } from "@tanstack/react-query";
import { listSuppliers } from "@/lib/admin/suppliers-api";

export function useGetSuppliers() {
  const searchParams = useSearchParams();
  const page = Number(searchParams.get("page") || "1");
  const pageSize = Number(searchParams.get("pageSize") || "10");
  const q = searchParams.get("q") || "";
  const active = (searchParams.get("active") || "all") as "all" | "true" | "false";

  const queryKey = ["suppliers", { page, pageSize, q, active }];

  const { data, isLoading, isError, error, refetch } = useQuery({
    queryKey: queryKey,
    queryFn: () => listSuppliers({ page, pageSize, q, active }),
  });

  return { 
    data, 
    isLoading, 
    isError, 
    error, 
    refetch, 
    page, 
    pageSize, 
    q, 
    active 
  };
}
