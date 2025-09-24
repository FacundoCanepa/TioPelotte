"use client";

import { Dispatch, SetStateAction, useMemo } from "react";
import Select from "react-select";
import { SupplierType } from "@/types/supplier";
import { useGetIngredients } from "@/components/hooks/useGetIngredients";
import { IngredientType } from "@/types/ingredient";

interface SupplierFormProps {
  form: Partial<SupplierType>;
  setForm: Dispatch<SetStateAction<Partial<SupplierType>>>;
  onSave: () => void;
  onCancel: () => void;
  saving: boolean;
}

type Option = { value: IngredientType; label: string };

export function SupplierForm({ form, setForm, onSave, onCancel, saving }: SupplierFormProps) {
  const { data: ingredientsData, isLoading: loadingIngredients } = useGetIngredients();

  const ingredientOptions: Option[] = useMemo(() => {
    const items = ingredientsData?.items ?? [];
    return items.map((ingredient) => ({
      value: ingredient,
      label: ingredient.ingredienteName,
    }));
  }, [ingredientsData]);

  const selectedIngredients = useMemo(() => {
    const current = form.ingredientes ?? [];
    return ingredientOptions.filter((option) =>
      current.some((ingredient) => ingredient.id === option.value.id)
    );
  }, [form.ingredientes, ingredientOptions]);

  const handleSelectChange = (options: readonly Option[] | null) => {
    const ingredients = options?.map((option) => option.value) ?? [];
    setForm((prev) => ({ ...prev, ingredientes: ingredients }));
  };

  const handleSubmit = (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    onSave();
  };

  return (
    <form onSubmit={handleSubmit} className="grid gap-4 md:grid-cols-2">
      <div className="space-y-1">
        <label className="block text-sm font-semibold text-[#5A3E1B]">Nombre</label>
        <input
          type="text"
          value={form.name ?? ""}
          onChange={(event) =>
            setForm((prev) => ({ ...prev, name: event.target.value }))
          }
          placeholder="Nombre del proveedor"
          className="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm shadow-sm focus:border-[#8B4513] focus:outline-none focus:ring-2 focus:ring-[#8B4513]/40"
        />
      </div>

      <div className="space-y-1">
        <label className="block text-sm font-semibold text-[#5A3E1B]">Teléfono</label>
        <input
          type="tel"
          value={form.phone ?? ""}
          onChange={(event) => {
            const numericValue = event.target.value.replace(/[^0-9+]/g, "");
            setForm((prev) => ({
              ...prev,
              phone: numericValue,
            }));
          }}
          placeholder="Ej: 5491122334455"
          className="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm shadow-sm focus:border-[#8B4513] focus:outline-none focus:ring-2 focus:ring-[#8B4513]/40"
        />
      </div>

      <div className="md:col-span-2 space-y-1">
        <label className="block text-sm font-semibold text-[#5A3E1B]">Ingredientes</label>
        <Select
          isMulti
          name="ingredientes"
          options={ingredientOptions}
          isLoading={loadingIngredients}
          className="basic-multi-select"
          classNamePrefix="select"
          placeholder="Selecciona los ingredientes"
          value={selectedIngredients}
          onChange={handleSelectChange}
          noOptionsMessage={() => (loadingIngredients ? "Cargando..." : "Sin resultados")}
        />
      </div>

      <label className="flex items-center gap-2 text-sm font-semibold text-[#5A3E1B]">
        <input
          type="checkbox"
          checked={form.active ?? true}
          onChange={(event) =>
            setForm((prev) => ({ ...prev, active: event.target.checked }))
          }
          className="h-4 w-4 rounded border-gray-300 text-[#8B4513] focus:ring-[#8B4513]"
        />
        Proveedor activo
      </label>

      <div className="md:col-span-2 flex justify-end gap-3 pt-2">
        <button
          type="button"
          onClick={onCancel}
          className="rounded-lg border border-gray-300 px-4 py-2 text-sm text-gray-600 transition hover:bg-gray-100"
        >
          Cancelar
        </button>
        <button
          type="submit"
          disabled={saving}
          className="rounded-lg bg-[#8B4513] px-4 py-2 text-sm font-medium text-white shadow transition hover:bg-[#5A3E1B] disabled:cursor-not-allowed disabled:bg-[#C8B6A6]"
        >
          {saving ? "Guardando..." : "Guardar"}
        </button>
      </div>
    </form>
  );
}