import { NextRequest, NextResponse } from 'next/server';
import { slugifyEs } from '@/utils/slug';

const STRAPI_URL = process.env.NEXT_PUBLIC_BACKEND_URL!;
const STRAPI_TOKEN = process.env.STRAPI_ADMIN_TOKEN || process.env.STRAPI_API_TOKEN;

async function strapiFetch(path: string, init?: RequestInit) {
  const url = `${STRAPI_URL}${path}`;
  const method = init?.method || 'GET';
  const headers = new Headers(init?.headers);
  if (!headers.has('Content-Type')) headers.set('Content-Type', 'application/json');
  if (STRAPI_TOKEN) headers.set('Authorization', `Bearer ${STRAPI_TOKEN}`);
  try {
    const dbg: any = { url, method };
    if (method !== 'GET' && init?.body) {
      try {
        const parsed = typeof init.body === 'string' ? JSON.parse(init.body) : init.body;
        dbg.bodyKeys = parsed && typeof parsed === 'object' ? Object.keys(parsed) : undefined;
      } catch {}
    }
    const res = await fetch(url, { ...init, headers, cache: 'no-store' });
    return res;
  } catch (e) {
    console.error('[admin/recipes][strapiFetch] error', e);
    throw e;
  }
}

async function ensureUniqueSlug(baseSlug: string): Promise<string> {
  let slug = baseSlug;
  let attempt = 1;
  while (true) {
    const qs = new URLSearchParams();
    qs.set('filters[slug][$eq]', slug);
    qs.set('pagination[pageSize]', '1');
    const res = await strapiFetch(`/api/recetas?${qs.toString()}`);
    if (!res.ok) break; // be permissive on errors
    const json = await res.json();
    const exists = Array.isArray(json?.data) && json.data.length > 0;
    if (!exists) break;
    attempt += 1;
    slug = `${baseSlug}-${attempt}`;
  }
  return slug;
}

async function resolveStrapiProductIdsByDocumentIds(docIds: string[]): Promise<number[]> {
  if (!docIds?.length) return [];
  const qs = new URLSearchParams();
  for (const d of docIds) qs.append('filters[documentId][$in]', d);
  qs.set('fields[0]', 'id');
  qs.set('fields[1]', 'documentId');
  qs.set('pagination[pageSize]', String(Math.max(100, docIds.length)));
  const res = await strapiFetch(`/api/products?${qs.toString()}`);
  if (!res.ok) {
    const txt = await res.text();
    console.error('[admin/recipes][POST] resolve products error', res.status, txt);
    return [];
  }
  const json = await res.json();
  const items = Array.isArray(json?.data) ? json.data : [];
  return items
    .map((p: any) => (typeof p?.id === 'number' ? p.id : p?.attributes?.id))
    .filter((x: any) => typeof x === 'number');
}

async function getFoundProductDocumentIds(docIds: string[]): Promise<string[]> {
  if (!docIds?.length) return [];
  const qs = new URLSearchParams();
  for (const d of docIds) qs.append('filters[documentId][$in]', d);
  qs.set('fields[0]', 'documentId');
  qs.set('pagination[pageSize]', String(Math.max(100, docIds.length)));
  const res = await strapiFetch(`/api/products?${qs.toString()}`);
  if (!res.ok) return [];
  const json = await res.json();
  const items = Array.isArray(json?.data) ? json.data : [];
  return items
    .map((p: any) => p?.documentId ?? p?.attributes?.documentId)
    .filter((x: any) => typeof x === 'string');
}

async function getRecetasRelationFieldName(): Promise<string> {
  try {
    const sp = new URLSearchParams();
    sp.set('populate', '*');
    sp.set('pagination[pageSize]', '1');
    const res = await strapiFetch(`/api/recetas?${sp.toString()}`);
    if (!res.ok) return 'productos';
    const json = await res.json();
    const first = json?.data?.[0];
    const attrs = first?.attributes ?? first ?? {};
    const candidates = ['productosRelacionados', 'productos', 'products', 'relatedProducts'];
    for (const key of candidates) {
      const val = attrs?.[key];
      if (!val) continue;
      if (Array.isArray(val) || typeof val === 'object') return key;
    }
  } catch (e) {
    console.log('[admin/recipes][POST] relation field detect error', e);
  }
  return 'productos';
}

