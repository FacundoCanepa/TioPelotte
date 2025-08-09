import { NextRequest, NextResponse } from "next/server";

/* =========================
   Helpers + Normalización
   ========================= */

function toNumberOrNull(v: any): number | null {
  const n = Number(v);
  return Number.isFinite(n) ? n : null;
}
function isDigitString(s: any): boolean {
  return typeof s === "string" && /^\d+$/.test(s.trim());
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

function toIdsArray(value: any): number[] | undefined | null {
  if (value === undefined) return undefined; // no tocar
  if (value === null) return null;          // limpiar relación
  const arr = Array.isArray(value) ? value : [value];
  const ids = arr
    .map((v) => (v && typeof v === "object" && "id" in v ? (v as any).id : v))
    .map(toNumberOrNull)
    .filter((n): n is number => n != null);
  return ids;
}

/** Construye payload de relación oneToOne para Strapi v5 (connect/disconnect).
 *  Acepta: undefined | null | number | string | {id}|{documentId}
 */
function buildOneToOneRelation(value: any, logPrefix = "category"):
  | undefined
  | { connect: Array<{ id?: number; documentId?: string }> }
  | { disconnect: true }
{
  if (value === undefined) {
    console.log(`🔵 [${logPrefix}] value: undefined → NO TOCAR (se omite el campo)`);
    return undefined;
  }
  if (value === null) {
    console.log(`🔵 [${logPrefix}] value: null → { disconnect: true }`);
    return { disconnect: true };
  }

  // Objeto con id o documentId
  if (typeof value === "object" && value) {
    const vid = (value as any).id;
    const vdoc = (value as any).documentId;
    if (vid != null && isDigitString(String(vid))) {
      console.log(`🔵 [${logPrefix}] objeto.id → connect by id:`, Number(vid));
      return { connect: [{ id: Number(vid) }] };
    }
    if (typeof vdoc === "string" && vdoc.trim()) {
      console.log(`🔵 [${logPrefix}] objeto.documentId → connect by documentId:`, vdoc.trim());
      return { connect: [{ documentId: vdoc.trim() }] };
    }
  }

  // Número o string numérico
  if (typeof value === "number" || isDigitString(value)) {
    const n = toNumberOrNull(value);
    console.log(`🔵 [${logPrefix}] num/dígitos → connect by id:`, n);
    return { connect: [{ id: n! }] };
  }

  // String no numérico → documentId
  if (typeof value === "string" && value.trim()) {
    console.log(`🟠 [${logPrefix}] string no numérico → connect by documentId:`, value.trim());
    return { connect: [{ documentId: value.trim() }] };
  }

  console.log(`🟡 [${logPrefix}] valor no reconocido → no tocar`);
  return undefined;
}

function normalizeProductPayload(input: any) {
  console.log("🧾 [normalize POST] input keys:", Object.keys(input ?? {}));
  console.log("🧾 [normalize POST] category (raw):", input?.category, "type:", typeof input?.category);

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

  // base
  const data: Record<string, any> = {
    ...rest,
    productName,
    slug: slug || slugify(productName),
    price: price === undefined ? undefined : toNumberOrNull(price),
    stock: stock === undefined ? undefined : toNumberOrNull(stock),
    img: toIdsArray(img),
    img_carousel: toIdsArray(img_carousel),
    recetas: toIdsArray(recetas),
    ingredientes: toIdsArray(ingredientes),
  };

  // relación oneToOne category (v5 connect/disconnect)
  const catRel = buildOneToOneRelation(category, "category");
  if (catRel !== undefined) data.category = catRel;

  const cleaned = stripUndefined(data);
  console.log("🧼 [normalize POST] payload limpio:", cleaned);
  return cleaned;
}

/* ================
   Handlers
   ================ */

export async function GET(req: NextRequest) {
  try {
    const token = process.env.STRAPI_API_TOKEN;
    const base = process.env.NEXT_PUBLIC_BACKEND_URL;
    if (!token || !base) {
      console.error("⛔ Missing envs STRAPI_API_TOKEN or NEXT_PUBLIC_BACKEND_URL");
      return NextResponse.json({ error: "Missing envs" }, { status: 500 });
    }

    const urlObj = new URL(req.url);
    const sp = urlObj.searchParams;
    if (!sp.has("populate")) sp.set("populate", "*");
    const strapiUrl = `${base}/api/products?${sp.toString()}`;

    console.log("🔎 [GET] products →", strapiUrl);
    const res = await fetch(strapiUrl, {
      method: "GET",
      headers: { Authorization: `Bearer ${token}` },
      cache: "no-store",
    });

    const txt = await res.text();
    console.log("⬅️ [GET] status:", res.status);

    let data: any = null;
    try { data = JSON.parse(txt); } catch {}
    if (!res.ok) {
      console.error("⛔ [GET] body:", data ?? txt);
      return NextResponse.json({ error: "Strapi error", status: res.status, body: data ?? txt }, { status: res.status });
    }

    return NextResponse.json(data, { status: 200 });
  } catch (err: any) {
    console.error("💥 Error GET /api/admin/products:", err);
    return NextResponse.json({ error: err?.message ?? "Unknown error" }, { status: 500 });
  }
}

export async function POST(req: NextRequest) {
  try {
    const raw = await req.text();
    console.log("🟢 [POST] rawBody:", raw);

    if (!raw) return NextResponse.json({ error: "Empty body" }, { status: 400 });

    let body: any;
    try { body = JSON.parse(raw); }
    catch (e) {
      console.error("⛔ [POST] Invalid JSON:", e);
      return NextResponse.json({ error: "Invalid JSON" }, { status: 400 });
    }

    const token = process.env.STRAPI_API_TOKEN;
    const base = process.env.NEXT_PUBLIC_BACKEND_URL;
    if (!token || !base) {
      console.error("⛔ Missing envs STRAPI_API_TOKEN or NEXT_PUBLIC_BACKEND_URL");
      return NextResponse.json({ error: "Missing envs" }, { status: 500 });
    }

    const cleanData = normalizeProductPayload(body);

    const url = `${base}/api/products`;
    console.log("📤 [POST] →", url, "payload:", JSON.stringify({ data: cleanData }));
    const res = await fetch(url, {
      method: "POST",
      headers: { "Content-Type": "application/json", Authorization: `Bearer ${token}` },
      body: JSON.stringify({ data: cleanData }),
      cache: "no-store",
    });

    const txt = await res.text();
    console.log("⬅️ [POST] status:", res.status, "body:", txt);

    let created: any = null;
    try { created = JSON.parse(txt); } catch {}
    if (!res.ok) {
      return NextResponse.json({ error: "Strapi error", status: res.status, body: created ?? txt }, { status: res.status });
    }

    // 🔁 REFETCH con populate=* usando documentId (v5)
    try {
      const savedDocId = created?.data?.documentId;
      const refetchUrl = `${base}/api/products/${savedDocId}?populate=*`;
      console.log("🔎 [POST→GET] refetch (by documentId):", refetchUrl);

      const ref = await fetch(refetchUrl, { headers: { Authorization: `Bearer ${token}` }, cache: "no-store" });
      const refTxt = await ref.text();
      console.log("⬅️ [POST→GET] status:", ref.status, "body:", refTxt);

      let refJson: any = null; try { refJson = JSON.parse(refTxt); } catch {}
      if (ref.ok) return NextResponse.json(refJson, { status: 201 });
      console.warn("⚠️ [POST→GET] falló refetch, devuelvo respuesta del POST");
    } catch (e) {
      console.warn("⚠️ [POST→GET] error refetch:", e);
    }

    return NextResponse.json(created, { status: 201 });
  } catch (err: any) {
    console.error("💥 Error POST /api/admin/products:", err);
    return NextResponse.json({ error: err?.message ?? "Unknown error" }, { status: 500 });
  }
}
