import { Recipe, RecipeCreateInput, RecipeUpdateInput } from '@/types/recipe';

// Response shape expected by GET /api/admin/recipes
export type RecipeListResponse = {
  items: Recipe[];
  meta: {
    pagination: {
      page: number;
      pageSize: number;
      pageCount: number;
      total: number;
    };
  };
  totalCount: number;
  publishedCount: number;
};

type ListParams = {
  q?: string;
  page?: number;
  pageSize?: number;
  published?: 'all' | 'true' | 'false';
  productDocumentId?: string;
};

function toQuery(params: Record<string, string | number | boolean | undefined | null>) {
  const usp = new URLSearchParams();
  Object.entries(params).forEach(([k, v]) => {
    if (v !== undefined && v !== null && v !== '') usp.set(k, String(v));
  });
  return usp.toString();
}

export async function listRecipes(params: ListParams = {}): Promise<RecipeListResponse> {
  const qs = toQuery({
    q: params.q,
    page: params.page ?? 1,
    pageSize: params.pageSize ?? 10,
    published: params.published ?? 'all',
    productDocumentId: params.productDocumentId,
  });
  const url = `/api/admin/recipes${qs ? `?${qs}` : ''}`;
  console.log('[recipes-api] listRecipes ->', url);
  const res = await fetch(url, { cache: 'no-store' });
  if (!res.ok) {
    const txt = await res.text();
    console.error('[recipes-api] listRecipes error', res.status, txt);
    throw new Error('Error listando recetas');
  }
  const json = (await res.json()) as RecipeListResponse;
  console.log('[recipes-api] listRecipes ok', {
    count: Array.isArray(json?.items) ? json.items.length : 0,
    meta: json?.meta,
    totalCount: json?.totalCount,
    publishedCount: json?.publishedCount,
  });
  return json;
}

export async function createRecipe(data: RecipeCreateInput): Promise<Recipe> {
  console.log('[recipes-api] createRecipe payload', data);
  const res = await fetch('/api/admin/recipes', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(data),
  });
  if (!res.ok) {
    const txt = await res.text();
    console.error('[recipes-api] createRecipe error', res.status, txt);
    throw new Error(txt || 'Error creando receta');
  }
  const json = await res.json();
  console.log('[recipes-api] createRecipe ok', { documentId: json?.documentId });
  return json;
}

export async function updateRecipe(documentId: string, data: RecipeUpdateInput): Promise<Recipe> {
  console.log('[recipes-api] updateRecipe payload', { documentId, data });
  const res = await fetch(`/api/admin/recipes/${documentId}`, {
    method: 'PUT',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(data),
  });
  if (!res.ok) {
    const txt = await res.text();
    console.error('[recipes-api] updateRecipe error', res.status, txt);
    throw new Error(txt || 'Error actualizando receta');
  }
  const json = await res.json();
  console.log('[recipes-api] updateRecipe ok', { documentId: json?.documentId });
  return json;
}

export async function deleteRecipe(documentId: string): Promise<{ ok: true }>{
  console.log('[recipes-api] deleteRecipe', { documentId });
  const res = await fetch(`/api/admin/recipes/${documentId}`, { method: 'DELETE' });
  if (!res.ok) {
    const txt = await res.text();
    console.error('[recipes-api] deleteRecipe error', res.status, txt);
    throw new Error(txt || 'Error eliminando receta');
  }
  return { ok: true };
}

// Helper for product autocomplete in filters/form
export type ProductLite = {
  documentId: string;
  productName: string;
  slug: string;
};

export async function searchProducts(q: string): Promise<ProductLite[]> {
  // Trae hasta 100 para sugerencias cuando q está vacío
  const res = await fetch(`/api/admin/products?q=${encodeURIComponent(q)}&page=1&pageSize=100`, {
    cache: 'no-store',
  });
  if (!res.ok) return [];
  const json = await res.json();
  // Try to map minimal shape
  const items = Array.isArray(json?.data) ? json.data : [];
  return items
    .map((p: any) => ({
      documentId: p.documentId ?? p.document_id ?? p.documentid ?? p.documentID ?? p?.attributes?.documentId,
      productName: p.productName ?? p.name ?? p?.attributes?.productName ?? p?.attributes?.name,
      slug: p.slug ?? p?.attributes?.slug,
    }))
    .filter((p: any) => p.documentId && p.productName);
}
