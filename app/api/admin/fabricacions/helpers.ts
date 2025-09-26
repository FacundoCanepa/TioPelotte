import {
  FabricacionDoc,
  FabricacionListMeta,
  FabricacionPayload,
  FabricacionPayloadLine,
  FabricacionSnapshot,
  IngredienteLite,
  ProductLite,
} from '@/types/fabricacion';
import { strapiFetch } from '../suppliers/strapi-helpers';

export type UnknownRecord = Record<string, unknown>;

export type StrapiResponse<T = unknown> = {
  data?: T;
  meta?: UnknownRecord;
};

function isRecord(value: unknown): value is UnknownRecord {
  return typeof value === 'object' && value !== null;
}

function toNumber(value: unknown, fallback = 0): number {
  if (value === null || value === undefined) return fallback;
  const num = Number(value);
  return Number.isFinite(num) ? num : fallback;
}

function toNullableNumber(value: unknown): number | null {
  if (value === null || value === undefined) return null;
  if (typeof value === 'string' && value.trim() === '') return null;
  const num = Number(value);
  return Number.isFinite(num) ? num : null;
}

function toStringValue(value: unknown): string {
  if (typeof value === 'string') return value;
  if (value === null || value === undefined) return '';
  return String(value);
}

function toPositiveNumber(value: unknown, fallback = 0): number {
  const num = Number(value);
  if (!Number.isFinite(num)) return fallback;
  return num < 0 ? fallback : num;
}

function toDateOrNull(value: unknown): string | null {
  if (!value) return null;
  if (typeof value === 'string') {
    const trimmed = value.trim();
    if (!trimmed) return null;
    const date = new Date(trimmed);
    return Number.isNaN(date.getTime()) ? trimmed : date.toISOString();
  }
  if (value instanceof Date) return value.toISOString();
  return null;
}

function unwrapData(node: unknown): UnknownRecord | null {
  if (!isRecord(node)) return null;
  if (isRecord(node.data)) return node.data as UnknownRecord;
  return node as UnknownRecord;
}

function getAttributes(node: unknown): UnknownRecord | null {
  const base = unwrapData(node);
  if (!base) return null;
  if (isRecord(base.attributes)) return { ...base.attributes, id: base.id ?? (base.attributes as UnknownRecord).id };
  return base;
}

function mapProductLite(node: unknown): ProductLite | null {
  const attrs = getAttributes(node);
  if (!attrs) return null;
  const id = toNumber(attrs.id, 0);
  if (!id) return null;
  const documentId = typeof attrs.documentId === 'string' ? attrs.documentId : undefined;
  const productName = typeof attrs.productName === 'string' ? attrs.productName : typeof attrs.nombre === 'string' ? attrs.nombre : '';
  const slug = typeof attrs.slug === 'string' ? attrs.slug : undefined;
  const price = toNullableNumber(attrs.price ?? attrs.precio);
  return { id, documentId, productName, slug, price };
}

function mapIngredientLite(node: unknown): IngredienteLite | null {
  const attrs = getAttributes(node);
  if (!attrs) return null;
  const id = toNumber(attrs.id, 0);
  if (!id) return null;
  const documentId = typeof attrs.documentId === 'string' ? attrs.documentId : undefined;
  const ingredienteName =
    typeof attrs.ingredienteName === 'string'
      ? attrs.ingredienteName
      : typeof attrs.nombre === 'string'
      ? attrs.nombre
      : typeof attrs.name === 'string'
      ? attrs.name
      : '';
  const unidadMedida = typeof attrs.unidadMedida === 'string' ? attrs.unidadMedida : undefined;
  const price = toNullableNumber(attrs.precio ?? attrs.price);
  return { id, documentId, ingredienteName, unidadMedida, price };
}

function mapLine(node: unknown) {
  if (!isRecord(node)) return null;
  const ingredient = mapIngredientLite(node.ingredient);
  const cantidad = toNumber(node.cantidad, 0);
  const unidad = toStringValue(node.unidad).trim();
  if (!unidad) return null;
  const mermaPct = toNullableNumber(node.mermaPct);
  const nota = typeof node.nota === 'string' ? node.nota : null;
  const idRaw = toNullableNumber(node.id);
  return {
    id: idRaw ?? undefined,
    ingredient,
    cantidad,
    unidad,
    mermaPct,
    nota,
  };
}

