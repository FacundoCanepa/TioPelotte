import { Fabricacion, FabricacionLine, FabricacionProduct } from "@/types/fabricacion";

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

export function mapFabricacion(node: unknown): Fabricacion | undefined {
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

function hasPopulate(params: URLSearchParams): boolean {
  for (const key of params.keys()) {
    if (key === "populate" || key.startsWith("populate[")) {
      return true;
    }
  }
  return false;
}

export function normalizeFabricacionPopulate(params: URLSearchParams): void {
  const simplePopulate = params.getAll("populate");
  if (simplePopulate.length === 0) return;

  params.delete("populate");

  const entries = simplePopulate
    .flatMap((value) => value.split(","))
    .map((value) => value.trim())
    .filter(Boolean);

  for (const key of entries) {
    if (!key) continue;

    const [root, ...rest] = key.split(".").filter(Boolean);
    if (!root) continue;

    if (root === "product") {
      if (!params.has("populate[product]")) {
        params.set("populate[product]", "*");
      }

      // Los campos de imagen del producto no son necesarios para la vista de fabricación
      // y algunos entornos de Strapi rechazan consultas como "product.img".
      if (rest.length === 0 || (rest.length === 1 && rest[0] === "img")) {
        continue;
      }
    }

    if (root === "lineas") {
      params.set("populate[lineas][populate]", "ingredient");
      continue;
    }

    params.set(`populate[${root}]`, "*");
  }
}

export function ensureFabricacionPopulate(params: URLSearchParams): void {
  if (hasPopulate(params)) return;
  params.set("populate[product]", "*");
  params.set("populate[lineas][populate]", "ingredient");
}
