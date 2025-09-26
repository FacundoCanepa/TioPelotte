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
  return (
    <div className="overflow-x-auto rounded-2xl border border-gray-200 bg-white shadow">
      <table className="min-w-full text-sm text-gray-800">
        <thead className="bg-gray-100 text-xs uppercase tracking-wider text-gray-600">
          <tr>
            <th scope="col" className="px-5 py-3 text-left font-semibold">
              Nombre
            </th>
            <th scope="col" className="px-5 py-3 text-left font-semibold">
              Ingredientes asociados
            </th>
            <th scope="col" className="px-5 py-3 text-center font-semibold">
              Acciones
            </th>
          </tr>
        </thead>
        <tbody className="divide-y divide-gray-200">
          {categories.length === 0 ? (
            <tr>
              <td
                colSpan={3}
                className="px-5 py-6 text-center text-sm text-gray-500"
              >
                No hay categorías cargadas todavía.
              </td>
            </tr>
          ) : (
            categories.map((category, index) => {
              const deleteIdentifier =
                category.documentId || (category.id ? String(category.id) : null);
              const rowKey =
                deleteIdentifier || category.nombre || `categoria-${index}`;
              const isDeleting =
                deleteIdentifier != null && deletingId === deleteIdentifier;
              const canDelete = Boolean(deleteIdentifier);
              const ingredientCount = category.ingredientes?.length ?? 0;

              return (
                <tr key={rowKey} className="transition hover:bg-gray-50">
                  <td className="whitespace-nowrap px-5 py-4 font-medium">
                    {category.nombre || "Sin nombre"}
                  </td>
                  <td className="px-5 py-4">
                    <span className="inline-flex items-center rounded-full bg-[#F7EDE2] px-3 py-1 text-xs font-medium text-[#8B4513]">
                      {ingredientCount} ingrediente{ingredientCount === 1 ? "" : "s"}
                    </span>
                  </td>
                  <td className="px-5 py-4">
                    <div className="flex items-center justify-center gap-3">
                      <button
                        type="button"
                        onClick={() => onEdit(category)}
                        className="text-[#8B4513] transition hover:text-[#5A3E1B]"
                        aria-label="Editar categoría"
                      >
                        <Pencil className="h-4 w-4" />
                      </button>
                      <button
                        type="button"
                        onClick={() => onDelete(category)}
                        className="text-red-500 transition hover:text-red-600"
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
                            <circle
                              className="opacity-25"
                              cx="12"
                              cy="12"
                              r="10"
                              stroke="currentColor"
                              strokeWidth="4"
                            ></circle>
                            <path
                              className="opacity-75"
                              fill="currentColor"
                              d="M4 12a8 8 0 018-8v4a4 4 0 00-4 4H4z"
                            ></path>
                          </svg>
                        ) : (
                          <Trash2 className="h-4 w-4" />
                        )}
                      </button>
                    </div>
                  </td>
                </tr>
              );
            })
          )}
        </tbody>
      </table>
    </div>
  );
}
