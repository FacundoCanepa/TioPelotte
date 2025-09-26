import { computePrecioUnitarioBase, getUnidadBase, toUnidadBase } from "../pricing/normalize";

export type BaseUnit = "kg" | "l" | "unidad";
export type QtyUnit = "kg" | "g" | "mg" | "l" | "ml" | "unidad" | "unidades" | string;

export type SupplierUnitPrice = {
  optionId?: string | number | null;
  supplierId?: string | number | null;
  supplierName?: string | null;
  label?: string | null;
  currency?: string | null;
  price: number;
  quantity: number;
  unit: QtyUnit;
  unitPriceBase: number | null;
  baseUnit: BaseUnit | null;
};

export type IngredientPricing = {
  ingredientId: string;
  ingredientName?: string | null;
  baseUnit: BaseUnit;
  options: SupplierUnitPrice[];
  selectedIndex?: number | null;
};

export type FabricacionLinea = {
  lineaId?: string | number | null;
  ingredientId: string;
  ingredientName?: string | null;
  quantity: number;
  unit: QtyUnit;
  mermaPct: number;
};

export type FabricacionParams = {
  fabricacionId: string;
  nombre: string;
  batchSize: number;
  mermaPctGlobal: number;
  costoManoObra: number;
  costoEmpaque: number;
  overheadPct: number;
  margenObjetivoPct: number;
  precioVentaActual?: number | null;
  lineas: FabricacionLinea[];
};

export type FabricacionCalculoLinea = {
  lineaId?: string | number | null;
  ingredientId: string;
  ingredientName?: string | null;
  quantityOriginal: number;
  quantityOriginalUnit: QtyUnit;
  quantityBase: number;
  quantityBaseConMerma: number;
  baseUnit: BaseUnit;
  mermaPct: number;
  unitPriceBase: number;
  costoTotal: number;
  supplier?: SupplierUnitPrice | null;
};

export type FabricacionResultado = {
  fabricacionId: string;
  nombre: string;
  batchSize: number;
  baseUnitarioPromedio?: number;
  costoIngredientes: number;
  costoIngredientesMermaGlobal: number;
  costoManoObra: number;
  costoEmpaque: number;
  overheadPct: number;
  overheadMonto: number;
  costoTotalLote: number;
  costoUnitario: number;
  precioSugeridoUnitario: number;
  margenObjetivoPct: number;
  margenEstimadoPct: number | null;
  lineas: FabricacionCalculoLinea[];
};

const KG_IN_G = 1_000;
const KG_IN_MG = 1_000_000;
const L_IN_ML = 1_000;

export function gramosAKilos(value: number): number {
  return value / KG_IN_G;
}

export function kilosAGramos(value: number): number {
  return value * KG_IN_G;
}

export function mililitrosALitros(value: number): number {
  return value / L_IN_ML;
}

export function litrosAMililitros(value: number): number {
  return value * L_IN_ML;
}

function clamp(value: number, min: number, max: number): number {
  if (Number.isNaN(value)) return min;
  if (value < min) return min;
  if (value > max) return max;
  return value;
}

function round2(value: number): number {
  return Math.round((Number.isFinite(value) ? value : 0) * 100) / 100;
}

function normalizarBaseUnit(unit: QtyUnit | null | undefined, fallback: BaseUnit): BaseUnit {
  const base = typeof unit === "string" ? getUnidadBase(unit) : null;
  return base ?? fallback;
}

function getIngredientBaseUnit(pricing?: IngredientPricing): BaseUnit | null {
  if (!pricing) return null;
  if (pricing.baseUnit) return pricing.baseUnit;
  const optionWithBase = pricing.options.find((option) => option.baseUnit);
  return optionWithBase?.baseUnit ?? null;
}

