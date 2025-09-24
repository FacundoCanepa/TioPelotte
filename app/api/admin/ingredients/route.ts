
import { NextRequest, NextResponse } from "next/server";

const STRAPI_URL = process.env.NEXT_PUBLIC_BACKEND_URL!;
const STRAPI_TOKEN = process.env.STRAPI_ADMIN_TOKEN || process.env.STRAPI_API_TOKEN;

async function strapiFetch(path: string, init?: RequestInit) {
  const url = `${STRAPI_URL}${path}`;
  const method = init?.method || "GET";
  const headers = new Headers(init?.headers);
  if (!headers.has("Content-Type")) headers.set("Content-Type", "application/json");
  if (STRAPI_TOKEN) headers.set("Authorization", `Bearer ${STRAPI_TOKEN}`);
  try {
    const res = await fetch(url, { ...init, headers, cache: "no-store" });
    return res;
  } catch (e) {
    console.error("[admin/ingredients][strapiFetch] error", e);
    throw e;
  }
}

function buildStrapiListURL(searchParams: URLSearchParams) {
  const page = Number(searchParams.get("page") || "1");
  const pageSize = Number(searchParams.get("pageSize") || "50");
  const q = (searchParams.get("q") || "").trim();
  const categoryId = (searchParams.get("categoryId") || "").trim();
  const sp = new URLSearchParams();

  sp.set("populate", "*");
  
  if (q) {
    sp.set("filters[ingredienteName][$containsi]", q);
  }

  
  if (categoryId) {
    sp.set("filters[categoria_ingrediente][id][$eq]", categoryId);
  }
  sp.set("pagination[page]", String(page));
  sp.set("pagination[pageSize]", String(pageSize));
  sp.set("sort[0]", "updatedAt:desc");

  return `/api/ingredientes?${sp.toString()}`;
}

function mapIngredientFromStrapi(s: any) {
  if (!s) return null;
  const { id, attributes } = s;
  if (!id || !attributes) return s; // Fallback for flat structure
  return {
    id: id,
    ingredienteName: attributes.ingredienteName,
    stock: attributes.stock,
    unidadMedida: attributes.unidadMedida,
    precio: attributes.precio,
    stockUpdatedAt: attributes.stockUpdatedAt,
  };
}

export async function GET(req: Request) {
  try {
    const url = new URL(req.url);
    const listUrl = buildStrapiListURL(url.searchParams);
    const res = await strapiFetch(listUrl);
    const json = await res.json();
    if (!res.ok) {
      return NextResponse.json(
        { error: "Error listando ingredientes", details: json },
        { status: res.status || 500 }
      );
    }

    const data = Array.isArray(json.data) ? json.data : [];
    const items = data.map(mapIngredientFromStrapi).filter(Boolean);

    const meta = json.meta ?? { pagination: { page: 1, pageSize: items.length, total: items.length, pageCount: 1 } };

    const payload = {
      items,
      meta,
      totalCount: meta?.pagination?.total ?? items.length,
    };

    return NextResponse.json(payload);
  } catch (e: any) {
    console.log("[admin/ingredients][GET] unexpected error:", e);
    return NextResponse.json({ error: "Error inesperado", details: String(e) }, { status: 500 });
  }
}
