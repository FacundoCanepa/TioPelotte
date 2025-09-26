
type UnidadBase = "kg" | "l" | "unidad";
type SupportedMassUnit = "mg" | "g" | "kg";
type SupportedVolumeUnit = "ml" | "l";
type SupportedCountUnit = "unidad" | "docena";
type SupportedUnit = SupportedMassUnit | SupportedVolumeUnit | SupportedCountUnit;

const MASS_UNITS: SupportedMassUnit[] = ["mg", "g", "kg"];
const VOLUME_UNITS: SupportedVolumeUnit[] = ["ml", "l"];
const COUNT_UNITS: SupportedCountUnit[] = ["unidad", "docena"];

const SUPPORTED_UNITS: SupportedUnit[] = [...MASS_UNITS, ...VOLUME_UNITS, ...COUNT_UNITS];

const CONVERSION_FACTORS: Record<SupportedUnit, number> = {
  // Masa (a kg)
  mg: 1 / 1_000_000,
  g: 1 / 1_000,
  kg: 1,
  // Volumen (a l)
  ml: 1 / 1_000,
  l: 1,
  // Conteo (a unidad)
  unidad: 1,
  docena: 12,
};

/**
 * Determina la unidad base para una unidad de medida dada.
 * @param unidadMedida La unidad de medida (ej. "kg", "g", "l").
 * @returns La unidad base ("kg", "l", "unidad") or null si no es soportada.
 */
export function getUnidadBase(unidadMedida: string): UnidadBase | null {
  const unit = unidadMedida.toLowerCase().trim();
  if (MASS_UNITS.includes(unit as SupportedMassUnit)) {
    return "kg";
  }
  if (VOLUME_UNITS.includes(unit as SupportedVolumeUnit)) {
    return "l";
  }
  if (COUNT_UNITS.includes(unit as SupportedCountUnit)) {
    return "unidad";
  }
  return null;
}

/**
 * Convierte una cantidad a su unidad base.
 * @param cantidad La cantidad a convertir.
 * @param unidadMedida La unidad de medida de la cantidad.
 * @returns La cantidad convertida a la unidad base, o null si la unidad no es soportada.
 */
export function toUnidadBase(cantidad: number, unidadMedida: string): number | null {
  const unit = unidadMedida.toLowerCase().trim() as SupportedUnit;
  if (!SUPPORTED_UNITS.includes(unit)) {
    return null;
  }
  if (typeof cantidad !== 'number' || !Number.isFinite(cantidad)) {
      return null;
  }
  const factor = CONVERSION_FACTORS[unit];
  return cantidad * factor;
}

/**
 * Calcula el precio unitario normalizado a la unidad base.
 * @param price El precio total del paquete.
 * @param quantityNeto La cantidad neta en el paquete.
 * @param unidadMedida La unidad de medida del paquete.
 * @returns Un objeto con el valor del precio unitario y la unidad base, o null si no se puede calcular.
 */
export function computePrecioUnitarioBase(
  price: number,
  quantityNeto: number,
  unidadMedida: string
): { value: number | null; unidadBase: UnidadBase | null } {
  const unidadBase = getUnidadBase(unidadMedida);
  if (price <= 0 || quantityNeto <= 0) {
    return { value: null, unidadBase };
  }

  const cantidadEnUnidadBase = toUnidadBase(quantityNeto, unidadMedida);

  if (cantidadEnUnidadBase === null || cantidadEnUnidadBase <= 0) {
    return { value: null, unidadBase };
  }

  const value = price / cantidadEnUnidadBase;
  return { value, unidadBase };
}

/**
 * Formatea un valor de precio unitario para mostrar en la UI.
 * @param value El valor numérico del precio.
 * @param unidadBase La unidad base ("kg", "l", "unidad").
 * @param currency La moneda a usar (default: "ARS").
 * @returns El precio formateado como string.
 */
export function formatPrecioUnitario(
  value: number,
  unidadBase: UnidadBase,
  currency = "ARS"
): string {
  const formatter = new Intl.NumberFormat("es-AR", {
    style: "currency",
    currency,
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  });

  const formattedPrice = formatter.format(value);
  return `≈ ${formattedPrice} por ${unidadBase}`;
}
