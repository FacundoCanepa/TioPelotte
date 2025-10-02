'use client';

import { useEffect, useMemo, useState } from 'react';
import { toast } from 'sonner';
import { useRecipesStore } from '@/store/admin/recipes-store';
import { Recipe } from '@/types/recipe';
import RecipeFilters from './RecipeFilters';
import RecipeTable from './RecipeTable';
import RecipeForm from './RecipeForm';
import RecipePreview from './RecipePreview';
import { Plus } from 'lucide-react';

export default function RecipeSection() {
  const { fetchRecipes, items, meta, loading, selectedRecipe, setSelectedRecipe, totalCount, publishedCount } = useRecipesStore();
  const [showForm, setShowForm] = useState(false);

  useEffect(() => {
    fetchRecipes().catch((e) => {
      console.error('Error cargando recetas', e);
      toast.error('No se pudieron cargar las recetas');
    });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  useEffect(() => {
    if (selectedRecipe) {
      setShowForm(true);
    } else {
      // Opcional: auto-cerrar el form si la receta se des-selecciona desde otro lugar
      // setShowForm(false);
    }
  }, [selectedRecipe]);

  const headerCounts = useMemo(() => ({ total: totalCount, published: publishedCount }), [totalCount, publishedCount]);

  const onNew = () => {
    setSelectedRecipe(null);
    setShowForm(true);
  };

  const onCloseForm = () => {
    setShowForm(false);
    setSelectedRecipe(null);
  };

  return (
    <div className="space-y-6 lg:space-y-8 p-4 sm:p-6">
      <header className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-2xl sm:text-3xl font-bold text-gray-800 font-garamond">Gestor de Recetas</h1>
          <p className="text-sm text-gray-600">{headerCounts.total} recetas en total · {headerCounts.published} publicadas</p>
        </div>
        <button onClick={onNew} className="w-full sm:w-auto inline-flex items-center justify-center gap-2 rounded-lg bg-amber-600 px-4 py-2 text-white shadow-sm hover:bg-amber-700 transition-colors min-h-[44px]">
          <Plus className="h-4 w-4" />
          Nueva receta
        </button>
      </header>

      {showForm ? (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 items-start">
          <div className="lg:col-span-2">
            <RecipeForm onClose={onCloseForm} />
          </div>
          <div className="w-full lg:w-1/3 fixed top-0 right-0 h-full bg-white z-20 overflow-y-auto p-6 lg:static lg:h-auto lg:z-auto lg:p-0 lg:bg-transparent">
            <RecipePreview recipe={(selectedRecipe as Recipe | null) || undefined} />
          </div>
        </div>
      ) : (
        <div className="space-y-6">
          <RecipeFilters />
          <RecipeTable items={items} loading={loading} meta={meta} />
        </div>
      )}
    </div>
  );
}
