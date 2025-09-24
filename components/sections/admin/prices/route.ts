import type { IngredientSupplierPrice } from "@/types/ingredient-supplier-price";
import { NextRequest, NextResponse } from "next/server";
import { mapPriceFromStrapi, strapiFetch } from "@/app/api/admin/suppliers/strapi-helpers";
import { buildPriceListPath, sanitizePricePayload, PRICE_POPULATE } from "./helpers";

type UnknownRecord = Record<string, unknown>;

export async function GET(req: NextRequest) {
  try {
    const url = new URL(req.url);
    const listPath = buildPriceListPath(url.searchParams);

    const res = await strapiFetch(listPath);
    const json = (await res.json()) as UnknownRecord;

    if (!res.ok) {
      console.error("[admin/prices][GET] Strapi error", { status: res.status, body: json });
      return NextResponse.json(
        { error: "Error listando precios", details: json },
        { status: res.status || 500 }
      );
    }

    const data = Array.isArray(json?.data) ? json.data : [];
    const items = data
      .map((entry) => mapPriceFromStrapi(entry))
      .filter((price): price is IngredientSupplierPrice => Boolean(price));

    const meta = json?.meta ?? {};

    return NextResponse.json({ items, meta });
  } catch (error) {
    console.error("[admin/prices][GET] unexpected error", error);
    return NextResponse.json(
      { error: "Error inesperado", details: String(error instanceof Error ? error.message : error) },
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