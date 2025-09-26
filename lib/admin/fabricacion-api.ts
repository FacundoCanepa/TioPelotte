import {
  FabricacionDoc,
  FabricacionFiltersState,
  FabricacionListMeta,
  FabricacionPayload,
} from '@/types/fabricacion';

export type ListFabricacionesResponse = {
  ok: boolean;
  items: FabricacionDoc[];
  meta: FabricacionListMeta;
};

export type GetFabricacionResponse = {
  ok: boolean;
  item: FabricacionDoc;
};

function toQuery(params: Partial<FabricacionFiltersState>): string {
  const searchParams = new URLSearchParams();
  if (params.search) searchParams.set('search', params.search.trim());
  if (params.productId) searchParams.set('productId', String(params.productId));
  if (params.status && params.status !== 'all') searchParams.set('status', params.status);
  if (params.page) searchParams.set('page', String(params.page));
  if (params.pageSize) searchParams.set('pageSize', String(params.pageSize));
  return searchParams.toString();
}

export async function listFabricaciones(params: Partial<FabricacionFiltersState> = {}): Promise<ListFabricacionesResponse> {
  const query = toQuery(params);
  const url = `/api/admin/fabricacions${query ? `?${query}` : ''}`;
  console.log('[fabricacion-api] listFabricaciones', url);
  const res = await fetch(url, { cache: 'no-store' });
  if (!res.ok) {
    const text = await res.text();
    console.error('[fabricacion-api] listFabricaciones error', res.status, text);
    throw new Error('Error listando fabricaciones');
  }
  const json = (await res.json()) as ListFabricacionesResponse;
  return json;
}

export async function getFabricacion(id: number | string): Promise<GetFabricacionResponse> {
  const res = await fetch(`/api/admin/fabricacions/${id}`, { cache: 'no-store' });
  if (!res.ok) {
    const text = await res.text();
    console.error('[fabricacion-api] getFabricacion error', res.status, text);
    throw new Error('Error obteniendo fabricación');
  }
  const json = (await res.json()) as GetFabricacionResponse;
  return json;
}

export async function createFabricacion(payload: FabricacionPayload): Promise<FabricacionDoc> {
  console.log('[fabricacion-api] createFabricacion payload', payload);
  const res = await fetch('/api/admin/fabricacions', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(payload),
  });
  if (!res.ok) {
    const text = await res.text();
    console.error('[fabricacion-api] createFabricacion error', res.status, text);
    throw new Error(text || 'Error creando fabricación');
  }
  const json = (await res.json()) as GetFabricacionResponse;
  return json.item;
}

export async function updateFabricacion(id: number | string, payload: FabricacionPayload): Promise<FabricacionDoc> {
  console.log('[fabricacion-api] updateFabricacion payload', { id, payload });
  const res = await fetch(`/api/admin/fabricacions/${id}`, {
    method: 'PUT',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(payload),
  });
  if (!res.ok) {
    const text = await res.text();
    console.error('[fabricacion-api] updateFabricacion error', res.status, text);
    throw new Error(text || 'Error actualizando fabricación');
  }
  const json = (await res.json()) as GetFabricacionResponse;
  return json.item;
}

export async function deleteFabricacion(id: number | string): Promise<{ ok: true }>{
  console.log('[fabricacion-api] deleteFabricacion', { id });
  const res = await fetch(`/api/admin/fabricacions/${id}`, { method: 'DELETE' });
  if (!res.ok) {
    const text = await res.text();
    console.error('[fabricacion-api] deleteFabricacion error', res.status, text);
    throw new Error(text || 'Error eliminando fabricación');
  }
  return { ok: true };
}

export async function recalculateFabricacion(id: number | string): Promise<FabricacionDoc> {
  console.log('[fabricacion-api] recalculateFabricacion', { id });
  const res = await fetch(`/api/admin/fabricacions/${id}/recalculate`, { method: 'POST' });
  if (!res.ok) {
    const text = await res.text();
    console.error('[fabricacion-api] recalculateFabricacion error', res.status, text);
    throw new Error(text || 'Error recalculando costos');
  }
  const json = (await res.json()) as GetFabricacionResponse;
  return json.item;
}
