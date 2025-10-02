'use client';

import { X } from 'lucide-react';
import SearchInput from '@/components/ui/productos-filters/SearchInput';

interface Props {
  search: string;
  setSearch: (v: string) => void;
  filterOffer: string;
  setFilterOffer: (v: string) => void;
  filterActive: string;
  setFilterActive: (v: string) => void;
  filterUnidad: string;
  setFilterUnidad: (v: string) => void;
  unidades: string[];
  filterLowStock: boolean;
  setFilterLowStock: (v: boolean) => void;
  onClose: () => void;
}

export default function ProductFilters({
  search,
  setSearch,
  filterOffer,
  setFilterOffer,
  filterActive,
  setFilterActive,
  filterUnidad,
  setFilterUnidad,
  unidades,
  filterLowStock,
  setFilterLowStock,
  onClose,
}: Props) {
  return (
    <div className='flex flex-col h-full p-4 space-y-4 bg-gray-50 lg:bg-transparent'>
      <div className='flex justify-between items-center lg:hidden'>
        <h2 className='text-lg font-semibold text-[#8B4513]'>Filtros</h2>
        <button onClick={onClose} className='p-2 rounded-full hover:bg-gray-200'>
          <X className='h-5 w-5' />
        </button>
      </div>
      <h2 className='hidden lg:block text-xl font-semibold text-[#8B4513] font-garamond'>
        Filtrar productos
      </h2>

      <div className='space-y-1'>
        <label htmlFor='search-product' className='text-sm font-medium text-gray-700'>
          Buscar por nombre
        </label>
        <SearchInput value={search} setValue={setSearch} />
      </div>

      <div className='space-y-1'>
        <label htmlFor='filter-offer' className='text-sm font-medium text-gray-700'>
          Filtrar por oferta
        </label>
        <select
          id='filter-offer'
          value={filterOffer}
          onChange={(e) => setFilterOffer(e.target.value)}
          className='w-full border p-2 rounded-lg bg-white min-h-[44px] focus:ring-2 focus:ring-[#8B4513] focus:border-transparent'
        >
          <option value='all'>Todas</option>
          <option value='offer'>En oferta</option>
          <option value='normal'>Sin oferta</option>
        </select>
      </div>

      <div className='space-y-1'>
        <label htmlFor='filter-active' className='text-sm font-medium text-gray-700'>
          Filtrar por estado
        </label>
        <select
          id='filter-active'
          value={filterActive}
          onChange={(e) => setFilterActive(e.target.value)}
          className='w-full border p-2 rounded-lg bg-white min-h-[44px] focus:ring-2 focus:ring-[#8B4513] focus:border-transparent'
        >
          <option value='all'>Todos</option>
          <option value='active'>Activos</option>
          <option value='inactive'>Inactivos</option>
        </select>
      </div>

      <div className='space-y-1'>
        <label htmlFor='filter-unidad' className='text-sm font-medium text-gray-700'>
          Filtrar por unidad
        </label>
        <select
          id='filter-unidad'
          value={filterUnidad}
          onChange={(e) => setFilterUnidad(e.target.value)}
          className='w-full border p-2 rounded-lg bg-white min-h-[44px] focus:ring-2 focus:ring-[#8B4513] focus:border-transparent'
        >
          <option value='all'>Todas las unidades</option>
          {Array.from(new Set((unidades || []).filter(Boolean))).map((u) => (
            <option key={`unidad-${u}`} value={u}>
              {u}
            </option>
          ))}
        </select>
      </div>

      <div className='pt-2'>
        <label className='flex items-center gap-3 p-2 rounded-lg hover:bg-gray-100 cursor-pointer'>
          <input
            type='checkbox'
            checked={filterLowStock}
            onChange={(e) => setFilterLowStock(e.target.checked)}
            className='h-5 w-5 rounded text-[#8B4513] focus:ring-[#8B4513] border-gray-300'
          />
          <span className='text-sm font-medium text-gray-800'>Solo stock bajo</span>
        </label>
      </div>
    </div>
  );
}
