
import { useSearchParams } from 'next/navigation';
import { useQuery } from '@tanstack/react-query';
import { PaginationMeta, StrapiResponse } from '@/types/response';
import { IngredientType } from '@/types/ingredient';

const fetchIngredients = async (q: string = '', page: number = 1, pageSize: number = 10): Promise<StrapiResponse<IngredientType[], PaginationMeta>> => {
  const STRAPI_URL = `${process.env.NEXT_PUBLIC_BACKEND_URL}/api/ingredients`;
  const STRAPI_TOKEN = process.env.STRAPI_ADMIN_TOKEN || process.env.STRAPI_API_TOKEN;
  
  const queryParams = new URLSearchParams({
    'pagination[page]': page.toString(),
    'pagination[pageSize]': pageSize.toString(),
  });

  if (q) {
    queryParams.append('_q', q);
  }

  const res = await fetch(`${STRAPI_URL}?${queryParams.toString()}`, {
    headers: {
      'Authorization': `Bearer ${STRAPI_TOKEN}`,
    },
  });

  if (!res.ok) {
    throw new Error('Error al obtener los ingredientes');
  }

  const { data, meta } = await res.json();
  
  // Remapear los datos para que coincidan con el tipo IngredientType si es necesario
  const items = data.map((item: any) => ({
    id: item.id,
    ...item.attributes
  }));
  
  return { items, meta };
};

export function useGetIngredients() {
  const searchParams = useSearchParams();
  const q = searchParams.get('q') || '';
  const page = Number(searchParams.get('page')) || 1;
  const pageSize = Number(searchParams.get('pageSize')) || 10;

  const { data, isLoading, isError, error } = useQuery<
    StrapiResponse<IngredientType[], PaginationMeta>,
    Error
  >({ 
    queryKey: ['ingredients', q, page, pageSize], 
    queryFn: () => fetchIngredients(q, page, pageSize), 
    keepPreviousData: true 
  });

  return { data, isLoading, isError, error, page, pageSize, q };
}
