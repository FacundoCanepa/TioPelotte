import { NextRequest, NextResponse } from 'next/server';
export const runtime = 'nodejs';
import { slugifyEs } from '@/utils/slug';
import { Recipe, RecipeUpdateInput } from '@/types/recipe';

const STRAPI_URL = process.env.NEXT_PUBLIC_BACKEND_URL;
const STRAPI_TOKEN = process.env.STRAPI_API_TOKEN;
const MEDIA_URL = process.env.NEXT_PUBLIC_MEDIA_URL || STRAPI_URL;

async function strapiFetch(path: string, init?: RequestInit) {
  const url = `${STRAPI_URL}${path}`;
  const method = init?.method || 'GET';
  const headers = new Headers(init?.headers);
  headers.set('Content-Type', 'application/json');
  if (STRAPI_TOKEN) headers.set('Authorization', `Bearer ${STRAPI_TOKEN}`);
  try {
    const dbg: any = { url, method };
    if (method !== 'GET' && init?.body) {
      try {
        const parsed = typeof init.body === 'string' ? JSON.parse(init.body) : init.body;
        // Avoid huge logs
        dbg.bodyKeys = parsed && typeof parsed === 'object' ? Object.keys(parsed) : undefined;
      } catch {}
    }
    console.log('[recipes API byId] strapiFetch', dbg);
    const res = await fetch(url, { ...init, headers, cache: 'no-store' });
    console.log('[recipes API byId] strapiFetch status', { status: res.status });
    return res;
  } catch (e) {
    console.error('[recipes API byId] strapiFetch error', e);
    throw e;
  }
}

function withMediaUrl(url?: string | null) {
  if (!url) return undefined;
  if (url.startsWith('http')) return url;
  return `${MEDIA_URL}${url}`;
}

function mapRecipe(item: any): Recipe {
  const id = item?.id;
  const a = item?.attributes ?? {};
  // Soporta diferentes nombres de media y formas (v4/v5)
  const imgAttrs =
    a?.imagen?.data?.attributes ||
    a?.img?.data?.attributes ||
    a?.image?.data?.attributes ||
    a?.cover?.data?.attributes ||
    a?.photo?.data?.attributes ||
    a?.foto?.data?.attributes || null;
  const relacionados = a?.productosRelacionados?.data ?? [];
  return {
    id,
    documentId: item?.documentId ?? a?.documentId ?? item?.attributes?.documentId,
    titulo: a?.titulo ?? a?.title ?? '',
    slug: a?.slug ?? '',
    descripcion: a?.descripcion ?? a?.description ?? '',
    tiempo: a?.tiempo ?? a?.time ?? '',
    porciones: a?.porciones ?? a?.servings ?? '',
    preparacion: a?.preparacion ?? a?.content ?? a?.preparation ?? '',
    imagen: imgAttrs ? { url: withMediaUrl(imgAttrs?.url)!, alternativeText: imgAttrs?.alternativeText ?? null } : null,
    productosRelacionados: relacionados.map((r: any) => ({
      documentId: r?.documentId ?? r?.attributes?.documentId,
      productName: r?.attributes?.productName ?? r?.attributes?.name ?? '',
      slug: r?.attributes?.slug ?? '',
    })),
    createdAt: a?.createdAt ?? undefined,
    updatedAt: a?.updatedAt ?? undefined,
    publishedAt: a?.publishedAt ?? undefined,
  } as Recipe;
}

async function ensureUniqueSlug(baseSlug: string, ignoreDocumentId?: string | null): Promise<string> {
  let slug = baseSlug;
  let attempt = 1;
  while (true) {
    const qs = new URLSearchParams();
    qs.set('filters[slug][$eq]', slug);
    if (ignoreDocumentId) qs.set('filters[documentId][$ne]', ignoreDocumentId);
    qs.set('pagination[pageSize]', '1');
    const res = await strapiFetch(`/api/recetas?${qs.toString()}`);
    if (!res.ok) break; // be permissive
    const json = await res.json();
    const exists = Array.isArray(json?.data) && json.data.length > 0;
    if (exists) console.log('[recipes API byId] ensureUniqueSlug exists -> increment', { slug, attempt });
    if (!exists) break;
    attempt += 1;
    slug = `${baseSlug}-${attempt}`;
  }
  return slug;
}

