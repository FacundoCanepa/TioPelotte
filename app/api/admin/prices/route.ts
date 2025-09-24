import type { IngredientSupplierPrice } from "@/types/ingredient-supplier-price";
import { NextRequest, NextResponse } from "next/server";
import { mapPriceFromStrapi, strapiFetch } from "../suppliers/strapi-helpers";
import {
  buildPriceListPath as buildBasePriceListPath,
  sanitizePricePayload,
  PRICE_POPULATE,
} from "@/components/sections/admin/prices/helpers";

type UnknownRecord = Record<string, unknown>;

const UUID_REGEX =
  /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;

function isLikelyDocIdString(value: string) {
  const trimmed = value.trim();
  if (!trimmed) return false;
  if (UUID_REGEX.test(trimmed)) return true;
  return Number.isNaN(Number(trimmed)) && /[a-zA-Z]/.test(trimmed);
}

function applyCategoryFilter(params: URLSearchParams, rawCategoryId: string | null) {
  const categoryId = rawCategoryId?.trim() ?? "";
  params.delete("filters[ingrediente][categoria_ingrediente][documentId][$eq]");
  params.delete("filters[ingrediente][categoria_ingrediente][id][$eq]");
  if (!categoryId) return;

  const key = isLikelyDocIdString(categoryId)
    ? "filters[ingrediente][categoria_ingrediente][documentId][$eq]"
    : "filters[ingrediente][categoria_ingrediente][id][$eq]";

  params.set(key, categoryId);
}
function buildPriceListPath(searchParams: URLSearchParams) {
  const basePath = buildBasePriceListPath(searchParams);
  const [pathname, rawQuery = ""] = basePath.split("?");
  const params = new URLSearchParams(rawQuery);
  params.delete("populate");
  params.set("populate", PRICE_POPULATE);

  const categoryDocumentId = searchParams.get("categoryDocumentId");
  if (categoryDocumentId?.trim()) {
    params.delete("filters[ingrediente][categoria_ingrediente][id][$eq]");
    params.delete("filters[ingrediente][categoria_ingrediente][documentId][$eq]");
    params.set(
      "filters[ingrediente][categoria_ingrediente][documentId][$eq]",
      categoryDocumentId.trim()
    );
  } else {
    applyCategoryFilter(params, searchParams.get("categoryId"));
  }
  params.delete("categoryId");
  params.delete("categoryDocumentId");

  const queryString = params.toString();
  return queryString ? `${pathname}?${queryString}` : pathname;
}

export async function GET(req: NextRequest) {
  try {
    const url = new URL(req.url);
    const listPath = buildPriceListPath(url.searchParams);

    const res = await strapiFetch(listPath);
    let json: UnknownRecord | null = null;
    try {
      json = (await res.json()) as UnknownRecord;
    } catch (parseError) {
      console.error("[admin/prices][GET] Error parsing Strapi response", parseError);
    }

    if (!res.ok) {
      console.error("[admin/prices][GET] Strapi error", { status: res.status, body: json });
      const message =
      (json && typeof json === "object" &&
        typeof (json as { error?: string }).error === "string"
        ? (json as { error: string }).error
        : undefined) ||
      "Error listando precios";
      return NextResponse.json(
        { ok: false, message },
        { status: res.status || 500 }
      );
    }
    if (!json) {
      return NextResponse.json(
        { ok: false, message: "Respuesta inválida del servidor" },
        { status: 502 }
      );
    }
    const data = Array.isArray(json?.data) ? json.data : [];
    const items = data
      .map((entry) => mapPriceFromStrapi(entry))
      .filter((price): price is IngredientSupplierPrice => Boolean(price));

    const meta = json?.meta ?? {};

    return NextResponse.json({ ok: true, items, meta });
  } catch (error) {
    console.error("[admin/prices][GET] unexpected error", error);
    return NextResponse.json(
      {
        ok: false,
        message: String(error instanceof Error ? error.message : error),
      },
      { status: 500 }
    );
  }
}

export async function POST(req: NextRequest) {
  try {
    const body = (await req.json()) as unknown;

    let sanitizedPayload: Record<string, unknown>;
    try {
      sanitizedPayload = sanitizePricePayload(body);
    } catch (error) {
      const message = error instanceof Error ? error.message : "Datos inválidos";
      return NextResponse.json({ error: message }, { status: 400 });
    }

    const res = await strapiFetch(`/api/ingredient-supplier-prices?populate=${PRICE_POPULATE}`, {
      method: "POST",
      body: JSON.stringify({ data: sanitizedPayload }),
    });
    const json = (await res.json()) as UnknownRecord;

    if (!res.ok) {
      console.error("[admin/prices][POST] Strapi error", { status: res.status, body: json });
      return NextResponse.json(
        { error: "Error creando precio", details: json },
        { status: res.status || 500 }
      );
    }

    const price = mapPriceFromStrapi(json?.data);
    if (!price) {
      console.error("[admin/prices][POST] Invalid Strapi response", json);
      return NextResponse.json(
        { error: "Respuesta inválida del servidor" },
        { status: 502 }
      );
    }

    return NextResponse.json({ data: price }, { status: 201 });
  } catch (error) {
    console.error("[admin/prices][POST] unexpected error", error);
    return NextResponse.json(
      { error: "Error inesperado", details: String(error instanceof Error ? error.message : error) },
      { status: 500 }
    );
  }
}