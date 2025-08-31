"use client";

import { useMemo, useState } from "react";
import {
  Copy,
  Loader2,
  ChevronDown,
  ChevronRight,
  MapPin,
  MapPinned,
  Phone,
  Receipt,
  MessageCircle,
} from "lucide-react";
import { toast } from "sonner";
import type { PedidoType } from "@/types/pedido";

interface Props {
  pedidos: PedidoType[];
}

type LineItem = {
  title?: string;
  product_name?: string;
  quantity?: number;
  unit_price?: number;
  // por si en algún flujo guardaste otros campos:
  price?: number;
  qty?: number;
};

function formatCurrency(n?: number) {
  try {
    return new Intl.NumberFormat("es-AR", {
      style: "currency",
      currency: "ARS",
      maximumFractionDigits: 2,
    }).format(n ?? 0);
  } catch {
    return `$${n ?? 0}`;
  }
}

function onlyDigits(s: string) {
  return (s || "").replace(/\D+/g, "");
}

function ensureWaPhone(arPhone: string) {
  // asumo Argentina. Si ya viene con 54 al inicio, lo dejamos.
  const d = onlyDigits(arPhone);
  if (d.startsWith("54")) return d;
  return `54${d}`;
}

function buildWhatsappLink(p: any, items: LineItem[]) {
  const lines =
    items.length > 0
      ? items
          .map((it) => {
            const name = it.title || it.product_name || "Item";
            const qty = it.quantity ?? it.qty ?? 1;
            const unit = it.unit_price ?? it.price ?? 0;
            return `• ${name} x${qty} — ${formatCurrency(unit)} c/u`;
          })
          .join("\n")
      : "• (sin ítems parseables)";
  const msg = `¡Hola ${p?.nombre || ""}! 👋
Tu pedido en *TÍO PELOTTE*:
${lines}

*Total:* ${formatCurrency(p?.total)}
*Pago:* ${p?.tipoPago ?? "-"}
*Entrega:* ${p?.tipoEntrega ?? "-"}${
    p?.direccion ? ` — ${p?.direccion}` : ""
  }${p?.zona ? ` (${p?.zona})` : ""}
*Estado:* ${p?.estado ?? "-"}

¡Gracias por tu compra!`;

  const phone = ensureWaPhone(p?.telefono || "");
  return `https://wa.me/${phone}?text=${encodeURIComponent(msg)}`;
}

function parseItems(raw: any): LineItem[] {
  try {
    if (!raw) return [];
    if (typeof raw === "string") {
      const t = raw.trim();
      if (!t) return [];
      const j = JSON.parse(t);
      if (Array.isArray(j)) return j as LineItem[];
      return [];
    }
    if (Array.isArray(raw)) return raw as LineItem[];
    return [];
  } catch {
    return [];
  }
}

