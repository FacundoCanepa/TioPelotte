"use client";
import { useEffect, useState, type ChangeEvent } from "react";
import SearchInput from "@/components/ui/productos-filters/SearchInput";

interface Props {
  search: string;
  setSearch: (v: string) => void;
  filterUnidad: string;
  setFilterUnidad: (v: string) => void;
  filterCategoria: number | "all";
  setFilterCategoria: (value: number | "all") => void;
  unidades: string[];
  filterLowStock: boolean;
  setFilterLowStock: (v: boolean) => void;
}

type IngredientCategoryOption = {
  id: number;
  nombre: string;
};

export default function IngredientFilters({
  search,
  setSearch,
  filterUnidad,
  setFilterUnidad,
  filterCategoria,
  setFilterCategoria,
  unidades,
  filterLowStock,
  setFilterLowStock,
}: Props) {
  const [categories, setCategories] = useState<IngredientCategoryOption[]>([]);

  useEffect(() => {
    let active = true;

    const fetchCategories = async () => {
      try {
        const res = await fetch("/api/admin/ingredient-categories", { cache: "no-store" });
        if (!res.ok) throw new Error("Error fetching categories");
        const json = await res.json();

        const raw = Array.isArray(json)
          ? json
          : Array.isArray(json?.items)
          ? json.items
          : Array.isArray(json?.data)
          ? json.data
          : [];

        const normalized = raw
          .map((cat: any) => {
            const id = typeof cat?.id === "number" ? cat.id : Number(cat?.id);
            const nombre =
              typeof cat?.nombre === "string"
                ? cat.nombre
                : typeof cat?.name === "string"
                ? cat.name
                : "";

            if (!id || Number.isNaN(id)) return null;

            return { id, nombre } satisfies IngredientCategoryOption;
          })
          .filter(Boolean) as IngredientCategoryOption[];

        if (active) {
          setCategories(normalized);
        }
      } catch (error) {
        console.error("Error cargando categorías de ingredientes", error);
        if (active) {
          setCategories([]);
        }
      }
    };

    fetchCategories();

    return () => {
      active = false;
    };
  }, []);

  const handleCategoryChange = (event: ChangeEvent<HTMLSelectElement>) => {
    const value = event.target.value;
    if (value === "all") {
      setFilterCategoria("all");
      return;
    }

    const parsed = Number(value);
    setFilterCategoria(Number.isNaN(parsed) ? "all" : parsed);
  };

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 w-full">
      <div className="sm:col-span-2 lg:col-span-1">
        <SearchInput value={search} setValue={setSearch} placeholder="Buscar por nombre..." />
      </div>
      <select
        value={filterUnidad}
        onChange={(e) => setFilterUnidad(e.target.value)}
        className="w-full border p-2 rounded-lg bg-white min-h-[44px] focus:ring-2 focus:ring-[#8B4513] focus:border-transparent"
      >
        <option value="all">Todas las unidades</option>
        {unidades.map((u) => (
          <option key={u} value={u}>
            {u}
          </option>
        ))}
      </select>
      <select
        value={filterCategoria}
        onChange={handleCategoryChange}
        className="w-full border p-2 rounded-lg bg-white min-h-[44px] focus:ring-2 focus:ring-[#8B4513] focus:border-transparent"
      >
        <option value="all">Todas las categorías</option>
        {categories.map((category) => (
          <option key={category.id} value={category.id}>
            {category.nombre || `Categoría ${category.id}`}
          </option>
        ))}
      </select>
      <div className="flex items-center justify-center sm:justify-start bg-white border rounded-lg p-2 min-h-[44px]">
        <label className="flex items-center gap-3 cursor-pointer">
          <input
            type="checkbox"
            checked={filterLowStock}
            onChange={(e) => setFilterLowStock(e.target.checked)}
            className="h-5 w-5 rounded text-[#8B4513] focus:ring-[#8B4513] border-gray-300"
          />
          <span className="text-sm font-medium text-gray-700">Solo stock bajo</span>
        </label>
      </div>
    </div>
  );
}
