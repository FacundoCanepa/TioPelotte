// app/api/admin/products/route.ts
import { NextRequest, NextResponse } from "next/server";

/** Helpers básicos (sin dependencias) */
function toNumberOrNull(v: any): number | null {
  // 👇 evita Number("") => 0
  if (typeof v === "string" && v.trim() === "") return null;
  const n = Number(v);
  return Number.isFinite(n) ? n : null;
}
function isUUIDString(v: any): boolean {
  return typeof v === "string" && /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i.test(v);
}
function isLikelyDocIdString(v: any): boolean {
  // Acepta uuid y/o strings no numéricas (p.ej. docId corto)
  if (typeof v !== "string") return false;
  if (isUUIDString(v)) return true;
  // si no es número y tiene letras, consideramos que es documentId
  return Number.isNaN(Number(v)) && /[a-zA-Z]/.test(v);
}
function toId(value: any): number | string | undefined | null {
  if (value === undefined) return undefined; // no tocar
  if (value === null) return null; // desvincular
  if (typeof value === "string") {
    // 👇 string vacío => no tocar
    if (value.trim() === "") return undefined;
    const n = toNumberOrNull(value);
    return n ?? value; // si no es número, puede ser documentId
  }
  if (typeof value === "object" && value) {
    if ("documentId" in value) return String((value as any).documentId);
    if ("id" in value) return toNumberOrNull((value as any).id);
  }
  return toNumberOrNull(value);
}
function toIdsArray(value: any): number[] | undefined | null {
  if (value === undefined) return undefined; // no tocar
  if (value === null) return null; // desvincular
  const arr = Array.isArray(value) ? value : [value]; // acepta single o array
  const ids = arr
    .map((v) => {
      if (typeof v === "string" && v.trim() === "") return null; // 👈 ignora strings vacíos
      return v && typeof v === "object" && "id" in v ? (v as any).id : v;
    })
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

/**
 * buildSingleRelation:
 *  - undefined => no enviar campo
 *  - null => desvincular (null)
 *  - number => usar ID directo (modo clásico)
 *  - string (docId/uuid) => usar connect por documentId
 */
function buildSingleRelation(value: any) {
  const v = toId(value);
  if (v === undefined) return undefined;
  if (v === null) return null;
  if (typeof v === "number") return v; // Strapi acepta el id numérico para relación single
  if (typeof v === "string" && isLikelyDocIdString(v)) {
    return { connect: [{ documentId: v }] };
  }
  return v; // fallback por si acaso
}

/**
 * buildManyRelation:
 *  - undefined => no enviar campo
 *  - null => desvincular (null)
 *  - array de números => enviar ids
 *  - array/strings no numéricos => connect por documentId
 */
function buildManyRelation(value: any) {
  if (value === undefined) return undefined;
  if (value === null) return null;

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
    return numericIds; // Strapi acepta array de IDs numéricos
  }

  // Mezcla rara: preferimos connect por documentId si existen
  if (docIds.length > 0) {
    return { connect: docIds.map((d) => ({ documentId: d })) };
  }
  return []; // vacía si no pudimos parsear nada útil
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

  const base = {
    ...rest,
    productName,
    slug: slug || slugify(productName),
    price: price === undefined ? undefined : toNumberOrNull(price),
    stock: stock === undefined ? undefined : toNumberOrNull(stock),

    // media:
    img: toIdsArray(img),                   // single-media
    img_carousel: toIdsArray(img_carousel), // multiple-media

    // relaciones:
    category: buildSingleRelation(category),       // id o connect por documentId
    recetas: buildManyRelation(recetas),           // ids o connect por documentId
    ingredientes: buildManyRelation(ingredientes), // ids o connect por documentId
  };

  return stripUndefined(base);
}

