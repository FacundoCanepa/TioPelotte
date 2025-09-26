import { NextRequest, NextResponse } from 'next/server';
import { mapFabricacionFromStrapi, type StrapiResponse, type UnknownRecord } from '../../helpers';
import { strapiFetch } from '../../../suppliers/strapi-helpers';

type RouteContext = {
  params: { id: string };
};

export async function POST(_req: NextRequest, context: RouteContext) {
  const id = context.params.id;
  try {
    const res = await strapiFetch(`/api/fabricacions/${id}/recalculate`, { method: 'POST' });
    const json = (await res.json().catch(() => ({}))) as StrapiResponse | UnknownRecord;
    if (!res.ok) {
      const errorRecord = json as UnknownRecord;
      const message =
        (errorRecord?.error && typeof (errorRecord.error as UnknownRecord)?.message === 'string'
          ? String((errorRecord.error as UnknownRecord).message)
          : 'Error recalculando costos');
      return NextResponse.json({ ok: false, message }, { status: res.status || 500 });
    }
    const responseData = (json as StrapiResponse).data ?? json;
    const item = mapFabricacionFromStrapi(responseData);
    if (!item) {
      return NextResponse.json({ ok: false, message: 'Respuesta inválida del servidor' }, { status: 502 });
    }
    return NextResponse.json({ ok: true, item });
  } catch (error) {
    console.error('[fabricacions][POST:recalculate] error', error);
    return NextResponse.json({ ok: false, message: 'Error inesperado' }, { status: 500 });
  }
}
