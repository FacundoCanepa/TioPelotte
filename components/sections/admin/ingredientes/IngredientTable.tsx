'use client';
import { useState } from 'react';
import { ArrowUpDown, Pencil, Trash2, AlertTriangle, Eye } from 'lucide-react';
import { IngredientType } from '@/types/ingredient';
import { LOW_STOCK_THRESHOLD } from '@/lib/inventory';
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

  const formatDateTime = (value?: string | null) => {
    if (!value) return '-';
    const date = new Date(value);
    if (Number.isNaN(date.getTime())) return '-';
    return date.toLocaleString('es-AR');
  };

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
    <div className="bg-[#FFFCF7] rounded-xl shadow-lg border border-[#EADBC8] overflow-hidden">
      <div className="overflow-x-auto">
        <table className="min-w-full text-sm text-[#4A2E15] w-full">
          <thead className="bg-[#FBE6D4] text-[#5A3E1B] uppercase text-xs tracking-wide hidden md:table-header-group">
            <tr>
              <th className="p-4 text-left cursor-pointer" onClick={() => handleSort('ingredienteName')}>
                Nombre <ArrowUpDown className="inline h-4 w-4 ml-1" />
              </th>
              <th className="p-4 text-left cursor-pointer" onClick={() => handleSort('Stock')}>
                Stock <ArrowUpDown className="inline h-4 w-4 ml-1" />
              </th>
              <th className="p-4 text-left">Unidad</th>
              <th className="p-4 text-left cursor-pointer" onClick={() => handleSort('precio')}>
                Precio <ArrowUpDown className="inline h-4 w-4 ml-1" />
              </th>
              <th className="p-4 text-left">Cantidad neta</th>
              <th className="p-4 text-left">Proveedor</th>
              <th className="p-4 text-left">Categoría</th>
              <th className="p-4 text-left">Actualizado</th>
              <th className="p-4 text-center">Acciones</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-[#EADBC8]">
            {ingredientes.map(i => (
              <tr key={i.id} className="grid grid-cols-1 sm:grid-cols-2 md:table-row gap-y-2 p-4 md:p-0 hover:bg-[#FFF8EC] transition group">
                {/* Nombre */}
                <td className="md:p-4 font-medium flex items-center gap-2 col-span-full sm:col-span-1">
                  {typeof i.Stock === 'number' && i.Stock <= LOW_STOCK_THRESHOLD && (
                    <AlertTriangle className="h-5 w-5 text-red-600" />
                  )}
                  <div className="flex flex-col">
                    <span className="font-bold md:font-medium">{i.ingredienteName}</span>
                    {i.ingredienteNameProducion && (
                      <span className="text-xs font-normal text-[#7a5b3a]">
                        {i.ingredienteNameProducion}
                      </span>
                    )}
                  </div>
                </td>
                
                {/* Stock */}
                <td className="md:p-4 flex justify-between items-center sm:block" data-label="Stock: ">
                  <span className="font-bold text-xs uppercase text-[#7a5b3a] md:hidden">Stock: </span>
                  <span>{i.Stock}</span>
                </td>
                
                {/* Unidad */}
                <td className="md:p-4 flex justify-between items-center sm:block" data-label="Unidad: ">
                  <span className="font-bold text-xs uppercase text-[#7a5b3a] md:hidden">Unidad: </span>
                  <span className="text-xs font-medium bg-[#FFF8EC] text-[#000000] px-2 py-1 rounded-md inline-block">
                    {i.unidadMedida}
                  </span>
                </td>
                
                {/* Precio */}
                <td className="md:p-4 font-semibold flex justify-between items-center sm:block" data-label="Precio: ">
                  <span className="font-bold text-xs uppercase text-[#7a5b3a] md:hidden">Precio: </span>
                  <span>${i.precio.toLocaleString('es-AR')}</span>
                </td>
                
                {/* Cantidad Neta */}
                <td className="md:p-4 flex justify-between items-center sm:block" data-label="Cantidad Neta: ">
                  <span className="font-bold text-xs uppercase text-[#7a5b3a] md:hidden">Cant. Neta: </span>
                  <span>{i.quantityNeto != null ? i.quantityNeto.toLocaleString('es-AR') : '-'}</span>
                </td>
                
                {/* Proveedor */}
                <td className="md:p-4 flex justify-between items-center sm:block" data-label="Proveedor: ">
                  <span className="font-bold text-xs uppercase text-[#7a5b3a] md:hidden">Proveedor: </span>
                  <span>{i.supplier?.name ?? '-'}</span>
                </td>
                
                {/* Categoría */}
                <td className="md:p-4 flex justify-between items-center sm:block" data-label="Categoría: ">
                  <span className="font-bold text-xs uppercase text-[#7a5b3a] md:hidden">Categoría: </span>
                  <span>{i.categoria_ingrediente?.nombre ?? '-'}</span>
                </td>
                
                {/* Actualizado */}
                <td className="md:p-4 text-xs text-gray-500 col-span-full sm:col-span-1 flex justify-between items-center sm:block" data-label="Actualizado: ">
                  <span className="font-bold uppercase text-[#7a5b3a] md:hidden">Actualizado: </span>
                  <span>{formatDateTime(i.updatedAt ?? i.stockUpdatedAt ?? null)}</span>
                </td>
                
                {/* Acciones */}
                <td className="md:p-4 text-center flex flex-col sm:flex-row justify-end items-center gap-3 col-span-full">
                  <button
                    onClick={() => handleOpenPrices(i)}
                    className="w-full sm:w-auto flex items-center justify-center gap-2 rounded-full bg-[#FBE6D4] px-4 py-2 text-sm font-semibold text-[#5A3E1B] transition hover:bg-[#F6D8BA] min-h-[44px]"
                  >
                    <Eye className="h-4 w-4" /> Ver precios
                  </button>
                  <div className="flex gap-3">
                    <button onClick={() => onEdit(i)} className="text-[#8B4513] hover:text-[#5A3E1B] transition p-2 rounded-full hover:bg-[#F6D8BA] min-h-[44px] min-w-[44px] flex items-center justify-center">
                      <Pencil className="h-5 w-5" />
                    </button>
                    <button onClick={() => onDelete(i.documentId)} className="text-red-600 hover:text-red-800 transition p-2 rounded-full hover:bg-red-100 min-h-[44px] min-w-[44px] flex items-center justify-center">
                      <Trash2 className="h-5 w-5" />
                    </button>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
      <IngredientPricesModal
        ingredient={selectedIngredient}
        open={showPrices}
        onClose={handleClosePrices}
      />
    </div>
  );
}
