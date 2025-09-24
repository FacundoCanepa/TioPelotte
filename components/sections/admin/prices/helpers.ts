import { strapiFetch } from "@/app/api/admin/suppliers/strapi-helpers";

type UnknownRecord = Record<string, unknown>;

export const PRICE_POPULATE = "ingrediente,supplier,ingrediente.categoria_ingrediente";

const UUID_REGEX =
  /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;

function isRecord(value: unknown): value is UnknownRecord {
  return typeof value === "object" && value !== null;
}

function toNumberOrNull(value: unknown): number | null {
  if (value === undefined || value === null) return null;
  if (typeof value === "string" && value.trim() === "") return null;
  const num = Number(value);
  return Number.isFinite(num) ? num : null;
}

function isLikelyDocIdString(value: unknown): value is string {
  if (typeof value !== "string") return false;
  const trimmed = value.trim();
  if (!trimmed) return false;
  if (UUID_REGEX.test(trimmed)) return true;
  return Number.isNaN(Number(trimmed)) && /[a-zA-Z]/.test(trimmed);
}

export function buildPriceListPath(searchParams: URLSearchParams) {
  const params = new URLSearchParams(searchParams);

  if (!params.has("populate")) {
    params.set("populate", PRICE_POPULATE);
  }

  const ingredientId = searchParams.get("ingredientId");
  if (ingredientId) {
    const trimmed = ingredientId.trim();
    if (trimmed) {
      if (isLikelyDocIdString(trimmed)) {
        params.set("filters[ingrediente][documentId][$eq]", trimmed);
      } else {
        params.set("filters[ingrediente][id][$eq]", trimmed);
      }
    }
  }

  const supplierId = searchParams.get("supplierId");
  if (supplierId) {
    const trimmed = supplierId.trim();
    if (trimmed) {
      if (isLikelyDocIdString(trimmed)) {
        params.set("filters[supplier][documentId][$eq]", trimmed);
      } else {
        params.set("filters[supplier][id][$eq]", trimmed);
      }
    }
  }

  const categoryId = searchParams.get("categoryId");
  if (categoryId) {
    const trimmed = categoryId.trim();
    if (trimmed) {
      if (isLikelyDocIdString(trimmed)) {
        params.set("filters[ingrediente][categoria_ingrediente][documentId][$eq]", trimmed);
      } else {
        params.set("filters[ingrediente][categoria_ingrediente][id][$eq]", trimmed);
      }
    }
  }

  return `/api/ingredient-supplier-prices?${params.toString()}`;
}

function buildConnectPayload(value: unknown) {
  if (value === undefined) return undefined;
  if (value === null) return null;

  if (typeof value === "string") {
    const trimmed = value.trim();
    if (!trimmed) return undefined;
    if (isLikelyDocIdString(trimmed)) {
      return { connect: [{ documentId: trimmed }] };
    }
    const numeric = toNumberOrNull(trimmed);
    return numeric !== null ? numeric : { connect: [{ documentId: trimmed }] };
  }

  if (typeof value === "number" && Number.isFinite(value)) {
    return value;
  }

  if (isRecord(value)) {
    if (typeof value.documentId === "string") {
      const trimmed = value.documentId.trim();
      if (trimmed) {
        return { connect: [{ documentId: trimmed }] };
      }
    }
    if (value.id !== undefined) {
      const numeric = toNumberOrNull(value.id);
      if (numeric !== null) return numeric;
    }
  }

  return undefined;
}

export function sanitizePricePayload(raw: unknown): Record<string, unknown> {
  const wrapper = isRecord(raw) ? raw : {};
  const inner = isRecord(wrapper.data) ? (wrapper.data as UnknownRecord) : wrapper;
  const sanitized: Record<string, unknown> = {};

  const unitPriceValue = inner.unitPrice ?? inner.price;
  const unitPrice = toNumberOrNull(unitPriceValue);
  if (unitPrice === null) {
    throw new Error("El precio unitario es obligatorio y debe ser numérico");
  }
  sanitized.unitPrice = unitPrice;

  const minOrderQtyValue = inner.minOrderQty ?? inner.min_order_qty;
  const minOrderQty = toNumberOrNull(minOrderQtyValue);
  if (minOrderQty !== null) sanitized.minOrderQty = minOrderQty;

  if (typeof inner.currency === "string") {
    sanitized.currency = inner.currency.trim();
  }

  if (typeof inner.unit === "string") {
    sanitized.unit = inner.unit.trim();
  }

  if (typeof inner.validFrom === "string") {
    sanitized.validFrom = inner.validFrom;
  }

  const ingredientRelation = buildConnectPayload(inner.ingrediente ?? inner.ingredient);
  if (!ingredientRelation) {
    throw new Error("El ingrediente es obligatorio");
  }
  sanitized.ingrediente = ingredientRelation;

  const supplierRelation = buildConnectPayload(inner.supplier);
  if (!supplierRelation) {
    throw new Error("El proveedor es obligatorio");
  }
  sanitized.supplier = supplierRelation;

  const categoryRelation = buildConnectPayload(inner.categoria_ingrediente ?? inner.category);
  if (categoryRelation !== undefined) {
    sanitized.categoria_ingrediente = categoryRelation;
  }

  return sanitized;
}

export async function resolvePriceIdByDocumentId(documentId: string): Promise<number | null> {
  const trimmed = documentId?.trim();
  if (!trimmed) return null;

  if (!isLikelyDocIdString(trimmed)) {
    const numeric = toNumberOrNull(trimmed);
    if (numeric !== null) return numeric;
  }

  const params = new URLSearchParams();
  params.set("filters[documentId][$eq]", trimmed);
  params.set("fields[0]", "id");
  params.set("pagination[pageSize]", "1");

  const res = await strapiFetch(`/api/ingredient-supplier-prices?${params.toString()}`);
  if (!res.ok) return null;

  try {
    const json = (await res.json()) as UnknownRecord;
    const data = Array.isArray(json?.data) ? json.data : [];
    const first = data[0];
    if (isRecord(first) && typeof first.id === "number") {
      return first.id;
    }
    if (isRecord(first) && isRecord(first.attributes) && typeof first.attributes.id === "number") {
      return first.attributes.id;
    }
  } catch {
    // ignore parsing issues
  }

  return null;
}