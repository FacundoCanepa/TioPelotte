import { Pencil, Trash2 } from "lucide-react";
import type { Category } from "@/types/categoria_ingrediente";

interface IngredientCategoryTableProps {
  categories: Category[];
  onEdit: (category: Category) => void;
  onDelete: (category: Category) => void;
  deletingId: string | null;
}

export function IngredientCategoryTable({
  categories,
  onEdit,
  onDelete,
  deletingId,
}: IngredientCategoryTableProps) {

  if (categories.length === 0) {
    return (
        <div className="px-5 py-10 text-center text-sm text-gray-500 border rounded-lg bg-white">
            No hay categorías cargadas todavía.
        </div>
    );
  }

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
      {categories.map((category) => {
        const deleteIdentifier = category.documentId || (category.id ? String(category.id) : null);
        const isDeleting = deleteIdentifier != null && deletingId === deleteIdentifier;
        const canDelete = Boolean(deleteIdentifier);
        const ingredientCount = category.ingredientes?.length ?? 0;

        return (
          <div key={deleteIdentifier || category.nombre} className="p-4 rounded-lg border bg-white shadow-sm flex flex-col justify-between">
            <div>
              <p className="font-semibold text-gray-800">{category.nombre || "Sin nombre"}</p>
              <p className="text-sm text-gray-500">
                {ingredientCount} ingrediente{ingredientCount === 1 ? "" : "s"}
              </p>
            </div>
            <div className="flex items-center justify-end gap-2 mt-3 pt-3 border-t border-gray-100">
              <button
                type="button"
                onClick={() => onEdit(category)}
                className="p-2 rounded-md text-gray-600 hover:bg-gray-100 hover:text-gray-800 transition-colors"
                aria-label="Editar categoría"
              >
                <Pencil className="h-4 w-4" />
              </button>
              <button
                type="button"
                onClick={() => onDelete(category)}
                className="p-2 rounded-md text-red-600 hover:bg-red-50 hover:text-red-700 transition-colors"
                aria-label="Eliminar categoría"
                disabled={!canDelete || isDeleting}
              >
                {isDeleting ? (
                  <svg
                    className="h-4 w-4 animate-spin text-red-500"
                    xmlns="http://www.w3.org/2000/svg"
                    fill="none"
                    viewBox="0 0 24 24"
                  >
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v4a4 4 0 00-4 4H4z"></path>
                  </svg>
                ) : (
                  <Trash2 className="h-4 w-4" />
                )}
              </button>
            </div>
          </div>
        );
      })}
    </div>
  );
}
