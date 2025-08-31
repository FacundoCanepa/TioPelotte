"use client";

import { useEffect, useMemo, useState } from 'react';
import { toast } from 'sonner';
import { useRecipesStore } from '@/store/admin/recipes-store';
import { Recipe } from '@/types/recipe';
import RecipeFilters from './RecipeFilters';
import RecipeTable from './RecipeTable';
import RecipeForm from './RecipeForm';
import RecipePreview from './RecipePreview';

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
    if (selectedRecipe) setShowForm(true);
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
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-semibold">Recetas</h1>
          <p className="text-sm text-muted-foreground">Total: {headerCounts.total} · Publicadas: {headerCounts.published}</p>
        </div>
        <button onClick={onNew} className="inline-flex items-center rounded-2xl bg-amber-600 px-4 py-2 text-white shadow hover:bg-amber-700">
          Nueva receta
        </button>
      </div>

      <div className="rounded-2xl bg-[#FBE6D4] p-4 shadow-sm">
        <RecipeFilters />
      </div>

      <div className="rounded-2xl bg-white p-4 shadow">
        <RecipeTable items={items} loading={loading} meta={meta} />
      </div>

      {showForm && (
        <div className="grid gap-4 md:grid-cols-2">
          <div className="rounded-2xl bg-white p-4 shadow">
            <RecipeForm onClose={onCloseForm} />
          </div>
          <div className="rounded-2xl bg-white p-4 shadow">
            <RecipePreview recipe={(selectedRecipe as Recipe | null) || undefined} />
          </div>
        </div>
      )}
    </div>
  );
}
