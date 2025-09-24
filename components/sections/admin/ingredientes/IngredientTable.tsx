'use client';
import { ArrowUpDown, Pencil, Trash2, AlertTriangle } from 'lucide-react';
import { IngredientType } from '@/types/ingredient';

interface Props {
  ingredientes: IngredientType[];
  onEdit: (i: IngredientType) => void;
  onDelete: (documentId: string) => void;
  orderBy: { field: string; direction: 'asc' | 'desc' };
  setOrderBy: (v: { field: string; direction: 'asc' | 'desc' }) => void;
}

export default function IngredientTable({ ingredientes, onEdit, onDelete, orderBy, setOrderBy }: Props) {
  return (
    <div className="overflow-x-auto bg-[#FFFCF7] rounded-xl shadow-lg border border-[#EADBC8]">
      <table className="min-w-full text-sm text-[#4A2E15]">
        <thead className="bg-[#FBE6D4] text-[#5A3E1B] uppercase text-xs tracking-wide">
          <tr>
            <th
              className="p-3 text-left cursor-pointer"
              onClick={() => setOrderBy({ field: 'ingredienteName', direction: orderBy.direction === 'asc' ? 'desc' : 'asc' })}
            >
              Nombre <ArrowUpDown className="inline h-3 w-3 ml-1" />
            </th>
            <th
              className="p-3 text-left cursor-pointer"
              onClick={() => setOrderBy({ field: 'stock', direction: orderBy.direction === 'asc' ? 'desc' : 'asc' })}
            >
              Stock <ArrowUpDown className="inline h-3 w-3 ml-1" />
            </th>
            <th className="p-3 text-left">Unidad</th>
            <th
              className="p-3 text-left cursor-pointer"
              onClick={() => setOrderBy({ field: 'precio', direction: orderBy.direction === 'asc' ? 'desc' : 'asc' })}
            >
              Precio <ArrowUpDown className="inline h-3 w-3 ml-1" />
            </th>
            <th className="p-3 text-left">Actualizado</th>
            <th className="p-3 text-center">Acciones</th>
          </tr>
        </thead>
        <tbody>
          {ingredientes.map(i => (
            <tr key={i.id} className="border-b last:border-none hover:bg-[#FFF8EC] transition">
              <td className="p-3 capitalize font-medium flex items-center gap-2">
                {i.stock <= 5 && <AlertTriangle className="h-4 w-4 text-red-600" />}
                {i.ingredienteName}
              </td>
              <td className="p-3">{i.stock}</td>
              <td className="p-3 text-xs font-medium bg-[#f2e8da] text-[#5A3E1B] px-2 py-1 rounded-md inline-block">
                {i.unidadMedida}
              </td>
              <td className="p-3 font-semibold">${i.precio.toLocaleString('es-AR')}</td>
              <td className="p-3 text-xs text-gray-500">
                {i.stockUpdatedAt ? new Date(i.stockUpdatedAt).toLocaleString('es-AR') : '-'}
              </td>
              <td className="p-3 text-center flex justify-center gap-3">
                <button onClick={() => onEdit(i)} className="text-[#8B4513] hover:text-[#5A3E1B] transition">
                  <Pencil className="h-4 w-4" />
                </button>
                <button onClick={() => onDelete(i.documentId)} className="text-red-600 hover:text-red-800 transition">
                  <Trash2 className="h-4 w-4" />
                </button>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
