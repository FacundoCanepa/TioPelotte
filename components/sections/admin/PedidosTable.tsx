"use client";

import { useState } from "react";
import { Copy, Loader2 } from "lucide-react";
import { toast } from "sonner";
import type { PedidoType } from "@/types/pedido";

interface Props {
  pedidos: PedidoType[];
}

export default function PedidosTable({ pedidos }: Props) {
  const [loadingId, setLoadingId] = useState<string | null>(null);

  const copiar = (texto: string) => {
    navigator.clipboard.writeText(texto);
    toast.success("Teléfono copiado");
  };

  const actualizarEstado = async (documentId: string, nuevoEstado: string) => {
    setLoadingId(documentId);
    try {
      const res = await fetch(`/api/pedidos/${documentId}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ estado: nuevoEstado }),
      });

      const json = await res.json();
      if (!res.ok) throw new Error(json.error?.message || "Error al actualizar");

      toast.success("Estado actualizado con éxito");
    } catch (err: any) {
      toast.error("No se pudo actualizar el estado");
      console.error(err);
    } finally {
      setLoadingId(null);
    }
  };

  return (
    <div className="overflow-x-auto bg-white rounded-xl shadow p-4">
      <h2 className="text-xl font-semibold text-[#8B4513] mb-4">Últimos pedidos</h2>
      <table className="min-w-full text-sm">
        <thead className="bg-[#FBE6D4] text-[#5A3E1B]">
          <tr>
            <th className="p-2 text-left">Fecha</th>
            <th className="p-2 text-left">Cliente</th>
            <th className="p-2 text-left">Total</th>
            <th className="p-2 text-left">Pago</th>
            <th className="p-2 text-left">Entrega</th>
            <th className="p-2 text-left">Estado</th>
            <th className="p-2 text-left">Teléfono</th>
          </tr>
        </thead>
        <tbody>
          {pedidos.map((p) => {
            const fecha = new Date(p.createdAt).toLocaleDateString("es-AR");
            const total = `$${p.total.toLocaleString("es-AR")}`;
                  const linkWhatsApp = p.telefono
                  ? `https://wa.me/54${p.telefono}`
                  : "#";

            return (
              <tr key={p.id} className="border-b last:border-none hover:bg-[#FFF8EC]">
                <td className="p-2 whitespace-nowrap">{fecha}</td>
                <td className="p-2 whitespace-nowrap capitalize">{p.nombre}</td>
                <td className="p-2 whitespace-nowrap">{total}</td>
                <td className="p-2 whitespace-nowrap capitalize">{p.tipoPago}</td>
                <td className="p-2 whitespace-nowrap capitalize">{p.tipoEntrega}</td>
                <td className="p-2 whitespace-nowrap">
                  <select
                    className="border rounded-md px-2 py-1 bg-white"
                    value={p.estado}
                       onChange={(e) => {
                      if (p.documentId) {
                        actualizarEstado(p.documentId, e.target.value);
                      }
                    }}
                  >
                    <option value="Pendiente">Pendiente</option>
                    <option value="En camino">En camino</option>
                    <option value="Entregado">Entregado</option>
                    <option value="Cancelado">Cancelado</option>
                  </select>
                  {loadingId === p.documentId && (
                    <Loader2 className="inline ml-2 w-4 h-4 animate-spin" />
                  )}
                </td>
                <td className="p-2 whitespace-nowrap flex items-center gap-2">
                  <a
                    href={linkWhatsApp}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-green-600 underline"
                  >
                    {p.telefono ?? ""}
                  </a>
                  <button
                    onClick={() => p.telefono && copiar(p.telefono)}
                    className="text-[#8B4513] hover:text-black"
                  >
                    <Copy className="h-4 w-4" />
                  </button>
                </td>
              </tr>
            );
          })}
        </tbody>
      </table>
    </div>
  );
}