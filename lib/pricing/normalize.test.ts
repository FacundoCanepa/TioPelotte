import { strict as assert } from "node:assert";
import { test } from "node:test";

import {
  computePrecioUnitarioBase,
  formatPrecioUnitario,
  getUnidadBase,
  isUnidadSoportada,
  toUnidadBase,
} from "./normalize";

test("detecta unidad base correcta", () => {
  assert.strictEqual(getUnidadBase("kg"), "kg");
  assert.strictEqual(getUnidadBase("g"), "kg");
  assert.strictEqual(getUnidadBase("ML"), "l");
  assert.strictEqual(getUnidadBase("docena"), "unidad");
  assert.strictEqual(getUnidadBase("otra"), null);
});

test("convierte cantidades a unidad base", () => {
  assert.ok(Math.abs((toUnidadBase(1_000, "g") ?? 0) - 1) < 1e-9);
  assert.ok(Math.abs((toUnidadBase(500, "g") ?? 0) - 0.5) < 1e-9);
  assert.ok(Math.abs((toUnidadBase(250_000, "mg") ?? 0) - 0.25) < 1e-9);
  assert.ok(Math.abs((toUnidadBase(1_500, "ml") ?? 0) - 1.5) < 1e-9);
  assert.strictEqual(toUnidadBase(2, "docena"), 24);
  assert.strictEqual(toUnidadBase(-1, "kg"), null);
  assert.strictEqual(toUnidadBase(1, "desconocida"), null);
});

test("calcula precio unitario base", () => {
  const harina = computePrecioUnitarioBase(20000, 5, "kg");
  assert.ok(Math.abs((harina.value ?? 0) - 4000) < 1e-6);
  assert.strictEqual(harina.unidadBase, "kg");

  const semolaGrande = computePrecioUnitarioBase(34000, 10, "kg");
  assert.ok(Math.abs((semolaGrande.value ?? 0) - 3400) < 1e-6);

  const gramos = computePrecioUnitarioBase(1200, 500, "g");
  assert.ok(Math.abs((gramos.value ?? 0) - 2400) < 1e-6);

  const docena = computePrecioUnitarioBase(8000, 1, "docena");
  assert.ok(Math.abs((docena.value ?? 0) - 8000 / 12) < 1e-6);
  assert.strictEqual(docena.unidadBase, "unidad");
});

test("maneja datos inválidos", () => {
  assert.strictEqual(computePrecioUnitarioBase(0, 1, "kg").value, null);
  assert.strictEqual(computePrecioUnitarioBase(100, 0, "kg").value, null);
  assert.strictEqual(computePrecioUnitarioBase(100, 1, "desconocida").value, null);
});

test("formatea precio unitario", () => {
  const formatted = formatPrecioUnitario(1234.56, "kg", "ARS");
  assert.ok(formatted.includes("kg"));
  assert.ok(formatted.includes("$"));
});

test("detecta unidades soportadas", () => {
  assert.strictEqual(isUnidadSoportada("kg"), true);
  assert.strictEqual(isUnidadSoportada("docena"), true);
  assert.strictEqual(isUnidadSoportada("unknown"), false);
});
