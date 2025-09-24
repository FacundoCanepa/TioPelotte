import type { Category } from "@/types/categoria_ingrediente";
import { NextResponse } from "next/server";
import {
  mapCategoryFromStrapi,
  mapIngredientFromStrapi,
  mapPriceFromStrapi,
  strapiFetch,
} from "../suppliers/strapi-helpers";

function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === "object" && value !== null;
}

function extractRelationArray(value: unknown): unknown[] {
  if (Array.isArray(value)) return value;
  if (isRecord(value) && Array.isArray(value.data)) return value.data;
  return [];
}

function mapCategoryWithRelations(entry: unknown): Category | null {
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
    .filter((item): item is NonNullable<ReturnType<typeof mapIngredientFromStrapi>> => Boolean(item));

  const pricesSource =
    attributes["ingredient_supplier_prices"] ?? normalizedRecord?.["ingredient_supplier_prices"];
  const ingredientSupplierPricesRaw = extractRelationArray(pricesSource);
  const ingredient_supplier_prices = ingredientSupplierPricesRaw
    .map((item) => mapPriceFromStrapi(item))
    .filter((item): item is NonNullable<ReturnType<typeof mapPriceFromStrapi>> => Boolean(item));

  return {
    ...base,
    ingredientes,
    ingredient_supplier_prices,
  };
}

export async function GET() {
  try {
    const res = await strapiFetch("/api/categoria-ingredientes?populate=*");
    let json: unknown;
    try {
      json = await res.json();
    } catch (error) {
      console.error("[admin/ingredient-categories][GET] parse error", error);
      return NextResponse.json(
        { error: "Respuesta inválida del servidor", details: "JSON inválido" },
        { status: 502 }
      );
    }

    if (!res.ok) {
      return NextResponse.json(
        { error: "Error listando categorías", details: json },
        { status: res.status || 500 }
      );
    }

    const dataField = isRecord(json) ? (json as Record<string, unknown>).data : undefined;
    const dataArray = Array.isArray(dataField) ? dataField : [];

    const categories = dataArray
      .map((entry) => mapCategoryWithRelations(entry))
      .filter((category): category is Category => Boolean(category));

    return NextResponse.json(categories);
  } catch (error) {
    console.error("[admin/ingredient-categories][GET] unexpected error", error);
    return NextResponse.json(
      { error: "Error inesperado", details: String(error instanceof Error ? error.message : error) },
      { status: 500 }
    );
  }
}