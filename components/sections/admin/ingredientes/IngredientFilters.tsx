"use client";
import { useEffect, useState, type ChangeEvent } from "react";
import { Plus } from "lucide-react";
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
  onNew: () => void;
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
  onNew,
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
      <select
        value={filterCategoria}
        onChange={handleCategoryChange}
        className="border p-2 rounded"
      >
        <option value="all">Todas</option>
        {categories.map((category) => (
          <option key={category.id} value={category.id}>
            {category.nombre || `Categoría ${category.id}`}
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