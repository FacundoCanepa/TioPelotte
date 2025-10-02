
"use client";

import { useEffect, useState } from 'react';
import { useFabricacionStore } from '@/store/admin/fabricacion-store';
import { FabricacionParams, IngredientPricing } from '@/lib/fabricacion/costing';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { ChevronDown, ChevronUp } from 'lucide-react';

interface FabricacionTableClientProps {
  initialFabricaciones: FabricacionParams[];
  initialPricingCatalog: Record<string, IngredientPricing>;
}

export function FabricacionTableClient({ initialFabricaciones, initialPricingCatalog }: FabricacionTableClientProps) {
  const { fabricaciones, pricingCatalog, fetchFabricaciones, setPricingCatalog } = useFabricacionStore();
  const [expandedRows, setExpandedRows] = useState<Record<string, boolean>>({});

  useEffect(() => {
    setPricingCatalog(initialPricingCatalog);
    fetchFabricaciones(initialFabricaciones);
  }, [initialFabricaciones, initialPricingCatalog, fetchFabricaciones, setPricingCatalog]);

  const toggleRow = (id: string) => {
    setExpandedRows(prev => ({ ...prev, [id]: !prev[id] }));
  };

  const formatCurrency = (value: number | null | undefined) => {
      if (value === null || value === undefined) return 'N/A';
      return `$${value.toFixed(2)}`;
  }

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
      {fabricaciones.map((fab) => (
        <Card key={fab.fabricacionId} className="flex flex-col">
          <CardHeader className="cursor-pointer" onClick={() => toggleRow(fab.fabricacionId)}>
            <div className="flex justify-between items-center">
                <CardTitle className="text-lg font-semibold">{fab.nombre}</CardTitle>
                {expandedRows[fab.fabricacionId] ? <ChevronUp size={20} /> : <ChevronDown size={20} />}
            </div>
          </CardHeader>
          <CardContent className="flex-grow flex flex-col">
            <div className="grid grid-cols-2 gap-2 text-sm flex-grow">
              <div>
                <p className="text-gray-500">Costo Ingredientes</p>
                <p className="font-medium">{formatCurrency(fab.costoIngredientes)}</p>
              </div>
              <div>
                <p className="text-gray-500">Precio Venta</p>
                <p className="font-medium">{formatCurrency(fab.precioVentaActual)}</p>
              </div>
              <div>
                <p className="text-gray-500">Margen Actual</p>
                <p className="font-medium">{fab.margenActualPct?.toFixed(2) ?? 'N/A'}%</p>
              </div>
              <div>
                <p className="text-gray-500">Sugerido (+5%)</p>
                <p className="font-medium">{formatCurrency(fab.precioSugerido5)}</p>
              </div>
            </div>
            {expandedRows[fab.fabricacionId] && (
              <div className="mt-4 pt-4 border-t">
                <h4 className="text-md font-semibold text-gray-700 mb-3">Detalle de Ingredientes</h4>
                <div className="space-y-3">
                  {fab.lineas.map(linea => (
                    <div key={linea.lineaId} className="p-3 rounded-md border flex justify-between items-center bg-gray-50">
                      <div>
                        <p className="font-medium text-sm text-gray-800">{linea.ingredientName}</p>
                        <p className="text-xs text-gray-600">{linea.quantityBaseConMerma.toFixed(2)} {linea.baseUnit}</p>
                      </div>
                      <p className="font-semibold text-sm">{formatCurrency(linea.costoTotal)}</p>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </CardContent>
        </Card>
      ))}
    </div>
  );
}
