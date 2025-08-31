"use client";

import { useRecipesStore } from '@/store/admin/recipes-store';
import { Recipe } from '@/types/recipe';
import { formatDateTime } from '@/utils/dates';
import { toast } from 'sonner';

type Props = {
  items: Recipe[];
  loading: boolean;
  meta?: { pagination: { page: number; pageSize: number; total: number; pageCount: number } };
};

export default function RecipeTable({ items, loading, meta }: Props) {
  const { fetchRecipes, setSelectedRecipe, deleteRecipe, filters } = useRecipesStore();

  const page = meta?.pagination?.page ?? filters.page;
  const pageSize = meta?.pagination?.pageSize ?? filters.pageSize;
  const total = meta?.pagination?.total ?? items.length;
  const pageCount = meta?.pagination?.pageCount ?? 1;

  const onDelete = async (r: Recipe) => {
    const ok = typeof window !== 'undefined' ? window.confirm(`Eliminar receta "${r.titulo}"?`) : false;
    if (!ok) return;
    try {
      await deleteRecipe(r.documentId);
      toast.success('Receta eliminada');
    } catch (e: any) {
      console.error(e);
      toast.error('No se pudo eliminar');
    }
  };

  return (
    <div className="w-full">
      <div className="overflow-x-auto">
        <table className="min-w-full table-auto">
          <thead>
            <tr className="border-b bg-[#FBE6D4] text-left text-sm font-semibold">
              <th className="px-3 py-2">Título</th>
              <th className="px-3 py-2">Slug</th>
              <th className="px-3 py-2">Tiempo</th>
              <th className="px-3 py-2">Porciones</th>
              <th className="px-3 py-2">Publicada</th>
              <th className="px-3 py-2">Actualizada</th>
              <th className="px-3 py-2">Acciones</th>
            </tr>
          </thead>
          <tbody>
            {loading && (
              <tr>
                <td className="px-3 py-6 text-center text-sm text-gray-500" colSpan={7}>
                  Cargando...
                </td>
              </tr>
            )}
            {!loading && items.length === 0 && (
              <tr>
                <td className="px-3 py-6 text-center text-sm text-gray-500" colSpan={7}>
                  Sin resultados
                </td>
              </tr>
            )}
            {!loading &&
              items.map((r) => (
                <tr key={r.documentId} className="border-b text-sm">
                  <td className="px-3 py-2 font-medium">{r.titulo}</td>
                  <td className="px-3 py-2 text-gray-600">{r.slug}</td>
                  <td className="px-3 py-2">{r.tiempo || '-'}</td>
                  <td className="px-3 py-2">{r.porciones || '-'}</td>
                  <td className="px-3 py-2">
                    {r.publishedAt ? (
                      <span className="rounded-full bg-green-100 px-2 py-1 text-xs text-green-700">Publicada</span>
                    ) : (
                      <span className="rounded-full bg-gray-100 px-2 py-1 text-xs text-gray-700">Borrador</span>
                    )}
                  </td>
                  <td className="px-3 py-2 text-gray-600">{formatDateTime(r.updatedAt)}</td>
                  <td className="px-3 py-2">
                    <div className="flex gap-2">
                      <button
                        className="rounded-xl border border-gray-300 bg-white px-3 py-1 shadow-sm hover:bg-gray-50"
                        onClick={() => setSelectedRecipe(r)}
                      >
                        Editar
                      </button>
                      <button
                        className="rounded-xl border border-red-200 bg-red-50 px-3 py-1 text-red-700 shadow-sm hover:bg-red-100"
                        onClick={() => onDelete(r)}
                      >
                        Eliminar
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
          </tbody>
        </table>
      </div>
      <div className="mt-4 flex items-center justify-between text-sm">
        <div>
          Mostrando página {page} de {pageCount} · {total} resultados
        </div>
        <div className="flex gap-2">
          <button
            className="rounded-xl border border-gray-300 bg-white px-3 py-1 shadow-sm disabled:opacity-50"
            disabled={page <= 1}
            onClick={() => fetchRecipes({ page: page - 1 })}
          >
            Anterior
          </button>
          <button
            className="rounded-xl border border-gray-300 bg-white px-3 py-1 shadow-sm disabled:opacity-50"
            disabled={page >= pageCount}
            onClick={() => fetchRecipes({ page: page + 1 })}
          >
            Siguiente
          </button>
        </div>
      </div>
    </div>
  );
}

