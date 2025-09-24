
'use client';

import { SupplierType } from '@/types/supplier';
import { useState, useEffect } from 'react';
import { useGetIngredients } from '@/components/hooks/useGetIngredients';
import Select from 'react-select';

const defaultForm: Partial<SupplierType> = {
  name: '',
  phone: undefined,
  active: true,
  ingredientes: [],
};

interface SupplierFormProps {
  onSave: (supplier: Partial<SupplierType>) => void;
  onCancel: () => void;
  isLoading: boolean;
}

export function SupplierForm({ onSave, onCancel, isLoading }: SupplierFormProps) {
  const [form, setForm] = useState(defaultForm);
  const { data: ingredientsData, isLoading: isLoadingIngredients } = useGetIngredients();

  const ingredientOptions = ingredientsData?.items.map(ingredient => ({ 
    value: ingredient.id, 
    label: ingredient.nombre 
  })) || [];

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value, type, checked } = e.target;
    setForm(prevForm => ({
      ...prevForm,
      [name]: type === 'checkbox' ? checked : (name === 'phone' ? (value === '' ? undefined : Number(value)) : value),
    }));
  };
  
  const handleSelectChange = (selectedOptions: any) => {
    const ingredientIds = selectedOptions ? selectedOptions.map((option: any) => option.value) : [];
    setForm(prevForm => ({
      ...prevForm,
      ingredientes: ingredientIds,
    }));
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSave(form);
  };

  return (
    <form onSubmit={handleSubmit} className="grid grid-cols-2 gap-6">
      <div>
        <label htmlFor="name" className="block text-sm font-medium text-gray-700">Nombre</label>
        <input
          type="text"
          name="name"
          id="name"
          value={form.name}
          onChange={handleChange}
          className="mt-1 block w-full px-3 py-2 bg-white border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
        />
      </div>
      <div>
        <label htmlFor="phone" className="block text-sm font-medium text-gray-700">Teléfono</label>
        <input
          type="number"
          name="phone"
          id="phone"
          value={form.phone || ''}
          onChange={handleChange}
          className="mt-1 block w-full px-3 py-2 bg-white border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
        />
      </div>
      <div className="col-span-2">
        <label htmlFor="ingredientes" className="block text-sm font-medium text-gray-700">Ingredientes</tabel>
        <Select
          isMulti
          name="ingredientes"
          options={ingredientOptions}
          isLoading={isLoadingIngredients}
          className="basic-multi-select"
          classNamePrefix="select"
          placeholder="Selecciona los ingredientes..."
          onChange={handleSelectChange}
        />
      </div>
      <div className="flex items-center">
        <input
          id="active"
          name="active"
          type="checkbox"
          checked={form.active}
          onChange={handleChange}
          className="h-4 w-4 text-indigo-600 focus:ring-indigo-500 border-gray-300 rounded"
        />
        <label htmlFor="active" className="ml-2 block text-sm text-gray-900">Activo</label>
      </div>
      <div className="col-span-2 flex justify-end mt-4">
        <button type="button" onClick={onCancel} className="px-4 py-2 mr-2 bg-gray-300 text-gray-700 rounded-md hover:bg-gray-400">
          Cancelar
        </button>
        <button type="submit" disabled={isLoading} className="px-4 py-2 bg-green-500 text-white rounded-md hover:bg-green-600 disabled:bg-gray-400">
          {isLoading ? 'Guardando...' : 'Guardar'}
        </button>
      </div>
    </form>
  );
}