function computeOptionUnitPriceBase(option: SupplierUnitPrice, baseUnit: BaseUnit): number | null {
  if (!Number.isFinite(option?.price) || !Number.isFinite(option?.quantity)) {
    return null;
  }

  const normalized = computePrecioUnitarioBase(option.price, option.quantity, option.unit);
  if (normalized.unidadBase && normalized.unidadBase !== baseUnit) {
    return null;
  }
  if (normalized.value && Number.isFinite(normalized.value) && normalized.value > 0) {
    return normalized.value;
  }

  const cantidadBase = toUnidadBase(option.quantity, option.unit);
  if (!cantidadBase || cantidadBase <= 0) {
    return null;
  }
  const value = option.price / cantidadBase;
  return Number.isFinite(value) && value > 0 ? value : null;
}

function pickSupplierOption(pricing: IngredientPricing): SupplierUnitPrice | null {
  const baseUnit = getIngredientBaseUnit(pricing);
  if (!baseUnit) return null;

  const optionsWithUnitPrice = pricing.options.map((option) => {
    const unitPriceBase =
      Number.isFinite(option.unitPriceBase) && (option.unitPriceBase ?? 0) > 0
        ? option.unitPriceBase
        : computeOptionUnitPriceBase(option, baseUnit);
    return {
      ...option,
      baseUnit,
      unitPriceBase: unitPriceBase ?? null,
    } satisfies SupplierUnitPrice;
  });

  const selectedIndex = pricing.selectedIndex;
  if (
    typeof selectedIndex === "number" &&
    selectedIndex >= 0 &&
    selectedIndex < optionsWithUnitPrice.length
  ) {
    const selected = optionsWithUnitPrice[selectedIndex];
    if (selected?.unitPriceBase && selected.unitPriceBase > 0) {
      return selected;
    }
  }

  const cheapest = optionsWithUnitPrice
    .filter((option) => Number.isFinite(option.unitPriceBase) && (option.unitPriceBase ?? 0) > 0)
    .reduce<SupplierUnitPrice | null>((acc, option) => {
      if (!option.unitPriceBase || option.unitPriceBase <= 0) return acc;
      if (!acc || (acc.unitPriceBase ?? Number.POSITIVE_INFINITY) > option.unitPriceBase) {
        return option;
      }
      return acc;
    }, null);

  return cheapest;
}

function quantityToBase(quantity: number, unit: QtyUnit, baseUnit: BaseUnit): number | null {
  if (!Number.isFinite(quantity) || quantity < 0) return null;

  if (unit === baseUnit) {
    return quantity;
  }

  const normalized = toUnidadBase(quantity, unit);
  if (normalized !== null && Number.isFinite(normalized)) {
    const normalizedBase = getUnidadBase(unit);
    if (normalizedBase && normalizedBase === baseUnit) {
      return normalized;
    }
  }

  const unitKey = typeof unit === "string" ? unit.trim().toLowerCase() : "";
  switch (baseUnit) {
    case "kg": {
      if (unitKey === "g" || unitKey === "gramo" || unitKey === "gr" || unitKey === "gramos") {
        return gramosAKilos(quantity);
      }
      if (unitKey === "mg" || unitKey === "miligramo" || unitKey === "miligramos") {
        return quantity / KG_IN_MG;
      }
      if (unitKey === "kg") return quantity;
      break;
    }
    case "l": {
      if (unitKey === "ml" || unitKey === "mililitro" || unitKey === "mililitros") {
        return mililitrosALitros(quantity);
      }
      if (unitKey === "l" || unitKey === "litro" || unitKey === "litros") return quantity;
      break;
    }
    case "unidad": {
      if (unitKey === "unidad" || unitKey === "unidades") return quantity;
      if (unitKey === "docena" || unitKey === "docenas") return quantity * 12;
      break;
    }
    default:
      break;
  }

  return null;
}

