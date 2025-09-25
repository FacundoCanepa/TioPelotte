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
  const selectedIngredient = useMemo(() => {
    if (!form.ingredientId) return null;
    return ingredientOptions.find(
      (ingredient) => getIngredientIdentifier(ingredient) === form.ingredientId
    );
  }, [form.ingredientId, ingredientOptions]);

  const showMissingCategoryWarning = useMemo(() => {
    if (!selectedIngredient) return false;
    const category =
      selectedIngredient.categoria_ingrediente as IngredientType["categoria_ingrediente"] | null | undefined;

    return category == null;
  }, [selectedIngredient]);



  useEffect(() => {
    if (!open || !supplier) {
      setForm(DEFAULT_FORM);
      setSubmitting(false);
      return;
    }

    setForm((prev) => {
      const base = {
        ...DEFAULT_FORM,
        currency: normalizeCurrency(prev.currency || DEFAULT_FORM.currency),
      };
      const previousIngredient = prev.ingredientId
        ? ingredientOptions.find(
            (ingredient) =>
              getIngredientIdentifier(ingredient) === prev.ingredientId
          )
        : null;
      const firstIngredient = ingredientOptions[0];
      const resolvedIngredient = previousIngredient ?? firstIngredient ?? null;
      const defaultUnit = normalizeUnit(resolvedIngredient?.unidadMedida);
      const today = new Date();
      const formattedToday = today.toISOString().slice(0, 10);

      return {
        ...base,
        ingredientId: resolvedIngredient
        ? getIngredientIdentifier(resolvedIngredient)
        : "",
        unit: defaultUnit,
        validFrom: formattedToday,
      };
    });
  }, [ingredientOptions, open, supplier]);

  useEffect(() => {
    if (!open) return;

    setForm((prev) => {
      const normalizedUnit = normalizeUnit(selectedIngredient?.unidadMedida);

      if (prev.unit === normalizedUnit) {
        return prev;
      }

      return {
        ...prev,
        unit: normalizedUnit,
      };
    });
  }, [open, selectedIngredient]);

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
        toast.error("El precio unitario debe ser mayor a 0");
      return;
    }

    if (!form.unit) {
        toast.error("Seleccioná una unidad para el precio");
      return;
    }
    if (!form.validFrom) {
        toast.error("Indicá desde cuándo aplica el precio");
        return;
      }
  
      let minOrderQtyValue: number | null = null;
      if (form.minOrderQty) {
        const parsedMinOrderQty = Number(form.minOrderQty);
        if (!Number.isFinite(parsedMinOrderQty) || parsedMinOrderQty <= 0) {
          toast.error("La cantidad mínima debe ser mayor a 0");
          return;
        }
        minOrderQtyValue = parsedMinOrderQty;
      }
  
    try {
      setSubmitting(true);

      if (!selectedIngredient) {
        toast.error("No se encontró el ingrediente seleccionado");
        setSubmitting(false);
        return;
      }

      const dto = {
        unitPrice: Number(form.unitPrice),
        currency: normalizeCurrency(form.currency),
        unit: form.unit,
        minOrderQty: minOrderQtyValue,
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
      toast.success("El precio se guardó correctamente");
      await onSuccess();
      handleClose();
    } catch (error) {
      const message = error instanceof Error ? error.message : "Error inesperado";
      toast.error(`No se pudo guardar el precio: ${message}`);
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
              onChange={(event) => {
                const { value } = event.target;
                const ingredient = ingredientOptions.find(
                  (item) => getIngredientIdentifier(item) === value
                );
                const normalizedUnit = normalizeUnit(ingredient?.unidadMedida);

                setForm((prev) => ({
                  ...prev,
                  ingredientId: value,
                  unit: normalizedUnit,
                }));
              }}
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
            {showMissingCategoryWarning && (
              <p className="text-xs text-amber-600">
                Este ingrediente no tiene categoría cargada. Podés cargarla más tarde.
              </p>
            )}
          </div>

          <div className="grid gap-4 sm:grid-cols-2">
            <div className="space-y-1">
              <label className="block text-sm font-semibold text-[#5A3E1B]">Precio unitario</label>
              <input
                type="number"
                step="0.01"
                min="0.01"
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
              <input
                type="text"
                value={form.unit}
                readOnly
                placeholder="Unidad definida por el ingrediente"
                className="w-full rounded-lg border border-gray-300 bg-gray-100 px-3 py-2 text-sm shadow-sm focus:border-[#8B4513] focus:outline-none focus:ring-2 focus:ring-[#8B4513]/40"
              />
            </div>
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
                className="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm shadow-sm focus:border-[#8B4513] focus:outline-none focus:ring-2 focus:ring-[#8B4513]/40"required
              />
            </div>
          </div>

          <div className="space-y-1">
            <label className="block text-sm font-semibold text-[#5A3E1B]">Cantidad mínima (opcional)</label>
            <input
              type="number"
              min="1"
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