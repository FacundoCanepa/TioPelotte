import { IngredientType } from "@/types/ingredient";
import { SupplierType } from "@/types/supplier";
import { IngredientSupplierPrice } from "@/types/ingredient-supplier-price";
import { Category } from "@/types/categoria_ingrediente";
import { computePrecioUnitarioBase, getUnidadBase } from "@/lib/pricing/normalize";

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

function normalizeEntity<T extends UnknownRecord>(entry: unknown): T | null {
  if (!isRecord(entry)) return null;
  const entity = isRecord(entry.data) ? (entry.data as UnknownRecord) : entry;
  if (!isRecord(entity)) return null;
  return entity as T;
}

export function mapCategoryFromStrapi(node: unknown): Category | undefined {
  const entry = normalizeEntity(node);
  if (!entry) return undefined;
  const attributes = isRecord(entry.attributes) ? entry.attributes : entry;

  const idValue = "id" in entry ? entry.id : attributes.id;
  const id = normalizeNumber(idValue);

  const docSource = attributes.documentId ?? entry.documentId;
  const documentId = typeof docSource === "string" && docSource.trim() !== ""
    ? docSource.trim()
    : id
    ? String(id)
    : "";

  const nombre = typeof attributes.nombre === "string"
    ? attributes.nombre
    : typeof attributes.name === "string"
    ? attributes.name
    : "";

  const description = typeof attributes.description === "string"
    ? attributes.description
    : typeof attributes.descripcion === "string"
    ? attributes.descripcion
    : undefined;

  return {
    id,
    documentId,
    nombre,
    description,
    ingredientes: [],
    ingredient_supplier_prices: [],
  };
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

  const quantityNetoValue = attributes.quantityNeto ?? attributes.quantity_neto;
  const quantityNeto = toNumberOrNull(quantityNetoValue);

    const rawCategory = attributes.categoria_ingrediente ?? entry.categoria_ingrediente;
    const categoria_ingrediente = mapCategoryFromStrapi(rawCategory);
  
    const ingredient: IngredientType = {
    id,
    documentId,
    ingredienteName,
    Stock: normalizeNumber(attributes.Stock),
    unidadMedida,
    quantityNeto,
    precio: normalizeNumber(attributes.precio ?? attributes.price),
    stockUpdatedAt,
    categoria_ingrediente: categoria_ingrediente ?? (undefined as unknown as Category)
  };
  return ingredient;
}

function mapSupplierEntity(entry: unknown, options: { includePrices: boolean }): SupplierType | null {
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

  const supplierBase: SupplierType = {
    id,
    documentId,
    name: typeof attributes.name === "string" ? attributes.name : "",
    phone,
    active,
    ingredientes,
    ingredient_supplier_prices: [],
  };
  const supplier: SupplierType = { ...supplierBase };

  const rawPrices = extractRelationArray(attributes.ingredient_supplier_prices ?? entry.ingredient_supplier_prices);
  const ingredient_supplier_prices = options.includePrices
    ? rawPrices
        .map((item) => mapPriceInternal(item, { includeSupplier: false }))
        .filter((item): item is IngredientSupplierPrice => Boolean(item))
        .map((price) => ({ ...price, supplier }))
    : [];

  supplier.ingredient_supplier_prices = ingredient_supplier_prices;

  return supplier;
}

export function mapSupplierFromStrapi(entry: unknown): SupplierType | null {
  return mapSupplierEntity(entry, { includePrices: true });
}

function mapSupplierForPrice(entry: unknown): SupplierType | null {
  return mapSupplierEntity(entry, { includePrices: false });
}

function mapPriceInternal(
  entry: unknown,
  options: { includeSupplier: boolean }
): IngredientSupplierPrice | null {
  const normalized = normalizeEntity(entry);
  if (!normalized) return null;
  const attributes = isRecord(normalized.attributes) ? normalized.attributes : normalized;

  const idValue = "id" in normalized ? normalized.id : attributes.id;
  const id = normalizeNumber(idValue);

  const ingredientNode = attributes.ingrediente ?? normalized.ingrediente ?? attributes.ingredient ?? normalized.ingredient;
  const ingrediente = mapIngredientFromStrapi(ingredientNode);

  const supplierNode = attributes.supplier ?? normalized.supplier;
  const supplier = options.includeSupplier ? mapSupplierForPrice(supplierNode) : null;

  const categoriaNode = attributes.categoria_ingrediente ?? normalized.categoria_ingrediente;
  const categoria_ingrediente = mapCategoryFromStrapi(categoriaNode);

  if (!ingrediente) return null;

  const rawQuantity = attributes.quantityNeto ?? attributes.quantity_neto;
  const quantityNeto = toNumberOrNull(rawQuantity);
  const unitPrice = normalizeNumber(attributes.unitPrice ?? attributes.price);
  const unitFromAttributes = typeof attributes.unit === "string" ? attributes.unit : "";
  const trimmedUnit = unitFromAttributes.trim();
  const fallbackUnit = ingrediente?.unidadMedida?.trim?.() ?? "";
  const resolvedUnit = trimmedUnit || fallbackUnit;

  const ingredientQuantity = toNumberOrNull(ingrediente?.quantityNeto);
  const quantityForNormalization = quantityNeto !== null ? quantityNeto : ingredientQuantity;

  const { value: precioUnitarioBase, unidadBase } =
    quantityForNormalization !== null && resolvedUnit
      ? computePrecioUnitarioBase(unitPrice, quantityForNormalization, resolvedUnit)
      : { value: null, unidadBase: getUnidadBase(resolvedUnit) };

  const base: IngredientSupplierPrice = {
    id,
    ingrediente,
    supplier: supplier ?? {
      id: 0,
      documentId: "",
      name: "",
      phone: null,
      active: null,
      ingredientes: [],
      ingredient_supplier_prices: [],
    },
    unitPrice,
    currency: typeof attributes.currency === "string" ? attributes.currency : "",
    unit: resolvedUnit,
    quantityNeto,
    minOrderQty: normalizeNumber(attributes.minOrderQty ?? attributes.min_order_qty),
    validFrom: typeof attributes.validFrom === "string" ? attributes.validFrom : "",
    categoria_ingrediente: categoria_ingrediente ?? (undefined as unknown as Category),
    precioUnitarioBase,
    unidadBase,
  };
  return categoria_ingrediente ? { ...base, categoria_ingrediente } : base;
}

export function mapPriceFromStrapi(entry: unknown): IngredientSupplierPrice | null {
  return mapPriceInternal(entry, { includeSupplier: true });
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