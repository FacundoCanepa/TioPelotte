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
      <div className="flex w-full justify-center py-10">
        <Loader2 className="h-6 w-6 animate-spin text-[#8B4513]" />
      </div>
    );
  }

  const headerSubtitle = total === 1 ? "1 categoría" : `${total} categorías`;

  return (
    <section className="space-y-6">
      <header className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-3xl font-semibold text-[#8B4513] font-garamond">
            Categorías de ingredientes
          </h1>
          <p className="text-sm text-gray-600">{headerSubtitle}</p>
        </div>
        <button
          type="button"
          onClick={startNew}
          className="inline-flex items-center gap-2 rounded-2xl bg-[#8B4513] px-4 py-2 text-sm font-medium text-white shadow transition hover:bg-[#5A3E1B]"
        >
          <Plus className="h-4 w-4" />
          Nueva categoría
        </button>
      </header>

      <div className="flex flex-col gap-3 sm:flex-row">
        <input
          type="search"
          value={search}
          onChange={(event) => setSearch(event.target.value)}
          placeholder="Buscar por nombre o descripción"
          className="w-full rounded-xl border border-gray-300 px-3 py-2 text-sm shadow-sm focus:border-[#8B4513] focus:outline-none focus:ring-2 focus:ring-[#8B4513]/40 sm:max-w-sm"
        />
      </div>

      {error && (
        <div className="rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
          {error}
        </div>
      )}

      {showForm && (
        <div className="space-y-4 rounded-2xl bg-white p-5 shadow">
          <div className="flex items-center justify-between">
            <h2 className="text-xl font-semibold text-[#8B4513]">
              {isEditing ? "Editar categoría" : "Nueva categoría"}
            </h2>
            <button
              type="button"
              onClick={resetForm}
              className="text-sm text-gray-500 transition hover:text-gray-700"
            >
              Cancelar
            </button>
          </div>
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

      <IngredientCategoryTable
        categories={categories}
        onEdit={editCategory}
        onDelete={deleteCategory}
        deletingId={deletingId}
      />
    </section>
  );
}