export default function PedidosTable({ pedidos }: Props) {
  const [loadingId, setLoadingId] = useState<string | null>(null);
  const [expanded, setExpanded] = useState<string | null>(null);

  const copiar = (texto: string | null | undefined, label = "Copiado") => {
    const s = (texto ?? "").toString();
    if (!s) return;
    navigator.clipboard.writeText(s);
    toast.success(label);
  };

  const actualizarPedido = async (documentId: string, patch: Partial<PedidoType>) => {
    setLoadingId(documentId);
    try {
      const res = await fetch(`/api/pedidos/${documentId}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(patch),
      });
      const json = await res.json();
      if (!res.ok) throw new Error(json?.error?.message || "Error al actualizar");
      toast.success("Actualizado con éxito");
    } catch (err: any) {
      toast.error("No se pudo actualizar");
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
            <th className="p-2 w-10" />
            <th className="p-2 text-left">Fecha</th>
            <th className="p-2 text-left">Cliente</th>
            <th className="p-2 text-left">Total</th>
            <th className="p-2 text-left">Pago</th>
            <th className="p-2 text-left">Entrega</th>
            <th className="p-2 text-left">Estado</th>
            <th className="p-2 text-left">Teléfono</th>
            <th className="p-2 text-left">#</th>
          </tr>
        </thead>

        <tbody>
          {pedidos.map((p) => {
            const fecha = new Date(p.createdAt).toLocaleDateString("es-AR");
            const total = formatCurrency(p.total as any);
            const waLink = p.telefono ? buildWhatsappLink(p, parseItems((p as any).items)) : "#";
            const isOpen = expanded === p.documentId;

            const toggle = () => setExpanded((prev) => (prev === p.documentId ? null : p.documentId));

            return (
              <>
                <tr key={p.id} className="border-b last:border-none hover:bg-[#FFF8EC]">
                  <td className="p-2 align-top">
                    <button
                      onClick={toggle}
                      className="rounded-md p-1 text-[#8B4513] hover:bg-[#FBE6D4] hover:text-[#5A3E1B] transition"
                      aria-label={isOpen ? "Ocultar detalle" : "Ver detalle"}
                    >
                      {isOpen ? <ChevronDown className="h-4 w-4" /> : <ChevronRight className="h-4 w-4" />}
                    </button>
                  </td>

                  <td className="p-2 whitespace-nowrap align-top">{fecha}</td>
                  <td className="p-2 whitespace-nowrap align-top capitalize">{p.nombre}</td>
                  <td className="p-2 whitespace-nowrap align-top">{total}</td>
                  <td className="p-2 whitespace-nowrap align-top capitalize">{p.tipoPago}</td>
                  <td className="p-2 whitespace-nowrap align-top capitalize">
                    <select
                      className="border rounded-md px-2 py-1 bg-white"
                      value={p.tipoEntrega}
                      onChange={(e) =>
                        p.documentId && actualizarPedido(p.documentId, { tipoEntrega: e.target.value as any })
                      }
                    >
                      <option value="domicilio">Domicilio</option>
                      <option value="local">Local</option>
                    </select>
                    {loadingId === p.documentId && <Loader2 className="inline ml-2 w-4 h-4 animate-spin" />}
                  </td>

                  <td className="p-2 whitespace-nowrap align-top">
                    <select
                      className="border rounded-md px-2 py-1 bg-white"
                      value={p.estado}
                      onChange={(e) => p.documentId && actualizarPedido(p.documentId, { estado: e.target.value as any })}
                    >
                      <option value="Pendiente">Pendiente</option>
                      <option value="En camino">En camino</option>
                      <option value="Entregado">Entregado</option>
                      <option value="Cancelado">Cancelado</option>
                    </select>
                    {loadingId === p.documentId && <Loader2 className="inline ml-2 w-4 h-4 animate-spin" />}
                  </td>

                  <td className="p-2 whitespace-nowrap align-top">
                    <div className="flex items-center gap-2">
                      {p.telefono ? (
                        <a
                          href={`https://wa.me/${ensureWaPhone(p.telefono)}`}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="text-green-600 underline"
                        >
                          {p.telefono}
                        </a>
                      ) : (
                        <span className="text-gray-400">—</span>
                      )}
                      {p.telefono && (
                        <button
                          onClick={() => copiar(p.telefono, "Teléfono copiado")}
                          className="text-[#8B4513] hover:text-black"
                          title="Copiar teléfono"
                        >
                          <Copy className="h-4 w-4" />
                        </button>
                      )}
                    </div>
                  </td>

                  <td className="p-2 whitespace-nowrap align-top">
                    <div className="flex items-center gap-2">
                      {p.payment_id ? (
                        <span className="inline-flex items-center gap-1 rounded-md bg-[#FBE6D4] px-2 py-1 text-xs text-[#5A3E1B]">
                          <Receipt className="h-3.5 w-3.5" />
                          {p.payment_id}
                        </span>
                      ) : null}
                    </div>
                  </td>
                </tr>

                {/* Fila expandida (detalle) */}
                {isOpen && (
                  <tr className="bg-[#FFFBF3]">
                    <td colSpan={9} className="p-3">
                      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
                        {/* Col 1: Datos de entrega */}
                        <section className="rounded-lg border border-[#EADBC8] p-3">
                          <h3 className="mb-2 text-sm font-semibold text-[#8B4513]">Entrega</h3>
                          <div className="space-y-2 text-sm">
                            <p className="flex items-start gap-2">
                              <MapPinned className="mt-0.5 h-4 w-4 text-[#8B4513]" />
                              <span>
                                <span className="font-medium">Dirección:</span>{" "}
                                {p.direccion ? (
                                  <>
                                    {p.direccion}{" "}
                                    <button
                                      className="ml-1 text-[#8B4513] underline"
                                      onClick={() => copiar(p.direccion!, "Dirección copiada")}
                                    >
                                      copiar
                                    </button>
                                  </>
                                ) : (
                                  "—"
                                )}
                              </span>
                            </p>

                            <p className="flex items-start gap-2">
                              <MapPin className="mt-0.5 h-4 w-4 text-[#8B4513]" />
                              <span>
                                <span className="font-medium">Zona:</span> {p.zona || "—"}
                              </span>
                            </p>

                            <p className="flex items-start gap-2">
                              <MapPin className="mt-0.5 h-4 w-4 text-[#8B4513]" />
                              <span>
                                <span className="font-medium">Referencias:</span> {p.referencias || "—"}
                              </span>
                            </p>

                            <p className="flex items-start gap-2">
                              <Phone className="mt-0.5 h-4 w-4 text-[#8B4513]" />
                              <span>
                                <span className="font-medium">Contacto:</span>{" "}
                                {p.nombre || "—"} {p.telefono ? `• ${p.telefono}` : ""}
                              </span>
                            </p>

                            <div className="pt-2">
                              {p.telefono && (
                                <a
                                  href={waLink}
                                  target="_blank"
                                  rel="noopener noreferrer"
                                  className="inline-flex items-center gap-2 rounded-md bg-green-600 px-3 py-1.5 text-xs font-medium text-white hover:bg-green-700"
                                >
                                  <MessageCircle className="h-4 w-4" />
                                  WhatsApp con detalle
                                </a>
                              )}
                            </div>
                          </div>
                        </section>

                        {/* Col 2: Items */}
                        <section className="rounded-lg border border-[#EADBC8] p-3">
                          <h3 className="mb-2 text-sm font-semibold text-[#8B4513]">Ítems</h3>
                          <ItemsTable rawItems={(p as any).items} />
                        </section>

                        {/* Col 3: Resumen / Pago */}
                        <section className="rounded-lg border border-[#EADBC8] p-3">
                          <h3 className="mb-2 text-sm font-semibold text-[#8B4513]">Resumen</h3>
                          <ul className="space-y-1 text-sm">
                            <li>
                              <span className="text-[#8a6a45]">Documento:</span>{" "}
                              <span className="font-mono">{p.documentId}</span>
                            </li>
                            <li>
                              <span className="text-[#8a6a45]">Creado:</span>{" "}
                              {new Date(p.createdAt).toLocaleString("es-AR")}
                            </li>
                            <li>
                              <span className="text-[#8a6a45]">Actualizado:</span>{" "}
                              {p.updatedAt ? new Date(p.updatedAt).toLocaleString("es-AR") : "—"}
                            </li>
                            <li>
                              <span className="text-[#8a6a45]">Pago:</span> {p.tipoPago || "—"}
                            </li>
                            <li>
                              <span className="text-[#8a6a45]">payment_id:</span>{" "}
                              {p.payment_id || "—"}
                            </li>
                            <li className="pt-2 text-base font-semibold">
                              Total: {formatCurrency(p.total as any)}
                            </li>
                          </ul>
                        </section>
                      </div>
                    </td>
                  </tr>
                )}
              </>
            );
          })}
        </tbody>
      </table>
    </div>
  );
}

