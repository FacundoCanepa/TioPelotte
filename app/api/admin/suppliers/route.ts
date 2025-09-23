
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
    console.error("[admin/suppliers][strapiFetch] error", e);
    throw e;
  }
}

function buildStrapiListURL(searchParams: URLSearchParams) {
  const page = Number(searchParams.get("page") || "1");
  const pageSize = Number(searchParams.get("pageSize") || "10");
  const q = (searchParams.get("q") || "").trim();
  const active = (searchParams.get("active") || "all") as "all" | "true" | "false";

  const sp = new URLSearchParams();

  sp.set("populate", "*");

  sp.set("fields[0]", "name");
  sp.set("fields[1]", "phone");
  sp.set("fields[2]", "active");

  if (q) {
    sp.set("filters[$or][0][name][$containsi]", q);
  }
  if (active === "true") {
    sp.set("filters[active][$eq]", "true");
  } else if (active === "false") {
    sp.set("filters[active][$eq]", "false");
  }

  sp.set("pagination[page]", String(page));
  sp.set("pagination[pageSize]", String(pageSize));
  sp.set("sort[0]", "updatedAt:desc");

  return `/api/suppliers?${sp.toString()}`;
}

function mapSupplierFromStrapi(s: any) {
  if (!s) return null;
  const { id, attributes } = s;
  if (!id || !attributes) return s; // Fallback for flat structure
  return {
    id: id,
    name: attributes.name,
    phone: attributes.phone,
    active: attributes.active,
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
        { error: "Error listando proveedores", details: json },
        { status: res.status || 500 }
      );
    }

    const data = Array.isArray(json.data) ? json.data : [];
    const items = data.map(mapSupplierFromStrapi).filter(Boolean);

    const meta = json.meta ?? { pagination: { page: 1, pageSize: items.length, total: items.length, pageCount: 1 } };

    const countSP = new URLSearchParams();
    countSP.set("filters[active][$eq]", "true");
    countSP.set("pagination[pageSize]", "1");
    const countUrl = `${STRAPI_URL}/api/suppliers?${countSP.toString()}`;

    let activeCount = 0;
    try {
      const resCount = await fetch(countUrl, {
        headers: { Authorization: `Bearer ${STRAPI_TOKEN}` },
        cache: "no-store",
      });
      const jsonCount = await resCount.json();
      activeCount = jsonCount?.meta?.pagination?.total ?? 0;
    } catch (e) {
      console.log("[admin/suppliers][GET] count error:", e);
    }

    const payload = {
      items,
      meta,
      totalCount: meta?.pagination?.total ?? items.length,
      activeCount,
    };

    return NextResponse.json(payload);
  } catch (e: any) {
    console.log("[admin/suppliers][GET] unexpected error:", e);
    return NextResponse.json({ error: "Error inesperado", details: String(e) }, { status: 500 });
  }
}

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const strapiPayload = { data: body };
    const createRes = await strapiFetch("/api/suppliers", {
      method: "POST",
      body: JSON.stringify(strapiPayload),
    });
    const createJson = await createRes.json();
    if (!createRes.ok) {
      return NextResponse.json({ error: "Strapi error", details: createJson }, { status: createRes.status });
    }

    const newId = createJson?.data?.id;
    if (!newId) {
      return NextResponse.json(createJson, { status: 201 });
    }
    const refetchRes = await strapiFetch(`/api/suppliers/${newId}?populate=*`);
    const refetchJson = await refetchRes.json();
    if (!refetchRes.ok) {
      return NextResponse.json(createJson, { status: 201 });
    }
    const createdItem = mapSupplierFromStrapi(refetchJson.data);
    return NextResponse.json(createdItem, { status: 201 });
  } catch (e: any) {
    return NextResponse.json({ error: "Internal error", details: e.message }, { status: 500 });
  }
}