async function getRecetasImageFieldName(): Promise<string> {
  try {
    const sp = new URLSearchParams();
    sp.set('populate', '*');
    sp.set('pagination[pageSize]', '1');
    const res = await strapiFetch(`/api/recetas?${sp.toString()}`);
    if (!res.ok) return 'img';
    const json = await res.json();
    const first = json?.data?.[0];
    const attrs = first?.attributes ?? first ?? {};
    const candidates = ['imagen', 'img', 'image', 'cover', 'coverImage', 'photo', 'foto', 'thumbnail'];
    for (const key of candidates) {
      const v = attrs?.[key];
      if (!v) continue;
      if (typeof v === 'object') return key;
    }
  } catch (e) {
    console.log('[admin/recipes][POST] image field detect error', e);
  }
  return 'img';
}

function buildStrapiListURL(searchParams: URLSearchParams) {
  const page = Number(searchParams.get('page') || '1');
  const pageSize = Number(searchParams.get('pageSize') || '10');
  const q = (searchParams.get('q') || '').trim();
  const published = (searchParams.get('published') || 'all') as 'all' | 'true' | 'false';
  const productDocumentId = searchParams.get('productDocumentId');

  const sp = new URLSearchParams();

  // ⚠️ Temporal: evitamos claves inválidas con populate global
  sp.set('populate', '*');

  // Campos base (opcionales)
  sp.set('fields[0]', 'documentId');
  sp.set('fields[1]', 'titulo');
  sp.set('fields[2]', 'slug');
  sp.set('fields[3]', 'descripcion');
  sp.set('fields[4]', 'preparacion');
  sp.set('fields[5]', 'tiempo');
  sp.set('fields[6]', 'porciones');
  sp.set('fields[7]', 'publishedAt');
  sp.set('fields[8]', 'updatedAt');

  // Filtros
  if (q) {
    sp.set('filters[$or][0][titulo][$containsi]', q);
    sp.set('filters[$or][1][slug][$containsi]', q);
  }
  if (published === 'true') {
    sp.set('filters[publishedAt][$notNull]', 'true');
  } else if (published === 'false') {
    sp.set('filters[publishedAt][$null]', 'true');
  }
  if (productDocumentId) {
    // Probar relación por nombre "productos" (ajustable)
    sp.set('filters[productos][documentId][$eq]', productDocumentId);
  }

  // Paginación y orden
  sp.set('pagination[page]', String(page));
  sp.set('pagination[pageSize]', String(pageSize));
  sp.set('sort[0]', 'updatedAt:desc');

  return `${STRAPI_URL}/api/recetas?${sp.toString()}`;
}

function mapRecipeFromStrapi(r: any) {
  // Media: tomar el primero que exista
  const mediaField = r.imagen || r.img || r.image || null;
  const imagen = mediaField
    ? {
        url: mediaField.url,
        alternativeText: mediaField.alternativeText ?? r.titulo,
      }
    : null;

  // Relación productos: probar varios nombres
  const rel = r.productos || r.relatedProducts || r.products || [];
  const productosRelacionados = Array.isArray(rel)
    ? rel.map((p: any) => ({
        documentId: p.documentId,
        productName: p.productName ?? p.titulo ?? p.nombre ?? '',
        slug: p.slug,
      }))
    : [];

  return {
    documentId: r.documentId,
    titulo: r.titulo,
    slug: r.slug,
    descripcion: r.descripcion,
    preparacion: r.preparacion,
    tiempo: r.tiempo,
    porciones: r.porciones,
    publishedAt: r.publishedAt,
    updatedAt: r.updatedAt,
    imagen,
    productosRelacionados,
  };
}

