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
}

export default function IngredientForm({ form, setForm, onSave }: Props) {
  const unidades = ['kg', 'planchas', 'unidad' , 'litros', 'maples', 'bolsas'];
  const { data: suppliers, isLoading: isLoadingSuppliers } = useGetSuppliers();
  const { data: categories, isLoading: isLoadingCategories } = useGetIngredientCategories();
  const categoryItems: Category[] = Array.isArray(categories) ? categories : categories?.items ?? [];
  return (
    <div className="bg-white p-4 rounded-xl shadow space-y-4 max-w-md">
      <div className="space-y-1">
        <label className="text-sm font-semibold text-[#5A3E1B]">Nombre</label>
        <input
          type="text"
          placeholder="Nombre"
          value={form.ingredienteName}
          onChange={e => setForm({ ...form, ingredienteName: e.target.value })}
          className="border p-2 rounded w-full"
        />
      </div>
      <div className="space-y-1">
        <label className="text-sm font-semibold text-[#5A3E1B]">Stock</label>
        <input
          type="number"
          placeholder="Stock"
          value={form.Stock}
          onChange={e => setForm({ ...form, Stock: Number(e.target.value) })}
          className="border p-2 rounded w-full"
        />
      </div>
      <div className="space-y-1">
        <label className="text-sm font-semibold text-[#5A3E1B]">Unidad de medida</label>
        <select
          value={form.unidadMedida || ''}
          onChange={e => setForm({ ...form, unidadMedida: e.target.value })}
          className="border p-2 rounded w-full"
        >
          <option value="" disabled>
            Unidad de medida
          </option>
          {unidades.map(u => (
            <option key={u} value={u}>
              {u}
            </option>
          ))}
        </select>
      </div>
      <div className="space-y-1">
        <label className="text-sm font-semibold text-[#5A3E1B]">Precio</label>
        <input
          type="number"
          placeholder="Precio"
          value={form.precio}
          onChange={e => setForm({ ...form, precio: Number(e.target.value) })}
          className="border p-2 rounded w-full"
        />
      </div>
      <div className="space-y-1">
        <label className="text-sm font-semibold text-[#5A3E1B]">Categoría</label>
        <select
          value={form.categoria_ingrediente?.id || ''}
          onChange={e =>
            setForm({ ...form, categoria_ingrediente: categoryItems.find((c: Category) => c.id === Number(e.target.value)) })          }
          className="border p-2 rounded w-full"
          disabled={isLoadingCategories}
        >
          <option value="" disabled>
            Seleccionar categoría
          </option>
          {categoryItems.map((c: Category) => (
            <option key={c.id} value={c.id}>
              {c.nombre}
            </option>
          ))}
        </select>
      </div>
      <div className="space-y-1">
        <label className="text-sm font-semibold text-[#5A3E1B]">Proveedor</label>
        <select
          value={form.supplier?.id || ''}
          onChange={e => setForm({ ...form, supplier: suppliers?.items.find((s: SupplierType) => s.id === Number(e.target.value)) })}
          className="border p-2 rounded w-full"
          disabled={isLoadingSuppliers}
        >
          <option value="" disabled>
            Seleccionar proveedor
          </option>
          {suppliers?.items.map((s: SupplierType) => (
            <option key={s.id} value={s.id}>
              {s.name}
            </option>
          ))}
        </select>
      </div>
      <div className="space-y-1">
        <label className="text-sm font-semibold text-[#5A3E1B]">Cantidad mínima de pedido</label>
        <input
          type="number"
          placeholder="Cantidad mínima"
          value={form.minOrderQty}
          onChange={e => setForm({ ...form, minOrderQty: Number(e.target.value) })}
          className="border p-2 rounded w-full"
        />
      </div>
      <div className="space-y-1">
        <label className="text-sm font-semibold text-[#5A3E1B]">Válido desde</label>
        <input
          type="date"
          value={form.validFrom ? new Date(form.validFrom).toISOString().split('T')[0] : ''}
          onChange={e => setForm({ ...form, validFrom: e.target.value })}
          className="border p-2 rounded w-full"
        />
      </div>
      <button onClick={onSave} className="bg-[#8B4513] text-white px-4 py-2 rounded w-full">
        Guardar
      </button>
    </div>
  );
}
