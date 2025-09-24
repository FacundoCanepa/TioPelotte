import type { SupplierType } from "@/types/supplier";
import { NextRequest, NextResponse } from "next/server";
import {
  fetchActiveSupplierCount,
  mapSupplierFromStrapi,
  sanitizeSupplierPayload,
  strapiFetch,
} from "./strapi-helpers";

function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === "object" && value !== null;
}

function buildStrapiListURL(searchParams: URLSearchParams) {
  const page = Math.max(Number(searchParams.get("page") ?? "1"), 1);
  const pageSize = Math.max(Number(searchParams.get("pageSize") ?? "10"), 1);
  const q = (searchParams.get("q") ?? "").trim();
  const active = searchParams.get("active");

  const params = new URLSearchParams();
  params.set("populate", "*");
  params.set("pagination[page]", String(page));
  params.set("pagination[pageSize]", String(pageSize));
  params.set("sort[0]", "updatedAt:desc");

  if (q) {
    params.set("filters[name][$containsi]", q);
  }

  if (active && active !== "all") {
    const isActive = active === "true" || active === "active";
    params.set("filters[active][$eq]", isActive ? "true" : "false");
  }

  return `/api/suppliers?${params.toString()}`;
}

export async function GET(req: NextRequest) {
  try {
    const url = new URL(req.url);
    const listPath = buildStrapiListURL(url.searchParams);
    const res = await strapiFetch(listPath);
    const json = (await res.json()) as Record<string, unknown>;

    if (!res.ok) {
      return NextResponse.json(
        { error: "Error listando proveedores", details: json },
        { status: res.status || 500 }
      );
    }

    const dataField = json.data;
    const dataArray = Array.isArray(dataField) ? dataField : [];
    const items = dataArray
      .map((entry) => mapSupplierFromStrapi(entry))
      .filter((supplier): supplier is SupplierType => Boolean(supplier));

    const metaField = isRecord(json.meta) ? (json.meta as Record<string, unknown>) : {};
    const paginationField = isRecord(metaField.pagination) ? (metaField.pagination as Record<string, unknown>) : {};
    const pageSizeValue = Number(paginationField.pageSize) || items.length || 1;
    const totalValue = Number(paginationField.total) || items.length;
    const pageCountValue = Number(paginationField.pageCount) || Math.max(1, Math.ceil(totalValue / pageSizeValue));

    const meta = {
      pagination: {
        page: Number(paginationField.page) || 1,
        pageSize: pageSizeValue,
        pageCount: pageCountValue,
        total: totalValue,
      },
    };

    let activeCount = items.filter((supplier) => supplier.active === true).length;
    try {
      activeCount = await fetchActiveSupplierCount();
    } catch (error) {
      console.warn("[admin/suppliers][GET] usando activeCount local por error", error);
    }

    const totalCount = meta.pagination.total ?? items.length;

    return NextResponse.json({ items, meta, totalCount, activeCount });
  } catch (error) {
    console.error("[admin/suppliers][GET] unexpected error", error);
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
      sanitizedPayload = sanitizeSupplierPayload(body);
    } catch (error) {
      const message = error instanceof Error ? error.message : "Datos inválidos";
      return NextResponse.json({ error: message }, { status: 400 });
    }

    const res = await strapiFetch("/api/suppliers", {
      method: "POST",
      body: JSON.stringify({ data: sanitizedPayload }),
    });
    const json = (await res.json()) as Record<string, unknown>;

    if (!res.ok) {
      return NextResponse.json(
        { error: "Error creando proveedor", details: json },
        { status: res.status || 500 }
      );
    }

    const supplier = mapSupplierFromStrapi(json?.data);
    if (!supplier) {
      return NextResponse.json(
        { error: "Respuesta inválida del servidor" },
        { status: 502 }
      );
    }

    return NextResponse.json({ data: supplier }, { status: 201 });
  } catch (error) {
    console.error("[admin/suppliers][POST] unexpected error", error);
    return NextResponse.json(
      { error: "Error inesperado", details: String(error instanceof Error ? error.message : error) },
      { status: 500 }
    );
  }
}