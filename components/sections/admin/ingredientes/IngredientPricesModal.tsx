"use client";

import { useEffect, useMemo, useState } from "react";
import { AlertCircle, Loader2, PackageOpen, X } from "lucide-react";

import type { IngredientSupplierPrice } from "@/types/ingredient-supplier-price";
import type { IngredientType } from "@/types/ingredient";

type IngredientPricesModalProps = {
  ingredient: IngredientType | null;
  open: boolean;
  onClose: () => void;
};

type RequestState = "idle" | "loading" | "success" | "error";

function getIngredientIdentifier(ingredient: IngredientType | null) {
  if (!ingredient) return "";
  if (ingredient.documentId) return ingredient.documentId;
  return String(ingredient.id);
}

function formatCurrency(value: number, currency: string) {
  const formatter = new Intl.NumberFormat("es-AR", {
    style: "currency",
    currency: currency?.toUpperCase?.() || "ARS",
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  });

  return formatter.format(value);
}

function formatDate(value: string | null | undefined) {
  if (!value) return "-";
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return "-";
  return date.toLocaleDateString("es-AR", {
    day: "2-digit",
    month: "2-digit",
    year: "numeric",
  });
}

export function IngredientPricesModal({ ingredient, open, onClose }: IngredientPricesModalProps) {
  const [state, setState] = useState<RequestState>("idle");
  const [prices, setPrices] = useState<IngredientSupplierPrice[]>([]);
  const [error, setError] = useState<string | null>(null);

  const ingredientIdentifier = useMemo(() => getIngredientIdentifier(ingredient), [ingredient]);

  useEffect(() => {
    if (!open) {
      setState("idle");
      setPrices([]);
      setError(null);
      return;
    }

    if (!ingredientIdentifier) {
      setPrices([]);
      setState("success");
      return;
    }

    let cancelled = false;

    async function fetchPrices() {
      try {
        setState("loading");
        setError(null);

        const params = new URLSearchParams();
        params.set("ingredientId", ingredientIdentifier);

        const res = await fetch(`/api/admin/prices?${params.toString()}`, { cache: "no-store" });

        if (!res.ok) {
          throw new Error("No se pudieron cargar los precios");
        }

        const json = (await res.json()) as { items?: IngredientSupplierPrice[] };
        const items = Array.isArray(json?.items) ? json.items : [];

        if (!cancelled) {
          setPrices(items);
          setState("success");
        }
      } catch (fetchError) {
        if (cancelled) return;
        const message =
          fetchError instanceof Error ? fetchError.message : "Error desconocido al cargar precios";
        setError(message);
        setState("error");
        setPrices([]);
      }
    }

    fetchPrices();

    return () => {
      cancelled = true;
    };
  }, [ingredientIdentifier, open]);

  const sortedPrices = useMemo(() => {
    return [...prices].sort((a, b) => {
      const priceA = Number.isFinite(a.unitPrice) ? a.unitPrice : Number.POSITIVE_INFINITY;
      const priceB = Number.isFinite(b.unitPrice) ? b.unitPrice : Number.POSITIVE_INFINITY;
      return priceA - priceB;
    });
  }, [prices]);

  if (!open || !ingredient) return null;

  const hasPrices = sortedPrices.length > 0;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 px-4 py-6">
      <div className="w-full max-w-3xl overflow-hidden rounded-2xl bg-white shadow-xl">
        <div className="flex items-start justify-between border-b border-gray-200 px-6 py-4">
          <div>
            <h2 className="text-lg font-semibold text-[#5A3E1B]">Comparar precios</h2>
            <p className="text-sm text-gray-500">
              {ingredient.ingredienteName ? `Ingrediente: ${ingredient.ingredienteName}` : ""}
            </p>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="rounded-full p-1 text-gray-500 transition hover:bg-gray-100 hover:text-gray-700"
            aria-label="Cerrar"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        <div className="px-6 py-5">
          {state === "loading" && (
            <div className="flex flex-col items-center justify-center gap-2 py-10 text-sm text-gray-500">
              <Loader2 className="h-6 w-6 animate-spin text-[#8B4513]" />
              Cargando precios del ingrediente...
            </div>
          )}

          {state === "error" && (
            <div className="flex items-start gap-3 rounded-lg border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
              <AlertCircle className="mt-0.5 h-5 w-5" />
              <div>
                <p className="font-semibold">No pudimos cargar los precios</p>
                <p>{error ?? "Intentá nuevamente en unos minutos."}</p>
              </div>
            </div>
          )}

          {state === "success" && !hasPrices && (
            <div className="flex flex-col items-center justify-center gap-2 rounded-2xl border border-dashed border-[#EADBC8] bg-[#FFFCF7] px-6 py-12 text-center text-sm text-[#5A3E1B]">
              <PackageOpen className="h-10 w-10 text-[#C19A6B]" />
              <p className="text-base font-semibold">Aún no hay precios cargados</p>
              <p className="text-sm text-[#7C5F39]">
                Agregá precios desde la sección de proveedores para comparar ofertas.
              </p>
            </div>
          )}

          {state === "success" && hasPrices && (
            <div className="overflow-hidden rounded-xl border border-[#EADBC8]">
              <table className="min-w-full divide-y divide-[#F0E4D4] text-sm text-[#4A2E15]">
                <thead className="bg-[#FBE6D4] text-xs uppercase tracking-wide text-[#5A3E1B]">
                  <tr>
                    <th className="p-3 text-left">Proveedor</th>
                    <th className="p-3 text-left">$/unidad</th>
                    <th className="p-3 text-left">Válido desde</th>
                    <th className="p-3 text-left">Mínimo de pedido</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-[#F0E4D4]">
                  {sortedPrices.map((price, index) => {
                    const isCheapest = index === 0;
                    const supplierName = price.supplier?.name?.trim() || "Proveedor sin nombre";
                    const currency = price.currency?.trim() || "ARS";
                    const unit = price.unit?.trim() || ingredient.unidadMedida || "unidad";
                    const minOrderQty = price.minOrderQty ?? null;

                    return (
                      <tr
                        key={price.id}
                        className={
                          "transition" + (isCheapest ? " bg-[#FFF5E6]" : " hover:bg-[#FFF8EC]")
                        }
                      >
                        <td className="p-3 font-medium">
                          <div className="flex items-center gap-2">
                            <span>{supplierName}</span>
                            {isCheapest && (
                              <span className="inline-flex items-center rounded-full bg-emerald-100 px-2.5 py-0.5 text-xs font-semibold text-emerald-700">
                                Más barato
                              </span>
                            )}
                          </div>
                        </td>
                        <td className="p-3 font-semibold text-[#8B4513]">
                          {`${formatCurrency(price.unitPrice, currency)} / ${unit}`}
                        </td>
                        <td className="p-3 text-sm text-gray-600">{formatDate(price.validFrom)}</td>
                        <td className="p-3 text-sm text-gray-600">
                          {minOrderQty !== null && minOrderQty !== undefined ? minOrderQty : "-"}
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

export default IngredientPricesModal;