function mapSnapshot(attrs: UnknownRecord): FabricacionSnapshot {
  return {
    ingredientesCostoTotal: toNullableNumber(attrs.ingredientesCostoTotal),
    costoTotalBatch: toNullableNumber(attrs.costoTotalBatch),
    costoUnitario: toNullableNumber(attrs.costoUnitario),
    precioSugerido: toNullableNumber(attrs.precioSugerido),
    margenRealPct: toNullableNumber(attrs.margenRealPct),
    lastCalculatedAt: toDateOrNull(attrs.lastCalculatedAt),
  };
}

export function mapFabricacionFromStrapi(entry: unknown): FabricacionDoc | null {
  const attrs = getAttributes(entry);
  if (!attrs) return null;
  const id = toNumber(attrs.id, 0);
  if (!id) return null;
  const documentId = typeof attrs.documentId === 'string' ? attrs.documentId : undefined;
  const nombre = typeof attrs.nombre === 'string' ? attrs.nombre : '';
  const batchSize = Math.max(1, toNumber(attrs.batchSize, 1));
  const mermaPct = toNullableNumber(attrs.mermaPct);
  const costoManoObra = toNullableNumber(attrs.costoManoObra);
  const costoEmpaque = toNullableNumber(attrs.costoEmpaque);
  const overheadPct = toNullableNumber(attrs.overheadPct);
  const margenObjetivoPct = toNullableNumber(attrs.margenObjetivoPct);
  const updatedAt = toDateOrNull(attrs.updatedAt);
  const publishedAt = toDateOrNull(attrs.publishedAt);
  const createdAt = toDateOrNull(attrs.createdAt);

  const lineasSource = Array.isArray(attrs.lineas)
    ? attrs.lineas
    : isRecord(attrs.lineas) && Array.isArray((attrs.lineas as UnknownRecord).data)
    ? ((attrs.lineas as UnknownRecord).data as unknown[])
    : [];
  const lineas = lineasSource
    .map((line) => mapLine(line))
    .filter((line): line is NonNullable<ReturnType<typeof mapLine>> => Boolean(line));

  const snapshots = mapSnapshot(attrs);
  const lastCalculatedAt = snapshots.lastCalculatedAt ? new Date(snapshots.lastCalculatedAt) : null;
  const updatedDate = updatedAt ? new Date(updatedAt) : null;
  const needsRecalculation = !lastCalculatedAt || (updatedDate && lastCalculatedAt && updatedDate > lastCalculatedAt);

  return {
    id,
    documentId,
    nombre,
    product: mapProductLite(attrs.product),
    batchSize,
    mermaPct,
    costoManoObra,
    costoEmpaque,
    overheadPct,
    margenObjetivoPct,
    lineas,
    snapshots,
    updatedAt,
    publishedAt,
    createdAt,
    needsRecalculation,
  };
}

export function extractMeta(meta: UnknownRecord | undefined): FabricacionListMeta {
  const pagination = isRecord(meta?.pagination) ? (meta!.pagination as UnknownRecord) : {};
  return {
    page: toNumber(pagination.page, 1),
    pageSize: toNumber(pagination.pageSize, 10),
    pageCount: toNumber(pagination.pageCount, 1),
    total: toNumber(pagination.total, 0),
  };
}

export function buildListPath(searchParams: URLSearchParams) {
  const page = Number(searchParams.get('page') || '1');
  const pageSize = Number(searchParams.get('pageSize') || '10');
  const search = (searchParams.get('search') || '').trim();
  const status = (searchParams.get('status') || 'all') as 'all' | 'draft' | 'published';
  const productId = (searchParams.get('productId') || '').trim();

  const sp = new URLSearchParams();
  sp.set('populate[0]', 'product');
  sp.set('populate[1]', 'lineas.ingredient');
  sp.set('pagination[page]', String(page));
  sp.set('pagination[pageSize]', String(pageSize));
  sp.set('sort[0]', 'updatedAt:desc');

  if (search) sp.set('filters[nombre][$containsi]', search);
  if (productId) sp.set('filters[product][id][$eq]', productId);
  if (status === 'draft') sp.set('filters[publishedAt][$null]', 'true');
  if (status === 'published') sp.set('filters[publishedAt][$notNull]', 'true');

  return `/api/fabricacions?${sp.toString()}`;
}

function cleanUndefined<T extends UnknownRecord>(data: T): T {
  const entries = Object.entries(data).filter(([, value]) => value !== undefined);
  return Object.fromEntries(entries) as T;
}

