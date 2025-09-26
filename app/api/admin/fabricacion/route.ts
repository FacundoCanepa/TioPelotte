import { NextRequest, NextResponse } from "next/server";
import { strapiFetch } from "../suppliers/strapi-helpers";
import { Fabricacion, FabricacionListResponse } from "@/types/fabricacion";
import { ensureFabricacionPopulate, mapFabricacion, normalizeFabricacionPopulate } from "./shared";

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

export async function GET(request: NextRequest) {
  try {
    const url = new URL(request.url);
    const params = new URLSearchParams(url.searchParams);
    normalizeFabricacionPopulate(params);
    ensureFabricacionPopulate(params);
    if (!params.has("pagination[page]")) {
      params.set("pagination[page]", params.get("page") ?? "1");
    }
    if (!params.has("pagination[pageSize]")) {
      params.set("pagination[pageSize]", params.get("pageSize") ?? "25");
    }
    params.delete("page");
    params.delete("pageSize");

    const path = `/api/fabricacions?${params.toString()}`;
    const res = await strapiFetch(path);
    const text = await res.text();
    if (!res.ok) {
      console.error("[admin/fabricacion][GET] Strapi error", {
        status: res.status,
        path,
        query: params.toString(),
        body: text,
      });
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
    const rawItems: unknown[] = Array.isArray(json?.data) ? json.data : [];
    const items = rawItems.map(mapFabricacion).filter((item): item is Fabricacion => Boolean(item));
    const meta = json?.meta ?? {};

    const payload: FabricacionListResponse = {
      items,
      meta,
    };

    return NextResponse.json(payload);
  } catch (error) {
    console.error("[admin/fabricacion][GET] Unexpected error", error);
    return NextResponse.json(
      { error: "Error inesperado obteniendo las órdenes de fabricación" },
      { status: 500 }
    );
  }
}
