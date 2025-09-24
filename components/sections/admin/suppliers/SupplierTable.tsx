import { SupplierType } from "@/types/supplier";
import { Pencil, Trash2 } from "lucide-react";

interface SupplierTableProps {
  suppliers: SupplierType[];
  onEdit: (supplier: SupplierType) => void;
  onDelete: (supplier: SupplierType) => void;
}

export function SupplierTable({ suppliers, onEdit, onDelete }: SupplierTableProps) {
  return (
    <div className="overflow-x-auto rounded-xl border border-gray-200 bg-white shadow-lg">
      <table className="min-w-full text-sm text-gray-800">
        <thead className="bg-gray-100 text-xs uppercase tracking-wider text-gray-600">
          <tr>
            <th scope="col" className="px-6 py-3 text-left font-semibold">
              Nombre
            </th>
            <th scope="col" className="px-6 py-3 text-left font-semibold">
              Teléfono
            </th>
            <th scope="col" className="px-6 py-3 text-left font-semibold">
              Ingredientes
            </th>
            <th scope="col" className="px-6 py-3 text-left font-semibold">
              Estado
            </th>
            <th scope="col" className="px-6 py-3 text-center font-semibold">
              Acciones
            </th>
          </tr>
        </thead>
        <tbody className="divide-y divide-gray-200">
          {suppliers.length === 0 ? (
            <tr>
              <td colSpan={5} className="px-6 py-6 text-center text-sm text-gray-500">
                No se encontraron proveedores con los filtros aplicados.
              </td>
            </tr>
          ) : (
            suppliers.map((supplier) => (
              <tr
                key={supplier.documentId || String(supplier.id) || supplier.name}
                className="transition hover:bg-gray-50"
              >
                <td className="whitespace-nowrap px-6 py-4 font-medium">{supplier.name}</td>
                <td className="whitespace-nowrap px-6 py-4">
                  {supplier.phone && supplier.phone.trim() !== ""
                    ? supplier.phone
                    : "Sin teléfono"}
                </td>
                <td className="px-6 py-4">
                  <div className="flex flex-wrap gap-1">
                    {supplier.ingredientes?.length ? (
                      supplier.ingredientes.map((ingredient) => (
                        <span
                          key={ingredient.id}
                          className="rounded-full bg-blue-100 px-2 py-1 text-xs font-medium text-blue-800"
                        >
                          {ingredient.ingredienteName}
                        </span>
                      ))
                    ) : (
                      <span className="text-xs text-gray-500">Sin ingredientes</span>
                    )}
                  </div>
                </td>
                <td className="whitespace-nowrap px-6 py-4">
                  {supplier.active === true ? (
                    <span className="inline-flex rounded-full bg-green-100 px-2 text-xs font-semibold leading-5 text-green-800">
                      Activo
                    </span>
                  ) : supplier.active === false ? (
                    <span className="inline-flex rounded-full bg-red-100 px-2 text-xs font-semibold leading-5 text-red-800">
                      Inactivo
                    </span>
                  ) : (
                    <span className="inline-flex rounded-full bg-gray-100 px-2 text-xs font-semibold leading-5 text-gray-700">
                      Sin estado
                    </span>
                  )}
                </td>
                <td className="px-6 py-4">
                  <div className="flex items-center justify-center gap-4">
                    <button
                      onClick={() => onEdit(supplier)}
                      className="text-indigo-600 transition hover:text-indigo-900"
                    >
                      <Pencil className="h-5 w-5" />
                    </button>
                    <button
                      onClick={() => onDelete(supplier)}
                      className="text-red-600 transition hover:text-red-900"
                    >
                      <Trash2 className="h-5 w-5" />
                    </button>
                  </div>
                </td>
              </tr>
            ))
          )}
        </tbody>
      </table>
    </div>
  );
}