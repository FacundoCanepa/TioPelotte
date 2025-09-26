import { FabricacionListResponse } from "@/types/fabricacion";

export async function listFabricaciones(): Promise<FabricacionListResponse> {
  const res = await fetch(`/api/admin/fabricacion`, { cache: "no-store" });
  if (!res.ok) {
    const text = await res.text();
    throw new Error(text || "No se pudieron obtener las órdenes de fabricación");
  }
  const json = (await res.json()) as FabricacionListResponse;
  return json;
}
