'use client';

import { useMemo, useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { listFabricaciones } from "@/lib/admin/fabricacion-api";
import { Fabricacion } from "@/types/fabricacion";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Plus } from 'lucide-react';

type SortKey = "margin" | "cost" | "name";

const currencyFormatter = new Intl.NumberFormat("es-AR", {
  style: "currency",
  currency: "ARS",
  maximumFractionDigits: 0,
});

const numberFormatter = new Intl.NumberFormat("es-AR", {
  maximumFractionDigits: 0,
});

function formatCurrency(value?: number | null) {
  if (value === null || value === undefined || Number.isNaN(value)) return "-";
  return currencyFormatter.format(value);
}

function formatPercent(value?: number | null) {
  if (value === null || value === undefined || Number.isNaN(value)) return "-";
  return `${value.toFixed(1)} %`;
}

function computeUnitCost(item: Fabricacion): number {
  if (item.costoUnitario !== null && item.costoUnitario !== undefined && !Number.isNaN(item.costoUnitario)) {
    return item.costoUnitario;
  }
  if (item.batchSize > 0) {
    return item.costoTotalBatch / item.batchSize;
  }
  return item.costoTotalBatch;
}

function computeMargin(item: Fabricacion): number {
  const unitCost = computeUnitCost(item);
  if (!item.precioSugerido || item.precioSugerido <= 0) return 0;
  const margin = ((item.precioSugerido - unitCost) / item.precioSugerido) * 100;
  return Number.isFinite(margin) ? margin : 0;
}

