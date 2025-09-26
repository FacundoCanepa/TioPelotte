import { NextRequest, NextResponse } from 'next/server';
import {
  buildListPath,
  extractMeta,
  fetchFabricacionFromStrapi,
  mapFabricacionFromStrapi,
  sanitizeFabricacionPayload,
  toStrapiPayload,
  type StrapiResponse,
  type UnknownRecord,
} from './helpers';
import { strapiFetch } from '../suppliers/strapi-helpers';

export async function GET(req: NextRequest) {
  try {
    const path = buildListPath(req.nextUrl.searchParams);
    const { res, json } = await fetchFabricacionFromStrapi(path);
    if (!res.ok) {
      const errorRecord = json as UnknownRecord;
      const message =
        (errorRecord?.error && typeof (errorRecord.error as UnknownRecord)?.message === 'string'
          ? String((errorRecord.error as UnknownRecord).message)
          : 'Error obteniendo fabricaciones');
      return NextResponse.json({ ok: false, message }, { status: res.status || 500 });
    }
    const data = Array.isArray(json?.data) ? (json?.data as unknown[]) : [];
    const items = data
      .map((entry) => mapFabricacionFromStrapi(entry))
      .filter((item): item is NonNullable<ReturnType<typeof mapFabricacionFromStrapi>> => Boolean(item));
    const meta = extractMeta(json?.meta as UnknownRecord | undefined);
    return NextResponse.json({ ok: true, items, meta });
  } catch (error) {
    console.error('[fabricacions][GET] unexpected error', error);
    return NextResponse.json({ ok: false, message: 'Error inesperado' }, { status: 500 });
  }
}

export async function POST(req: NextRequest) {
  try {
    const payload = sanitizeFabricacionPayload(await req.json());
    const body = { data: toStrapiPayload(payload) };
    const path = '/api/fabricacions?populate[0]=product&populate[1]=lineas.ingredient';
    const res = await strapiFetch(path, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(body),
    });
    const json = (await res.json().catch(() => ({}))) as StrapiResponse;
    if (!res.ok) {
      const errorRecord = json as UnknownRecord;
      const message =
        (errorRecord?.error && typeof (errorRecord.error as UnknownRecord)?.message === 'string'
          ? String((errorRecord.error as UnknownRecord).message)
          : 'Error creando fabricación');
      return NextResponse.json({ ok: false, message, details: json }, { status: res.status || 500 });
    }
    const item = mapFabricacionFromStrapi(json.data);
    if (!item) {
      return NextResponse.json({ ok: false, message: 'Respuesta inválida del servidor' }, { status: 502 });
    }
    return NextResponse.json({ ok: true, item }, { status: 201 });
  } catch (error) {
    const message = error instanceof Error ? error.message : 'Error inesperado';
    console.error('[fabricacions][POST] error', error);
    return NextResponse.json({ ok: false, message }, { status: 400 });
  }
}
