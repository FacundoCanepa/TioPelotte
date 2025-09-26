import { strict as assert } from "node:assert";
import { test } from "node:test";

import {
  calcularCostoFabricacion,
  FabricacionParams,
  IngredientPricing,
  SupplierUnitPrice,
  gramosAKilos,
  kilosAGramos,
  mililitrosALitros,
  litrosAMililitros,
} from "./costing";

test("conversion helpers handle kg and g", () => {
  assert.ok(Math.abs(gramosAKilos(500) - 0.5) < 1e-9);
  assert.ok(Math.abs(gramosAKilos(1_000) - 1) < 1e-9);
  assert.ok(Math.abs(kilosAGramos(1.5) - 1_500) < 1e-9);
});

test("conversion helpers handle litros and mililitros", () => {
  assert.ok(Math.abs(mililitrosALitros(750) - 0.75) < 1e-9);
  assert.ok(Math.abs(litrosAMililitros(2.5) - 2_500) < 1e-9);
});

function createPricing(
  ingredientId: string,
  options: Array<Pick<SupplierUnitPrice, "price" | "quantity" | "unit"> & Partial<SupplierUnitPrice>>,
  selectedIndex?: number | null,
  baseUnit: IngredientPricing["baseUnit"] = "kg"
): IngredientPricing {
  return {
    ingredientId,
    baseUnit,
    options: options.map((option, index) => ({
      optionId: option.optionId ?? index,
      supplierId: option.supplierId ?? index,
      supplierName: option.supplierName ?? `Proveedor ${index + 1}`,
      label: option.label ?? `Opción ${index + 1}`,
      price: option.price,
      quantity: option.quantity,
      unit: option.unit,
      unitPriceBase: option.unitPriceBase ?? null,
      baseUnit: option.baseUnit ?? baseUnit,
    })),
    selectedIndex: selectedIndex ?? null,
  } satisfies IngredientPricing;
}

test("selecciona proveedor más barato cuando no hay seleccionado", () => {
  const pricing = createPricing(
    "harina",
    [
      { price: 10_000, quantity: 5, unit: "kg" },
      { price: 18_000, quantity: 10, unit: "kg" },
    ]
  );

  const params: FabricacionParams = {
    fabricacionId: "fab-1",
    nombre: "Harina 000",
    batchSize: 10,
    mermaPctGlobal: 0,
    costoManoObra: 0,
    costoEmpaque: 0,
    overheadPct: 0,
    margenObjetivoPct: 0,
    precioVentaActual: null,
    lineas: [
      {
        lineaId: 1,
        ingredientId: "harina",
        ingredientName: "Harina 000",
        quantity: 2,
        unit: "kg",
        mermaPct: 0,
      },
    ],
  };

  const resultado = calcularCostoFabricacion(params, { harina: pricing });
  assert.strictEqual(resultado.costoIngredientes, 3_600);
  assert.strictEqual(resultado.costoTotalLote, 3_600);
  assert.strictEqual(resultado.costoUnitario, 360);
});

test("respeta índice seleccionado cuando es válido", () => {
  const pricing = createPricing(
    "leche",
    [
      { price: 1_000, quantity: 1, unit: "l" },
      { price: 4_500, quantity: 5, unit: "l" },
    ],
    0,
    "l"
  );

  const params: FabricacionParams = {
    fabricacionId: "fab-2",
    nombre: "Leche entera",
    batchSize: 10,
    mermaPctGlobal: 0,
    costoManoObra: 0,
    costoEmpaque: 0,
    overheadPct: 0,
    margenObjetivoPct: 0,
    precioVentaActual: null,
    lineas: [
      {
        lineaId: 1,
        ingredientId: "leche",
        ingredientName: "Leche entera",
        quantity: 10,
        unit: "l",
        mermaPct: 0,
      },
    ],
  };

  const resultado = calcularCostoFabricacion(params, { leche: pricing });
  assert.strictEqual(resultado.costoIngredientes, 10_000);
  assert.strictEqual(resultado.costoTotalLote, 10_000);
  assert.strictEqual(resultado.costoUnitario, 1_000);
});

test("aplica merma por línea y global, mano de obra, empaque y overhead", () => {
  const pricingAzucar = createPricing(
    "azucar",
    [
      { price: 12_000, quantity: 10_000, unit: "g" },
    ]
  );
  const pricingHarina = createPricing(
    "harina",
    [
      { price: 20_000, quantity: 25, unit: "kg" },
    ]
  );

  const params: FabricacionParams = {
    fabricacionId: "fab-3",
    nombre: "Bizcochuelo",
    batchSize: 50,
    mermaPctGlobal: 5,
    costoManoObra: 2_000,
    costoEmpaque: 1_000,
    overheadPct: 10,
    margenObjetivoPct: 20,
    precioVentaActual: 150,
    lineas: [
      {
        lineaId: 1,
        ingredientId: "azucar",
        ingredientName: "Azúcar",
        quantity: 1_000,
        unit: "g",
        mermaPct: 10,
      },
      {
        lineaId: 2,
        ingredientId: "harina",
        ingredientName: "Harina",
        quantity: 5,
        unit: "kg",
        mermaPct: 0,
      },
    ],
  };

  const resultado = calcularCostoFabricacion(params, {
    azucar: pricingAzucar,
    harina: pricingHarina,
  });

  assert.ok(Math.abs(resultado.costoIngredientes - 5_320) < 1e-6);
  assert.ok(Math.abs(resultado.costoIngredientesMermaGlobal - 5_586) < 1e-6);
  assert.ok(Math.abs(resultado.costoTotalLote - 9_444.6) < 1e-3);
  assert.ok(Math.abs(resultado.costoUnitario - 188.89) < 1e-2);
  assert.ok(Math.abs(resultado.precioSugeridoUnitario - 226.67) < 1e-2);
  assert.ok(resultado.margenEstimadoPct !== null);
  assert.ok(resultado.margenEstimadoPct !== null && Math.abs(resultado.margenEstimadoPct + 25.93) < 0.1);
});

test("calcula margen estimado solo cuando hay precio de venta", () => {
  const pricing = createPricing(
    "producto",
    [{ price: 2_000, quantity: 1, unit: "kg" }]
  );

  const params: FabricacionParams = {
    fabricacionId: "fab-4",
    nombre: "Producto",
    batchSize: 2,
    mermaPctGlobal: 0,
    costoManoObra: 0,
    costoEmpaque: 0,
    overheadPct: 0,
    margenObjetivoPct: 0,
    precioVentaActual: null,
    lineas: [
      {
        lineaId: 1,
        ingredientId: "producto",
        ingredientName: "Producto",
        quantity: 1,
        unit: "kg",
        mermaPct: 0,
      },
    ],
  };

  const resultado = calcularCostoFabricacion(params, { producto: pricing });
  assert.strictEqual(resultado.margenEstimadoPct, null);
});

