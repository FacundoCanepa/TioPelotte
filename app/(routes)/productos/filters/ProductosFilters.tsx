"use client"

import { useGetCategory } from "@/components/hooks/useGetCategory"
import { Search, DollarSign, Flame, Scale, ArrowUpDown } from "lucide-react"

interface Props {
  selected: string
  setSelected: (value: string) => void
  search: string
  setSearch: (value: string) => void
  minPrice: string
  setMinPrice: (value: string) => void
  maxPrice: string
  setMaxPrice: (value: string) => void
  onlyOffers: boolean
  setOnlyOffers: (value: boolean) => void
  sortOrder: string
  setSortOrder: (value: string) => void
  unidad?: string
  setUnidad?: (value: string) => void
}

const ProductosFilters = ({
  selected,
  setSelected,
  search,
  setSearch,
  minPrice,
  setMinPrice,
  maxPrice,
  setMaxPrice,
  onlyOffers,
  setOnlyOffers,
  sortOrder,
  setSortOrder,
  unidad = "",
  setUnidad = () => {},
}: Props) => {
  const { loading, result } = useGetCategory()
const baseInput =
    "w-full rounded-xl border bg-[#FFF4E3] text-[#8B4513] border-[#E6D2B5] shadow-sm text-sm transition-colors placeholder:text-[#B48B60] focus:border-[#8B4513] focus:outline-none"

  return (
    <div className="w-full max-w-sm space-y-4 p-4 bg-[#FFFAF3] rounded-2xl shadow-md animate-fade-in">
      {/* Categoría */}
      <div className="space-y-1">
        <span className={`text-sm text-[#8B4513] ${selected && "font-semibold"}`}>Categoría</span>
        <select
          value={selected}
          onChange={(e) => setSelected(e.target.value)}
          className={`${baseInput} px-4 py-2 cursor-pointer ${selected && "border-[#8B4513] font-medium"}`}
        >
          <option value="" className="cursor-pointer">
            Todas las categorías
          </option>
          {!loading &&
            Array.isArray(result) &&
            result.map((cat: any) => (
              <option key={cat.id} value={cat.slug} className="cursor-pointer">
                {cat.categoryNames}
              </option>
            ))}
        </select>
      </div>

      {/* Búsqueda por nombre */}
      <div className="space-y-1">
        <span className={`text-sm text-[#8B4513] ${search && "font-semibold"}`}>Buscar</span>
        <div className="relative">
          <Search size={16} className="absolute left-3 top-3 text-[#8B4513]" />
          <input
            type="text"
            placeholder="Buscar producto..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className={`${baseInput} pl-9 pr-4 py-2 ${search && "border-[#8B4513]"}`}
          />
        </div>
      </div>

      {/* Rango de precios */}
      <div className="space-y-1">
        <span
          className={`text-sm text-[#8B4513] ${(minPrice || maxPrice) && "font-semibold"}`}
        >
          Precio
        </span>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div className="relative w-full">
            <DollarSign size={16} className="absolute left-3 top-3 text-[#8B4513]" />
            <input
              type="number"
              placeholder="Mínimo"
              value={minPrice}
              onChange={(e) => setMinPrice(e.target.value)}
              className={`${baseInput} pl-9 pr-2 py-2 ${
                minPrice && "border-[#8B4513]"
              }`}
            />
          </div>
          <div className="relative w-full">
            <DollarSign size={16} className="absolute left-3 top-3 text-[#8B4513]" />
            <input
              type="number"
              placeholder="Máximo"
              value={maxPrice}
              onChange={(e) => setMaxPrice(e.target.value)}
              className={`${baseInput} pl-9 pr-2 py-2 ${
                maxPrice && "border-[#8B4513]"
              }`}
            />
          </div>
        </div>
      </div>

      {/* Checkbox solo ofertas */}
      <label
        className={`flex items-center gap-3 px-4 py-2 rounded-xl border shadow-sm text-sm cursor-pointer select-none transition-colors bg-[#FFF4E3] text-[#8B4513] ${
          onlyOffers ? "border-[#8B4513] font-semibold" : "border-[#E6D2B5]"
        }`}
      >
        <Flame size={16} className="text-[#8B4513]" />
        <input
          type="checkbox"
          checked={onlyOffers}
          onChange={(e) => setOnlyOffers(e.target.checked)}
          className="accent-[#6B8E23] w-4 h-4 rounded focus:ring-0"
        />
        Solo ofertas
      </label>

      {/* Unidad de medida */}
      <div className="space-y-1">
        <span className={`text-sm text-[#8B4513] ${unidad && "font-semibold"}`}>
          Unidad de medida
        </span>
        <div className="relative">
          <Scale size={16} className="absolute left-3 top-3 text-[#8B4513]" />
          <select
            value={unidad}
            onChange={(e) => setUnidad(e.target.value)}
            className={`${baseInput} pl-9 pr-2 py-2 cursor-pointer ${
              unidad && "border-[#8B4513] font-medium"
            }`}
          >
            <option value="">Todas las unidades</option>
            <option value="kg">Por kilo</option>
            <option value="unidad">Por unidad</option>
            <option value="planchas">Por planchas</option>
          </select>
        </div>
      </div>

      {/* Ordenar por precio */}
      <div className="space-y-1">
        <span className={`text-sm text-[#8B4513] ${sortOrder && "font-semibold"}`}>
          Ordenar por precio
        </span>
        <div className="relative">
          <ArrowUpDown size={16} className="absolute left-3 top-3 text-[#8B4513]" />
          <select
            value={sortOrder}
            onChange={(e) => setSortOrder(e.target.value)}
            className={`${baseInput} pl-9 pr-2 py-2 cursor-pointer ${
              sortOrder && "border-[#8B4513] font-medium"
            }`}
          >
            <option value="">Ordenar por precio</option>
            <option value="asc">Menor a mayor</option>
            <option value="desc">Mayor a menor</option>
          </select>
        </div>
      </div>
    </div>
  )
}

export default ProductosFilters