function calcularLinea(
  linea: FabricacionLinea,
  pricingCatalog: Record<string, IngredientPricing>,
  fallbackBaseUnit: BaseUnit
): FabricacionCalculoLinea {
  const pricing = pricingCatalog[linea.ingredientId];
  const baseUnit = getIngredientBaseUnit(pricing) ?? normalizarBaseUnit(linea.unit, fallbackBaseUnit);
  const selectedOption = pricing ? pickSupplierOption(pricing) : null;
  const unitPriceBase = selectedOption?.unitPriceBase && selectedOption.unitPriceBase > 0 ? selectedOption.unitPriceBase : 0;
  const quantityBase = quantityToBase(linea.quantity, linea.unit, baseUnit) ?? 0;
  const mermaMultiplier = 1 + clamp(linea.mermaPct, 0, 1000) / 100;
  const quantityBaseConMerma = quantityBase * mermaMultiplier;
  const costoTotal = quantityBaseConMerma * unitPriceBase;

  return {
    lineaId: linea.lineaId,
    ingredientId: linea.ingredientId,
    ingredientName: linea.ingredientName,
    quantityOriginal: linea.quantity,
    quantityOriginalUnit: linea.unit,
    quantityBase: round2(quantityBase),
    quantityBaseConMerma: round2(quantityBaseConMerma),
    baseUnit,
    mermaPct: round2(clamp(linea.mermaPct, 0, 1000)),
    unitPriceBase: round2(unitPriceBase),
    costoTotal: round2(costoTotal),
    supplier: selectedOption,
  };
}

export type CalcularCostoFabricacionOptions = {
  fallbackBaseUnit?: BaseUnit;
};

export function calcularCostoFabricacion(
  params: FabricacionParams,
  pricingCatalog: Record<string, IngredientPricing>,
  opts?: CalcularCostoFabricacionOptions
): FabricacionResultado {
  const fallbackBase = opts?.fallbackBaseUnit ?? "kg";
  const lineasCalculadas = params.lineas.map((linea) =>
    calcularLinea(linea, pricingCatalog, fallbackBase)
  );

  const costoIngredientes = lineasCalculadas.reduce((acc, linea) => acc + (linea.costoTotal || 0), 0);
  const mermaGlobalMultiplier = 1 + clamp(params.mermaPctGlobal, 0, 1000) / 100;
  const costoIngredientesMermaGlobal = costoIngredientes * mermaGlobalMultiplier;
  const subtotal =
    costoIngredientesMermaGlobal +
    (Number.isFinite(params.costoManoObra) ? params.costoManoObra : 0) +
    (Number.isFinite(params.costoEmpaque) ? params.costoEmpaque : 0);
  const overheadMultiplier = 1 + clamp(params.overheadPct, 0, 1000) / 100;
  const costoTotalLote = subtotal * overheadMultiplier;
  const costoUnitario = params.batchSize > 0 ? costoTotalLote / params.batchSize : costoTotalLote;
  const precioSugeridoUnitario = costoUnitario * (1 + clamp(params.margenObjetivoPct, 0, 1000) / 100);

  const precioVentaActual = Number.isFinite(params.precioVentaActual ?? NaN)
    ? params.precioVentaActual ?? null
    : null;
  let margenEstimadoPct: number | null = null;
  if (precioVentaActual && precioVentaActual > 0) {
    const margen = ((precioVentaActual - costoUnitario) / precioVentaActual) * 100;
    margenEstimadoPct = clamp(margen, -1000, 1000);
  }

  const overheadMonto = costoTotalLote - subtotal;

  return {
    fabricacionId: params.fabricacionId,
    nombre: params.nombre,
    batchSize: params.batchSize,
    costoIngredientes: round2(costoIngredientes),
    costoIngredientesMermaGlobal: round2(costoIngredientesMermaGlobal),
    costoManoObra: round2(params.costoManoObra),
    costoEmpaque: round2(params.costoEmpaque),
    overheadPct: round2(clamp(params.overheadPct, 0, 1000)),
    overheadMonto: round2(overheadMonto),
    costoTotalLote: round2(costoTotalLote),
    costoUnitario: round2(costoUnitario),
    precioSugeridoUnitario: round2(precioSugeridoUnitario),
    margenObjetivoPct: round2(clamp(params.margenObjetivoPct, 0, 1000)),
    margenEstimadoPct: margenEstimadoPct !== null ? round2(margenEstimadoPct) : null,
    lineas: lineasCalculadas,
  };
}

