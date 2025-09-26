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

  if (description && description.length > 0) {
    payload.description = description;
    payload.descripcion = description;
  } else {
    payload.description = null;
    payload.descripcion = null;
  }

  return payload;
}

type StrapiErrorInfo = {
  message: string | null;
  details: unknown;
};

function extractStrapiError(input: unknown): StrapiErrorInfo | null {
  if (!isRecord(input)) return null;

  const errorNode = input.error;
  if (!isRecord(errorNode)) {
    return {
      message: null,
      details: input,
    };
  }

  const messageValue =
    typeof errorNode.message === "string"
      ? errorNode.message
      : typeof errorNode.name === "string"
      ? errorNode.name
      : null;

  const detailsNode = errorNode.details;
  const details = isRecord(detailsNode)
    ? // Strapi v4 nests validation errors inside details.errors
      (Array.isArray((detailsNode as Record<string, unknown>).errors)
        ? (detailsNode as Record<string, unknown>).errors
        : detailsNode)
    : errorNode;

  return {
    message: messageValue,
    details,
  };
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

    let rawBody: string | null = null;
    try {
      rawBody = await res.text();
    } catch (error) {
      console.error("[admin/ingredient-categories][POST] read error", error);
    }

    let json: unknown = null;
    let parseError: unknown = null;
    if (rawBody && rawBody.trim() !== "") {
      try {
        json = JSON.parse(rawBody);
      } catch (error) {
        parseError = error;
        console.error(
          "[admin/ingredient-categories][POST] parse error",
          error,
          rawBody
        );
      }
    }

    if (!res.ok) {
      const errorInfo = extractStrapiError(json);
      console.error("[admin/ingredient-categories][POST] failed", {
        status: res.status,
        statusText: res.statusText,
        payload,
        responseBody: rawBody,
        parseError: parseError instanceof Error ? parseError.message : parseError,
      });

      return NextResponse.json(
        {
          error: errorInfo?.message ?? "Error creando categoría",
          details: {
            status: res.status,
            statusText: res.statusText,
            payload,
            strapi: errorInfo?.details ?? (json ?? rawBody ?? null),
          },
        },
        { status: res.status || 500 }
      );
    }

    if (!json) {
      return NextResponse.json(
        {
          error: "Respuesta inválida del servidor",
          details: rawBody,
        },
        { status: 502 }
      );
    }

    const category = mapCategoryWithRelations(
      isRecord(json) ? (json as Record<string, unknown>).data : json
    );
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
