import { NextRequest, NextResponse } from "next/server";

function toNumberOrNull(v: any): number | null {
  const n = Number(v);
  return Number.isFinite(n) ? n : null;
}
function toId(value: any): number | undefined | null {
  if (value === undefined) return undefined;
  if (value === null) return null;
  if (typeof value === "object" && value && "id" in value) return toNumberOrNull((value as any).id);
  return toNumberOrNull(value);
}
function toIdsArray(value: any): number[] | undefined | null {
  if (value === undefined) return undefined;
  if (value === null) return null;
  const arr = Array.isArray(value) ? value : [value];
  const ids = arr
    .map((v) => (v && typeof v === "object" && "id" in v ? (v as any).id : v))
    .map(toNumberOrNull)
    .filter((n): n is number => n != null);
  return ids;
}
function stripUndefined<T extends Record<string, any>>(obj: T): T {
  const out: Record<string, any> = {};
  for (const [k, v] of Object.entries(obj)) if (v !== undefined) out[k] = v;
  return out as T;
}
function slugify(text?: string): string | undefined {
  if (!text) return undefined;
  return text
    .toString()
    .normalize("NFKD").replace(/[\u0300-\u036f]/g, "")
    .toLowerCase()
    .trim()
    .replace(/\s+/g, "-")
    .replace(/[^a-z0-9-]/g, "")
    .replace(/-+/g, "-");
}
function normalizeProductPayload(input: any) {
  const {
    id,
    documentId,
    createdAt,
    updatedAt,
    publishedAt,
    img,
    img_carousel,
    category,
    recetas,
    ingredientes,
    price,
    stock,
    productName,
    slug,
    ...rest
  } = input ?? {};

  const data = {
    ...rest,
    productName,
    slug: slug || slugify(productName),
    price: price === undefined ? undefined : toNumberOrNull(price),
    stock: stock === undefined ? undefined : toNumberOrNull(stock),
    img: toIdsArray(img),
    img_carousel: toIdsArray(img_carousel),
    category: toId(category),
    recetas: toIdsArray(recetas),
    ingredientes: toIdsArray(ingredientes),
  };

  return stripUndefined(data);
}

export async function GET(
  req: NextRequest,
  ctx: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await ctx.params;
    const token = process.env.STRAPI_API_TOKEN;
    const base = process.env.NEXT_PUBLIC_BACKEND_URL;
    if (!token || !base) return NextResponse.json({ error: "Missing envs" }, { status: 500 });
    if (!id) return NextResponse.json({ error: "Missing id" }, { status: 400 });

    const urlObj = new URL(req.url);
    const sp = urlObj.searchParams;
    if (!sp.has("populate")) sp.set("populate", "*");

    const res = await fetch(`${base}/api/products/${id}?${sp.toString()}`, {
      method: "GET",
      headers: { Authorization: `Bearer ${token}` },
      cache: "no-store",
    });

    const text = await res.text();
    let data: any = null;
    try { data = JSON.parse(text); } catch {}

    if (!res.ok) {
      return NextResponse.json({ error: "Strapi error", status: res.status, body: data ?? text }, { status: res.status });
    }
    return NextResponse.json(data, { status: 200 });
  } catch (err: any) {
    return NextResponse.json({ error: err?.message ?? "Unknown error" }, { status: 500 });
  }
}

export async function PUT(
  req: NextRequest,
  ctx: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await ctx.params;
    if (!id) return NextResponse.json({ error: "Missing id param" }, { status: 400 });

    const raw = await req.text();
    if (!raw) return NextResponse.json({ error: "Empty body" }, { status: 400 });

    let body: any;
    try { body = JSON.parse(raw); } catch { return NextResponse.json({ error: "Invalid JSON" }, { status: 400 }); }

    const cleanBody = normalizeProductPayload(body);

    const token = process.env.STRAPI_API_TOKEN;
    const base = process.env.NEXT_PUBLIC_BACKEND_URL;
    if (!token || !base) return NextResponse.json({ error: "Missing envs" }, { status: 500 });

    const res = await fetch(`${base}/api/products/${id}`, {
      method: "PUT",
      headers: { "Content-Type": "application/json", Authorization: `Bearer ${token}` },
      body: JSON.stringify({ data: cleanBody }),
      cache: "no-store",
    });

    const text = await res.text();
    let data: any = null;
    try { data = JSON.parse(text); } catch {}

    if (!res.ok) {
      return NextResponse.json({ error: "Strapi error", status: res.status, body: data ?? text }, { status: res.status });
    }
    return NextResponse.json(data, { status: 200 });
  } catch (err: any) {
    return NextResponse.json({ error: err?.message ?? "Unknown error" }, { status: 500 });
  }
}

export async function DELETE(
  _req: NextRequest,
  ctx: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await ctx.params;
    if (!id) return NextResponse.json({ error: "Missing id param" }, { status: 400 });

    const token = process.env.STRAPI_API_TOKEN;
    const base = process.env.NEXT_PUBLIC_BACKEND_URL;
    if (!token || !base) return NextResponse.json({ error: "Missing envs" }, { status: 500 });

    const res = await fetch(`${base}/api/products/${id}`, {
      method: "DELETE",
      headers: { Authorization: `Bearer ${token}` },
      cache: "no-store",
    });

    if (res.status === 204) return new NextResponse(null, { status: 204 });

    const text = await res.text();
    let data: any = null;
    try { data = JSON.parse(text); } catch {}

    if (!res.ok) {
      return NextResponse.json({ error: "Strapi error", status: res.status, body: data ?? text }, { status: res.status });
    }
    return NextResponse.json(data, { status: 200 });
  } catch (err: any) {
    return NextResponse.json({ error: err?.message ?? "Unknown error" }, { status: 500 });
  }
}
