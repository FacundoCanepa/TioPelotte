import { NextRequest, NextResponse } from "next/server";

import { computeCheapestByCategory, IngredientWithPrices } from "@/lib/pricing/cheapest-by-category";
import type { IngredientSupplierPrice } from "@/types/ingredient-supplier-price";
import { mapIngredientFromStrapi, mapPriceFromStrapi, strapiFetch } from "../suppliers/strapi-helpers";

const LOG_PREFIX = "[admin/ingredients][cheapest-by-category]";
const INGREDIENT_POPULATE = "categoria_ingrediente";

const DEFAULT_PAGE_SIZE = "200";

type UnknownRecord = Record<string, unknown>;

type CategoryFilter = {
  categoryId?: string | null;
  categoryDocumentId?: string | null;
};

function isRecord(value: unknown): value is UnknownRecord {
  return typeof value === "object" && value !== null;
}

async function fetchCollection(path: string) {
  const res = await strapiFetch(path);
  let json: unknown;
  try {
    json = await res.json();
  } catch (error) {
    console.error(`${LOG_PREFIX} parse error`, error);
    throw new Error("Respuesta inválida del servidor");
  }

  if (!res.ok) {
    console.error(`${LOG_PREFIX} Strapi error`, { status: res.status, body: json });
    throw new Error("Error consultando Strapi");
  }
  const dataField = isRecord(json) ? (json as UnknownRecord).data : undefined;
  return Array.isArray(dataField) ? dataField : [];
}

async function fetchIngredientByIdentifier({
  ingredientId,
  ingredientDocumentId,
}: {
  ingredientId?: string | null;
  ingredientDocumentId?: string | null;
}): Promise<IngredientWithPrices | null> {
  const params = new URLSearchParams();
  params.set("populate", INGREDIENT_POPULATE);
  params.set("pagination[page]", "1");
  params.set("pagination[pageSize]", "1");

  if (ingredientDocumentId) {
    params.set("filters[documentId][$eq]", ingredientDocumentId);
  } else if (ingredientId) {
    params.set("filters[id][$eq]", ingredientId);
  } else {
    return null;
  }

  const dataArray = await fetchCollection(`/api/ingredientes?${params.toString()}`);
  const ingredientEntry = dataArray[0];
  if (!ingredientEntry) return null;

  const ingredient = mapIngredientFromStrapi(ingredientEntry);
  if (!ingredient) return null;

  return { ...ingredient, ingredient_supplier_prices: [] };
}

async function fetchIngredientsByCategory(filter: CategoryFilter): Promise<IngredientWithPrices[]> {
  const params = new URLSearchParams();
  params.set("populate", INGREDIENT_POPULATE);
  params.set("pagination[page]", "1");
  params.set("pagination[pageSize]", DEFAULT_PAGE_SIZE);

  if (filter.categoryDocumentId) {
    params.set(
        "filters[categoria_ingrediente][documentId][$eq]",
        filter.categoryDocumentId
      );
  } else if (filter.categoryId) {
    params.set(
        "filters[categoria_ingrediente][id][$eq]",
        filter.categoryId
      )
  }

  const dataArray = await fetchCollection(`/api/ingredientes?${params.toString()}`);

  return dataArray
    .map((entry) => mapIngredientFromStrapi(entry))
    .filter((item): item is NonNullable<ReturnType<typeof mapIngredientFromStrapi>> => Boolean(item))
    .map((ingredient) => ({ ...ingredient, ingredient_supplier_prices: [] }));
}

async function fetchPricesByCategory(filter: CategoryFilter): Promise<IngredientSupplierPrice[]> {
  const params = new URLSearchParams();
  params.set("populate[ingrediente][populate][0]", "categoria_ingrediente");
  params.set("populate[supplier]", "*");
  params.set("pagination[page]", "1");
  params.set("pagination[pageSize]", DEFAULT_PAGE_SIZE);

  if (filter.categoryDocumentId) {
    params.set(
        "filters[ingrediente][categoria_ingrediente][documentId][$eq]",
        filter.categoryDocumentId
      );
  } else if (filter.categoryId) {
    params.set(
        "filters[ingrediente][categoria_ingrediente][id][$eq]",
        filter.categoryId
      );
  }

  const dataArray = await fetchCollection(`/api/ingredient-supplier-prices?${params.toString()}`);

  return dataArray
    .map((entry) => mapPriceFromStrapi(entry))
    .filter((item): item is IngredientSupplierPrice => Boolean(item));
}

function attachPricesToIngredients(
  ingredients: IngredientWithPrices[],
  prices: IngredientSupplierPrice[]
): IngredientWithPrices[] {
  if (ingredients.length === 0) return [];

  const pricesByIngredient = new Map<number, IngredientSupplierPrice[]>();

  prices.forEach((price) => {
    const ingredientId = price.ingrediente?.id;
    if (!Number.isFinite(ingredientId)) return;
    const list = pricesByIngredient.get(ingredientId) ?? [];
    list.push(price);
    pricesByIngredient.set(ingredientId, list);
  });

  return ingredients.map((ingredient) => ({
    ...ingredient,
    ingredient_supplier_prices: pricesByIngredient.get(ingredient.id) ?? [],
  }));
}

export async function GET(req: NextRequest) {
  try {
    const url = new URL(req.url);
    const ingredientId = url.searchParams.get("ingredientId");
    const ingredientDocumentId = url.searchParams.get("ingredientDocumentId");
    const categoryId = url.searchParams.get("categoryId");
    const categoryDocumentId = url.searchParams.get("categoryDocumentId");

    if (!ingredientId && !ingredientDocumentId && !categoryId && !categoryDocumentId) {
      return NextResponse.json({ ok: false, message: "Faltan parámetros" }, { status: 400 });
    }

    let categoryFilter: CategoryFilter | null = null;

    if (categoryId || categoryDocumentId) {
      categoryFilter = { categoryId, categoryDocumentId };
    } else {
      const ingredient = await fetchIngredientByIdentifier({ ingredientId, ingredientDocumentId });
      if (!ingredient) {
        return NextResponse.json({ ok: true, data: [] });
      }

      const category = ingredient.categoria_ingrediente;
      if (!category) {
        return NextResponse.json({ ok: true, data: [] });
      }

      categoryFilter = {
        categoryId: category.id ? String(category.id) : null,
        categoryDocumentId: category.documentId ?? null,
      };
    }

    if (!categoryFilter) {
      return NextResponse.json({ ok: true, data: [] });
    }

    const ingredients = await fetchIngredientsByCategory(categoryFilter);
    const prices = await fetchPricesByCategory(categoryFilter);
    const enriched = attachPricesToIngredients(ingredients, prices);
    const cheapest = computeCheapestByCategory(enriched);

    return NextResponse.json({ ok: true, data: cheapest });
  } catch (error) {
    console.error(`${LOG_PREFIX} unexpected error`, error);
    const message = error instanceof Error ? error.message : "Error inesperado";
    return NextResponse.json({ ok: false, message }, { status: 500 });
  }
}
