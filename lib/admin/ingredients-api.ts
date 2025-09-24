
import { IngredientType } from "@/types/ingredient";

// Response shape expected by GET /api/admin/ingredients
export type IngredientListResponse = {
  items: IngredientType[];
  meta: {
    pagination: {
      page: number;
      pageSize: number;
      pageCount: number;
      total: number;
    };
  };
  totalCount: number;
};

type ListParams = {
  q?: string;
  page?: number;
  pageSize?: number;
};

function toQuery(params: Record<string, string | number | boolean | undefined | null>) {
  const usp = new URLSearchParams();
  Object.entries(params).forEach(([k, v]) => {
    if (v !== undefined && v !== null && v !== "") usp.set(k, String(v));
  });
  return usp.toString();
}

export async function listIngredients(params: ListParams = {}): Promise<IngredientListResponse> {
  const qs = toQuery({
    q: params.q,
    page: params.page ?? 1,
    pageSize: params.pageSize ?? 50, // Default to a larger size for selection
  });
  const url = `/api/admin/ingredients${qs ? `?${qs}` : ""}`;
  console.log("[ingredients-api] listIngredients ->", url);
  const res = await fetch(url, { cache: "no-store" });
  if (!res.ok) {
    const txt = await res.text();
    console.error("[ingredients-api] listIngredients error", res.status, txt);
    throw new Error("Error listando ingredientes");
  }
  const json = (await res.json()) as IngredientListResponse;
  console.log("[ingredients-api] listIngredients ok", {
    count: Array.isArray(json?.items) ? json.items.length : 0,
    meta: json?.meta,
    totalCount: json?.totalCount,
  });
  return json;
}