async function resolveStrapiIdByDocumentId(documentId: string): Promise<number | null> {
  const qs = new URLSearchParams();
  qs.set('filters[documentId][$eq]', documentId);
  qs.set('fields[0]', 'id');
  qs.set('fields[1]', 'documentId');
  qs.set('pagination[pageSize]', '1');
  const path = `/api/recetas?${qs.toString()}`;
  console.log('[recipes API byId] resolve id path', path);
  const res = await strapiFetch(path);
  if (!res.ok) return null;
  const json = await res.json();
  console.log('[recipes API byId] resolve id json', JSON.stringify(json?.data?.[0] ?? null));
  const id = json?.data?.[0]?.id;
  return typeof id === 'number' ? id : null;
}

async function resolveStrapiProductIdsByDocumentIds(docIds: string[]): Promise<number[]> {
  if (!docIds?.length) return [];
  const qs = new URLSearchParams();
  // Use repeated params for $in (more compatible across Strapi versions)
  for (const d of docIds) qs.append('filters[documentId][$in]', d);
  qs.set('fields[0]', 'id');
  qs.set('fields[1]', 'documentId');
  qs.set('pagination[pageSize]', String(Math.max(100, docIds.length)));
  const res = await strapiFetch(`/api/products?${qs.toString()}`);
  if (!res.ok) {
    const txt = await res.text();
    console.error('[recipes API byId] resolve products error', res.status, txt);
    return [];
  }
  const json = await res.json();
  const items = Array.isArray(json?.data) ? json.data : [];
  // v4 vs v5 shape tolerant
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
      if (Array.isArray(val) || typeof val === 'object') {
        return key;
      }
    }
  } catch (e) {
    console.log('[recipes API byId] relation field detect error', e);
  }
  // Default/fallback
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
    console.log('[recipes API byId] image field detect error', e);
  }
  return 'img';
}

