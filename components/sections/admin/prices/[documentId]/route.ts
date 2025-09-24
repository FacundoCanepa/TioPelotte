import type { IngredientSupplierPrice } from "@/types/ingredient-supplier-price";
import { NextRequest, NextResponse } from "next/server";
import { mapPriceFromStrapi, strapiFetch } from "@/app/api/admin/suppliers/strapi-helpers";
import { PRICE_POPULATE, resolvePriceIdByDocumentId, sanitizePricePayload } from "../helpers";

type UnknownRecord = Record<string, unknown>;

export async function PUT(
  req: NextRequest,
  ctx: { params: Promise<{ documentId: string }> }
) {
  try {
    const { documentId } = await ctx.params;
    if (!documentId) {
      return NextResponse.json({ error: "Falta documentId" }, { status: 400 });
    }

    const strapiId = await resolvePriceIdByDocumentId(documentId);
    if (!strapiId) {
      return NextResponse.json({ error: "Precio no encontrado" }, { status: 404 });
    }

    const body = (await req.json()) as unknown;
    let sanitizedPayload: Record<string, unknown>;
    try {
      sanitizedPayload = sanitizePricePayload(body);
    } catch (error) {
      const message = error instanceof Error ? error.message : "Datos inválidos";
      return NextResponse.json({ error: message }, { status: 400 });
    }

    const res = await strapiFetch(
      `/api/ingredient-supplier-prices/${strapiId}?populate=${PRICE_POPULATE}`,
      {
        method: "PUT",
        body: JSON.stringify({ data: sanitizedPayload }),
      }
    );
    const json = (await res.json()) as UnknownRecord;

    if (!res.ok) {
      console.error("[admin/prices][PUT] Strapi error", {
        status: res.status,
        body: json,
        documentId,
        strapiId,
      });
      return NextResponse.json(
        { error: "Error actualizando precio", details: json },
        { status: res.status || 500 }
      );
    }

    const price = mapPriceFromStrapi(json?.data);
    if (!price) {
      console.error("[admin/prices][PUT] Invalid Strapi response", json);
      return NextResponse.json(
        { error: "Respuesta inválida del servidor" },
        { status: 502 }
      );
    }

    return NextResponse.json({ data: price });
  } catch (error) {
    console.error("[admin/prices][PUT] unexpected error", error);
    return NextResponse.json(
      { error: "Error inesperado", details: String(error instanceof Error ? error.message : error) },
      { status: 500 }
    );
  }
}

export async function DELETE(
  _req: NextRequest,
  ctx: { params: Promise<{ documentId: string }> }
) {
  try {
    const { documentId } = await ctx.params;
    if (!documentId) {
      return NextResponse.json({ error: "Falta documentId" }, { status: 400 });
    }

    const strapiId = await resolvePriceIdByDocumentId(documentId);
    if (!strapiId) {
      return NextResponse.json({ error: "Precio no encontrado" }, { status: 404 });
    }

    const res = await strapiFetch(
      `/api/ingredient-supplier-prices/${strapiId}?populate=${PRICE_POPULATE}`,
      { method: "DELETE" }
    );

    let json: UnknownRecord = {};
    try {
      json = (await res.json()) as UnknownRecord;
    } catch (parseError) {
      console.warn("[admin/prices][DELETE] Error parsing response", parseError);
    }

    if (!res.ok) {
      console.error("[admin/prices][DELETE] Strapi error", {
        status: res.status,
        body: json,
        documentId,
        strapiId,
      });
      return NextResponse.json(
        { error: "Error eliminando precio", details: json },
        { status: res.status || 500 }
      );
    }

    const price = mapPriceFromStrapi(json?.data);
    const payload: { deleted: true; data?: IngredientSupplierPrice | null } = {
      deleted: true,
      data: price ?? null,
    };

    return NextResponse.json(payload);
  } catch (error) {
    console.error("[admin/prices][DELETE] unexpected error", error);
    return NextResponse.json(
      { error: "Error inesperado", details: String(error instanceof Error ? error.message : error) },
      { status: 500 }
    );
  }
}