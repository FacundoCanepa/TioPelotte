"use client";

import { AlertTriangle, CheckCircle2 } from "lucide-react";
import { IngredientType } from "@/types/ingredient";
import { formatIngredientStockLabel } from "@/lib/inventory";

interface LowStockSummaryProps {
  ingredientes: IngredientType[];
  threshold: number;
}

export function LowStockSummary({ ingredientes, threshold }: LowStockSummaryProps) {
  const hasLowStock = ingredientes.length > 0;

  if (!hasLowStock) {
    return (
      <div className="rounded-2xl border border-emerald-200 bg-emerald-50 p-4 text-sm text-emerald-700 shadow-sm">
        <div className="flex items-start gap-3">
          <CheckCircle2 className="mt-0.5 h-5 w-5 text-emerald-500" />
          <div className="space-y-1">
            <p className="font-semibold text-emerald-900">
              Stock al día
            </p>
            <p className="text-emerald-800/80">
              Todos los ingredientes superan el umbral de {threshold} unidades.
            </p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="rounded-2xl border border-amber-200 bg-amber-50 p-4 text-sm text-amber-900 shadow-sm">
      <div className="flex items-start gap-3">
        <AlertTriangle className="mt-0.5 h-5 w-5 text-amber-600" />
        <div className="space-y-1">
          <p className="font-semibold text-amber-900">
            Ingredientes con stock crítico
          </p>
          <p className="text-amber-800/80">
            Los siguientes ingredientes tienen stock menor o igual a {threshold}.
          </p>
        </div>
      </div>

      <ul className="mt-4 space-y-2">
        {ingredientes.map((ingredient) => {
          const numericStock = Number.isFinite(ingredient.Stock)
            ? ingredient.Stock
            : 0;
          const isOutOfStock = numericStock <= 0;
          const unit = ingredient.unidadMedida?.trim?.() ?? "";
          const quantityLabel = isOutOfStock
            ? "Sin stock"
            : `${numericStock.toLocaleString("es-AR", {
                minimumFractionDigits: 0,
                maximumFractionDigits: numericStock % 1 === 0 ? 0 : 2,
              })}${unit ? ` ${unit}` : ""}`;

          return (
            <li
              key={ingredient.documentId || ingredient.id || ingredient.ingredienteName}
              className="rounded-xl border border-amber-200 bg-white/80 px-3 py-2 shadow-sm"
            >
              <div className="flex flex-col gap-1 sm:flex-row sm:items-center sm:justify-between">
                <div>
                  <p className="font-medium text-amber-900">
                    {ingredient.ingredienteName}
                  </p>
                  {ingredient.supplier?.name && (
                    <p className="text-xs text-amber-700/80">
                      Proveedor habitual: {ingredient.supplier.name}
                    </p>
                  )}
                </div>
                <div className="text-sm font-semibold">
                  <span className={isOutOfStock ? "text-red-600" : "text-amber-800"}>
                    {quantityLabel}
                  </span>
                </div>
              </div>
              <p className="mt-1 text-xs text-amber-700/70">
                {formatIngredientStockLabel(ingredient)}
              </p>
            </li>
          );
        })}
      </ul>
    </div>
  );
}
