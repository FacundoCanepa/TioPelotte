"use client";

import { Dispatch, FormEvent, SetStateAction } from "react";
import { Loader2 } from "lucide-react";
import type { CategoryFormState } from "./hooks/useIngredientCategoriesAdmin";

interface IngredientCategoryFormProps {
  form: CategoryFormState;
  setForm: Dispatch<SetStateAction<CategoryFormState>>;
  onSave: () => Promise<void> | void;
  onCancel: () => void;
  saving: boolean;
  isEditing: boolean;
}

export function IngredientCategoryForm({
  form,
  setForm,
  onSave,
  onCancel,
  saving,
  isEditing,
}: IngredientCategoryFormProps) {
  const handleSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    await onSave();
  };

  return (
    <form className="space-y-4" onSubmit={handleSubmit}>
      <div className="grid gap-4 sm:grid-cols-2">
        <div className="sm:col-span-1">
          <label className="mb-1 block text-sm font-medium text-gray-700" htmlFor="category-name">
            Nombre <span className="text-red-500">*</span>
          </label>
          <input
            id="category-name"
            type="text"
            value={form.nombre}
            onChange={(event) =>
              setForm((prev) => ({ ...prev, nombre: event.target.value }))
            }
            placeholder="Ej. Lácteos"
            className="w-full rounded-xl border border-gray-300 px-3 py-2 text-sm shadow-sm focus:border-[#8B4513] focus:outline-none focus:ring-2 focus:ring-[#8B4513]/40"
            required
          />
        </div>
        <div className="sm:col-span-1">
          <label className="mb-1 block text-sm font-medium text-gray-700" htmlFor="category-description">
            Descripción
          </label>
          <textarea
            id="category-description"
            value={form.description}
            onChange={(event) =>
              setForm((prev) => ({ ...prev, description: event.target.value }))
            }
            placeholder="Descripción opcional"
            rows={3}
            className="w-full rounded-xl border border-gray-300 px-3 py-2 text-sm shadow-sm focus:border-[#8B4513] focus:outline-none focus:ring-2 focus:ring-[#8B4513]/40"
          />
        </div>
      </div>

      <div className="flex flex-col gap-2 sm:flex-row sm:justify-end">
        <button
          type="button"
          onClick={onCancel}
          className="inline-flex items-center justify-center rounded-2xl border border-gray-300 px-4 py-2 text-sm font-medium text-gray-600 transition hover:bg-gray-100"
          disabled={saving}
        >
          Cancelar
        </button>
        <button
          type="submit"
          className="inline-flex items-center justify-center rounded-2xl bg-[#8B4513] px-4 py-2 text-sm font-medium text-white shadow transition hover:bg-[#5A3E1B] disabled:opacity-70"
          disabled={saving}
        >
          {saving && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
          {isEditing ? "Guardar cambios" : "Crear categoría"}
        </button>
      </div>
    </form>
  );
}
