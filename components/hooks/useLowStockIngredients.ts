import { useMemo } from "react";
import { useQuery } from "@tanstack/react-query";
import { listIngredients } from "@/lib/admin/ingredients-api";
import { isLowStock, LOW_STOCK_THRESHOLD } from "@/lib/inventory";

interface UseLowStockOptions {
  threshold?: number;
  pageSize?: number;
  enabled?: boolean;
}

export function useLowStockIngredients(options: UseLowStockOptions = {}) {
  const threshold = options.threshold ?? LOW_STOCK_THRESHOLD;
  const pageSize = options.pageSize ?? 200;
  const enabled = options.enabled ?? true;

  const query = useQuery({
    queryKey: ["lowStockIngredients", { threshold, pageSize }],
    queryFn: () => listIngredients({ page: 1, pageSize }),
    staleTime: 1000 * 60,
    gcTime: 1000 * 60 * 5,
    enabled,
  });

  const lowStockIngredientes = useMemo(() => {
    const items = query.data?.items ?? [];
    return items
      .filter((ingredient) => isLowStock(ingredient, threshold))
      .sort((a, b) => (a.Stock ?? 0) - (b.Stock ?? 0));
  }, [query.data, threshold]);

  return {
    lowStockIngredientes,
    threshold,
    ...query,
  };
}
