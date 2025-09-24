import { NextRequest, NextResponse } from "next/server";
import {
  mapSupplierFromStrapi,
  sanitizeSupplierPayload,
  strapiFetch,
} from "../strapi-helpers";

function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === "object" && value !== null;
}

async function resolveDocumentId(context: { params: Promise<{ id: string }> }) {
  const { id } = await context.params;
  if (!id) {
    throw new Error("Falta el identificador del proveedor");
  }
  return id;
}

export async function GET(
  req: NextRequest,
  context: { params: Promise<{ id: string }> }
) {
  try {
    const documentId = await resolveDocumentId(context);
    const url = new URL(req.url);
    if (!url.searchParams.has("populate")) {
      url.searchParams.set("populate", "*");
    }

    const res = await strapiFetch(`/api/suppliers/${documentId}?${url.searchParams.toString()}`);
    const json = (await res.json()) as Record<string, unknown>;

    if (!res.ok) {
      return NextResponse.json(
        { error: "Error obteniendo proveedor", details: json },
        { status: res.status || 500 }
      );
    }

    const dataField = json.data ?? json;
    const supplier = mapSupplierFromStrapi(dataField);
    if (!supplier) {
      return NextResponse.json({ error: "Proveedor no encontrado" }, { status: 404 });
    }

    return NextResponse.json({ data: supplier });
  } catch (error) {
    console.error("[admin/suppliers/:id][GET] unexpected error", error);
    return NextResponse.json(
      { error: "Error inesperado", details: String(error instanceof Error ? error.message : error) },
      { status: 500 }
    );
  }
}

async function updateSupplier(
  req: NextRequest,
  context: { params: Promise<{ id: string }> }
) {
  try {
    const documentId = await resolveDocumentId(context);
    const body = (await req.json()) as unknown;

    let sanitizedPayload: Record<string, unknown>;
    try {
      sanitizedPayload = sanitizeSupplierPayload(body);
    } catch (error) {
      const message = error instanceof Error ? error.message : "Datos inválidos";
      return NextResponse.json({ error: message }, { status: 400 });
    }

    const res = await strapiFetch(`/api/suppliers/${documentId}`, {
      method: "PUT",
      body: JSON.stringify({ data: sanitizedPayload }),
    });

    const text = await res.text();
    let parsed: unknown = null;
    if (text) {
      try {
        parsed = JSON.parse(text);
      } catch {
        parsed = text;
      }
    }

    if (!res.ok) {
      return NextResponse.json(
        { error: "Error actualizando proveedor", details: parsed },
        { status: res.status || 500 }
      );
    }

    const supplier = mapSupplierFromStrapi(isRecord(parsed) && parsed.data ? parsed.data : parsed);
    if (!supplier) {
      return NextResponse.json({ error: "Proveedor no encontrado" }, { status: 404 });
    }

    return NextResponse.json({ data: supplier });
  } catch (error) {
    console.error("[admin/suppliers/:id][UPDATE] unexpected error", error);
    return NextResponse.json(
      { error: "Error inesperado", details: String(error instanceof Error ? error.message : error) },
      { status: 500 }
    );
  }
}

export async function PUT(
  req: NextRequest,
  context: { params: Promise<{ id: string }> }
) {
  return updateSupplier(req, context);
}

export async function PATCH(
  req: NextRequest,
  context: { params: Promise<{ id: string }> }
) {
  return updateSupplier(req, context);
}

export async function DELETE(
  req: NextRequest,
  context: { params: Promise<{ id: string }> }
) {
  try {
    const documentId = await resolveDocumentId(context);
    const res = await strapiFetch(`/api/suppliers/${documentId}`, { method: "DELETE" });

    if (!res.ok && res.status !== 204) {
      const text = await res.text();
      let parsed: unknown = null;
      if (text) {
        try {
          parsed = JSON.parse(text);
        } catch {
          parsed = text;
        }
      }
      return NextResponse.json(
        { error: "Error eliminando proveedor", details: parsed },
        { status: res.status || 500 }
      );
    }

    return new NextResponse(null, { status: 204 });
  } catch (error) {
    console.error("[admin/suppliers/:id][DELETE] unexpected error", error);
    return NextResponse.json(
      { error: "Error inesperado", details: String(error instanceof Error ? error.message : error) },
      { status: 500 }
    );
  }
}