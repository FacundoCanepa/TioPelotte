import { NextRequest, NextResponse } from "next/server";
import { strapiFetch } from "../../suppliers/strapi-helpers";
import { Fabricacion } from "@/types/fabricacion";
import { ensureFabricacionPopulate, mapFabricacion, normalizeFabricacionPopulate } from "../shared";

function parseStrapiErrorPayload(payload: string) {
  try {
    const parsed = JSON.parse(payload);
    const message =
      typeof parsed?.error === "string"
        ? parsed.error
        : typeof parsed?.error?.message === "string"
        ? parsed.error.message
        : typeof parsed?.message === "string"
        ? parsed.message
        : undefined;
    const details = parsed?.error?.details ?? parsed?.details;
    return { message, details };
  } catch {
    return { message: undefined, details: undefined };
  }
}

export async function GET(req: NextRequest, ctx: { params: Promise<{ documentId: string }> }) {
  try {
    const { documentId } = await ctx.params;
    const trimmed = documentId?.trim();
    if (!trimmed) {
      return NextResponse.json({ error: "Falta documentId" }, { status: 400 });
    }

    const url = new URL(req.url);
    const params = new URLSearchParams(url.searchParams);
    normalizeFabricacionPopulate(params);
    ensureFabricacionPopulate(params);

    const query = params.toString();
    const path = `/api/fabricacions/${encodeURIComponent(trimmed)}${query ? `?${query}` : ""}`;
    const res = await strapiFetch(path);
    const text = await res.text();

    if (!res.ok) {
      console.error("[admin/fabricacion byId][GET] Strapi error", {
        status: res.status,
        path,
        query,
        body: text,
      });
      if (res.status === 404) {
        return NextResponse.json({ error: "Fabricación no encontrada" }, { status: 404 });
      }
      if (res.status === 400) {
        const parsed = text ? parseStrapiErrorPayload(text) : undefined;
        return NextResponse.json(
          {
            error:
              "Strapi rechazó la consulta de fabricación (parámetros inválidos). Intenta recargar o avisa al equipo si persiste.",
            details: parsed?.details ?? parsed?.message,
          },
          { status: 502 }
        );
      }
      return NextResponse.json({ error: "No se pudo obtener la información de fabricación" }, { status: 502 });
    }

    const json = text ? JSON.parse(text) : {};
    const raw = json?.data ?? json;
    const item = mapFabricacion(raw);
    if (!item) {
      return NextResponse.json({ error: "Fabricación no encontrada" }, { status: 404 });
    }

    return NextResponse.json(item as Fabricacion);
  } catch (error) {
    console.error("[admin/fabricacion byId][GET] Unexpected error", error);
    return NextResponse.json(
      { error: "Error inesperado obteniendo la orden de fabricación" },
      { status: 500 }
    );
  }
}