export async function GET(req: NextRequest) {
  try {
    const token = process.env.STRAPI_API_TOKEN;
    const base = process.env.NEXT_PUBLIC_BACKEND_URL;
    if (!token || !base) {
      console.error("[API][products][GET] Missing envs", { hasToken: !!token, base });
      return NextResponse.json({ error: "Missing envs" }, { status: 500 });
    }

    const urlObj = new URL(req.url);
    const spIn = urlObj.searchParams;

    const q = (spIn.get("q") || "").trim();
    const page = spIn.get("page") || "1";
    const pageSize = spIn.get("pageSize") || "10";

    const sp = new URLSearchParams();
    sp.set("pagination[page]", page);
    sp.set("pagination[pageSize]", pageSize);
    // Campos mínimos para autocompletar
    sp.set("fields[0]", "documentId");
    sp.set("fields[1]", "productName");
    sp.set("fields[2]", "slug");
    // populate no es necesario para autocomplete, pero no hace daño
    if (!spIn.has("populate")) sp.set("populate", "*");
    // Filtro de búsqueda por nombre/slug
    if (q) {
      sp.set("filters[$or][0][productName][$containsi]", q);
      sp.set("filters[$or][1][slug][$containsi]", q);
    }

    const url = `${base}/api/products?${sp.toString()}`;
    console.log("[API][products][GET] URL:", url);

    const res = await fetch(url, {
      method: "GET",
      headers: { Authorization: `Bearer ${token}` },
      cache: "no-store",
    });

    const text = await res.text();
    let data: any = null;
    try { data = JSON.parse(text); } catch {}

    if (!res.ok) {
      console.error("[API][products][GET] Strapi error", { status: res.status, body: data ?? text });
      return NextResponse.json({ error: "Strapi error", status: res.status, body: data ?? text }, { status: res.status });
    }
    return NextResponse.json(data, { status: 200 });
  } catch (err: any) {
    console.error("[API][products][GET] Exception:", err?.message, err);
    return NextResponse.json({ error: err?.message ?? "Unknown error" }, { status: 500 });
  }
}

export async function POST(req: NextRequest) {
  try {
    const raw = await req.text();
    if (!raw) {
      console.warn("[API][products][POST] Empty body");
      return NextResponse.json({ error: "Empty body" }, { status: 400 });
    }

    let body: any;
    try {
      body = JSON.parse(raw);
    } catch {
      console.warn("[API][products][POST] Invalid JSON:", raw);
      return NextResponse.json({ error: "Invalid JSON" }, { status: 400 });
    }

    console.log("[API][products][POST] Raw body recibido:", body);

    const cleanBody = normalizeProductPayload(body);
    console.log("[API][products][POST] cleanBody (normalizado):", cleanBody);

    // Validaciones mínimas sin Zod (lo esencial para evitar 400 tontos)
    const required = ["productName", "slug", "price", "stock"];
    const missing = required.filter(
      (k) =>
        cleanBody[k as keyof typeof cleanBody] == null ||
        cleanBody[k as keyof typeof cleanBody] === ""
    );
    if (missing.length) {
      console.warn("[API][products][POST] Faltan campos requeridos:", missing);
      return NextResponse.json({ error: "Campos requeridos faltantes", missing }, { status: 400 });
    }

    const token = process.env.STRAPI_API_TOKEN;
    const base = process.env.NEXT_PUBLIC_BACKEND_URL;
    if (!token || !base) {
      console.error("[API][products][POST] Missing envs", { hasToken: !!token, base });
      return NextResponse.json({ error: "Missing envs" }, { status: 500 });
    }

    // Construimos payload final para Strapi
    const strapiPayload = { data: cleanBody };
    console.log("[API][products][POST] Payload → Strapi:", JSON.stringify(strapiPayload, null, 2));

    const url = `${base}/api/products`;
    console.log("[API][products][POST] URL Strapi:", url);

    const res = await fetch(url, {
      method: "POST",
      headers: { "Content-Type": "application/json", Authorization: `Bearer ${token}` },
      body: JSON.stringify(strapiPayload),
      cache: "no-store",
    });

    const text = await res.text();
    let data: any = null;
    try { data = JSON.parse(text); } catch {}

    console.log("[API][products][POST] Strapi status:", res.status);
    if (!res.ok) {
      console.error("[API][products][POST] Error Strapi", {
        status: res.status,
        body: data ?? text,
        enviado: strapiPayload,
      });
      return NextResponse.json(
        { error: "Strapi error", status: res.status, body: data ?? text, enviado: strapiPayload },
        { status: res.status }
      );
    }

    console.log("[API][products][POST] Producto creado OK:", data);
    return NextResponse.json(data, { status: 201 });
  } catch (err: any) {
    console.error("[API][products][POST] Exception:", err?.message, err);
    return NextResponse.json({ error: err?.message ?? "Unknown error" }, { status: 500 });
  }
}
