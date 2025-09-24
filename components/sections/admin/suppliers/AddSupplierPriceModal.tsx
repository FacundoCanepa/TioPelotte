"use client";

import { useEffect, useMemo, useState } from "react";
import { Loader2, X } from "lucide-react";
import { toast } from "sonner";

import { usePricesAdmin } from "@/components/sections/admin/precios/hooks/usePricesAdmin";
import { IngredientType } from "@/types/ingredient";
import { SupplierType } from "@/types/supplier";

type AddSupplierPriceModalProps = {
  supplier: SupplierType | null;
  open: boolean;
  onClose: () => void;
  onSuccess: () => Promise<void> | void;
};

type FormState = {
  ingredientId: string;
  unitPrice: string;
  unit: string;
  currency: string;
  validFrom: string;
  minOrderQty: string;
};

const DEFAULT_FORM: FormState = {
  ingredientId: "",
  unitPrice: "",
  unit: "",
  currency: "ARS",
  validFrom: "",
  minOrderQty: "",
};

function getIngredientIdentifier(ingredient: IngredientType) {
  if (ingredient.documentId) return ingredient.documentId;
  return String(ingredient.id);
}

function normalizeUnit(value: string | null | undefined) {
  return value?.trim() ?? "";
}

function normalizeCurrency(value: string | null | undefined) {
  const trimmed = value?.trim();
  return trimmed && trimmed.length > 0 ? trimmed.toUpperCase() : "ARS";
}

