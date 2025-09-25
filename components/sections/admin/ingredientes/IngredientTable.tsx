'use client';
import { useState } from 'react';
import { ArrowUpDown, Pencil, Trash2, AlertTriangle, Eye } from 'lucide-react';
import { IngredientType } from '@/types/ingredient';
import IngredientPricesModal from './IngredientPricesModal';

interface Props {
  ingredientes: IngredientType[];
  onEdit: (i: IngredientType) => void;
  onDelete: (documentId: string) => void;
  orderBy: { field: keyof IngredientType; direction: 'asc' | 'desc' };
  setOrderBy: (v: { field: keyof IngredientType; direction: 'asc' | 'desc' }) => void;
}

export default function IngredientTable({ ingredientes, onEdit, onDelete, orderBy, setOrderBy }: Props) {
  const [showPrices, setShowPrices] = useState(false);
  const [selectedIngredient, setSelectedIngredient] = useState<IngredientType | null>(null);

  const handleSort = (field: keyof IngredientType) => {
    const newDirection = orderBy.field === field && orderBy.direction === 'asc' ? 'desc' : 'asc';
    setOrderBy({ field, direction: newDirection });
  };

  const handleOpenPrices = (ingredient: IngredientType) => {
    setSelectedIngredient(ingredient);
    setShowPrices(true);
  };

  const handleClosePrices = () => {
    setShowPrices(false);
    setSelectedIngredient(null);
  };

  return (
    <div className="overflow-x-auto bg-[#FFFCF7] rounded-xl shadow-lg border border-[#EADBC8]">
      <table className="min-w-full text-sm text-[#4A2E15]">
        <thead className="bg-[#FBE6D4] text-[#5A3E1B] uppercase text-xs tracking-wide">
          <tr>
            <th className="p-3 text-left cursor-pointer" onClick={() => handleSort('ingredienteName')}>
              Nombre <ArrowUpDown className="inline h-3 w-3 ml-1" />
            </th>
            <th className="p-3 text-left cursor-pointer" onClick={() => handleSort('Stock')}>
              Stock <ArrowUpDown className="inline h-3 w-3 ml-1" />
            </th>
            <th className="p-3 text-left">Unidad</th>
            <th className="p-3 text-left cursor-pointer" onClick={() => handleSort('precio')}>
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
              {i.Stock <= 5 && <AlertTriangle className="h-4 w-4 text-red-600" />}
                {i.ingredienteName}
              </td>
              <td className="p-3">{i.Stock}</td>
              <td className="p-3 text-xs font-medium bg-[#f2e8da] text-[#5A3E1B] px-2 py-1 rounded-md inline-block">
                {i.unidadMedida}
              </td>
              <td className="p-3 font-semibold">${i.precio.toLocaleString('es-AR')}</td>
              <td className="p-3 text-xs text-gray-500">
                {i.stockUpdatedAt ? new Date(i.stockUpdatedAt).toLocaleString('es-AR') : '-'}
              </td>
              <td className="p-3 text-center flex justify-center gap-3">
                <button
                  onClick={() => handleOpenPrices(i)}
                  className="flex items-center gap-1 rounded-full bg-[#FBE6D4] px-3 py-1 text-xs font-semibold text-[#5A3E1B] transition hover:bg-[#F6D8BA]"
                >
                  <Eye className="h-3.5 w-3.5" /> Ver precios
                </button>
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
      <IngredientPricesModal
        ingredient={selectedIngredient}
        open={showPrices}
        onClose={handleClosePrices}
      />
    </div>
  );
}