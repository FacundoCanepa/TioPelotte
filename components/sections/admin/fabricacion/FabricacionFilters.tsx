"use client";

import { useEffect, useMemo, useState } from 'react';
import AsyncSelect from 'react-select/async';
import { useDebouncedCallback } from 'use-debounce';
import type { FabricacionFiltersState } from '@/types/fabricacion';
import { fetchProductOptions, type ProductOption } from './product-options';

type Props = {
  filters: FabricacionFiltersState;
  onSearchChange: (value: string) => void;
  onStatusChange: (value: FabricacionFiltersState['status']) => void;
  onProductChange: (value: number | null) => void;
  onReset: () => void;
};

export default function FabricacionFilters({ filters, onSearchChange, onStatusChange, onProductChange, onReset }: Props) {
  const [searchValue, setSearchValue] = useState(filters.search);
  const [productOption, setProductOption] = useState<ProductOption | null>(null);

  useEffect(() => {
    setSearchValue(filters.search);
  }, [filters.search]);

  useEffect(() => {
    if (!filters.productId) {
      setProductOption(null);
    }
  }, [filters.productId]);

  const debouncedSearch = useDebouncedCallback((value: string) => {
    onSearchChange(value);
  }, 400);

  const loadOptions = useMemo(() => (inputValue: string) => fetchProductOptions(inputValue.trim()), []);

  return (
    <div className="flex flex-col gap-4 lg:flex-row lg:items-end lg:justify-between">
      <div className="grid flex-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
        <div className="flex flex-col gap-1">
          <label className="text-sm font-semibold text-[#5A3E1B]">Buscar por nombre</label>
          <input
            type="text"
            value={searchValue}
            onChange={(event) => {
              const value = event.target.value;
              setSearchValue(value);
              debouncedSearch(value);
            }}
            placeholder="Ej. Salsa fileto"
            className="w-full rounded-lg border border-[#e6cdb0] bg-[#fff7ee] px-3 py-2 text-sm text-[#5A3E1B] focus:border-amber-500 focus:outline-none focus:ring-2 focus:ring-amber-200"
          />
        </div>

        <div className="flex flex-col gap-1">
          <label className="text-sm font-semibold text-[#5A3E1B]">Producto asociado</label>
          <AsyncSelect
            cacheOptions
            loadOptions={loadOptions}
            defaultOptions
            classNamePrefix="fabricacion-select"
            value={productOption}
            onChange={(option) => {
              const next = option ? (option as ProductOption) : null;
              setProductOption(next);
              onProductChange(next ? next.value : null);
            }}
            isClearable
            placeholder="Buscar producto..."
            styles={{
              control: (base) => ({
                ...base,
                backgroundColor: '#fff7ee',
                borderColor: '#e6cdb0',
                borderRadius: 12,
                minHeight: 40,
              }),
              menu: (base) => ({ ...base, zIndex: 20 }),
            }}
            noOptionsMessage={() => 'Sin resultados'}
          />
        </div>

        <div className="flex flex-col gap-1">
          <label className="text-sm font-semibold text-[#5A3E1B]">Estado</label>
          <select
            value={filters.status}
            onChange={(event) => onStatusChange(event.target.value as FabricacionFiltersState['status'])}
            className="w-full rounded-lg border border-[#e6cdb0] bg-[#fff7ee] px-3 py-2 text-sm text-[#5A3E1B] focus:border-amber-500 focus:outline-none focus:ring-2 focus:ring-amber-200"
          >
            <option value="all">Todos</option>
            <option value="published">Publicados</option>
            <option value="draft">Borradores</option>
          </select>
        </div>
      </div>

      <div className="flex flex-col gap-2 sm:flex-row sm:items-center">
        <button
          type="button"
          onClick={onReset}
          className="rounded-xl border border-amber-400 px-4 py-2 text-sm font-medium text-amber-700 transition hover:bg-amber-50"
        >
          Limpiar filtros
        </button>
      </div>
    </div>
  );
}