export async function GET(req: Request) {
  try {
    const url = new URL(req.url);
    const qp = Object.fromEntries(url.searchParams.entries());
    console.log('[admin/recipes][GET] query:', qp);

    const listUrl = buildStrapiListURL(url.searchParams);
    console.log('[admin/recipes][GET] strapi url:', listUrl);

    const res = await fetch(listUrl, {
      headers: { Authorization: `Bearer ${STRAPI_TOKEN}` },
      cache: 'no-store',
    });
    const json = await res.json();
    console.log('[admin/recipes][GET] strapi status:', res.status);
    if (!res.ok) {
      console.log('[admin/recipes][GET] strapi error json:', json);
      return NextResponse.json(
        { error: 'Error listando recetas', details: json },
        { status: res.status || 500 }
      );
    }

    const data = Array.isArray(json.data) ? json.data : [];
    // Strapi v5 entrega flat sin .attributes
    const items = data.map(mapRecipeFromStrapi);

    const meta = json.meta ?? { pagination: { page: 1, pageSize: items.length, total: items.length, pageCount: 1 } };

    // Count publicadas (consulta rápida separada)
    const countSP = new URLSearchParams();
    countSP.set('filters[publishedAt][$notNull]', 'true');
    countSP.set('pagination[pageSize]', '1');
    const countUrl = `${STRAPI_URL}/api/recetas?${countSP.toString()}`;
    console.log('[admin/recipes][GET] count url:', countUrl);

    let publishedCount = 0;
    try {
      const resCount = await fetch(countUrl, {
        headers: { Authorization: `Bearer ${STRAPI_TOKEN}` },
        cache: 'no-store',
      });
      const jsonCount = await resCount.json();
      publishedCount = jsonCount?.meta?.pagination?.total ?? 0;
      console.log('[admin/recipes][GET] publishedCount:', publishedCount);
    } catch (e) {
      console.log('[admin/recipes][GET] count error:', e);
    }

    const payload = {
      items,
      meta,
      totalCount: meta?.pagination?.total ?? items.length,
      publishedCount,
    };
    console.log('[admin/recipes][GET] response payload:', payload);

    return NextResponse.json(payload);
  } catch (e: any) {
    console.log('[admin/recipes][GET] unexpected error:', e);
    return NextResponse.json({ error: 'Error inesperado', details: String(e) }, { status: 500 });
  }
}

