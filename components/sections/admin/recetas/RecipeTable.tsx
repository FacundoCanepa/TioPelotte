'use client';

import { useRecipesStore } from '@/store/admin/recipes-store';
import { Recipe } from '@/types/recipe';
import { formatDateTime } from '@/utils/dates';
import { toast } from 'sonner';
import { Pencil, Trash2, Clock, Users, BookOpen, FileText } from 'lucide-react';
import Image from 'next/image';

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
    if (!window.confirm(`¿Estás seguro de que quieres eliminar la receta "${r.titulo}"?`)) return;

    try {
      await deleteRecipe(r.documentId);
      toast.success('Receta eliminada con éxito');
    } catch (e: any) {
      console.error('Error al eliminar la receta', e);
      toast.error('No se pudo eliminar la receta. Inténtalo de nuevo.');
    }
  };

  if (loading) {
    return <div className="text-center py-10 text-gray-500">Cargando recetas...</div>;
  }

  if (items.length === 0) {
    return <div className="text-center py-10 text-gray-500 bg-gray-50 rounded-lg">No se encontraron recetas.</div>;
  }

  return (
    <div className="space-y-4">
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
        {items.map((r) => (
          <div key={r.documentId} className="bg-white border rounded-lg shadow-sm overflow-hidden flex flex-col">
            <div className="relative h-40 w-full">
              {r.imagen?.url ? (
                <Image src={r.imagen.url} alt={r.titulo} layout="fill" objectFit="cover" />
              ) : (
                <div className="w-full h-full bg-gray-200 flex items-center justify-center">
                  <BookOpen className="w-12 h-12 text-gray-400" />
                </div>
              )}
            </div>
            <div className="p-4 flex-grow flex flex-col">
              <h3 className="font-semibold text-lg text-gray-800 truncate">{r.titulo}</h3>
              <div className="flex items-center text-sm text-gray-500 mt-2 gap-4">
                <span className="flex items-center gap-1"><Clock size={14} /> {r.tiempo || 'N/A'}</span>
                <span className="flex items-center gap-1"><FileText size={14} /> {r.productosRelacionados?.length || 0} ing.</span>
              </div>
              <div className="flex-grow" />
              <div className="flex justify-end gap-2 pt-4 mt-4 border-t">
                <button
                  className="p-2 rounded-md text-gray-600 hover:bg-gray-100 transition-colors"
                  onClick={() => setSelectedRecipe(r)}
                  aria-label="Editar receta"
                >
                  <Pencil size={16} />
                </button>
                <button
                  className="p-2 rounded-md text-red-600 hover:bg-red-50 transition-colors"
                  onClick={() => onDelete(r)}
                  aria-label="Eliminar receta"
                >
                  <Trash2 size={16} />
                </button>
              </div>
            </div>
          </div>
        ))}
      </div>
      <div className="mt-6 flex items-center justify-between text-sm">
        <div className="text-gray-600">
          Página {page} de {pageCount} ({total} resultados)
        </div>
        <div className="flex gap-2">
          <button
            className="px-3 py-1 rounded-md border bg-white shadow-sm disabled:opacity-50"
            disabled={page <= 1}
            onClick={() => fetchRecipes({ page: page - 1 })}
          >
            Anterior
          </button>
          <button
            className="px-3 py-1 rounded-md border bg-white shadow-sm disabled:opacity-50"
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