export function AddSupplierPriceModal({
  supplier,
  open,
  onClose,
  onSuccess,
}: AddSupplierPriceModalProps) {
  const [form, setForm] = useState<FormState>(DEFAULT_FORM);
  const [submitting, setSubmitting] = useState(false);
  const { createPrice } = usePricesAdmin();

  const ingredientOptions = useMemo(() => {
    if (!supplier?.ingredientes) return [] as IngredientType[];
    return supplier.ingredientes;
  }, [supplier?.ingredientes]);

  const hasIngredients = ingredientOptions.length > 0;

  const unitOptions = useMemo(() => {
    const ingredientUnits = ingredientOptions
      .map((ingredient) => normalizeUnit(ingredient.unidadMedida))
      .filter(Boolean);

    const priceUnits = (supplier?.ingredient_supplier_prices ?? [])
      .map((price) => normalizeUnit(price.unit))
      .filter(Boolean);

    const fallbackUnits = ["kg", "unidad", "planchas"];

    return Array.from(new Set([...ingredientUnits, ...priceUnits, ...fallbackUnits]));
  }, [ingredientOptions, supplier?.ingredient_supplier_prices]);

  useEffect(() => {
    if (!open || !supplier) {
      setForm(DEFAULT_FORM);
      setSubmitting(false);
      return;
    }

    setForm((prev) => {
      const base = { ...DEFAULT_FORM, currency: prev.currency || "ARS" };
      const firstIngredient = ingredientOptions[0];
      const defaultUnit = normalizeUnit(
        firstIngredient?.unidadMedida || unitOptions[0] || ""
      );
      const today = new Date();
      const formattedToday = today.toISOString().slice(0, 10);

      return {
        ...base,
        ingredientId: firstIngredient ? getIngredientIdentifier(firstIngredient) : "",
        unit: defaultUnit,
        currency: normalizeCurrency(prev.currency || "ARS"),
        validFrom: formattedToday,
      };
    });
  }, [ingredientOptions, open, supplier, unitOptions]);

  const handleClose = () => {
    if (submitting) return;
    setForm(DEFAULT_FORM);
    onClose();
  };

  const handleSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    if (!supplier) return;

    if (!hasIngredients) {
      toast.error("El proveedor no tiene ingredientes disponibles");
      return;
    }

    if (!form.ingredientId) {
      toast.error("Seleccioná un ingrediente");
      return;
    }

    if (!form.unitPrice || Number(form.unitPrice) <= 0) {
      toast.error("Ingresá un precio válido");
      return;
    }

    if (!form.unit) {
      toast.error("Seleccioná una unidad");
      return;
    }

    try {
      setSubmitting(true);
      const selectedIngredient = ingredientOptions.find(
        (ingredient) => getIngredientIdentifier(ingredient) === form.ingredientId
      );

      if (!selectedIngredient) {
        toast.error("No se encontró el ingrediente seleccionado");
        setSubmitting(false);
        return;
      }

      const dto = {
        unitPrice: Number(form.unitPrice),
        currency: normalizeCurrency(form.currency),
        unit: form.unit,
        minOrderQty: form.minOrderQty ? Number(form.minOrderQty) : null,
        validFrom: form.validFrom ? new Date(form.validFrom).toISOString() : null,
        ingrediente: selectedIngredient
          ? selectedIngredient.documentId
            ? { documentId: selectedIngredient.documentId }
            : { id: selectedIngredient.id }
          : null,
        supplier: supplier.documentId
          ? { documentId: supplier.documentId }
          : supplier.id
          ? { id: supplier.id }
          : null,
        categoria_ingrediente: selectedIngredient?.categoria_ingrediente?.documentId
          ? { documentId: selectedIngredient.categoria_ingrediente.documentId }
          : selectedIngredient?.categoria_ingrediente?.id
          ? { id: selectedIngredient.categoria_ingrediente.id }
          : undefined,
      };

      await createPrice(dto);
      toast.success("Precio agregado correctamente");
      await onSuccess();
      handleClose();
    } catch (error) {
      const message = error instanceof Error ? error.message : "Error inesperado";
      toast.error(message);
    } finally {
      setSubmitting(false);
    }
  };

  if (!open || !supplier) {
    return null;
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 px-4 py-6">
      <div className="w-full max-w-lg rounded-2xl bg-white shadow-xl">
        <div className="flex items-start justify-between border-b border-gray-200 px-6 py-4">
          <div>
            <h2 className="text-lg font-semibold text-[#5A3E1B]">Agregar precio</h2>
            <p className="text-sm text-gray-500">
              {supplier.name ? `Proveedor: ${supplier.name}` : "Nuevo precio"}
            </p>
          </div>
          <button
            type="button"
            onClick={handleClose}
            className="rounded-full p-1 text-gray-500 transition hover:bg-gray-100 hover:text-gray-700"
            aria-label="Cerrar"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4 px-6 py-5">
          <div className="space-y-1">
            <label className="block text-sm font-semibold text-[#5A3E1B]">Ingrediente</label>
            <select
              value={form.ingredientId}
              onChange={(event) =>
                setForm((prev) => ({ ...prev, ingredientId: event.target.value }))
              }
              disabled={!hasIngredients}
              className="w-full rounded-lg border border-gray-300 bg-white px-3 py-2 text-sm shadow-sm focus:border-[#8B4513] focus:outline-none focus:ring-2 focus:ring-[#8B4513]/40 disabled:cursor-not-allowed disabled:bg-gray-100"
            >
              {hasIngredients ? (
                ingredientOptions.map((ingredient) => (
                  <option key={getIngredientIdentifier(ingredient)} value={getIngredientIdentifier(ingredient)}>
                    {ingredient.ingredienteName}
                  </option>
                ))
              ) : (
                <option value="">Sin ingredientes disponibles</option>
              )}
            </select>
            {!hasIngredients && (
              <p className="text-xs text-red-500">Este proveedor aún no tiene ingredientes asociados.</p>
            )}
          </div>

          <div className="grid gap-4 sm:grid-cols-2">
            <div className="space-y-1">
              <label className="block text-sm font-semibold text-[#5A3E1B]">Precio unitario</label>
              <input
                type="number"
                step="0.01"
                min="0"
                value={form.unitPrice}
                onChange={(event) =>
                  setForm((prev) => ({ ...prev, unitPrice: event.target.value }))
                }
                className="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm shadow-sm focus:border-[#8B4513] focus:outline-none focus:ring-2 focus:ring-[#8B4513]/40"
                placeholder="Ej: 1500"
                required
              />
            </div>

            <div className="space-y-1">
              <label className="block text-sm font-semibold text-[#5A3E1B]">Unidad</label>
              <select
                value={form.unit}
                onChange={(event) => setForm((prev) => ({ ...prev, unit: event.target.value }))}
                className="w-full rounded-lg border border-gray-300 bg-white px-3 py-2 text-sm shadow-sm focus:border-[#8B4513] focus:outline-none focus:ring-2 focus:ring-[#8B4513]/40"
              >
                {unitOptions.map((unit) => (
                  <option key={unit} value={unit}>
                    {unit}
                  </option>
                ))}
              </select>
            </div>
          </div>

          <div className="grid gap-4 sm:grid-cols-2">
            <div className="space-y-1">
              <label className="block text-sm font-semibold text-[#5A3E1B]">Moneda</label>
              <input
                type="text"
                value={form.currency}
                onChange={(event) =>
                  setForm((prev) => ({ ...prev, currency: event.target.value.toUpperCase() }))
                }
                className="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm uppercase shadow-sm focus:border-[#8B4513] focus:outline-none focus:ring-2 focus:ring-[#8B4513]/40"
                placeholder="ARS"
                maxLength={10}
              />
            </div>

            <div className="space-y-1">
              <label className="block text-sm font-semibold text-[#5A3E1B]">Vigente desde</label>
              <input
                type="date"
                value={form.validFrom}
                onChange={(event) =>
                  setForm((prev) => ({ ...prev, validFrom: event.target.value }))
                }
                className="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm shadow-sm focus:border-[#8B4513] focus:outline-none focus:ring-2 focus:ring-[#8B4513]/40"
              />
            </div>
          </div>

          <div className="space-y-1">
            <label className="block text-sm font-semibold text-[#5A3E1B]">Cantidad mínima (opcional)</label>
            <input
              type="number"
              min="0"
              step="1"
              value={form.minOrderQty}
              onChange={(event) =>
                setForm((prev) => ({ ...prev, minOrderQty: event.target.value }))
              }
              className="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm shadow-sm focus:border-[#8B4513] focus:outline-none focus:ring-2 focus:ring-[#8B4513]/40"
              placeholder="Ej: 10"
            />
          </div>

          <div className="flex justify-end gap-3 pt-2">
            <button
              type="button"
              onClick={handleClose}
              className="rounded-lg border border-gray-300 px-4 py-2 text-sm text-gray-600 transition hover:bg-gray-100 disabled:cursor-not-allowed"
              disabled={submitting}
            >
              Cancelar
            </button>
            <button
              type="submit"
              className="inline-flex items-center gap-2 rounded-lg bg-[#8B4513] px-4 py-2 text-sm font-medium text-white shadow transition hover:bg-[#5A3E1B] disabled:cursor-not-allowed disabled:bg-[#C8B6A6]"
              disabled={submitting || !hasIngredients}
            >
              {submitting && <Loader2 className="h-4 w-4 animate-spin" />}
              Guardar precio
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}