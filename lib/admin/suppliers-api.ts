
import { Supplier } from "@/types/supplier";

// Response shape expected by GET /api/admin/suppliers
export type SupplierListResponse = {
  items: Supplier[];
  meta: {
    pagination: {
      page: number;
      pageSize: number;
      pageCount: number;
      total: number;
    };
  };
  totalCount: number;
  activeCount: number;
};

type ListParams = {
  q?: string;
  page?: number;
  pageSize?: number;
  active?: "all" | "true" | "false";
};

function toQuery(params: Record<string, string | number | boolean | undefined | null>) {
  const usp = new URLSearchParams();
  Object.entries(params).forEach(([k, v]) => {
    if (v !== undefined && v !== null && v !== "") usp.set(k, String(v));
  });
  return usp.toString();
}

export async function listSuppliers(params: ListParams = {}): Promise<SupplierListResponse> {
  const qs = toQuery({
    q: params.q,
    page: params.page ?? 1,
    pageSize: params.pageSize ?? 10,
    active: params.active ?? "all",
  });
  const url = `/api/admin/suppliers${qs ? `?${qs}` : ""}`;
  console.log("[suppliers-api] listSuppliers ->", url);
  const res = await fetch(url, { cache: "no-store" });
  if (!res.ok) {
    const txt = await res.text();
    console.error("[suppliers-api] listSuppliers error", res.status, txt);
    throw new Error("Error listando proveedores");
  }
  const json = (await res.json()) as SupplierListResponse;
  console.log("[suppliers-api] listSuppliers ok", {
    count: Array.isArray(json?.items) ? json.items.length : 0,
    meta: json?.meta,
    totalCount: json?.totalCount,
    activeCount: json?.activeCount,
  });
  return json;
}

export async function createSupplier(data: Omit<Supplier, "id">): Promise<Supplier> {
  console.log("[suppliers-api] createSupplier payload", data);
  const res = await fetch("/api/admin/suppliers", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(data),
  });
  if (!res.ok) {
    const txt = await res.text();
    console.error("[suppliers-api] createSupplier error", res.status, txt);
    throw new Error(txt || "Error creando proveedor");
  }
  const json = await res.json();
  console.log("[suppliers-api] createSupplier ok", { id: json?.id });
  return json;
}

export async function updateSupplier(id: number, data: Partial<Omit<Supplier, "id">>): Promise<Supplier> {
  console.log("[suppliers-api] updateSupplier payload", { id, data });
  const res = await fetch(`/api/admin/suppliers/${id}`, {
    method: "PUT",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(data),
  });
  if (!res.ok) {
    const txt = await res.text();
    console.error("[suppliers-api] updateSupplier error", res.status, txt);
    throw new Error(txt || "Error actualizando proveedor");
  }
  const json = await res.json();
  console.log("[suppliers-api] updateSupplier ok", { id: json?.id });
  return json;
}

export async function deleteSupplier(id: number): Promise<{ ok: true }> {
  console.log("[suppliers-api] deleteSupplier", { id });
  const res = await fetch(`/api/admin/suppliers/${id}`, { method: "DELETE" });
  if (!res.ok) {
    const txt = await res.text();
    console.error("[suppliers-api] deleteSupplier error", res.status, txt);
    throw new Error(txt || "Error eliminando proveedor");
  }
  return { ok: true };
}
