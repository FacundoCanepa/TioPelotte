import type { ProductLite } from '@/types/fabricacion';

type ProductOption = {
  value: number;
  label: string;
  product: ProductLite;
};

export async function fetchProductOptions(query: string, pageSize = 20): Promise<ProductOption[]> {
  const params = new URLSearchParams();
  if (query) params.set('q', query);
  params.set('pageSize', String(pageSize));
  try {
    const res = await fetch(`/api/admin/fabricacions/products?${params.toString()}`, { cache: 'no-store' });
    if (!res.ok) return [];
    const json = await res.json();
    const items = Array.isArray(json?.items) ? (json.items as ProductLite[]) : [];
    return items.map((product) => ({ value: product.id, label: product.productName, product }));
  } catch (error) {
    console.error('[fabricacion-ui] fetchProductOptions error', error);
    return [];
  }
}

export type { ProductOption };