export async function POST(req: NextRequest) {
  try {
    const raw = await req.text();
    if (!raw) return NextResponse.json({ error: 'Empty body' }, { status: 400 });
    let body: any;
    try {
      body = JSON.parse(raw);
    } catch {
      return NextResponse.json({ error: 'Invalid JSON' }, { status: 400 });
    }

    console.log('[admin/recipes][POST] body', body);

    const data: any = {};
    if (typeof body.titulo === 'string') data.titulo = body.titulo.trim();
    if (typeof body.descripcion === 'string') data.descripcion = body.descripcion.trim();
    if (typeof body.preparacion === 'string') data.preparacion = body.preparacion.trim();
    if (typeof body.tiempo === 'string') data.tiempo = body.tiempo.trim();
    if (typeof body.porciones === 'string') data.porciones = body.porciones.trim();

    // slug: prefer body.slug, else from titulo; ensure unique
    const baseSlug = slugifyEs((body.slug || data.titulo || '').trim());
    if (baseSlug) data.slug = await ensureUniqueSlug(baseSlug);

    // productos relacionados by documentId -> numeric IDs
    let handledRelated = false;
    if (Array.isArray(body.productosRelacionadosDocumentIds) && body.productosRelacionadosDocumentIds.length > 0) {
      const incomingDocIds = body.productosRelacionadosDocumentIds.filter(Boolean);
      const ids = await resolveStrapiProductIdsByDocumentIds(incomingDocIds);
      if (ids.length !== incomingDocIds.length) {
        const found = await getFoundProductDocumentIds(incomingDocIds);
        const missing = incomingDocIds.filter((d: string) => !found.includes(d));
        console.warn('[admin/recipes][POST] some product documentIds not found', { missing, found });
      }
      if (ids.length > 0) {
        const relationKey = await getRecetasRelationFieldName();
        data[relationKey] = ids;
        handledRelated = true;
      }
    }
    if (!handledRelated && Array.isArray((body as any).productosRelacionados) && (body as any).productosRelacionados.length > 0) {
      const incomingDocIds = (body as any).productosRelacionados
        .map((p: any) => (typeof p === 'string' ? p : p?.documentId))
        .filter(Boolean);
      if (incomingDocIds.length > 0) {
        const ids = await resolveStrapiProductIdsByDocumentIds(incomingDocIds);
        if (ids.length !== incomingDocIds.length) {
          const found = await getFoundProductDocumentIds(incomingDocIds);
          const missing = incomingDocIds.filter((d: string) => !found.includes(d));
          console.warn('[admin/recipes][POST] some product documentIds not found (legacy)', { missing, found });
        }
        if (ids.length > 0) {
          const relationKey = await getRecetasRelationFieldName();
          data[relationKey] = ids;
        }
      }
    }

    // publish switch convenience
    if (typeof body.publishedAt !== 'undefined') {
      data.publishedAt = body.publishedAt;
    } else if (typeof (body as any).published === 'boolean') {
      data.publishedAt = (body as any).published ? new Date().toISOString() : null;
    }

    // image (single-media), if provided as numeric id
    if (typeof (body as any).imagenId === 'number') {
      const imageKey = await getRecetasImageFieldName();
      (data as any)[imageKey] = (body as any).imagenId;
    }

    const strapiPayload = { data };
    console.log('[admin/recipes][POST] payload for Strapi', JSON.stringify(strapiPayload));
    const createRes = await strapiFetch('/api/recetas', { method: 'POST', body: JSON.stringify(strapiPayload) });
    const createText = await createRes.text();
    let createJson: any = null;
    try { createJson = JSON.parse(createText); } catch {}
    if (!createRes.ok) {
      console.error('[admin/recipes][POST] Strapi error', { status: createRes.status, body: createJson ?? createText });
      return NextResponse.json({ error: 'Strapi error', status: createRes.status, body: createJson ?? createText }, { status: createRes.status });
    }

    // Try to refetch created item in a predictable, populated shape (v5 flat)
    const createdDocId = createJson?.data?.documentId ?? createJson?.documentId ?? null;
    if (createdDocId) {
      const sp = new URLSearchParams();
      sp.set('populate', '*');
      sp.set('fields[0]', 'documentId');
      sp.set('fields[1]', 'titulo');
      sp.set('fields[2]', 'slug');
      sp.set('fields[3]', 'descripcion');
      sp.set('fields[4]', 'preparacion');
      sp.set('fields[5]', 'tiempo');
      sp.set('fields[6]', 'porciones');
      sp.set('fields[7]', 'publishedAt');
      sp.set('fields[8]', 'updatedAt');
      sp.set('filters[documentId][$eq]', createdDocId);
      sp.set('pagination[pageSize]', '1');
      const fetchUrl = `${STRAPI_URL}/api/recetas?${sp.toString()}`;
      const refetchRes = await fetch(fetchUrl, { headers: { Authorization: `Bearer ${STRAPI_TOKEN}` }, cache: 'no-store' });
      const refetchJson = await refetchRes.json();
      if (refetchRes.ok && Array.isArray(refetchJson?.data) && refetchJson.data[0]) {
        const createdFlat = mapRecipeFromStrapi(refetchJson.data[0]);
        return NextResponse.json(createdFlat, { status: 201 });
      }
    }

    // Fallback: return original JSON data (may not be normalized)
    return NextResponse.json(createJson, { status: 201 });
  } catch (e: any) {
    console.error('[admin/recipes][POST] unexpected error', e);
    return NextResponse.json({ error: 'Internal error', details: e?.message ?? String(e) }, { status: 500 });
  }
}
