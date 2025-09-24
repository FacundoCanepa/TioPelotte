import { IngredientType } from "@/types/ingredient";
import { SupplierType } from "@/types/supplier";

type UnknownRecord = Record<string, unknown>;

const STRAPI_TOKEN = process.env.STRAPI_ADMIN_TOKEN || process.env.STRAPI_API_TOKEN;
const STRAPI_URL = process.env.NEXT_PUBLIC_BACKEND_URL;

if (!STRAPI_URL) {
  console.warn("[admin/suppliers] NEXT_PUBLIC_BACKEND_URL is not defined");
}

const UUID_REGEX =
  /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;

function isRecord(value: unknown): value is UnknownRecord {
  return typeof value === "object" && value !== null;
}

export async function strapiFetch(path: string, init?: RequestInit) {
  if (!STRAPI_URL) {
    throw new Error("NEXT_PUBLIC_BACKEND_URL is not configured");
  }
  const url = `${STRAPI_URL}${path}`;
  const headers = new Headers(init?.headers);
  if (init?.body && !headers.has("Content-Type")) {
    headers.set("Content-Type", "application/json");
  }
  if (STRAPI_TOKEN) {
    headers.set("Authorization", `Bearer ${STRAPI_TOKEN}`);
  }
  return fetch(url, { ...init, headers, cache: "no-store" });
}

function normalizeNumber(value: unknown): number {
  const num = Number(value);
  return Number.isFinite(num) ? num : 0;
}

function toNumberOrNull(value: unknown): number | null {
  if (value === undefined || value === null) return null;
  if (typeof value === "string" && value.trim() === "") return null;
  const num = Number(value);
  return Number.isFinite(num) ? num : null;
}

function isLikelyDocIdString(value: unknown): boolean {
  if (typeof value !== "string") return false;
  const trimmed = value.trim();
  if (!trimmed) return false;
  if (UUID_REGEX.test(trimmed)) return true;
  return Number.isNaN(Number(trimmed)) && /[a-zA-Z]/.test(trimmed);
}

function extractRelationArray(value: unknown): unknown[] {
  if (Array.isArray(value)) return value;
  if (isRecord(value) && Array.isArray(value.data)) return value.data;
  return [];
}

export function normalizeManyRelation(value: unknown): unknown {
  if (value === undefined) return undefined;
  if (value === null) return null;
  if (Array.isArray(value) && value.length === 0) return [];

  const queue: unknown[] = Array.isArray(value) ? [...value] : [value];
  const numericIds: number[] = [];
  const documentIds: string[] = [];

  while (queue.length > 0) {
    const current = queue.shift();
    if (current === undefined || current === null) continue;

    if (Array.isArray(current)) {
      queue.push(...current);
      continue;
    }

    if (isRecord(current) && Array.isArray(current.data)) {
      queue.push(...current.data);
      continue;
    }

    if (isRecord(current) && "documentId" in current && typeof current.documentId === "string") {
      const docId = current.documentId.trim();
      if (isLikelyDocIdString(docId)) {
        documentIds.push(docId);
        continue;
      }
    }

    if (isRecord(current) && "id" in current) {
      const numeric = toNumberOrNull(current.id);
      if (numeric !== null) {
        numericIds.push(numeric);
        continue;
      }
    }

    if (typeof current === "string") {
      if (isLikelyDocIdString(current)) {
        documentIds.push(current.trim());
      } else {
        const numeric = toNumberOrNull(current);
        if (numeric !== null) numericIds.push(numeric);
      }
      continue;
    }

    const numeric = toNumberOrNull(current);
    if (numeric !== null) {
      numericIds.push(numeric);
    }
  }

  if (documentIds.length > 0 && numericIds.length === 0) {
    return { connect: documentIds.map((documentId) => ({ documentId })) };
  }

  if (numericIds.length > 0 && documentIds.length === 0) {
    return numericIds;
  }

  if (documentIds.length > 0) {
    return { connect: documentIds.map((documentId) => ({ documentId })) };
  }

  return undefined;
}

