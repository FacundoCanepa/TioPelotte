export type BaseUnidad = "kg" | "l" | "unidad";

type ConversionEntry = {
  base: BaseUnidad;
  convert: (cantidad: number) => number;
};

const UNIT_CONVERSIONS: Record<string, ConversionEntry> = {
  mg: { base: "kg", convert: (cantidad) => cantidad / 1_000_000 },
  g: { base: "kg", convert: (cantidad) => cantidad / 1_000 },
  gr: { base: "kg", convert: (cantidad) => cantidad / 1_000 },
  kilogramo: { base: "kg", convert: (cantidad) => cantidad },
  kilogramos: { base: "kg", convert: (cantidad) => cantidad },
  kg: { base: "kg", convert: (cantidad) => cantidad },
  ml: { base: "l", convert: (cantidad) => cantidad / 1_000 },
  litro: { base: "l", convert: (cantidad) => cantidad },
  litros: { base: "l", convert: (cantidad) => cantidad },
  l: { base: "l", convert: (cantidad) => cantidad },
  unidad: { base: "unidad", convert: (cantidad) => cantidad },
  unidades: { base: "unidad", convert: (cantidad) => cantidad },
  docena: { base: "unidad", convert: (cantidad) => cantidad * 12 },
  docenas: { base: "unidad", convert: (cantidad) => cantidad * 12 },
};

function normalizeUnitKey(unidadMedida: string | null | undefined) {
  return unidadMedida?.trim().toLowerCase() ?? "";
}

export function getUnidadBase(unidadMedida: string | null | undefined): BaseUnidad | null {
  const key = normalizeUnitKey(unidadMedida);
  if (!key) return null;
  return UNIT_CONVERSIONS[key]?.base ?? null;
}

export function toUnidadBase(
  cantidad: number,
  unidadMedida: string | null | undefined
): number | null {
  if (!Number.isFinite(cantidad) || cantidad <= 0) {
    return null;
  }
  const key = normalizeUnitKey(unidadMedida);
  const entry = UNIT_CONVERSIONS[key];
  if (!entry) return null;
  return entry.convert(cantidad);
}

export function computePrecioUnitarioBase(
  price: number,
  quantityNeto: number,
  unidadMedida: string | null | undefined
): { value: number | null; unidadBase: BaseUnidad | null } {
  const unidadBase = getUnidadBase(unidadMedida);
  if (!Number.isFinite(price) || price <= 0) {
    return { value: null, unidadBase };
  }
  const cantidadBase = toUnidadBase(quantityNeto, unidadMedida);
  if (!Number.isFinite(cantidadBase) || cantidadBase === null || cantidadBase <= 0) {
    return { value: null, unidadBase };
  }
  const value = price / cantidadBase;
  if (!Number.isFinite(value) || value <= 0) {
    return { value: null, unidadBase };
  }
  return { value, unidadBase };
}

export function formatPrecioUnitario(
  value: number,
  unidadBase: BaseUnidad,
  currency = "ARS"
): string {
  const formatter = new Intl.NumberFormat("es-AR", {
    style: "currency",
    currency: currency?.toUpperCase?.() || "ARS",
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  });
  return `${formatter.format(value)} / ${unidadBase}`;
}

export function isUnidadSoportada(unidadMedida: string | null | undefined): boolean {
  const key = normalizeUnitKey(unidadMedida);
  return Boolean(key && UNIT_CONVERSIONS[key]);
}

export const SUPPORTED_UNITS = Object.freeze(Object.keys(UNIT_CONVERSIONS));
