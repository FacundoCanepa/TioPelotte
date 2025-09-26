import { NextRequest, NextResponse } from "next/server";
import { strapiFetch } from "../suppliers/strapi-helpers";
import { Fabricacion, FabricacionLine, FabricacionListResponse, FabricacionProduct } from "@/types/fabricacion";

function toNumber(value: unknown, fallback = 0): number {
  const source = typeof value === "string" ? value.trim() : value;
  const num = Number(source);
  return Number.isFinite(num) ? num : fallback;
}

function toNullableNumber(value: unknown): number | null {
  const source = typeof value === "string" ? value.trim() : value;
  if (source === "" || source === null || source === undefined) return null;
  const num = Number(source);
  return Number.isFinite(num) ? num : null;
}

function toOptionalNumber(value: unknown): number | undefined {
  const num = toNullableNumber(value);
  return num === null ? undefined : num;
}

function toStringOrNull(value: unknown): string | null {
  if (typeof value === "string") {
    const trimmed = value.trim();
    return trimmed === "" ? null : trimmed;
  }
  return value == null ? null : String(value);
}

function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === "object" && value !== null;
}

function normalizeEntity<T extends Record<string, unknown>>(node: unknown): T | null {
  if (!isRecord(node)) return null;
  const record = node as Record<string, unknown>;
  if (isRecord(record.data)) {
    return normalizeEntity(record.data);
  }
  if (isRecord(record.attributes)) {
    return { ...record, ...(record.attributes as Record<string, unknown>) } as T;
  }
  return record as T;
}

function normalizeArray(value: unknown): unknown[] {
  if (Array.isArray(value)) return value;
  if (isRecord(value) && Array.isArray(value.data)) return value.data as unknown[];
  return [];
}

function mapProduct(node: unknown): FabricacionProduct | null {
  const entry = normalizeEntity<Record<string, unknown>>(node);
  if (!entry) return null;
  const documentId = toStringOrNull(entry.documentId) ?? toStringOrNull(entry.document_id);
  const productName =
    toStringOrNull(entry.productName) ?? toStringOrNull(entry.name) ?? toStringOrNull(entry.titulo) ?? "";
  if (!documentId || !productName) return null;
  return {
    id: toOptionalNumber(entry.id),
    documentId,
    productName,
    slug: toStringOrNull(entry.slug) ?? undefined,
    price: toNullableNumber(entry.price),
    unidadMedida: toStringOrNull(entry.unidadMedida) ?? undefined,
  };
}

function mapLinea(node: unknown): FabricacionLine | undefined {
  const entry = normalizeEntity<Record<string, unknown>>(node);
  if (!entry) return undefined;
  return {
    id: toOptionalNumber(entry.id),
    cantidad: toNumber(entry.cantidad),
    unidad: toStringOrNull(entry.unidad) ?? "",
    mermaPct: toNumber(entry.mermaPct),
    nota: toStringOrNull(entry.nota),
  };
}

function mapFabricacion(node: unknown): Fabricacion | undefined {
  const entry = normalizeEntity<Record<string, unknown>>(node);
  if (!entry) return undefined;

  const documentId =
    toStringOrNull(entry.documentId) ??
    toStringOrNull(entry.document_id) ??
    (entry.id != null ? String(entry.id) : null);
  const nombre = toStringOrNull(entry.nombre) ?? "";
  if (!documentId || !nombre) return undefined;

  const lineasRaw = normalizeArray(entry.lineas);

  const lineas = lineasRaw.map(mapLinea).filter((linea): linea is FabricacionLine => Boolean(linea));

  return {
    id: toOptionalNumber(entry.id),
    documentId,
    nombre,
    batchSize: toNumber(entry.batchSize),
    mermaPct: toNumber(entry.mermaPct),
    costoManoObra: toNumber(entry.costoManoObra),
    costoEmpaque: toNumber(entry.costoEmpaque),
    overheadPct: toNumber(entry.overheadPct),
    margenObjetivoPct: toNumber(entry.margenObjetivoPct),
    ingredientesCostoTotal: toNumber(entry.ingredientesCostoTotal),
    costoTotalBatch: toNumber(entry.costoTotalBatch),
    costoUnitario: toNullableNumber(entry.costoUnitario),
    precioSugerido: toNumber(entry.precioSugerido),
    margenRealPct: toNumber(entry.margenRealPct),
    lastCalculatedAt: toStringOrNull(entry.lastCalculatedAt),
    createdAt: toStringOrNull(entry.createdAt) ?? undefined,
    updatedAt: toStringOrNull(entry.updatedAt) ?? undefined,
    publishedAt: toStringOrNull(entry.publishedAt) ?? undefined,
    product: mapProduct(entry.product),
    lineas,
  };
}

const DEFAULT_POPULATE = "product,lineas";

export async function GET(request: NextRequest) {
  try {
    const url = new URL(request.url);
    const params = new URLSearchParams(url.searchParams);
    if (!params.has("populate")) {
      params.set("populate", DEFAULT_POPULATE);
    }
    if (!params.has("pagination[page]")) {
      params.set("pagination[page]", params.get("page") ?? "1");
    }
    if (!params.has("pagination[pageSize]")) {
      params.set("pagination[pageSize]", params.get("pageSize") ?? "25");
    }
    params.delete("page");
    params.delete("pageSize");

    const path = `/api/fabricacions?${params.toString()}`;
    const res = await strapiFetch(path);
    const text = await res.text();
    if (!res.ok) {
      console.error("[admin/fabricacion][GET] Strapi error", { status: res.status, body: text });
      return NextResponse.json({ error: "No se pudo obtener la información de fabricación" }, { status: 502 });
    }

    const json = text ? JSON.parse(text) : {};
    const rawItems: unknown[] = Array.isArray(json?.data) ? json.data : [];
    const items = rawItems.map(mapFabricacion).filter((item): item is Fabricacion => Boolean(item));
    const meta = json?.meta ?? {};

    const payload: FabricacionListResponse = {
      items,
      meta,
    };

    return NextResponse.json(payload);
  } catch (error) {
    console.error("[admin/fabricacion][GET] Unexpected error", error);
    return NextResponse.json(
      { error: "Error inesperado obteniendo las órdenes de fabricación" },
      { status: 500 }
    );
  }
}