/** Subtabla de items con parseo tolerante (string o array) */
function ItemsTable({ rawItems }: { rawItems: any }) {
  const items = useMemo(() => parseItems(rawItems), [rawItems]);
  const sum = useMemo(
    () =>
      items.reduce((acc, it) => {
        const qty = it.quantity ?? it.qty ?? 1;
        const unit = it.unit_price ?? it.price ?? 0;
        return acc + qty * unit;
      }, 0),
    [items]
  );

  if (!items.length) {
    return <p className="text-sm text-gray-500">Sin ítems.</p>;
  }

  return (
    <div className="overflow-hidden rounded-md border border-[#EADBC8]">
      <table className="w-full text-xs">
        <thead className="bg-[#FFF4E6]">
          <tr className="text-[#5A3E1B]">
            <th className="px-2 py-1 text-left">Producto</th>
            <th className="px-2 py-1 text-right">Cant.</th>
            <th className="px-2 py-1 text-right">Unit.</th>
            <th className="px-2 py-1 text-right">Subtot.</th>
          </tr>
        </thead>
        <tbody>
          {items.map((it, idx) => {
            const name = it.title || it.product_name || `Item ${idx + 1}`;
            const qty = it.quantity ?? it.qty ?? 1;
            const unit = it.unit_price ?? it.price ?? 0;
            const subtotal = qty * unit;
            return (
              <tr key={idx} className="border-t">
                <td className="px-2 py-1">{name}</td>
                <td className="px-2 py-1 text-right">{qty}</td>
                <td className="px-2 py-1 text-right">{formatCurrency(unit)}</td>
                <td className="px-2 py-1 text-right font-medium">{formatCurrency(subtotal)}</td>
              </tr>
            );
          })}
          <tr className="border-t bg-[#FFF9F0]">
            <td className="px-2 py-1 text-right font-semibold" colSpan={3}>
              Total ítems
            </td>
            <td className="px-2 py-1 text-right font-semibold">{formatCurrency(sum)}</td>
          </tr>
        </tbody>
      </table>
    </div>
  );
}
