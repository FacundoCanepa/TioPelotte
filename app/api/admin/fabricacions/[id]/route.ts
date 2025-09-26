import { NextRequest, NextResponse } from 'next/server';
import {
  mapFabricacionFromStrapi,
  sanitizeFabricacionPayload,
  toStrapiPayload,
  type StrapiResponse,
  type UnknownRecord,
} from '../helpers';
import { strapiFetch } from '../../suppliers/strapi-helpers';

type RouteContext = {
  params: { id: string };
};

function buildDetailPath(id: string) {
  return `/api/fabricacions/${id}?populate[0]=product&populate[1]=lineas.ingredient`;
}

export async function GET(_req: NextRequest, context: RouteContext) {
  const id = context.params.id;
  try {
    const res = await strapiFetch(buildDetailPath(id));
    const json = (await res.json().catch(() => ({}))) as StrapiResponse;
    if (!res.ok) {
      const errorRecord = json as UnknownRecord;
      const message =
        (errorRecord?.error && typeof (errorRecord.error as UnknownRecord)?.message === 'string'
          ? String((errorRecord.error as UnknownRecord).message)
          : 'Error obteniendo fabricación');
      return NextResponse.json({ ok: false, message }, { status: res.status || 500 });
    }
    const item = mapFabricacionFromStrapi(json.data);
    if (!item) {
      return NextResponse.json({ ok: false, message: 'Fabricación no encontrada' }, { status: 404 });
    }
    return NextResponse.json({ ok: true, item });
  } catch (error) {
    console.error('[fabricacions][GET:id] error', error);
    return NextResponse.json({ ok: false, message: 'Error inesperado' }, { status: 500 });
  }
}

export async function PUT(req: NextRequest, context: RouteContext) {
  const id = context.params.id;
  try {
    const payload = sanitizeFabricacionPayload(await req.json());
    const res = await strapiFetch(`/api/fabricacions/${id}?populate[0]=product&populate[1]=lineas.ingredient`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ data: toStrapiPayload(payload) }),
    });
    const json = (await res.json().catch(() => ({}))) as StrapiResponse;
    if (!res.ok) {
      const errorRecord = json as UnknownRecord;
      const message =
        (errorRecord?.error && typeof (errorRecord.error as UnknownRecord)?.message === 'string'
          ? String((errorRecord.error as UnknownRecord).message)
          : 'Error actualizando fabricación');
      return NextResponse.json({ ok: false, message, details: json }, { status: res.status || 500 });
    }
    const item = mapFabricacionFromStrapi(json.data);
    if (!item) {
      return NextResponse.json({ ok: false, message: 'Respuesta inválida del servidor' }, { status: 502 });
    }
    return NextResponse.json({ ok: true, item });
  } catch (error) {
    const message = error instanceof Error ? error.message : 'Error inesperado';
    console.error('[fabricacions][PUT:id] error', error);
    return NextResponse.json({ ok: false, message }, { status: 400 });
  }
}

export async function DELETE(_req: NextRequest, context: RouteContext) {
  const id = context.params.id;
  try {
    const res = await strapiFetch(`/api/fabricacions/${id}`, { method: 'DELETE' });
    if (!res.ok) {
      const json = (await res.json().catch(() => ({}))) as UnknownRecord;
      const message =
        (json?.error && typeof (json.error as UnknownRecord)?.message === 'string'
          ? String((json.error as UnknownRecord).message)
          : 'Error eliminando fabricación');
      return NextResponse.json({ ok: false, message }, { status: res.status || 500 });
    }
    return NextResponse.json({ ok: true });
  } catch (error) {
    console.error('[fabricacions][DELETE:id] error', error);
    return NextResponse.json({ ok: false, message: 'Error inesperado' }, { status: 500 });
  }
}
