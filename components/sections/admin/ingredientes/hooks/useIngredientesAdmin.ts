// Vercel, please refresh this file! Cache invalidation attempt: 2024-07-16T22:15:00Z
"use client";

import { useState } from 'react';
import { IngredientType } from '@/types/ingredient';
import { toast } from 'sonner';
import { generateSlug } from '@/lib/utils';
import { useGetIngredients } from '@/components/hooks/useGetIngredients';
import { isLowStock, LOW_STOCK_THRESHOLD } from '@/lib/inventory';

export function useIngredientesAdmin() {
  const { data, isLoading, isError, refetch } = useGetIngredients();

  const [search, setSearch] = useState('');
  const [filterUnidad, setFilterUnidad] = useState('all');
  const [filterCategoria, setFilterCategoria] = useState<number | 'all'>('all');
  const [filterLowStock, setFilterLowStock] = useState(false);

  const todayInputValue = () => new Date().toISOString().split('T')[0];
  const normalizeDateInput = (value?: string | null) => {
    if (typeof value !== 'string' || value.trim() === '') {
      return todayInputValue();
    }
    const parsed = new Date(value);
    if (!Number.isNaN(parsed.getTime())) {
      return parsed.toISOString().split('T')[0];
    }
    if (/^\d{4}-\d{2}-\d{2}$/.test(value.trim())) {
      return value.trim();
    }
    return todayInputValue();
  };
  const toISOStringOrNull = (value?: string | null) => {
    if (typeof value !== 'string' || value.trim() === '') return null;
    const parsed = new Date(value);
    if (Number.isNaN(parsed.getTime())) return null;
    return parsed.toISOString();
  };

  const [orderBy, setOrderBy] = useState({
    field: 'ingredienteName' as keyof IngredientType,
    direction: 'asc' as 'asc' | 'desc',
  });

  const [showForm, setShowForm] = useState(false);
  const [form, setForm] = useState<Partial<IngredientType>>({
    ingredienteName: '',
    ingredienteNameProducion: '',
    Stock: 0,
    unidadMedida: 'kg',
    precio: 0,
    categoria_ingrediente: undefined,
    quantityNeto: null,
    validFrom: todayInputValue(),
    supplier: undefined,
  });

  const unidades = ['kg', 'planchas', 'unidad'];

  const saveIngrediente = async () => {
    if (!form.ingredienteName) {
      toast.error('El nombre del ingrediente no puede estar vacío');
      return;
    }

    try {
      const isNew = !form.id;

      const validFromISO = toISOStringOrNull(form.validFrom) ?? new Date().toISOString();
      const payload = {
        ingredienteName: form.ingredienteName,
        ingredienteNameProducion: form.ingredienteNameProducion,
        Stock: form.Stock,
        unidadMedida: form.unidadMedida,
        precio: form.precio,
        documentId: isNew ? generateSlug(form.ingredienteName) : form.documentId,
        stockUpdatedAt: new Date().toISOString(),
        categoria_ingrediente: form.categoria_ingrediente,
        quantityNeto: form.quantityNeto,
        validFrom: validFromISO,
        supplier: form.supplier,
      };

      const url = isNew ? '/api/admin/ingredients' : `/api/admin/ingredients/${form.documentId}`;
      const method = isNew ? 'POST' : 'PUT';

      const res = await fetch(url, {
        method,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      });

      if (!res.ok) {
        const errorData = await res.json();
        throw new Error(errorData.error || 'Error al guardar');
      }

      toast.success(isNew ? 'Ingrediente creado' : 'Ingrediente editado');
      setShowForm(false);
      refetch();
    } catch (error: any) {
      console.error('❌ Error al guardar ingrediente:', error);
      toast.error(error.message || 'Error al guardar ingrediente');
    }
  };

  const deleteIngrediente = async (documentId: string) => {
    try {
      const res = await fetch(`/api/admin/ingredients/${documentId}`, {
        method: 'DELETE',
      });

      if (!res.ok) throw new Error('Error al eliminar');

      toast.success('Ingrediente eliminado');
      refetch();
    } catch (error) {
      console.error('❌ Error al eliminar:', error);
      toast.error('Error al eliminar');
    }
  };

  const editIngrediente = (i: IngredientType) => {
    setForm({
      id: i.id,
      ingredienteName: i.ingredienteName,
      ingredienteNameProducion: i.ingredienteNameProducion,
      Stock: i.Stock,
      unidadMedida: i.unidadMedida,
      precio: i.precio,
      documentId: i.documentId,
      categoria_ingrediente: i.categoria_ingrediente,
      quantityNeto: i.quantityNeto,
      validFrom: normalizeDateInput(i.validFrom),
      supplier: i.supplier,
    });
    setShowForm(true);
  };

  const startNew = () => {
    setForm({
      ingredienteName: '',
      ingredienteNameProducion: '',
      Stock: 0,
      unidadMedida: 'kg',
      precio: 0,
      categoria_ingrediente: undefined,
      quantityNeto: null,
      validFrom: todayInputValue(),
      supplier: undefined,
    });
    setShowForm(true);
  };

  const ingredientes = data?.items || [];

  const lowStockIngredientes = ingredientes
    .filter(ingredient => isLowStock(ingredient))
    .sort((a, b) => (a.Stock ?? 0) - (b.Stock ?? 0));

  const filteredAndSortedIngredientes = ingredientes
    .filter(i => {
      const term = search.toLowerCase();
      const name = i.ingredienteName?.toLowerCase() ?? '';
      const productionName = i.ingredienteNameProducion?.toLowerCase() ?? '';
      return name.includes(term) || productionName.includes(term);
    })
    .filter(i => (filterUnidad === 'all' ? true : i.unidadMedida === filterUnidad))
    .filter(i =>
      filterCategoria === 'all'
        ? true
        : (i.categoria_ingrediente?.id ?? null) === filterCategoria
    )
    .filter(i => (filterLowStock ? isLowStock(i) : true))
    .sort((a, b) => {
      const field = orderBy.field;
      const dir = orderBy.direction === 'asc' ? 1 : -1;
      const aValue = a[field];
      const bValue = b[field];

      if (aValue == null && bValue == null) return 0;
      if (aValue == null) return 1 * dir;
      if (bValue == null) return -1 * dir;

      if (typeof aValue === 'number' && typeof bValue === 'number') {
        return (aValue - bValue) * dir;
      }

      return String(aValue).localeCompare(String(bValue)) * dir;
    });

  return {
    ingredientes: filteredAndSortedIngredientes,
    loading: isLoading,
    error: isError,
    lowStockIngredientes,
    lowStockThreshold: LOW_STOCK_THRESHOLD,
    search,
    setSearch,
    filterUnidad,
    setFilterUnidad,
    filterCategoria,
    setFilterCategoria,
    filterLowStock,
    setFilterLowStock,
    orderBy,
    setOrderBy,
    unidades,
    showForm,
    setShowForm,
    form,
    setForm,
    saveIngrediente,
    editIngrediente,
    deleteIngrediente,
    startNew,
  };
}
