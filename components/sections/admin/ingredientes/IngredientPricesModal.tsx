"use client";

import { useEffect, useMemo, useState } from "react";
import { AlertCircle, Loader2, PackageOpen, X } from "lucide-react";

import type { CheapestByCategoryItem } from "@/lib/pricing/cheapest-by-category";
import type { IngredientType } from "@/types/ingredient";

type IngredientPricesModalProps = {
  ingredient: IngredientType | null;
  open: boolean;
  onClose: () => void;
};

type RequestState = "idle" | "loading" | "success" | "error";

function getIngredientIdentifier(ingredient: IngredientType | null) {
  if (!ingredient) return "";
  if ((ingredient as any).documentId) return (ingredient as any).documentId as string;
  return String((ingredient as any).id ?? "");
}

function formatCurrency(value: number, currency: string) {
  const formatter = new Intl.NumberFormat("es-AR", {
    style: "currency",
    currency: currency?.toUpperCase?.() || "ARS",
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  });

  return formatter.format(Number.isFinite(value) ? value : 0);
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

export function IngredientPricesModal({
  ingredient,
  open,
  onClose,
}: IngredientPricesModalProps) {
  const [state, setState] = useState<RequestState>("idle");
  const [prices, setPrices] = useState<CheapestByCategoryItem[]>([]);
  const [error, setError] = useState<string | null>(null);

  const ingredientIdentifier = useMemo(
    () => getIngredientIdentifier(ingredient),
    [ingredient]
  );

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
        if (ingredient && (ingredient as any).documentId) {
          params.set("ingredientDocumentId", (ingredient as any).documentId as string);
        } else if (ingredientIdentifier) {
          params.set("ingredientId", ingredientIdentifier);
        }

        if (params.size === 0) {
          setPrices([]);
          setState("success");
          return;
        }

        const res = await fetch(
          `/api/admin/ingredients/cheapest-by-category?${params.toString()}`,
          { cache: "no-store" }
        );

        const json = (await res.json()) as {
          ok?: boolean;
          data?: CheapestByCategoryItem[];
          message?: string;
        };

        if (!res.ok || json?.ok === false) {
          throw new Error(json?.message || "No se pudieron cargar los precios");
        }

        const items = Array.isArray(json?.data) ? json.data : [];

        if (!cancelled) {
          setPrices(items);
          setState("success");
        }
      } catch (fetchError) {
        if (cancelled) return;
        const message =
          fetchError instanceof Error
            ? fetchError.message
            : "Error desconocido al cargar precios";
        setError(message);
        setState("error");
        setPrices([]);
      }
    }

    fetchPrices();

    return () => {
      cancelled = true;
    };
  }, [ingredient, ingredientIdentifier, open]);

  const sortedPrices = useMemo(() => {
    return [...prices].sort((a, b) => {
      const nameA = a.ingredientName?.toLocaleLowerCase?.() ?? "";
      const nameB = b.ingredientName?.toLocaleLowerCase?.() ?? "";
      if (nameA < nameB) return -1;
      if (nameA > nameB) return 1;
      const priceA = Number.isFinite(a.price) ? (a.price as number) : Number.POSITIVE_INFINITY;
      const priceB = Number.isFinite(b.price) ? (b.price as number) : Number.POSITIVE_INFINITY;
      return priceA - priceB;
    });
  }, [prices]);

  if (!open || !ingredient) return null;

  const hasPrices = sortedPrices.length > 0;
  const selectedIngredientId = (ingredient as any).id;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 px-4 py-6">
      <div
        role="dialog"
        aria-modal="true"
        className="w-full max-w-3xl overflow-hidden rounded-2xl bg-white shadow-xl"
      >
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
              <span>Cargando precios...</span>
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
                    <th className="p-3 text-left">Ingrediente</th>
                    <th className="p-3 text-left">Proveedor más barato</th>
                    <th className="p-3 text-left">Precio</th>
                    <th className="p-3 text-left">Válido desde</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-[#F0E4D4]">
                  {sortedPrices.map((item) => {
                    const supplierName = item.supplierName?.trim() || "Proveedor sin nombre";
                    const currency = item.currency?.trim() || "ARS";
                    const unit =
                      item.unit?.trim() ||
                      (ingredient as any).unidadMedida ||
                      "unidad";
                    const isSelected = item.ingredientId === selectedIngredientId;

                    return (
                      <tr
                        key={`${item.ingredientId}-${item.supplierId}-${item.price}-${item.validFrom ?? ""}`}
                        className={`transition ${
                          isSelected ? "bg-[#FFF5E6]" : "hover:bg-[#FFF8EC]"
                        }`}
                      >
                        <td className="p-3 font-medium">{item.ingredientName}</td>
                        <td className="p-3">{supplierName}</td>
                        <td className="p-3 font-semibold text-[#8B4513]">
                          {`${formatCurrency(item.price as number, currency)} / ${unit}`}
                        </td>
                        <td className="p-3 text-sm text-gray-600">
                          {formatDate(item.validFrom as string | undefined)}
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
