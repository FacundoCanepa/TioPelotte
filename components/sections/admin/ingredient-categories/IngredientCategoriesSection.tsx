"use client";

import { Loader2, Plus } from "lucide-react";
import { IngredientCategoryForm } from "./IngredientCategoryForm";
import { IngredientCategoryTable } from "./IngredientCategoryTable";
import { useIngredientCategoriesAdmin } from "./hooks/useIngredientCategoriesAdmin";

export default function IngredientCategoriesSection() {
  const {
    categories,
    total,
    loading,
    error,
    search,
    setSearch,
    showForm,
    startNew,
    editCategory,
    deleteCategory,
    form,
    setForm,
    saveCategory,
    resetForm,
    saving,
    deletingId,
    isEditing,
  } = useIngredientCategoriesAdmin();

  if (loading && categories.length === 0) {
    return (
      <div className="flex w-full justify-center py-20">
        <Loader2 className="h-8 w-8 animate-spin text-[#8B4513]" />
      </div>
    );
  }

  const headerSubtitle = total === 1 ? "1 categoría registrada" : `${total} categorías registradas`;

  return (
    <section className="space-y-6 lg:space-y-8 p-4 sm:p-6">
      <header className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-2xl sm:text-3xl font-bold text-[#8B4513] font-garamond">
            Categorías de Ingredientes
          </h1>
          <p className="text-sm text-gray-600">{headerSubtitle}</p>
        </div>
        <button
          type="button"
          onClick={startNew}
          className="w-full sm:w-auto inline-flex items-center justify-center gap-2 rounded-lg bg-[#8B4513] px-4 py-2 text-white shadow-sm hover:opacity-90 transition-opacity min-h-[44px]"
        >
          <Plus className="h-4 w-4" />
          Nueva categoría
        </button>
      </header>

      {error && (
        <div className="rounded-lg border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700 w-full">
          <strong>Error:</strong> {error}
        </div>
      )}

      {showForm && (
        <div className="bg-white p-4 sm:p-6 rounded-xl shadow-sm border space-y-4">
          <h2 className="text-xl font-semibold text-[#8B4513]">
            {isEditing ? "Editar categoría" : "Crear nueva categoría"}
          </h2>
          <IngredientCategoryForm
            form={form}
            setForm={setForm}
            onSave={saveCategory}
            onCancel={resetForm}
            saving={saving}
            isEditing={isEditing}
          />
        </div>
      )}

      {!showForm && (
         <div className="space-y-4">
            <input
              type="search"
              value={search}
              onChange={(event) => setSearch(event.target.value)}
              placeholder="Buscar por nombre o descripción..."
              className="w-full rounded-lg border bg-white px-3 py-2 text-sm shadow-sm focus:border-[#8B4513] focus:outline-none focus:ring-2 focus:ring-[#8B4513]/40 sm:max-w-xs min-h-[44px]"
            />

            <IngredientCategoryTable
              categories={categories}
              onEdit={editCategory}
              onDelete={deleteCategory}
              deletingId={deletingId}
            />
        </div>
      )}
    </section>
  );
}