export function mapIngredientFromStrapi(entry: unknown): IngredientType | null {
  if (!isRecord(entry)) return null;
  const attributes = isRecord(entry.attributes) ? entry.attributes : entry;

  const idValue = "id" in entry ? entry.id : attributes.id;
  const id = normalizeNumber(idValue);

  const docIdSource = attributes.documentId ?? entry.documentId;
  const documentId = typeof docIdSource === "string" && docIdSource.trim() !== ""
    ? docIdSource.trim()
    : id
    ? String(id)
    : null;
  if (!documentId) return null;

  const ingredienteName = typeof attributes.ingredienteName === "string"
    ? attributes.ingredienteName
    : typeof attributes.name === "string"
    ? attributes.name
    : "";

  const unidadMedida = typeof attributes.unidadMedida === "string"
    ? attributes.unidadMedida
    : typeof attributes.unit === "string"
    ? attributes.unit
    : "";

  const stockUpdatedAt = typeof attributes.stockUpdatedAt === "string"
    ? attributes.stockUpdatedAt
    : typeof attributes.stock_updated_at === "string"
    ? attributes.stock_updated_at
    : null;

  return {
    id,
    documentId,
    ingredienteName,
    stock: normalizeNumber(attributes.stock),
    unidadMedida,
    precio: normalizeNumber(attributes.precio ?? attributes.price),
    stockUpdatedAt,
  };
}

export function mapSupplierFromStrapi(entry: unknown): SupplierType | null {
  if (!isRecord(entry)) return null;
  const attributes = isRecord(entry.attributes) ? entry.attributes : entry;

  const idValue = "id" in entry ? entry.id : attributes.id;
  const id = typeof idValue === "number" ? idValue : normalizeNumber(idValue);

  const docIdSource = attributes.documentId ?? entry.documentId;
  if (typeof docIdSource !== "string" || docIdSource.trim() === "") {
    return null;
  }
  const documentId = docIdSource.trim();

  const rawIngredientes = extractRelationArray(attributes.ingredientes ?? entry.ingredientes);
  const ingredientes = rawIngredientes
    .map((item) => mapIngredientFromStrapi(item))
    .filter((item): item is IngredientType => Boolean(item));

  const phoneValue = attributes.phone ?? entry.phone;
  const phone =
    typeof phoneValue === "string"
      ? phoneValue.trim() === "" ? null : phoneValue.trim()
      : phoneValue != null
      ? String(phoneValue)
      : null;

  const activeValue = attributes.active ?? entry.active;
  const active = typeof activeValue === "boolean" ? activeValue : null;

  return {
    id,
    documentId,
    name: typeof attributes.name === "string" ? attributes.name : "",
    phone,
    active,
    ingredientes,
    ingredient_supplier_prices: [],
  };
}

export async function fetchActiveSupplierCount(): Promise<number> {
  try {
    const params = new URLSearchParams();
    params.set("filters[active][$eq]", "true");
    params.set("pagination[page]", "1");
    params.set("pagination[pageSize]", "1");
    params.set("fields[0]", "id");

    const res = await strapiFetch(`/api/suppliers?${params.toString()}`);
    let json: UnknownRecord = {};
    try {
      json = (await res.json()) as UnknownRecord;
    } catch (error) {
      const err = error instanceof Error ? error : new Error(String(error));
      throw err;
    }

    if (!res.ok) {
      throw new Error(JSON.stringify(json));
    }

    const meta = isRecord(json.meta) ? (json.meta as UnknownRecord) : {};
    const pagination = isRecord(meta.pagination) ? (meta.pagination as UnknownRecord) : {};
    const total = toNumberOrNull(pagination.total) ?? 0;
    return total;
  } catch (error) {
    console.error("[admin/suppliers] fetchActiveSupplierCount error", error);
    throw error;
  }
}

export function sanitizeSupplierPayload(raw: unknown): Record<string, unknown> {
  const wrapper = isRecord(raw) ? raw : {};
  const inner = isRecord(wrapper.data) ? wrapper.data : wrapper;
  const sanitized: Record<string, unknown> = { ...inner };

  delete sanitized.id;
  delete sanitized.documentId;
  delete sanitized.createdAt;
  delete sanitized.updatedAt;
  delete sanitized.publishedAt;

  const nameValue = sanitized.name;
  if (typeof nameValue === "string") {
    sanitized.name = nameValue.trim();
  }
  if (typeof sanitized.name !== "string" || sanitized.name === "") {
    throw new Error("El nombre es obligatorio");
  }

  const phoneValue = sanitized.phone;
  if (typeof phoneValue === "string") {
    const trimmed = phoneValue.trim();
    sanitized.phone = trimmed === "" ? null : trimmed;
  }

  const activeValue = sanitized.active;
  if (activeValue === undefined || activeValue === null) {
    sanitized.active = true;
  } else if (typeof activeValue !== "boolean") {
    sanitized.active = Boolean(activeValue);
  }

  const normalizedIngredients = normalizeManyRelation(sanitized.ingredientes);
  if (normalizedIngredients !== undefined) {
    sanitized.ingredientes = normalizedIngredients;
  } else {
    delete sanitized.ingredientes;
  }

  delete sanitized.ingredient_supplier_prices;

  return sanitized;
}