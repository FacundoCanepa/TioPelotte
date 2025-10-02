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

  const inputStyles = "w-full rounded-lg border border-gray-300 bg-white px-3 py-2 text-sm shadow-sm focus:border-[#8B4513] focus:outline-none focus:ring-2 focus:ring-[#8B4513]/40 min-h-[44px]";
  const labelStyles = "block text-sm font-medium text-gray-700";

  return (
    <form className="flex flex-col gap-4 w-full" onSubmit={handleSubmit}>
      <div>
        <label className={labelStyles} htmlFor="category-name">
          Nombre de la Categoría <span className="text-red-500">*</span>
        </label>
        <input
          id="category-name"
          type="text"
          value={form.nombre}
          onChange={(event) => setForm((prev) => ({ ...prev, nombre: event.target.value }))}
          placeholder="Ej. Lácteos, Harinas, etc."
          className={inputStyles}
          required
        />
      </div>

      <div className="flex flex-col-reverse sm:flex-row sm:justify-end gap-3 pt-3 border-t">
        <button
          type="button"
          onClick={onCancel}
          className="w-full sm:w-auto inline-flex items-center justify-center rounded-lg border border-gray-300 px-4 py-2 text-sm font-medium text-gray-700 bg-white hover:bg-gray-50 transition-colors min-h-[44px]"
          disabled={saving}
        >
          Cancelar
        </button>
        <button
          type="submit"
          className="w-full sm:w-auto inline-flex items-center justify-center rounded-lg bg-[#8B4513] px-6 py-2 text-sm font-semibold text-white shadow-sm hover:opacity-90 transition-opacity disabled:opacity-70 min-h-[44px]"
          disabled={saving}
        >
          {saving && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
          {isEditing ? "Guardar Cambios" : "Guardar Categoría"}
        </button>
      </div>
    </form>
  );
}
