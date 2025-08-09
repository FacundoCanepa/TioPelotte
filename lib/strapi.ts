// lib/strapi.ts
/* Helpers centralizados para hablar con Strapi y normalizar relaciones. */

export const STRAPI_URL = process.env.NEXT_PUBLIC_BACKEND_URL!;
const STRAPI_TOKEN = process.env.STRAPI_API_TOKEN!;

if (!STRAPI_URL) {
  throw new Error("Falta NEXT_PUBLIC_BACKEND_URL en el .env");
}
if (!STRAPI_TOKEN) {
  throw new Error("Falta STRAPI_API_TOKEN en el .env");
}

export async function strapiFetch<T = any>(path: string, init?: RequestInit): Promise<T> {
  const res = await fetch(`${STRAPI_URL}${path}`, {
    ...init,
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${STRAPI_TOKEN}`,
      ...(init?.headers || {}),
    },
    cache: "no-store",
  });

  if (!res.ok) {
    let details: any = undefined;
    try {
      details = await res.json();
    } catch {
      // ignore
    }
    const message = `[Strapi ${res.status}] ${res.statusText}${details ? `: ${JSON.stringify(details)}` : ""}`;
    throw new Error(message);
  }

  return res.json();
}

/** Devuelve el id numérico de la categoría a partir del documentId (UUID). */
export async function getCategoryIdByDocumentId(categoryDocId?: string | null): Promise<number | null> {
  if (!categoryDocId) return null;

  const data = await strapiFetch<{ data: Array<{ id: number; documentId: string }> }>(
    `/api/categories?filters[documentId][$eq]=${encodeURIComponent(categoryDocId)}&fields[0]=documentId`
  );

  return data?.data?.[0]?.id ?? null;
}

/** Normaliza `category` (puede venir como id numérico, objeto con id, objeto con documentId, o string documentId). */
export async function normalizeCategory(category: any): Promise<number | null> {
  if (typeof category === "number") return category;

  if (category && typeof category === "object") {
    if (typeof category.id === "number") return category.id;
    if (typeof category.documentId === "string") {
      return await getCategoryIdByDocumentId(category.documentId);
    }
  }

  if (typeof category === "string") {
    // Asumimos que es un documentId
    return await getCategoryIdByDocumentId(category);
  }

  return null;
}

/** Si viene un media como objeto/array, devuelve el id numérico; si ya es número, lo deja. */
export function normalizeMediaId(input: any): number | null {
  if (!input) return null;
  if (typeof input === "number") return input;

  // Caso: objeto con id
  if (typeof input === "object" && input?.id && typeof input.id === "number") {
    return input.id;
  }

  // Caso: array con primer item
  if (Array.isArray(input) && input[0]?.id && typeof input[0].id === "number") {
    return input[0].id;
  }

  return null;
}

/** Para arrays de relaciones que pueden venir como [{id}, ...] o [id, ...] */
export function normalizeRelationIds(arr: any): number[] {
  if (!Array.isArray(arr)) return [];
  return arr
    .map((v) => (typeof v === "object" ? v?.id : v))
    .filter((v) => typeof v === "number");
}

/** (Opcional) Si alguna vez recibís `params.id` como documentId del producto, resolvelo a id numérico. */
export async function getProductIdByDocumentId(productDocId: string): Promise<number | null> {
  if (!productDocId) return null;
  const data = await strapiFetch<{ data: Array<{ id: number; documentId: string }> }>(
    `/api/products?filters[documentId][$eq]=${encodeURIComponent(productDocId)}&fields[0]=documentId`
  );
  return data?.data?.[0]?.id ?? null;
}
