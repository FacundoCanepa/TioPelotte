import type { Category } from "@/types/categoria_ingrediente";
import {
  mapCategoryFromStrapi,
  mapIngredientFromStrapi,
  mapPriceFromStrapi,
} from "../suppliers/strapi-helpers";

export function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === "object" && value !== null;
}

function extractRelationArray(value: unknown): unknown[] {
  if (Array.isArray(value)) return value;
  if (isRecord(value) && Array.isArray(value.data)) return value.data;
  return [];
}

export function mapCategoryWithRelations(entry: unknown): Category | null {
  const base = mapCategoryFromStrapi(entry);
  if (!base) return null;

  const normalized = isRecord(entry) ? (entry as Record<string, unknown>) : null;
  const attributes: Record<string, unknown> =
    normalized && isRecord(normalized.attributes)
      ? (normalized.attributes as Record<string, unknown>)
      : normalized ?? {};

  const normalizedRecord = normalized as Record<string, unknown> | null;

  const ingredientesSource =
    attributes["ingredientes"] ?? normalizedRecord?.["ingredientes"];
  const ingredientesRaw = extractRelationArray(ingredientesSource);
  const ingredientes = ingredientesRaw
    .map((item) => mapIngredientFromStrapi(item))
    .filter(
      (item): item is NonNullable<ReturnType<typeof mapIngredientFromStrapi>> =>
        Boolean(item)
    );

  const pricesSource =
    attributes["ingredient_supplier_prices"] ??
    normalizedRecord?.["ingredient_supplier_prices"];
  const ingredientSupplierPricesRaw = extractRelationArray(pricesSource);
  const ingredient_supplier_prices = ingredientSupplierPricesRaw
    .map((item) => mapPriceFromStrapi(item))
    .filter(
      (item): item is NonNullable<ReturnType<typeof mapPriceFromStrapi>> =>
        Boolean(item)
    );

  return {
    ...base,
    ingredientes,
    ingredient_supplier_prices,
  };
}
