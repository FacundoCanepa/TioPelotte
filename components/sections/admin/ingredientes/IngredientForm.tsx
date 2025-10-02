'use client';

import { Dispatch, SetStateAction } from 'react';
import { useGetSuppliers } from '../../../hooks/useGetSuppliers';
import { useGetIngredientCategories } from '../../../hooks/useGetIngredientCategories';
import { SupplierType } from '@/types/supplier';
import { Category } from '@/types/categoria_ingrediente';

interface Props {
  form: any;
  setForm: Dispatch<SetStateAction<any>>;
  onSave: () => void;
  onCancel: () => void;
}

export default function IngredientForm({ form, setForm, onSave, onCancel }: Props) {
  const unidades = ['kg', 'planchas', 'unidad' , 'litros', 'maples', 'bolsas'];
  const { data: suppliers, isLoading: isLoadingSuppliers } = useGetSuppliers();
  const { data: categories, isLoading: isLoadingCategories } = useGetIngredientCategories();
  const categoryItems: Category[] = Array.isArray(categories) ? categories : categories?.items ?? [];
  
  const todayValue = new Date().toISOString().split('T')[0];
  const validFromValue = (() => {
    if (!form.validFrom) return todayValue;
    const parsed = new Date(form.validFrom);
    if (!Number.isNaN(parsed.getTime())) {
      return parsed.toISOString().split('T')[0];
    }
    if (typeof form.validFrom === 'string' && /^\d{4}-\d{2}-\d{2}$/.test(form.validFrom.trim())) {
      return form.validFrom.trim();
    }
    return todayValue;
  })();

  const inputStyles = "w-full rounded-lg border border-gray-300 bg-white px-3 py-2 text-sm shadow-sm focus:border-[#8B4513] focus:outline-none focus:ring-2 focus:ring-[#8B4513]/40 min-h-[44px]";
  const labelStyles = "block text-sm font-medium text-gray-700";

  return (
    <div className="bg-white p-4 sm:p-6 rounded-xl shadow-sm border space-y-6">
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-x-4 gap-y-6">
        
        {/* Nombre */}
        <div className="space-y-1">
          <label className={labelStyles}>Nombre del Ingrediente</label>
          <input
            type="text"
            placeholder="Ej: Harina 000"
            value={form.ingredienteName}
            onChange={e => setForm({ ...form, ingredienteName: e.target.value })}
            className={inputStyles}
          />
        </div>

        {/* Nombre para producción */}
        <div className="space-y-1">
          <label className={labelStyles}>Nombre para Producción</label>
          <input
            type="text"
            placeholder="Ej: Harina (la del paquete rojo)"
            value={form.ingredienteNameProducion || ''}
            onChange={e => setForm({ ...form, ingredienteNameProducion: e.target.value })}
            className={inputStyles}
          />
        </div>

        {/* Stock */}
        <div className="space-y-1">
          <label className={labelStyles}>Stock Actual</label>
          <input
            type="number"
            placeholder="0"
            value={form.Stock}
            onChange={e => setForm({ ...form, Stock: Number(e.target.value) })}
            className={inputStyles}
          />
        </div>

        {/* Unidad de medida */}
        <div className="space-y-1">
          <label className={labelStyles}>Unidad de medida</label>
          <select
            value={form.unidadMedida || ''}
            onChange={e => setForm({ ...form, unidadMedida: e.target.value })}
            className={inputStyles}
          >
            <option value="" disabled>Seleccionar unidad</option>
            {unidades.map(u => (
              <option key={u} value={u}>{u}</option>
            ))}
          </select>
        </div>

        {/* Precio */}
        <div className="space-y-1">
          <label className={labelStyles}>Precio</label>
          <input
            type="number"
            placeholder="0.00"
            value={form.precio}
            onChange={e => setForm({ ...form, precio: Number(e.target.value) })}
            className={inputStyles}
          />
        </div>

        {/* Cantidad Neta */}
        <div className="space-y-1">
          <label className={labelStyles}>Cantidad neta</label>
          <input
            type="number"
            placeholder="Ej: 5 (si el paquete es de 5kg)"
            value={form.quantityNeto ?? ''}
            onChange={e => setForm({ ...form, quantityNeto: e.target.value === '' ? null : Number(e.target.value) })}
            className={inputStyles}
            min={0}
            step="any"
          />
        </div>

        {/* Categoría */}
        <div className="space-y-1">
          <label className={labelStyles}>Categoría</label>
          <select
            value={form.categoria_ingrediente?.id || ''}
            onChange={e => setForm({ ...form, categoria_ingrediente: categoryItems.find((c: Category) => c.id === Number(e.target.value)) })}
            className={inputStyles}
            disabled={isLoadingCategories}
          >
            <option value="" disabled>Seleccionar categoría</option>
            {categoryItems.map((c: Category) => (
              <option key={c.id} value={c.id}>{c.nombre}</option>
            ))}
          </select>
        </div>

        {/* Proveedor */}
        <div className="space-y-1">
          <label className={labelStyles}>Proveedor</label>
          <select
            value={form.supplier?.id || ''}
            onChange={e => setForm({ ...form, supplier: suppliers?.items.find((s: SupplierType) => s.id === Number(e.target.value)) })}
            className={inputStyles}
            disabled={isLoadingSuppliers}
          >
            <option value="" disabled>Seleccionar proveedor</option>
            {suppliers?.items.map((s: SupplierType) => (
              <option key={s.id} value={s.id}>{s.name}</option>
            ))}
          </select>
        </div>
        
        {/* Válido desde */}
        <div className="space-y-1 sm:col-span-2">
            <label className={labelStyles}>Precio Válido Desde</label>
            <input
                type="date"
                value={validFromValue}
                onChange={e => setForm({ ...form, validFrom: e.target.value })}
                className={inputStyles}
            />
        </div>
      </div>

      {/* Botones */}
      <div className="flex justify-end gap-3 pt-4 border-t">
          <button 
            type="button" 
            onClick={onCancel} 
            className="px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 min-h-[44px]"
          >
            Cancelar
          </button>
          <button 
            type="button" 
            onClick={onSave} 
            className="px-6 py-2 text-sm font-semibold text-white bg-[#8B4513] rounded-lg hover:opacity-90 min-h-[44px]"
          >
            Guardar Ingrediente
          </button>
      </div>
    </div>
  );
}
