'use client';
import { useState } from 'react';
import { ArrowUpDown, Pencil, Trash2, AlertTriangle, Eye, Package } from 'lucide-react';
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
    return date.toLocaleString('es-AR', { day: '2-digit', month: '2-digit', year: 'numeric', hour: '2-digit', minute: '2-digit' });
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
    <div>
      {/* Vista de Tabla para Desktop */}
      <div className="hidden lg:block bg-white rounded-xl shadow-sm border overflow-hidden">
        <table className="min-w-full text-sm">
          <thead className="bg-gray-50 text-gray-600 uppercase text-xs tracking-wider">
            <tr>
              <th className="p-4 text-left cursor-pointer" onClick={() => handleSort('ingredienteName')}>
                Nombre <ArrowUpDown className="inline h-4 w-4 ml-1 opacity-50" />
              </th>
              <th className="p-4 text-left cursor-pointer" onClick={() => handleSort('Stock')}>
                Stock <ArrowUpDown className="inline h-4 w-4 ml-1 opacity-50" />
              </th>
              <th className="p-4 text-left">Unidad</th>
              <th className="p-4 text-left">Última Actualización</th>
              <th className="p-4 text-center">Acciones</th>
            </tr>
          </thead>
          <tbody className="divide-y">
            {ingredientes.map(i => (
              <tr key={i.id} className="hover:bg-gray-50 transition-colors group">
                <td className="p-4 font-medium text-gray-800">
                  <div className="flex items-center gap-2">
                    {typeof i.Stock === 'number' && i.Stock <= LOW_STOCK_THRESHOLD ? (
                      <AlertTriangle className="h-5 w-5 text-red-500 flex-shrink-0" title="Stock bajo" />
                    ) : (
                      <Package className="h-5 w-5 text-gray-400 flex-shrink-0" />
                    )}
                     <div>
                        {i.ingredienteName}
                        {i.ingredienteNameProducion && (
                          <span className="text-xs text-gray-500 ml-2">({i.ingredienteNameProducion})</span>
                        )}
                    </div>
                  </div>
                </td>
                <td className={`p-4 font-semibold ${typeof i.Stock === 'number' && i.Stock <= LOW_STOCK_THRESHOLD ? 'text-red-600' : 'text-gray-800'}`}>
                  {i.Stock}
                </td>
                <td className="p-4">
                  <span className="text-xs font-medium bg-gray-100 text-gray-700 px-2 py-1 rounded-md">
                    {i.unidadMedida}
                  </span>
                </td>
                <td className="p-4 text-xs text-gray-500 truncate">
                  {formatDateTime(i.stockUpdatedAt ?? i.updatedAt ?? null)}
                </td>
                <td className="p-4">
                  <div className="flex justify-center items-center gap-2">
                    <button onClick={() => handleOpenPrices(i)} className="p-2 rounded-full text-gray-500 hover:bg-gray-100 hover:text-gray-800 transition-colors">
                      <Eye className="h-5 w-5" />
                    </button>
                    <button onClick={() => onEdit(i)} className="p-2 rounded-full text-blue-600 hover:bg-blue-50 transition-colors">
                      <Pencil className="h-5 w-5" />
                    </button>
                    <button onClick={() => onDelete(i.documentId)} className="p-2 rounded-full text-red-600 hover:bg-red-50 transition-colors">
                      <Trash2 className="h-5 w-5" />
                    </button>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* Vista de Tarjetas para Mobile */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 lg:hidden">
        {ingredientes.map(i => (
          <div key={i.id} className="bg-white rounded-xl shadow-sm border flex flex-col p-4 space-y-3">
            <div className="flex items-start justify-between gap-3">
                <div className="font-bold text-gray-800">
                    {i.ingredienteName}
                     {i.ingredienteNameProducion && (
                        <span className="text-xs font-normal text-gray-500 block">({i.ingredienteNameProducion})</span>
                    )}
                </div>
                <div className="flex items-center gap-2 flex-shrink-0">
                    {typeof i.Stock === 'number' && i.Stock <= LOW_STOCK_THRESHOLD && (
                      <AlertTriangle className="h-5 w-5 text-red-500" title="Stock bajo" />
                    )}
                </div>
            </div>

            <div className="flex justify-between items-center text-sm border-t pt-3">
              <span className="text-gray-500">Stock</span>
              <span className={`font-semibold ${typeof i.Stock === 'number' && i.Stock <= LOW_STOCK_THRESHOLD ? 'text-red-600' : 'text-gray-800'}`}>{i.Stock} {i.unidadMedida}</span>
            </div>

            <div className="flex justify-between items-center text-xs border-t pt-3">
              <span className="text-gray-500">Actualizado</span>
              <span className="text-gray-600 truncate">{formatDateTime(i.stockUpdatedAt ?? i.updatedAt ?? null)}</span>
            </div>
            
            <div className="flex gap-2 border-t pt-3 mt-auto">
              <button
                onClick={() => onEdit(i)}
                className="flex-1 inline-flex items-center justify-center gap-2 rounded-lg px-3 py-2 text-sm font-semibold text-gray-700 bg-gray-100 border border-gray-200 hover:bg-gray-200 min-h-[40px] transition-colors"
              >
                <Pencil className="h-4 w-4" />
                Editar
              </button>
              <button
                onClick={() => onDelete(i.documentId)}
                className="inline-flex items-center justify-center rounded-lg p-2 text-red-600 bg-white border border-gray-200 hover:bg-red-50 hover:text-red-700 min-h-[40px] aspect-square transition-colors"
              >
                <Trash2 className="h-4 w-4" />
              </button>
            </div>
          </div>
        ))}
      </div>
      
      <IngredientPricesModal
        ingredient={selectedIngredient}
        open={showPrices}
        onClose={handleClosePrices}
      />
    </div>
  );
}
