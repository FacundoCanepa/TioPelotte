"use client";

import { useMemo, useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { listFabricaciones } from "@/lib/admin/fabricacion-api";
import { Fabricacion } from "@/types/fabricacion";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";

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
    <div className="mx-auto flex w-full max-w-6xl flex-col gap-6 p-2 sm:p-4 lg:p-0">
      <header className="space-y-2">
        <h1 className="text-2xl sm:text-3xl font-semibold text-neutral-900">Centro de fabricación</h1>
        <p className="text-sm text-neutral-500">
          Conecta tus recetas con costos reales para entender cuánto cuesta producir cada lote y qué margen estás obteniendo.
        </p>
      </header>

      <section className="grid gap-4 grid-cols-1 sm:grid-cols-2 lg:grid-cols-4">
        <Card>
          <CardHeader className="pb-2">
            <CardDescription>Órdenes de fabricación</CardDescription>
            <CardTitle className="text-2xl font-semibold text-neutral-900">{numberFormatter.format(fabricaciones.length)}</CardTitle>
          </CardHeader>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardDescription>Costo total estimado</CardDescription>
            <CardTitle className="text-2xl font-semibold text-neutral-900">{formatCurrency(resumen.totalCost)}</CardTitle>
          </CardHeader>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardDescription>Costo unitario promedio</CardDescription>
            <CardTitle className="text-2xl font-semibold text-neutral-900">{formatCurrency(resumen.avgUnitCost)}</CardTitle>
          </CardHeader>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardDescription>Margen promedio</CardDescription>
            <CardTitle className="text-2xl font-semibold text-neutral-900">{formatPercent(resumen.avgMargin)}</CardTitle>
          </CardHeader>
        </Card>
      </section>

      <Card>
        <CardHeader className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <CardTitle className="text-lg sm:text-xl">Detalle de costos por fabricación</CardTitle>
            <CardDescription className="text-sm">
              Analizá cada receta para ajustar tus precios y lograr el margen objetivo.
            </CardDescription>
          </div>
          <div className="flex flex-col gap-2 w-full sm:w-auto md:flex-row md:items-center">
            <label className="text-sm font-medium text-neutral-500 w-full sm:w-auto" htmlFor="fabricacion-sort">
              Ordenar por
            </label>
            <select
              id="fabricacion-sort"
              value={sortKey}
              onChange={(event) => setSortKey(event.target.value as SortKey)}
              className="rounded-lg border border-neutral-200 bg-white px-3 py-2 text-sm text-neutral-700 shadow-sm focus:border-amber-400 focus:outline-none w-full min-h-[44px]"
            >
              <option value="margin">Margen de ganancia</option>
              <option value="cost">Costo unitario</option>
              <option value="name">Nombre</option>
            </select>
          </div>
        </CardHeader>

        <CardContent className="overflow-x-auto">
          {isLoading ? (
            <div className="flex h-48 w-full items-center justify-center text-sm text-neutral-500">
              Cargando información de fabricación...
            </div>
          ) : isError ? (
            <div className="flex flex-col gap-2 rounded-lg border border-red-200 bg-red-50 p-4 text-sm text-red-700 w-full">
              <p className="font-medium">No pudimos traer los datos de fabricación.</p>
              <p className="text-red-600">{error instanceof Error ? error.message : "Intenta nuevamente en unos minutos."}</p>
              <button
                type="button"
                onClick={() => refetch()}
                className="self-start rounded-md border border-red-200 px-3 py-1 text-xs font-medium text-red-700 hover:bg-red-100 min-h-[44px] min-w-[44px] flex items-center justify-center"
              >
                Reintentar
              </button>
            </div>
          ) : fabricaciones.length === 0 ? (
            <div className="flex h-48 w-full items-center justify-center text-sm text-neutral-500">
              No hay órdenes de fabricación registradas todavía.
            </div>
          ) : (
            <table className="min-w-full divide-y divide-neutral-200 text-sm w-full">
              <thead className="hidden md:table-header-group">
                <tr className="text-left text-neutral-500">
                  <th className="whitespace-nowrap px-3 py-2 font-medium">Nombre</th>
                  <th className="whitespace-nowrap px-3 py-2 font-medium">Producto</th>
                  <th className="whitespace-nowrap px-3 py-2 font-medium text-right">Batch</th>
                  <th className="whitespace-nowrap px-3 py-2 font-medium text-right">Costo ingredientes</th>
                  <th className="whitespace-nowrap px-3 py-2 font-medium text-right">Costo total</th>
                  <th className="whitespace-nowrap px-3 py-2 font-medium text-right">Costo unitario</th>
                  <th className="whitespace-nowrap px-3 py-2 font-medium text-right">Precio sugerido</th>
                  <th className="whitespace-nowrap px-3 py-2 font-medium text-right">Margen estimado</th>
                  <th className="whitespace-nowrap px-3 py-2 font-medium text-right">Margen objetivo</th>
                  <th className="whitespace-nowrap px-3 py-2 font-medium">Último cálculo</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-neutral-100">
                {sortedFabricaciones.map((item) => {
                  const unitCost = computeUnitCost(item);
                  const margin = computeMargin(item);
                  return (
                    <tr key={item.documentId} className="grid grid-cols-1 sm:grid-cols-2 md:table-row gap-y-2 p-4 md:p-0 hover:bg-neutral-50 transition group">
                      <td className="md:whitespace-nowrap px-3 py-3 font-medium col-span-full sm:col-span-1" data-label="Nombre: ">
                        <span className="font-bold text-xs uppercase text-neutral-600 md:hidden">Nombre: </span>
                        <div className="flex flex-col">
                          <span>{item.nombre}</span>
                          {item.lineas && item.lineas.length > 0 && (
                            <span className="text-xs text-neutral-500">
                              {item.lineas.length} ingredientes en la fórmula
                            </span>
                          )}
                        </div>
                      </td>
                      <td className="md:whitespace-nowrap px-3 py-3 flex justify-between items-center sm:block" data-label="Producto: ">
                        <span className="font-bold text-xs uppercase text-neutral-600 md:hidden">Producto: </span>
                        <span>{item.product?.productName ?? "Sin producto asociado"}</span>
                      </td>
                      <td className="md:whitespace-nowrap px-3 py-3 text-right flex justify-between items-center sm:block" data-label="Batch: ">
                        <span className="font-bold text-xs uppercase text-neutral-600 md:hidden">Batch: </span>
                        <span>{numberFormatter.format(item.batchSize)}</span>
                      </td>
                      <td className="md:whitespace-nowrap px-3 py-3 text-right flex justify-between items-center sm:block" data-label="Costo ingredientes: ">
                        <span className="font-bold text-xs uppercase text-neutral-600 md:hidden">Costo ingredientes: </span>
                        <span>{formatCurrency(item.ingredientesCostoTotal)}</span>
                      </td>
                      <td className="md:whitespace-nowrap px-3 py-3 text-right flex justify-between items-center sm:block" data-label="Costo total: ">
                        <span className="font-bold text-xs uppercase text-neutral-600 md:hidden">Costo total: </span>
                        <span>{formatCurrency(item.costoTotalBatch)}</span>
                      </td>
                      <td className="md:whitespace-nowrap px-3 py-3 text-right flex justify-between items-center sm:block" data-label="Costo unitario: ">
                        <span className="font-bold text-xs uppercase text-neutral-600 md:hidden">Costo unitario: </span>
                        <span>{formatCurrency(unitCost)}</span>
                      </td>
                      <td className="md:whitespace-nowrap px-3 py-3 text-right flex justify-between items-center sm:block" data-label="Precio sugerido: ">
                        <span className="font-bold text-xs uppercase text-neutral-600 md:hidden">Precio sugerido: </span>
                        <span>{formatCurrency(item.precioSugerido)}</span>
                      </td>
                      <td
                        className={`md:whitespace-nowrap px-3 py-3 text-right font-medium flex justify-between items-center sm:block ${margin >= item.margenObjetivoPct ? "text-emerald-600" : "text-amber-600"}`}
                        data-label="Margen estimado: "
                      >
                        <span className="font-bold text-xs uppercase text-neutral-600 md:hidden">Margen estimado: </span>
                        <span>{formatPercent(margin)}</span>
                      </td>
                      <td className="md:whitespace-nowrap px-3 py-3 text-right flex justify-between items-center sm:block" data-label="Margen objetivo: ">
                        <span className="font-bold text-xs uppercase text-neutral-600 md:hidden">Margen objetivo: </span>
                        <span>{formatPercent(item.margenObjetivoPct)}</span>
                      </td>
                      <td className="md:whitespace-nowrap px-3 py-3 flex justify-between items-center sm:block" data-label="Último cálculo: ">
                        <span className="font-bold text-xs uppercase text-neutral-600 md:hidden">Último cálculo: </span>
                        <span>{item.lastCalculatedAt ? new Date(item.lastCalculatedAt).toLocaleDateString("es-AR") : "-"}</span>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
