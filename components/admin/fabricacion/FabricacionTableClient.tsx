
"use client";

import { useEffect, useState } from 'react';
import { useFabricacionStore } from '@/store/admin/fabricacion-store';
import { FabricacionResultado, FabricacionParams, IngredientPricing } from '@/lib/fabricacion/costing';

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

  return (
    <div className="overflow-x-auto bg-white rounded-lg shadow-md">
      <table className="min-w-full divide-y divide-gray-200">
        <thead className="bg-gray-50">
          <tr>
            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Producto</th>
            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Costo Ingredientes</th>
            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Precio de Venta</th>
            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Margen Actual</th>
            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Sugerido (+5%)</th>
            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Sugerido (+10%)</th>
          </tr>
        </thead>
        <tbody className="divide-y divide-gray-200">
          {fabricaciones.map((fab) => (
            <>
              <tr key={fab.fabricacionId} onClick={() => toggleRow(fab.fabricacionId)} className="cursor-pointer hover:bg-gray-50">
                <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">{fab.nombre}</td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">${fab.costoIngredientes.toFixed(2)}</td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">${fab.precioVentaActual?.toFixed(2) ?? 'N/A'}</td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{fab.margenActualPct?.toFixed(2) ?? 'N/A'}%</td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">${fab.precioSugerido5.toFixed(2)}</td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">${fab.precioSugerido10.toFixed(2)}</td>
              </tr>
              {expandedRows[fab.fabricacionId] && (
                <tr>
                  <td colSpan={6} className="px-6 py-4">
                    <div className="overflow-hidden border-b border-gray-200">
                      <h4 className="text-md font-semibold text-gray-700 mb-2">Detalle de Ingredientes</h4>
                      <table className="min-w-full divide-y divide-gray-200">
                        <thead className="bg-gray-100">
                          <tr>
                            <th className="px-4 py-2 text-left text-xs font-medium text-gray-600">Ingrediente</th>
                            <th className="px-4 py-2 text-left text-xs font-medium text-gray-600">Cantidad</th>
                            <th className="px-4 py-2 text-left text-xs font-medium text-gray-600">Costo</th>
                          </tr>
                        </thead>
                        <tbody>
                          {fab.lineas.map(linea => (
                            <tr key={linea.lineaId}>
                              <td className="px-4 py-2 whitespace-nowrap text-sm text-gray-800">{linea.ingredientName}</td>
                              <td className="px-4 py-2 whitespace-nowrap text-sm text-gray-600">{linea.quantityBaseConMerma.toFixed(2)} {linea.baseUnit}</td>
                              <td className="px-4 py-2 whitespace-nowrap text-sm text-gray-600">${linea.costoTotal.toFixed(2)}</td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </div>
                  </td>
                </tr>
              )}
            </>
          ))}
        </tbody>
      </table>
    </div>
  );
}
