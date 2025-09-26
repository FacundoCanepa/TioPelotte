"use client";

import { useMemo, useState } from "react";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";

const STATUS_LABELS = {
  pending: "Pendiente",
  running: "En proceso",
  completed: "Completado",
} as const;

const STATUS_STYLES: Record<keyof typeof STATUS_LABELS, string> = {
  pending: "bg-amber-100 text-amber-800 border border-amber-200",
  running: "bg-sky-100 text-sky-800 border border-sky-200",
  completed: "bg-emerald-100 text-emerald-800 border border-emerald-200",
};

const MOCK_ORDERS = [
  {
    id: "FAB-001",
    recipe: "Tortas Selva Negra",
    quantity: 12,
    status: "pending" as const,
    scheduledFor: "09:00",
    responsible: "Carla Ríos",
  },
  {
    id: "FAB-002",
    recipe: "Budines de Nuez",
    quantity: 20,
    status: "running" as const,
    scheduledFor: "11:00",
    responsible: "Juan Pérez",
  },
  {
    id: "FAB-003",
    recipe: "Cookies de Chocolate",
    quantity: 150,
    status: "completed" as const,
    scheduledFor: "Ayer",
    responsible: "Equipo B",
  },
];

type StatusFilter = "all" | keyof typeof STATUS_LABELS;

export default function FabricacionSection() {
  const [statusFilter, setStatusFilter] = useState<StatusFilter>("all");

  const stats = useMemo(() => {
    const totals = MOCK_ORDERS.reduce(
      (acc, order) => {
        acc.total++;
        acc[order.status]++;
        return acc;
      },
      { total: 0, pending: 0, running: 0, completed: 0 }
    );

    return [
      { label: "Órdenes totales", value: totals.total },
      { label: "Pendientes", value: totals.pending },
      { label: "En proceso", value: totals.running },
      { label: "Completadas", value: totals.completed },
    ];
  }, []);

  const filteredOrders = useMemo(() => {
    if (statusFilter === "all") {
      return MOCK_ORDERS;
    }

    return MOCK_ORDERS.filter((order) => order.status === statusFilter);
  }, [statusFilter]);

  return (
    <div className="mx-auto flex w-full max-w-6xl flex-col gap-8 p-4">
      <header className="space-y-2">
        <h1 className="text-3xl font-semibold text-neutral-900">
          Centro de fabricación
        </h1>
        <p className="text-sm text-neutral-500">
          Controla el estado de tus órdenes de producción y prioriza las tareas
          del día.
        </p>
      </header>

      <section className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        {stats.map((stat) => (
          <Card key={stat.label}>
            <CardHeader className="pb-2">
              <CardDescription>{stat.label}</CardDescription>
              <CardTitle className="text-2xl font-semibold text-neutral-900">
                {stat.value}
              </CardTitle>
            </CardHeader>
          </Card>
        ))}
      </section>

      <Card>
        <CardHeader className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
          <div>
            <CardTitle className="text-xl">Órdenes de producción</CardTitle>
            <CardDescription>
              Filtra las órdenes por estado para organizar la planificación.
            </CardDescription>
          </div>

          <div className="flex flex-wrap gap-2">
            {["all", "pending", "running", "completed"].map((status) => (
              <button
                key={status}
                onClick={() => setStatusFilter(status as StatusFilter)}
                className={
                  "rounded-full border px-3 py-1 text-sm transition-colors" +
                  (statusFilter === status
                    ? " border-amber-400 bg-amber-50 text-amber-700"
                    : " border-neutral-200 text-neutral-500 hover:bg-neutral-50")
                }
                type="button"
              >
                {status === "all" ? "Todas" : STATUS_LABELS[status as keyof typeof STATUS_LABELS]}
              </button>
            ))}
          </div>
        </CardHeader>

        <CardContent className="overflow-x-auto">
          <table className="min-w-full divide-y divide-neutral-200 text-sm">
            <thead>
              <tr className="text-left text-neutral-500">
                <th className="whitespace-nowrap px-3 py-2 font-medium">Orden</th>
                <th className="whitespace-nowrap px-3 py-2 font-medium">Receta</th>
                <th className="whitespace-nowrap px-3 py-2 font-medium">Cantidad</th>
                <th className="whitespace-nowrap px-3 py-2 font-medium">Responsable</th>
                <th className="whitespace-nowrap px-3 py-2 font-medium">Programado</th>
                <th className="whitespace-nowrap px-3 py-2 font-medium">Estado</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-neutral-100">
              {filteredOrders.length === 0 ? (
                <tr>
                  <td colSpan={6} className="px-3 py-6 text-center text-neutral-400">
                    No hay órdenes con el estado seleccionado.
                  </td>
                </tr>
              ) : (
                filteredOrders.map((order) => (
                  <tr key={order.id} className="text-neutral-700">
                    <td className="whitespace-nowrap px-3 py-3 font-medium">
                      {order.id}
                    </td>
                    <td className="whitespace-nowrap px-3 py-3">{order.recipe}</td>
                    <td className="whitespace-nowrap px-3 py-3">{order.quantity}</td>
                    <td className="whitespace-nowrap px-3 py-3">{order.responsible}</td>
                    <td className="whitespace-nowrap px-3 py-3">{order.scheduledFor}</td>
                    <td className="whitespace-nowrap px-3 py-3">
                      <span
                        className={
                          "inline-flex items-center gap-2 rounded-full px-3 py-1 text-xs font-medium " +
                          STATUS_STYLES[order.status]
                        }
                      >
                        <span className="size-2 rounded-full bg-current opacity-80" />
                        {STATUS_LABELS[order.status]}
                      </span>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </CardContent>
      </Card>
    </div>
  );
}
