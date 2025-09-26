import { NextRequest, NextResponse } from "next/server";
import { strapiFetch } from "../../suppliers/strapi-helpers";
import { isRecord, mapCategoryWithRelations } from "../utils";

function sanitizeUpdatePayload(body: unknown) {
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

  const payload: Record<string, unknown> = { nombre };
  if (description && description.length > 0) {
    payload.description = description;
    payload.descripcion = description;
  } else {
    payload.description = null;
    payload.descripcion = null;
  }

  return payload;
}

export async function PUT(
  req: NextRequest,
  context: { params: Promise<{ id: string }> }
) {
  const { id } = await context.params;

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
      payload = sanitizeUpdatePayload(body);
    } catch (error) {
      const message = error instanceof Error ? error.message : "Datos inválidos";
      return NextResponse.json({ error: message }, { status: 400 });
    }

    const res = await strapiFetch(`/api/categoria-ingredientes/${id}`, {
      method: "PUT",
      body: JSON.stringify({ data: payload }),
    });

    let json: unknown = null;
    try {
      json = await res.json();
    } catch (error) {
      console.error("[admin/ingredient-categories][PUT] parse error", error);
    }

    if (!res.ok) {
      return NextResponse.json(
        { error: "Error actualizando categoría", details: json },
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

    return NextResponse.json({ data: category });
  } catch (error) {
    console.error("[admin/ingredient-categories][PUT] unexpected error", error);
    return NextResponse.json(
      { error: "Error inesperado", details: String(error instanceof Error ? error.message : error) },
      { status: 500 }
    );
  }
}

export async function DELETE(
  _req: NextRequest,
  context: { params: Promise<{ id: string }> }
) {
  const { id } = await context.params;

  try {
    const res = await strapiFetch(`/api/categoria-ingredientes/${id}`, {
      method: "DELETE",
    });

    if (res.status === 204) {
      return new Response(null, { status: 204 });
    }

    let json: unknown = null;
    try {
      json = await res.json();
    } catch (error) {
      console.error("[admin/ingredient-categories][DELETE] parse error", error);
    }

    if (!res.ok) {
      return NextResponse.json(
        { error: "Error eliminando categoría", details: json },
        { status: res.status || 500 }
      );
    }

    return NextResponse.json({ ok: true });
  } catch (error) {
    console.error("[admin/ingredient-categories][DELETE] unexpected error", error);
    return NextResponse.json(
      { error: "Error inesperado", details: String(error instanceof Error ? error.message : error) },
      { status: 500 }
    );
  }
}
