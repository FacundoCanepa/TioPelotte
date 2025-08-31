"use client";

import { useEffect, useMemo, useRef, useState } from 'react';
import { useRecipesStore } from '@/store/admin/recipes-store';
import { searchProducts, ProductLite } from '@/lib/admin/recipes-api';

export default function RecipeFilters() {
  const { filters, setFilters, fetchRecipes } = useRecipesStore();
  const [q, setQ] = useState(filters.q);
  const [pub, setPub] = useState(filters.published);
  const [productQuery, setProductQuery] = useState('');
  const [productOptions, setProductOptions] = useState<ProductLite[]>([]);
  const [productLoading, setProductLoading] = useState(false);

  const debounceRef = useRef<NodeJS.Timeout | null>(null);

  useEffect(() => {
    if (debounceRef.current) clearTimeout(debounceRef.current);
    debounceRef.current = setTimeout(() => {
      setFilters({ q });
      void fetchRecipes({ q });
    }, 300);
    return () => {
      if (debounceRef.current) clearTimeout(debounceRef.current);
    };
  }, [q, setFilters, fetchRecipes]);

  useEffect(() => {
    setFilters({ published: pub });
    void fetchRecipes({ published: pub });
  }, [pub, setFilters, fetchRecipes]);

  useEffect(() => {
    let alive = true;
    if (!productQuery) return setProductOptions([]);
    setProductLoading(true);
    searchProducts(productQuery)
      .then((items) => {
        if (!alive) return;
        setProductOptions(items);
      })
      .finally(() => alive && setProductLoading(false));
    return () => {
      alive = false;
    };
  }, [productQuery]);

  const selectedLabel = useMemo(() => {
    if (!filters.productDocumentId) return 'Todos los productos';
    const f = productOptions.find((p) => p.documentId === filters.productDocumentId);
    return f ? f.productName : '1 producto seleccionado';
  }, [filters.productDocumentId, productOptions]);

  return (
    <div className="flex flex-col gap-3 md:flex-row md:items-end md:justify-between">
      <div className="flex flex-1 flex-col gap-2 md:flex-row">
        <div className="flex-1">
          <label htmlFor="q" className="block text-sm font-medium">Buscar</label>
          <input
            id="q"
            aria-label="Buscar recetas por título o slug"
            value={q}
            onChange={(e) => setQ(e.target.value)}
            placeholder="Título o slug"
            className="mt-1 w-full rounded-xl border border-gray-300 bg-white px-3 py-2 shadow-sm focus:border-amber-600 focus:outline-none"
          />
        </div>
        <div className="w-full md:w-48">
          <label htmlFor="published" className="block text-sm font-medium">Estado</label>
          <select
            id="published"
            aria-label="Filtro por publicación"
            className="mt-1 w-full rounded-xl border border-gray-300 bg-white px-3 py-2 shadow-sm focus:border-amber-600 focus:outline-none"
            value={pub}
            onChange={(e) => setPub(e.target.value as any)}
          >
            <option value="all">Todas</option>
            <option value="true">Publicadas</option>
            <option value="false">Sin publicar</option>
          </select>
        </div>
      </div>

      <div className="flex-1">
        <label htmlFor="product" className="block text-sm font-medium">Producto relacionado</label>
        <div className="relative mt-1">
          <input
            id="product"
            aria-label="Buscar producto para filtrar"
            value={productQuery}
            onChange={(e) => setProductQuery(e.target.value)}
            placeholder="Buscar producto..."
            className="w-full rounded-xl border border-gray-300 bg-white px-3 py-2 shadow-sm focus:border-amber-600 focus:outline-none"
          />
          {!!productOptions.length && (
            <ul className="absolute z-10 mt-1 max-h-56 w-full overflow-auto rounded-xl border border-gray-200 bg-white shadow">
              {productOptions.map((p) => (
                <li
                  key={p.documentId}
                  className="cursor-pointer px-3 py-2 hover:bg-amber-50"
                  onClick={() => {
                    setFilters({ productDocumentId: p.documentId });
                    void fetchRecipes({ productDocumentId: p.documentId });
                    setProductQuery(p.productName);
                  }}
                >
                  <div className="text-sm font-medium">{p.productName}</div>
                  <div className="text-xs text-gray-500">{p.slug}</div>
                </li>
              ))}
            </ul>
          )}
        </div>
        <div className="mt-1 text-xs text-gray-600">{productLoading ? 'Buscando...' : selectedLabel}</div>
      </div>

      <div className="flex items-end">
        <button
          className="rounded-xl border border-gray-300 bg-white px-3 py-2 text-sm shadow-sm hover:bg-gray-50"
          onClick={() => {
            setFilters({ q: '', published: 'all', productDocumentId: null, page: 1 });
            setQ('');
            setPub('all');
            setProductQuery('');
            void fetchRecipes({ q: '', published: 'all', productDocumentId: null, page: 1 });
          }}
        >
          Limpiar filtros
        </button>
      </div>
    </div>
  );
}