export default function FabricacionSection() {
  const [sortKey, setSortKey] = useState<SortKey>("margin");
  const { data, isLoading, isError, error, refetch } = useQuery({
    queryKey: ["fabricaciones"],
    queryFn: () => listFabricaciones(),
  });

  const fabricaciones = useMemo(() => data?.items ?? [], [data]);

  const resumen = useMemo(() => {
    if (!fabricaciones.length) {
      return {
        totalCost: 0,
        avgMargin: 0,
        totalBatches: 0,
        avgUnitCost: 0,
      };
    }

    const totals = fabricaciones.reduce(
      (acc, item) => {
        const unitCost = computeUnitCost(item);
        const margin = computeMargin(item);
        acc.totalCost += item.costoTotalBatch;
        acc.avgMargin += margin;
        acc.totalBatches += item.batchSize;
        acc.avgUnitCost += unitCost;
        return acc;
      },
      { totalCost: 0, avgMargin: 0, totalBatches: 0, avgUnitCost: 0 }
    );

    return {
      totalCost: totals.totalCost,
      avgMargin: totals.avgMargin / fabricaciones.length,
      totalBatches: totals.totalBatches,
      avgUnitCost: totals.avgUnitCost / fabricaciones.length,
    };
  }, [fabricaciones]);

  const sortedFabricaciones = useMemo(() => {
    const copy = [...fabricaciones];
    switch (sortKey) {
      case "cost":
        return copy.sort((a, b) => computeUnitCost(b) - computeUnitCost(a));
      case "name":
        return copy.sort((a, b) => a.nombre.localeCompare(b.nombre));
      case "margin":
      default:
        return copy.sort((a, b) => computeMargin(b) - computeMargin(a));
    }
  }, [fabricaciones, sortKey]);

  return (
    <div className="p-4 sm:p-6 space-y-6">
      <header className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl sm:text-3xl font-bold text-gray-800">Centro de Fabricación</h1>
          <p className="text-sm text-gray-600">Analiza costos, márgenes y crea nuevas órdenes de fabricación.</p>
        </div>
        <button className="w-full sm:w-auto inline-flex items-center justify-center gap-2 rounded-lg bg-amber-600 px-4 py-2 text-white shadow-sm hover:bg-amber-700 transition-colors min-h-[44px]">
          <Plus className="h-4 w-4" />
          Crear Lote
        </button>
      </header>

      <section className="grid gap-4 grid-cols-1 sm:grid-cols-2 lg:grid-cols-4">
        <Card>
          <CardHeader className="pb-2">
            <CardDescription>Órdenes</CardDescription>
            <CardTitle className="text-2xl font-semibold">{numberFormatter.format(fabricaciones.length)}</CardTitle>
          </CardHeader>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardDescription>Costo Total</CardDescription>
            <CardTitle className="text-2xl font-semibold">{formatCurrency(resumen.totalCost)}</CardTitle>
          </CardHeader>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardDescription>Costo Unit. Prom.</CardDescription>
            <CardTitle className="text-2xl font-semibold">{formatCurrency(resumen.avgUnitCost)}</CardTitle>
          </CardHeader>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardDescription>Margen Prom.</CardDescription>
            <CardTitle className="text-2xl font-semibold">{formatPercent(resumen.avgMargin)}</CardTitle>
          </CardHeader>
        </Card>
      </section>

      <div className="bg-white p-4 sm:p-6 rounded-lg border shadow-sm">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
          <div>
            <h2 className="text-lg sm:text-xl font-semibold">Detalle de Costos</h2>
            <p className="text-sm text-gray-500">Analiza cada lote para optimizar precios y rentabilidad.</p>
          </div>
          <div className="flex items-center gap-2">
            <label htmlFor="fabricacion-sort" className="text-sm font-medium">Ordenar por</label>
            <select
              id="fabricacion-sort"
              value={sortKey}
              onChange={(e) => setSortKey(e.target.value as SortKey)}
              className="rounded-lg border bg-white px-3 py-2 text-sm shadow-sm focus:border-amber-500 focus:outline-none min-h-[44px]"
            >
              <option value="margin">Margen</option>
              <option value="cost">Costo Unitario</option>
              <option value="name">Nombre</option>
            </select>
          </div>
        </div>

        <div className="mt-4">
          {isLoading && <div className="py-10 text-center text-gray-500">Cargando...</div>}
          {isError && (
            <div className="p-4 text-red-700 bg-red-50 border border-red-200 rounded-lg">
              <p className="font-semibold">Error al cargar datos.</p>
              <p className="text-sm">{error instanceof Error ? error.message : "Intenta de nuevo."}</p>
              <button onClick={() => refetch()} className="mt-2 px-3 py-1 text-sm border rounded-md">Reintentar</button>
            </div>
          )}
          {!isLoading && !isError && fabricaciones.length === 0 && (
            <div className="py-10 text-center text-gray-500">No hay lotes de fabricación.</div>
          )}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {sortedFabricaciones.map((item) => {
              const unitCost = computeUnitCost(item);
              const margin = computeMargin(item);
              return (
                <div key={item.documentId} className="bg-white border rounded-lg shadow-sm flex flex-col p-4 space-y-3">
                  <div className="flex justify-between items-start">
                    <h3 className="font-semibold text-gray-800">{item.nombre}</h3>
                    <span className={`text-xs font-medium px-2 py-1 rounded-full ${margin >= item.margenObjetivoPct ? 'bg-emerald-100 text-emerald-800' : 'bg-amber-100 text-amber-800'}`}>
                      {formatPercent(margin)} Margen
                    </span>
                  </div>
                  <p className="text-sm text-gray-500">{item.product?.productName ?? "Sin producto"}</p>
                  <div className="grid grid-cols-2 gap-x-4 gap-y-2 text-sm pt-3 border-t">
                    <div>
                      <p className="text-gray-500">Costo Unitario</p>
                      <p className="font-medium">{formatCurrency(unitCost)}</p>
                    </div>
                    <div>
                      <p className="text-gray-500">Precio Sugerido</p>
                      <p className="font-medium">{formatCurrency(item.precioSugerido)}</p>
                    </div>
                    <div>
                      <p className="text-gray-500">Tamaño Lote</p>
                      <p className="font-medium">{numberFormatter.format(item.batchSize)}</p>
                    </div>
                    <div>
                      <p className="text-gray-500">Costo Total</p>
                      <p className="font-medium">{formatCurrency(item.costoTotalBatch)}</p>
                    </div>
                  </div>
                  <div className="text-xs text-gray-400 text-right pt-2 border-t mt-auto">
                    Último cálculo: {item.lastCalculatedAt ? new Date(item.lastCalculatedAt).toLocaleDateString("es-AR") : "N/A"}
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </div>
    </div>
  );
}
