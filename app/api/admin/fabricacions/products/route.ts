import { NextRequest, NextResponse } from 'next/server';
import { ProductLite } from '@/types/fabricacion';
import { strapiFetch } from '../../suppliers/strapi-helpers';
import { type UnknownRecord } from '../helpers';

function isRecord(value: unknown): value is UnknownRecord {
  return typeof value === 'object' && value !== null;
}

function mapProduct(node: unknown): ProductLite | null {
  if (!isRecord(node)) return null;
  const attributes = isRecord(node.attributes) ? node.attributes : node;
  const id = typeof node.id === 'number' ? node.id : typeof attributes.id === 'number' ? attributes.id : null;
  if (!id) return null;
  const documentId = typeof attributes.documentId === 'string' ? attributes.documentId : undefined;
  const productNameValue =
    typeof attributes.productName === 'string'
      ? attributes.productName
      : typeof attributes.name === 'string'
      ? attributes.name
      : '';
  const productName = productNameValue.trim();
  if (!productName) return null;
  const priceRaw = attributes.price ?? attributes.precio;
  const price = typeof priceRaw === 'number' ? priceRaw : Number(priceRaw);
  const slug = typeof attributes.slug === 'string' ? attributes.slug : undefined;
  return { id, documentId, productName, slug, price: Number.isFinite(price) ? price : null };
}

export async function GET(req: NextRequest) {
  const q = (req.nextUrl.searchParams.get('q') || '').trim();
  const page = Number(req.nextUrl.searchParams.get('page') || '1');
  const pageSize = Number(req.nextUrl.searchParams.get('pageSize') || '20');

  const sp = new URLSearchParams();
  sp.set('fields[0]', 'id');
  sp.set('fields[1]', 'documentId');
  sp.set('fields[2]', 'productName');
  sp.set('fields[3]', 'slug');
  sp.set('fields[4]', 'price');
  sp.set('filters[active][$eq]', 'true');
  if (q) sp.set('filters[productName][$containsi]', q);
  sp.set('pagination[page]', String(page));
  sp.set('pagination[pageSize]', String(pageSize));
  sp.set('sort[0]', 'productName:asc');

  try {
    const res = await strapiFetch(`/api/products?${sp.toString()}`);
    const json = (await res.json().catch(() => ({}))) as UnknownRecord;
    if (!res.ok) {
      const errorRecord = json as UnknownRecord;
      const message =
        (errorRecord?.error && typeof (errorRecord.error as UnknownRecord)?.message === 'string'
          ? String((errorRecord.error as UnknownRecord).message)
          : 'Error obteniendo productos');
      return NextResponse.json({ ok: false, message }, { status: res.status || 500 });
    }
    const data = Array.isArray((json as { data?: unknown[] })?.data) ? ((json as { data?: unknown[] }).data as unknown[]) : [];
    const items = data.map(mapProduct).filter((item): item is ProductLite => Boolean(item));
    return NextResponse.json({ ok: true, items });
  } catch (error) {
    console.error('[fabricacions][products] error', error);
    return NextResponse.json({ ok: false, message: 'Error inesperado' }, { status: 500 });
  }
}
