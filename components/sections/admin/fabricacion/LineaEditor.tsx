"use client";

import { useEffect, useMemo, useState } from 'react';
import { useDebouncedCallback } from 'use-debounce';
import type { FabricacionLine, IngredienteLite } from '@/types/fabricacion';
import type { IngredientType } from '@/types/ingredient';

const unidadHelper = 'Ej. "kg", "g", "l", "ml", "unidad", "bolsa 25kg"';

type Props = {
  value: FabricacionLine[];
  onChange: (lines: FabricacionLine[]) => void;
  errors?: string[];
};

type IngredientOption = {
  value: number;
  label: string;
  ingredient: IngredienteLite;
};

export default function LineaEditor({ value, onChange, errors }: Props) {
  const addLine = () => {
    onChange([
      ...value,
      {
        id: undefined,
        ingredient: null,
        cantidad: 1,
        unidad: '',
        mermaPct: null,
        nota: '',
      },
    ]);
  };

  const updateLine = (index: number, updater: (line: FabricacionLine) => FabricacionLine) => {
    const next = value.map((linea, idx) => (idx === index ? updater(linea) : linea));
    onChange(next);
  };

  const removeLine = (index: number) => {
    const next = value.filter((_, idx) => idx !== index);
    onChange(next);
  };

  const lineErrors = useMemo(() => errors ?? [], [errors]);

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h3 className="text-sm font-semibold text-[#5A3E1B]">Líneas de ingredientes</h3>
        <button
          type="button"
          onClick={addLine}
          className="rounded-lg border border-amber-500 px-3 py-1 text-xs font-semibold text-amber-700 transition hover:bg-amber-50"
        >
          Agregar línea
        </button>
      </div>
      {value.length === 0 && (
        <p className="text-sm text-[#8c6d4c]">Agregá al menos un ingrediente con su cantidad.</p>
      )}
      <div className="space-y-6">
        {value.map((linea, index) => (
          <div key={index} className="rounded-2xl border border-[#f0dcc3] bg-[#fffaf4] p-4 shadow-sm">
            <div className="flex items-start justify-between gap-4">
              <span className="rounded-full bg-[#fef1e4] px-3 py-1 text-xs font-semibold uppercase text-[#b27742]">Línea {index + 1}</span>
              <button
                type="button"
                onClick={() => removeLine(index)}
                className="text-xs font-semibold text-red-600 hover:underline"
              >
                Quitar
              </button>
            </div>

            <div className="mt-4 grid gap-4 md:grid-cols-2">
              <div className="space-y-1">
                <label className="text-sm font-semibold text-[#5A3E1B]">Ingrediente *</label>
                <IngredientAutocomplete
                  value={linea.ingredient}
                  onSelect={(ingredient) => updateLine(index, (prev) => ({ ...prev, ingredient }))}
                  error={lineErrors[index]}
                />
              </div>
              <div className="grid gap-3 sm:grid-cols-2">
                <div className="space-y-1">
                  <label className="text-sm font-semibold text-[#5A3E1B]">Cantidad *</label>
                  <input
                    type="number"
                    min={0}
                    step="0.01"
                    value={linea.cantidad}
                    onChange={(event) => {
                      const cantidad = Number(event.target.value);
                      updateLine(index, (prev) => ({ ...prev, cantidad: Number.isFinite(cantidad) ? cantidad : prev.cantidad }));
                    }}
                    className="w-full rounded-lg border border-[#e6cdb0] bg-white px-3 py-2 text-sm text-[#5A3E1B] focus:border-amber-500 focus:outline-none focus:ring-2 focus:ring-amber-200"
                  />
                </div>
                <div className="space-y-1">
                  <label className="text-sm font-semibold text-[#5A3E1B]">Unidad *</label>
                  <input
                    type="text"
                    value={linea.unidad}
                    onChange={(event) => {
                      const unidad = event.target.value;
                      updateLine(index, (prev) => ({ ...prev, unidad }));
                    }}
                    placeholder={unidadHelper}
                    className="w-full rounded-lg border border-[#e6cdb0] bg-white px-3 py-2 text-sm text-[#5A3E1B] focus:border-amber-500 focus:outline-none focus:ring-2 focus:ring-amber-200"
                  />
                  <p className="text-xs text-[#a57c52]">{unidadHelper}</p>
                </div>
              </div>
              <div className="space-y-1">
                <label className="text-sm font-semibold text-[#5A3E1B]">Merma %</label>
                <input
                  type="number"
                  min={0}
                  step="0.1"
                  value={linea.mermaPct ?? ''}
                  onChange={(event) => {
                    const valueNumber = event.target.value === '' ? null : Number(event.target.value);
                    updateLine(index, (prev) => ({ ...prev, mermaPct: valueNumber === null || Number.isFinite(valueNumber) ? valueNumber : prev.mermaPct }));
                  }}
                  className="w-full rounded-lg border border-[#e6cdb0] bg-white px-3 py-2 text-sm text-[#5A3E1B] focus:border-amber-500 focus:outline-none focus:ring-2 focus:ring-amber-200"
                  placeholder="0"
                />
              </div>
              <div className="space-y-1 md:col-span-2">
                <label className="text-sm font-semibold text-[#5A3E1B]">Nota</label>
                <textarea
                  value={linea.nota ?? ''}
                  onChange={(event) => {
                    const nota = event.target.value;
                    updateLine(index, (prev) => ({ ...prev, nota }));
                  }}
                  rows={2}
                  className="w-full rounded-lg border border-[#e6cdb0] bg-white px-3 py-2 text-sm text-[#5A3E1B] focus:border-amber-500 focus:outline-none focus:ring-2 focus:ring-amber-200"
                />
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

type AutocompleteProps = {
  value: IngredienteLite | null;
  onSelect: (ingredient: IngredienteLite | null) => void;
  error?: string;
};

function IngredientAutocomplete({ value, onSelect, error }: AutocompleteProps) {
  const [inputValue, setInputValue] = useState<string>(value?.ingredienteName ?? '');
  const [options, setOptions] = useState<IngredientOption[]>([]);
  const [open, setOpen] = useState(false);

  useEffect(() => {
    setInputValue(value?.ingredienteName ?? '');
  }, [value?.id, value?.ingredienteName]);

  const fetchOptions = useDebouncedCallback(async (query: string) => {
    const params = new URLSearchParams();
    if (query) params.set('q', query);
    params.set('pageSize', '10');
    try {
      const res = await fetch(`/api/admin/ingredients?${params.toString()}`, { cache: 'no-store' });
      if (!res.ok) {
        setOptions([]);
        return;
      }
      const json = await res.json();
      const items = Array.isArray(json?.items) ? (json.items as IngredientType[]) : [];
      const mapped = items.map((item) => ({
        value: item.id,
        label: item.ingredienteName,
        ingredient: {
          id: item.id,
          documentId: item.documentId,
          ingredienteName: item.ingredienteName,
          unidadMedida: item.unidadMedida,
          price: item.precio,
        } satisfies IngredienteLite,
      }));
      setOptions(mapped);
    } catch (err) {
      console.error('[fabricacion-ui] ingredient search error', err);
      setOptions([]);
    }
  }, 300);

  return (
    <div className="relative">
      <input
        type="text"
        value={inputValue}
        onChange={(event) => {
          const next = event.target.value;
          setInputValue(next);
          setOpen(true);
          fetchOptions(next);
        }}
        onFocus={() => {
          setOpen(true);
          fetchOptions(inputValue);
        }}
        onBlur={() => {
          setTimeout(() => setOpen(false), 150);
        }}
        placeholder="Buscar ingrediente..."
        className={`w-full rounded-lg border px-3 py-2 text-sm text-[#5A3E1B] focus:border-amber-500 focus:outline-none focus:ring-2 focus:ring-amber-200 ${
          error ? 'border-red-400 bg-red-50' : 'border-[#e6cdb0] bg-white'
        }`}
      />
      {error && <p className="mt-1 text-xs text-red-600">{error}</p>}
      {open && options.length > 0 && (
        <ul className="absolute z-20 mt-1 max-h-48 w-full overflow-auto rounded-lg border border-[#f0dcc3] bg-white shadow-lg">
          {options.map((option) => (
            <li
              key={option.value}
              className="cursor-pointer px-3 py-2 text-sm text-[#5A3E1B] hover:bg-[#fff7ee]"
              onMouseDown={(event) => {
                event.preventDefault();
                setInputValue(option.label);
                onSelect(option.ingredient);
                setOpen(false);
              }}
            >
              <div className="flex flex-col">
                <span className="font-medium">{option.label}</span>
                <span className="text-xs text-[#a57c52]">
                  {option.ingredient.unidadMedida ? `Unidad: ${option.ingredient.unidadMedida}` : 'Sin unidad definida'} ·{' '}
                  {option.ingredient.price != null ? `Precio: ${option.ingredient.price}` : 'Sin precio activo'}
                </span>
              </div>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
