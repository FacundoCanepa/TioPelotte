import { Fabricacion, FabricacionListResponse } from "@/types/fabricacion";

function extractErrorMessage(payload: string | null): string {
  if (!payload) return "No se pudieron obtener las órdenes de fabricación";
  try {
    const parsed = JSON.parse(payload);
    if (typeof parsed?.error === "string") return parsed.error;
    if (parsed?.error && typeof parsed.error.message === "string") return parsed.error.message;
  } catch {
    // ignore, fall back to raw payload
  }
  return payload;
}

export async function listFabricaciones(): Promise<FabricacionListResponse> {
  const res = await fetch(`/api/admin/fabricacion`, { cache: "no-store" });
  if (!res.ok) {
    const text = await res.text();
    throw new Error(extractErrorMessage(text));
  }
  const json = (await res.json()) as FabricacionListResponse;
  return json;
}

export async function getFabricacion(documentId: string): Promise<Fabricacion> {
  const trimmed = documentId?.trim();
  if (!trimmed) {
    throw new Error("Falta el identificador de la orden de fabricación");
  }
  const res = await fetch(`/api/admin/fabricacion/${encodeURIComponent(trimmed)}`, { cache: "no-store" });
  if (!res.ok) {
    const text = await res.text();
    throw new Error(extractErrorMessage(text));
  }
  const json = (await res.json()) as Fabricacion;
  return json;
}
