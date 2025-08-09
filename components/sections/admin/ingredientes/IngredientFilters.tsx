"use client";
import { Plus } from "lucide-react";
import SearchInput from "@/components/ui/productos-filters/SearchInput";

interface Props {
  search: string;
  setSearch: (v: string) => void;
  filterUnidad: string;
  setFilterUnidad: (v: string) => void;
  unidades: string[];
  filterLowStock: boolean;
  setFilterLowStock: (v: boolean) => void;
  onNew: () => void;
}

export default function IngredientFilters({
  search,
  setSearch,
  filterUnidad,
  setFilterUnidad,
  unidades,
  filterLowStock,
  setFilterLowStock,
  onNew,
}: Props) {
  return (
    <div className="flex flex-col sm:flex-row gap-2 flex-wrap">
      <SearchInput value={search} setValue={setSearch} />
      <select
        value={filterUnidad}
        onChange={(e) => setFilterUnidad(e.target.value)}
        className="border p-2 rounded"
      >
        <option value="all">Unidad</option>
        {unidades.map((u) => (
          <option key={u} value={u}>
            {u}
          </option>
        ))}
      </select>
      <label className="flex items-center gap-2 text-sm">
        <input
          type="checkbox"
          checked={filterLowStock}
          onChange={(e) => setFilterLowStock(e.target.checked)}
        />
        Stock bajo
      </label>
      <button
        onClick={onNew}
        className="flex items-center gap-2 px-4 py-2 bg-[#FFF4E3] text-[#8B4513] border border-[#8B4513] rounded-lg hover:bg-[#f5e5cc] transition"
      >
        <Plus className="w-4 h-4" /> Nuevo ingrediente
      </button>
    </div>
  );
}