export async function PUT(req: NextRequest, ctx: { params: Promise<{ documentId: string }> }) {
  try {
    const { documentId } = await ctx.params;
    console.log('[recipes API byId][PUT] documentId', documentId);
    const id = await resolveStrapiIdByDocumentId(documentId);
    if (!id) return NextResponse.json({ error: 'Receta no encontrada' }, { status: 404 });

    const body = (await req.json()) as RecipeUpdateInput & {
      productosRelacionadosDocumentIds?: string[];
      publishedAt?: string | null;
    };
    const data: any = {};

    if (typeof body.titulo === 'string') data.titulo = body.titulo.trim();
    if (typeof body.descripcion === 'string') data.descripcion = body.descripcion.trim();
    if (typeof body.preparacion === 'string') data.preparacion = body.preparacion.trim();
    if (typeof body.tiempo === 'string') data.tiempo = body.tiempo;
    if (typeof body.porciones === 'string') data.porciones = body.porciones;

    if (typeof body.slug === 'string' || typeof body.titulo === 'string') {
      const base = slugifyEs((body.slug || data.titulo || '').trim());
      if (base) data.slug = await ensureUniqueSlug(base, documentId);
    }

    // Resolver productos relacionados por documentId si llegan
    let handledRelated = false;
    if (Array.isArray(body.productosRelacionadosDocumentIds) && body.productosRelacionadosDocumentIds.length > 0) {
      const incomingDocIds = body.productosRelacionadosDocumentIds.filter(Boolean);
      console.log('[recipes API byId][PUT] resolving product ids', { incomingDocIds });
      const ids = await resolveStrapiProductIdsByDocumentIds(incomingDocIds);
      console.log('[recipes API byId][PUT] resolved product ids', { ids });
      // Validar faltantes (no bloquear; usar los encontrados)
      if (ids.length !== incomingDocIds.length) {
        const found = await getFoundProductDocumentIds(incomingDocIds);
        const missing = incomingDocIds.filter((d) => !found.includes(d));
        console.warn('[recipes API byId][PUT] some product documentIds not found', { missing, found });
        if (ids.length === 0) {
          console.warn('[recipes API byId][PUT] skipping relation update (no matches)');
        } else {
          const relationKey = await getRecetasRelationFieldName();
          console.log('[recipes API byId][PUT] relation key resolved', { relationKey });
          data[relationKey] = ids; // usar los que existen
        }
      } else {
        const relationKey = await getRecetasRelationFieldName();
        console.log('[recipes API byId][PUT] relation key resolved', { relationKey });
        data[relationKey] = ids; // array de IDs numéricos
      }
      handledRelated = true;
    }
    // Fallback: aceptar forma antigua productosRelacionados: [{ documentId }]
    if (!handledRelated && Array.isArray((body as any).productosRelacionados) && (body as any).productosRelacionados.length > 0) {
      const incomingDocIds = (body as any).productosRelacionados
        .map((p: any) => (typeof p === 'string' ? p : p?.documentId))
        .filter(Boolean);
      if (incomingDocIds.length > 0) {
        console.log('[recipes API byId][PUT] resolving product ids (legacy key)', { incomingDocIds });
        const ids = await resolveStrapiProductIdsByDocumentIds(incomingDocIds);
        if (ids.length !== incomingDocIds.length) {
          const found = await getFoundProductDocumentIds(incomingDocIds);
          const missing = incomingDocIds.filter((d: string) => !found.includes(d));
          console.warn('[recipes API byId][PUT] some product documentIds not found (legacy)', { missing, found });
          if (ids.length === 0) {
            console.warn('[recipes API byId][PUT] skipping relation update (legacy, no matches)');
          } else {
            const relationKey = await getRecetasRelationFieldName();
            console.log('[recipes API byId][PUT] relation key resolved (legacy)', { relationKey });
            data[relationKey] = ids;
          }
        } else {
          const relationKey = await getRecetasRelationFieldName();
          console.log('[recipes API byId][PUT] relation key resolved (legacy)', { relationKey });
          data[relationKey] = ids;
        }
      }
    }

    // Publicación manual via publishedAt o switch boolean
    if (typeof body.publishedAt !== 'undefined') {
      data.publishedAt = body.publishedAt;
    } else if (typeof (body as any).published === 'boolean') {
      data.publishedAt = (body as any).published ? new Date().toISOString() : null;
    }

    if (typeof (body as any).imagenId === 'number') {
      const imageKey = await getRecetasImageFieldName();
      console.log('[recipes API byId][PUT] image key resolved', { imageKey });
      (data as any)[imageKey] = (body as any).imagenId;
    }

    const updatePath = `/api/recetas/${id}`;
    console.log('[recipes API byId][PUT] data', data);
    console.log('[recipes API byId][PUT] update path', updatePath);
    let res = await strapiFetch(updatePath, {
      method: 'PUT',
      body: JSON.stringify({ data }),
    });
    if (!res.ok) {
      // Fallback: some Strapi deployments expect documentId in the URL
      if (res.status === 404) {
        const altPath = `/api/recetas/${documentId}`;
        console.log('[recipes API byId][PUT] fallback update path (documentId)', altPath);
        const resAlt = await strapiFetch(altPath, {
          method: 'PUT',
          body: JSON.stringify({ data }),
        });
        if (resAlt.ok) {
          const json = await resAlt.json();
          const updated = json?.data ? mapRecipe(json.data) : json;
          return NextResponse.json(updated, { status: 200 });
        }
        const txtAlt = await resAlt.text();
        console.error('[recipes API byId][PUT] Fallback Strapi error', resAlt.status, txtAlt);
      }
      const txt = await res.text();
      console.error('[recipes API byId][PUT] Strapi error', res.status, txt);
      return NextResponse.json({ error: 'Error actualizando en Strapi', details: txt }, { status: 500 });
    }
    const json = await res.json();
    // Intentar responder forma amigable; tolerante a v4/v5
    const updated = json?.data ? mapRecipe(json.data) : json;
    return NextResponse.json(updated, { status: 200 });
  } catch (e) {
    // eslint-disable-next-line no-console
    console.error('Recipes PUT error', e);
    return NextResponse.json({ error: 'Internal error' }, { status: 500 });
  }
}

export async function DELETE(_req: NextRequest, ctx: { params: Promise<{ documentId: string }> }) {
  try {
    const { documentId } = await ctx.params;
    console.log('[recipes API byId][DELETE] documentId', documentId);
    const id = await resolveStrapiIdByDocumentId(documentId);
    if (!id) return NextResponse.json({ error: 'Receta no encontrada' }, { status: 404 });
    const res = await strapiFetch(`/api/recetas/${id}`, { method: 'DELETE' });
    if (!res.ok) {
      const txt = await res.text();
      console.error('[recipes API byId][DELETE] Strapi error', res.status, txt);
      return NextResponse.json({ error: 'Error eliminando en Strapi', details: txt }, { status: 500 });
    }
    return NextResponse.json({ ok: true });
  } catch (e) {
    // eslint-disable-next-line no-console
    console.error('Recipes DELETE error', e);
    return NextResponse.json({ error: 'Internal error' }, { status: 500 });
  }
}
