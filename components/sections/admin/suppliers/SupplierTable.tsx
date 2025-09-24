
import { SupplierType } from "@/types/supplier";
import { Pencil, Trash2 } from 'lucide-react';

interface SupplierTableProps {
  suppliers: SupplierType[];
  onEdit: (supplier: SupplierType) => void;
  onDelete: (supplierId: number) => void;
}

export function SupplierTable({ suppliers, onEdit, onDelete }: SupplierTableProps) {
  return (
    <div className="overflow-x-auto bg-white rounded-xl shadow-lg border border-gray-200">
      <table className="min-w-full text-sm text-gray-800">
        <thead className="bg-gray-100 text-gray-600 uppercase text-xs tracking-wider">
          <tr>
            <th scope="col" className="px-6 py-3 text-left font-semibold">Nombre</th>
            <th scope="col" className="px-6 py-3 text-left font-semibold">Teléfono</th>
            <th scope="col" className="px-6 py-3 text-left font-semibold">Ingredientes</th>
            <th scope="col" className="px-6 py-3 text-left font-semibold">Estado</th>
            <th scope="col" className="px-6 py-3 text-center font-semibold">Acciones</th>
          </tr>
        </thead>
        <tbody className="divide-y divide-gray-200">
          {suppliers.map((supplier) => (
            <tr key={supplier.id} className="hover:bg-gray-50 transition">
              <td className="px-6 py-4 whitespace-nowrap font-medium">{supplier.name}</td>
              <td className="px-6 py-4 whitespace-nowrap">{supplier.phone}</td>
              <td className="px-6 py-4 whitespace-nowrap">
                <div className="flex flex-wrap gap-1">
                  {supplier.ingredientes?.map(ing => (
                    <span key={ing.id} className="px-2 py-1 text-xs font-medium bg-blue-100 text-blue-800 rounded-full">
                      {ing.ingredienteName}
                    </span>
                  ))}
                  {(!supplier.ingredientes || supplier.ingredientes.length === 0) && (
                    <span className="text-xs text-gray-500">Sin ingredientes</span>
                  )}
                </div>
              </td>
              <td className="px-6 py-4 whitespace-nowrap">
                {supplier.active ? (
                  <span className="px-2 inline-flex text-xs leading-5 font-semibold rounded-full bg-green-100 text-green-800">
                    Activo
                  </span>
                ) : (
                  <span className="px-2 inline-flex text-xs leading-5 font-semibold rounded-full bg-red-100 text-red-800">
                    Inactivo
                  </span>
                )}
              </td>
              <td className="px-6 py-4 whitespace-nowrap text-center flex justify-center gap-4">
                <button onClick={() => onEdit(supplier)} className="text-indigo-600 hover:text-indigo-900 transition">
                  <Pencil className="h-5 w-5" />
                </button>
                <button onClick={() => onDelete(supplier.id)} className="text-red-600 hover:text-red-900 transition">
                  <Trash2 className="h-5 w-5" />
                </button>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
