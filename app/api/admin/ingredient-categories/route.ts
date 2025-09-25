import { NextRequest, NextResponse } from "next/server";
import { generateSlug } from "@/lib/utils";
import { strapiFetch } from "../suppliers/strapi-helpers";
import { isRecord, mapCategoryWithRelations } from "./utils";

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
      .filter((category): category is NonNullable<ReturnType<typeof mapCategoryWithRelations>> =>
        Boolean(category)
      );

    return NextResponse.json(categories);
  } catch (error) {
    console.error("[admin/ingredient-categories][GET] unexpected error", error);
    return NextResponse.json(
      { error: "Error inesperado", details: String(error instanceof Error ? error.message : error) },
      { status: 500 }
    );
  }
}

function sanitizeCategoryPayload(body: unknown) {
  if (!isRecord(body)) {
    throw new Error("Datos inválidos");
  }

  const nombreValue = body.nombre;
  const descriptionValue = body.description;

  const nombre = typeof nombreValue === "string" ? nombreValue.trim() : "";
  if (!nombre) {
    throw new Error("El nombre es obligatorio");
  }

  const description =
    typeof descriptionValue === "string" ? descriptionValue.trim() : undefined;

  const payload: Record<string, unknown> = {
    nombre,
    documentId: generateSlug(nombre),
  };

  payload.description = description && description.length > 0 ? description : null;

  return payload;
}

export async function POST(req: NextRequest) {
  try {
    let body: unknown;
    try {
      body = await req.json();
    } catch {
      return NextResponse.json(
        { error: "Datos inválidos", details: "JSON inválido" },
        { status: 400 }
      );
    }

    let payload: Record<string, unknown>;
    try {
      payload = sanitizeCategoryPayload(body);
    } catch (error) {
      const message = error instanceof Error ? error.message : "Datos inválidos";
      return NextResponse.json({ error: message }, { status: 400 });
    }

    const res = await strapiFetch("/api/categoria-ingredientes", {
      method: "POST",
      body: JSON.stringify({ data: payload }),
    });

    let json: unknown = null;
    try {
      json = await res.json();
    } catch (error) {
      console.error("[admin/ingredient-categories][POST] parse error", error);
    }

    if (!res.ok) {
      return NextResponse.json(
        { error: "Error creando categoría", details: json },
        { status: res.status || 500 }
      );
    }

    const category = mapCategoryWithRelations(isRecord(json) ? (json as Record<string, unknown>).data : json);
    if (!category) {
      return NextResponse.json(
        { error: "Respuesta inválida del servidor" },
        { status: 502 }
      );
    }

    return NextResponse.json({ data: category }, { status: 201 });
  } catch (error) {
    console.error("[admin/ingredient-categories][POST] unexpected error", error);
    return NextResponse.json(
      { error: "Error inesperado", details: String(error instanceof Error ? error.message : error) },
      { status: 500 }
    );
  }
}
