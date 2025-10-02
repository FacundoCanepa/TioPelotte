"use client";

import { AlertTriangle, CheckCircle2 } from "lucide-react";
import { IngredientType } from "@/types/ingredient";

interface LowStockSummaryProps {
  ingredientes: IngredientType[];
  threshold: number;
}

export function LowStockSummary({ ingredientes, threshold }: LowStockSummaryProps) {
  const hasLowStock = ingredientes.length > 0;

  if (!hasLowStock) {
    return (
      <div className="rounded-xl border border-green-200 bg-green-50 p-4 shadow-sm">
        <div className="flex items-start gap-3">
          <CheckCircle2 className="mt-0.5 h-5 w-5 text-green-600 flex-shrink-0" />
          <div>
            <p className="font-semibold text-green-800">Stock al día</p>
            <p className="text-sm text-green-700">
              ¡Excelente! No hay ingredientes con stock bajo (menor o igual a {threshold}).
            </p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="rounded-xl border border-red-200 bg-red-50 p-4 shadow-sm">
      <div className="flex items-start gap-3">
        <AlertTriangle className="mt-0.5 h-5 w-5 text-red-600 flex-shrink-0" />
        <div>
          <p className="font-semibold text-red-800">¡Atención! Ingredientes con Stock Crítico</p>
          <p className="text-sm text-red-700">
            Los siguientes ingredientes tienen un stock igual o inferior al umbral de {threshold}.
          </p>
        </div>
      </div>

      <ul className="mt-3 space-y-2 pl-8 text-sm">
        {ingredientes.map((ing) => {
          const stock = Number.isFinite(ing.Stock) ? ing.Stock : 0;
          const unitLabel = ing.unidadMedida ? ` ${ing.unidadMedida}` : "";

          return (
            <li key={ing.documentId} className="flex items-center justify-between rounded-md bg-white/60 p-2 pl-3 border border-red-100">
                <span className="font-medium text-gray-800">{ing.ingredienteName}</span>
                <span className="font-bold text-red-700">
                  {stock.toLocaleString('es-AR')}{unitLabel}
                </span>
            </li>
          );
        })}
      </ul>
    </div>
  );
}