export function toStrapiPayload(payload: FabricacionPayload) {
  const base = {
    nombre: payload.nombre,
    batchSize: payload.batchSize,
    mermaPct: payload.mermaPct ?? 0,
    costoManoObra: payload.costoManoObra ?? 0,
    costoEmpaque: payload.costoEmpaque ?? 0,
    overheadPct: payload.overheadPct ?? 0,
    margenObjetivoPct: payload.margenObjetivoPct ?? 0,
    product: payload.productId ?? null,
    lineas: payload.lineas.map((line) =>
      cleanUndefined({
        id: line.id,
        ingredient: line.ingredientId ?? null,
        cantidad: line.cantidad,
        unidad: line.unidad,
        mermaPct: line.mermaPct ?? 0,
        nota: line.nota ?? null,
      }),
    ),
  };
  return cleanUndefined(base);
}

export async function fetchFabricacionFromStrapi(path: string) {
  const res = await strapiFetch(path);
  const json = (await res.json()) as StrapiResponse;
  return { res, json };
}

function ensureLinePayload(line: FabricacionPayloadLine, index: number): FabricacionPayloadLine {
  if (!line.ingredientId || line.ingredientId <= 0) {
    throw new Error(`La línea ${index + 1} debe tener un ingrediente`);
  }
  if (!Number.isFinite(line.cantidad) || line.cantidad <= 0) {
    throw new Error(`La línea ${index + 1} debe tener una cantidad válida`);
  }
  if (!line.unidad || line.unidad.trim() === '') {
    throw new Error(`La línea ${index + 1} debe tener una unidad`);
  }
  const normalized: FabricacionPayloadLine = {
    id: line.id,
    ingredientId: line.ingredientId,
    cantidad: Math.max(0, Number(line.cantidad)),
    unidad: line.unidad.trim(),
    mermaPct:
      line.mermaPct === null || line.mermaPct === undefined
        ? 0
        : Math.max(0, Number(line.mermaPct)),
    nota: line.nota?.trim() ? line.nota.trim() : null,
  };
  return normalized;
}

export function sanitizeFabricacionPayload(input: unknown): FabricacionPayload {
  if (!isRecord(input)) {
    throw new Error('Datos de fabricación inválidos');
  }
  const nombre = toStringValue(input.nombre).trim();
  if (!nombre) throw new Error('El nombre es obligatorio');

  const batchSizeRaw = Number(input.batchSize ?? 1);
  const batchSize = Number.isFinite(batchSizeRaw) && batchSizeRaw >= 1 ? batchSizeRaw : 1;

  const productIdValue = input.productId;
  const productId =
    productIdValue === null || productIdValue === undefined
      ? null
      : toPositiveNumber(productIdValue, 0) || null;

  const mermaPct = input.mermaPct === undefined ? undefined : Math.max(0, Number(input.mermaPct) || 0);
  const costoManoObra = input.costoManoObra === undefined ? undefined : Math.max(0, Number(input.costoManoObra) || 0);
  const costoEmpaque = input.costoEmpaque === undefined ? undefined : Math.max(0, Number(input.costoEmpaque) || 0);
  const overheadPct = input.overheadPct === undefined ? undefined : Math.max(0, Number(input.overheadPct) || 0);
  const margenObjetivoPct =
    input.margenObjetivoPct === undefined ? undefined : Math.max(0, Number(input.margenObjetivoPct) || 0);

  const lineasInput = Array.isArray(input.lineas) ? input.lineas : [];
  if (!lineasInput.length) {
    throw new Error('Debe ingresar al menos una línea de ingrediente');
  }

  const lineas = lineasInput.map((line, index) => {
    if (!isRecord(line)) {
      throw new Error(`Línea ${index + 1} inválida`);
    }
    const ingredientId = toPositiveNumber(line.ingredientId ?? (line.ingredient as UnknownRecord)?.id, 0);
    const cantidad = Number(line.cantidad);
    const unidad = toStringValue(line.unidad).trim();
    const merma = line.mermaPct === undefined ? undefined : Number(line.mermaPct);
    const nota = typeof line.nota === 'string' ? line.nota : null;
    const payloadLine: FabricacionPayloadLine = {
      id: toNullableNumber(line.id) ?? undefined,
      ingredientId,
      cantidad,
      unidad,
      mermaPct: merma ?? undefined,
      nota,
    };
    return ensureLinePayload(payloadLine, index);
  });

  return {
    nombre,
    productId,
    batchSize,
    mermaPct,
    costoManoObra,
    costoEmpaque,
    overheadPct,
    margenObjetivoPct,
    lineas,
  };
}
