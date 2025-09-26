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
  const nombre = typeof nombreValue === "string" ? nombreValue.trim() : "";
  if (!nombre) {
    throw new Error("El nombre es obligatorio");
  }

  const payload: Record<string, unknown> = {
    nombre,
    documentId: generateSlug(nombre),
  };

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

type StrapiAttemptResult = {
  res: Response;
  rawBody: string | null;
  json: unknown;
  parseError: unknown;
};

function isInvalidDocumentIdError(info: StrapiErrorInfo | null): boolean {
  if (!info) return false;

  const messageMatch =
    typeof info.message === "string" &&
    info.message.toLowerCase().includes("documentid");

  const details = info.details;
  if (Array.isArray(details)) {
    const hasDocIdDetail = details.some((detail) => {
      if (!isRecord(detail)) return false;
      const key = detail.key ?? detail.path ?? detail.name;
      return key === "documentId";
    });
    if (hasDocIdDetail) {
      return true;
    }
  }

  if (isRecord(details)) {
    const key = details.key ?? details.path ?? details.name;
    if (key === "documentId") {
      return true;
    }
  }

  return messageMatch;
}

async function sendCategoryToStrapi(
  data: Record<string, unknown>
): Promise<StrapiAttemptResult> {
  const res = await strapiFetch("/api/categoria-ingredientes", {
    method: "POST",
    body: JSON.stringify({ data }),
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

  return { res, rawBody, json, parseError };
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

    let attemptPayload: Record<string, unknown> = payload;
    let attemptResult = await sendCategoryToStrapi(attemptPayload);

    if (!attemptResult.res.ok) {
      const errorInfo = extractStrapiError(attemptResult.json);

      const shouldRetryWithoutDocId =
        isInvalidDocumentIdError(errorInfo) &&
        Object.prototype.hasOwnProperty.call(attemptPayload, "documentId");

      if (shouldRetryWithoutDocId) {
        const fallbackPayload = { ...attemptPayload };
        delete fallbackPayload.documentId;
        console.warn(
          "[admin/ingredient-categories][POST] retrying without documentId"
        );
        attemptPayload = fallbackPayload;
        attemptResult = await sendCategoryToStrapi(attemptPayload);

        if (!attemptResult.res.ok) {
          const fallbackErrorInfo = extractStrapiError(attemptResult.json);
          console.error("[admin/ingredient-categories][POST] failed", {
            status: attemptResult.res.status,
            statusText: attemptResult.res.statusText,
            payload: attemptPayload,
            responseBody: attemptResult.rawBody,
            parseError:
              attemptResult.parseError instanceof Error
                ? attemptResult.parseError.message
                : attemptResult.parseError,
            initialError: errorInfo,
            fallbackError: fallbackErrorInfo,
          });

          return NextResponse.json(
            {
              error: fallbackErrorInfo?.message ?? "Error creando categoría",
              details: {
                status: attemptResult.res.status,
                statusText: attemptResult.res.statusText,
                payload: attemptPayload,
                strapi:
                  fallbackErrorInfo?.details ??
                  attemptResult.json ??
                  attemptResult.rawBody ??
                  null,
              },
            },
            { status: attemptResult.res.status || 500 }
          );
        }
      } else {
        console.error("[admin/ingredient-categories][POST] failed", {
          status: attemptResult.res.status,
          statusText: attemptResult.res.statusText,
          payload: attemptPayload,
          responseBody: attemptResult.rawBody,
          parseError:
            attemptResult.parseError instanceof Error
              ? attemptResult.parseError.message
              : attemptResult.parseError,
        });

        return NextResponse.json(
          {
            error: errorInfo?.message ?? "Error creando categoría",
            details: {
              status: attemptResult.res.status,
              statusText: attemptResult.res.statusText,
              payload: attemptPayload,
              strapi:
                errorInfo?.details ??
                attemptResult.json ??
                attemptResult.rawBody ??
                null,
            },
          },
          { status: attemptResult.res.status || 500 }
        );
      }
    }

    const { rawBody, json } = attemptResult;

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
