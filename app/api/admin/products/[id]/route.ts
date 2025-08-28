// app/api/admin/products/[id]/route.ts
import { NextRequest, NextResponse } from "next/server";

/** Helpers genéricos */
function toNumberOrNull(v: any): number | null {
  // 👇 evita Number("") => 0
  if (typeof v === "string" && v.trim() === "") return null;
  const n = Number(v);
  return Number.isFinite(n) ? n : null;
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

/** Detección simple de documentId string (uuid o string no numérica) */
function isUUIDString(v: any): boolean {
  return typeof v === "string" && /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i.test(v);
}
function isLikelyDocIdString(v: any): boolean {
  if (typeof v !== "string") return false;
  if (isUUIDString(v)) return true;
  // si no es número y tiene letras, lo tratamos como documentId
  return Number.isNaN(Number(v)) && /[a-zA-Z]/.test(v);
}

/** Normalizadores base (no tocan undefined) */
function toId(value: any): number | string | undefined | null {
  if (value === undefined) return undefined; // no tocar
  if (value === null) return null;           // desvincular
  if (typeof value === "string") {
    // 👇 string vacío => no tocar
    if (value.trim() === "") return undefined;
    const n = toNumberOrNull(value);
    return n ?? value;
  }
  if (typeof value === "object" && value) {
    if ("documentId" in value) return String((value as any).documentId);
    if ("id" in value) return toNumberOrNull((value as any).id);
  }
  return toNumberOrNull(value);
}
function toIdsArray(value: any): number[] | undefined | null {
  if (value === undefined) return undefined; // no tocar
  if (value === null) return null;           // desvincular
  const arr = Array.isArray(value) ? value : [value];
  const ids = arr
    .map((v) => {
      if (typeof v === "string" && v.trim() === "") return null; // 👈 ignora strings vacíos
      return v && typeof v === "object" && "id" in v ? (v as any).id : v;
    })
    .map(toNumberOrNull)
    .filter((n): n is number => n != null);
  return ids;
}

/**
 * Relaciones con soporte id/documentId:
 * - buildSingleRelation: category (one)
 * - buildManyRelation: ingredientes/recetas (many)
 *
 * Reglas:
 *  - undefined => NO enviar el campo (no tocar)
 *  - null      => desvincular (setear null / arreglo vacío según el tipo)
 *  - number    => usar id numérico directo
 *  - string no numérica => connect por documentId
 */
function buildSingleRelation(value: any) {
  const v = toId(value);
  if (v === undefined) return undefined;
  if (v === null) return null; // desvincular
  if (typeof v === "number") return v; // Strapi acepta el id numérico
  if (typeof v === "string" && isLikelyDocIdString(v)) {
    return { connect: [{ documentId: v }] };
  }
  // fallback
  return v;
}

function buildManyRelation(value: any) {
  if (value === undefined) return undefined;
  if (value === null) return null; // desvincular todo

  const arr = Array.isArray(value) ? value : [value];

  const numericIds = arr
    .map((v) => (v && typeof v === "object" && "id" in v ? (v as any).id : v))
    .map(toNumberOrNull)
    .filter((n): n is number => n != null);

  const docIds = arr
    .map((v) =>
      v && typeof v === "object" && "documentId" in v ? String((v as any).documentId) : v
    )
    .filter((x): x is string => typeof x === "string" && isLikelyDocIdString(x));

  if (docIds.length > 0 && numericIds.length === 0) {
    return { connect: docIds.map((d) => ({ documentId: d })) };
  }
  if (numericIds.length > 0 && docIds.length === 0) {
    return numericIds; // ids numéricos directos
  }
  // mezcla: priorizamos connect por documentId
  if (docIds.length > 0) {
    return { connect: docIds.map((d) => ({ documentId: d })) };
  }
  // nada parseable (evitamos mandar [] si no querías tocar)
  return undefined;
}

/** Normaliza SOLO lo que venga en el body (para no tocar lo que no mandaste) */
function normalizeProductPayload(input: any) {
  const {
    // campos reservados que NO se deben mandar a Strapi
    id,
    documentId,
    createdAt,
    updatedAt,
    publishedAt,

    // relaciones y media
    img,
    img_carousel,
    category,
    recetas,
    ingredientes,

    // campos estrictos
    productName,
    slug,
    price,
    stock,

    // resto queda tal cual venga (siempre sin undefined)
    ...rest
  } = input ?? {};

  const data: Record<string, any> = {
    ...rest,
  };

  // Campos simples (solo si se incluyeron en el body original)
  if (productName !== undefined) data.productName = productName;
  if (slug !== undefined) data.slug = slug || slugify(productName);
  if (price !== undefined) data.price = toNumberOrNull(price);
  if (stock !== undefined) data.stock = toNumberOrNull(stock);

  // Media:
  if (img !== undefined) data.img = toIdsArray(img); // single-media: number|null (Strapi lo acepta)
  if (img_carousel !== undefined) data.img_carousel = toIdsArray(img_carousel); // multi: number[]

  // Relaciones:
  if (category !== undefined) data.category = buildSingleRelation(category);
  if (recetas !== undefined) data.recetas = buildManyRelation(recetas);
  if (ingredientes !== undefined) data.ingredientes = buildManyRelation(ingredientes);

  // Fuera undefined (clave para no tocar campos no enviados)
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
    if (!token || !base) {
      console.error("[API][products/:id][GET] Missing envs", { hasToken: !!token, base });
      return NextResponse.json({ error: "Missing envs" }, { status: 500 });
    }
    if (!id) return NextResponse.json({ error: "Missing id" }, { status: 400 });

    const urlObj = new URL(req.url);
    const sp = urlObj.searchParams;
    if (!sp.has("populate")) sp.set("populate", "*");

    const url = `${base}/api/products/${id}?${sp.toString()}`;
    console.log("[API][products/:id][GET] URL:", url);

    const res = await fetch(url, {
      method: "GET",
      headers: { Authorization: `Bearer ${token}` },
      cache: "no-store",
    });

    const text = await res.text();
    let data: any = null;
    try { data = JSON.parse(text); } catch {}

    if (!res.ok) {
      console.error("[API][products/:id][GET] Strapi error", { status: res.status, body: data ?? text });
      return NextResponse.json({ error: "Strapi error", status: res.status, body: data ?? text }, { status: res.status });
    }
    return NextResponse.json(data, { status: 200 });
  } catch (err: any) {
    console.error("[API][products/:id][GET] Exception:", err?.message, err);
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
    if (!raw) {
      console.warn("[API][products/:id][PUT] Empty body");
      return NextResponse.json({ error: "Empty body" }, { status: 400 });
    }

    let body: any;
    try { body = JSON.parse(raw); }
    catch {
      console.warn("[API][products/:id][PUT] Invalid JSON:", raw);
      return NextResponse.json({ error: "Invalid JSON" }, { status: 400 });
    }

    console.log("[API][products/:id][PUT] Raw body recibido:", body);

    // ⚠️ Normalizamos SOLO lo que vino (para no pisar campos)
    const cleanBody = normalizeProductPayload(body);
    console.log("[API][products/:id][PUT] cleanBody (normalizado):", cleanBody);

    // Evitar enviar objetos vacíos
    if (!cleanBody || Object.keys(cleanBody).length === 0) {
      console.warn("[API][products/:id][PUT] Nada para actualizar");
      return NextResponse.json({ error: "No hay campos para actualizar" }, { status: 400 });
    }

    const token = process.env.STRAPI_API_TOKEN;
    const base = process.env.NEXT_PUBLIC_BACKEND_URL;
    if (!token || !base) {
      console.error("[API][products/:id][PUT] Missing envs", { hasToken: !!token, base });
      return NextResponse.json({ error: "Missing envs" }, { status: 500 });
    }

    const payload = { data: cleanBody };
    console.log("[API][products/:id][PUT] Payload → Strapi:", JSON.stringify(payload, null, 2));

    const url = `${base}/api/products/${id}`;
    console.log("[API][products/:id][PUT] URL Strapi:", url);

    const res = await fetch(url, {
      method: "PUT",
      headers: { "Content-Type": "application/json", Authorization: `Bearer ${token}` },
      body: JSON.stringify(payload),
      cache: "no-store",
    });

    const text = await res.text();
    let data: any = null;
    try { data = JSON.parse(text); } catch {}

    console.log("[API][products/:id][PUT] Strapi status:", res.status);
    if (!res.ok) {
      console.error("[API][products/:id][PUT] Error Strapi", {
        status: res.status,
        body: data ?? text,
        enviado: payload,
      });
      return NextResponse.json(
        { error: "Strapi error", status: res.status, body: data ?? text, enviado: payload },
        { status: res.status }
      );
    }
    console.log("[API][products/:id][PUT] Producto actualizado OK:", data);
    return NextResponse.json(data, { status: 200 });
  } catch (err: any) {
    console.error("[API][products/:id][PUT] Exception:", err?.message, err);
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
    if (!token || !base) {
      console.error("[API][products/:id][DELETE] Missing envs", { hasToken: !!token, base });
      return NextResponse.json({ error: "Missing envs" }, { status: 500 });
    }

    const url = `${base}/api/products/${id}`;
    console.log("[API][products/:id][DELETE] URL Strapi:", url);

    const res = await fetch(url, {
      method: "DELETE",
      headers: { Authorization: `Bearer ${token}` },
      cache: "no-store",
    });

    if (res.status === 204) return new NextResponse(null, { status: 204 });

    const text = await res.text();
    let data: any = null;
    try { data = JSON.parse(text); } catch {}

    if (!res.ok) {
      console.error("[API][products/:id][DELETE] Strapi error", { status: res.status, body: data ?? text });
      return NextResponse.json({ error: "Strapi error", status: res.status, body: data ?? text }, { status: res.status });
    }
    return NextResponse.json(data, { status: 200 });
  } catch (err: any) {
    console.error("[API][products/:id][DELETE] Exception:", err?.message, err);
    return NextResponse.json({ error: err?.message ?? "Unknown error" }, { status: 500 });
  }
}
