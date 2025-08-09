"use client";

import { useMemo, useState } from "react";
import type { PedidoType } from "@/types/pedido";

interface Props {
  pedidos: PedidoType[];
}

export default function BestSellingProducts({ pedidos }: Props) {
  const [pagina, setPagina] = useState(1);
  const porPagina = 10;

  const resumen = useMemo(() => {
    const conteo: Record<string, { cantidad: number; monto: number }> = {};

    pedidos.forEach((pedido) => {
      pedido.items?.forEach((item) => {
        if (!item.product_name) return;
        const nombre = item.product_name;
        if (!conteo[nombre]) conteo[nombre] = { cantidad: 0, monto: 0 };
        conteo[nombre].cantidad += item.quantity;
        conteo[nombre].monto += item.quantity * (item.unit_price ?? 0);
      });
    });

    return Object.entries(conteo)
      .sort((a, b) => b[1].cantidad - a[1].cantidad)
      .map(([nombre, data]) => ({ nombre, ...data }));
  }, [pedidos]);

  const totalPaginas = Math.ceil(resumen.length / porPagina);
  const lista = resumen.slice((pagina - 1) * porPagina, pagina * porPagina);

  return (
    <section className="space-y-4">
      <h2 className="text-xl font-semibold text-[#8B4513]">Productos más vendidos</h2>

      <ul className="divide-y divide-[#E0E0E0] bg-white rounded-xl shadow">
        {lista.map((item, index) => (
          <li key={index} className="p-4 flex flex-col md:flex-row md:items-center md:justify-between">
            <div>
              <p className="font-semibold text-[#5A3E1B]">{item.nombre}</p>
              <p className="text-sm text-stone-500">
                {item.cantidad} unidades · ${item.monto.toLocaleString("es-AR")}
              </p>
            </div>
          </li>
        ))}
      </ul>

      <div className="flex justify-between items-center text-sm text-[#5A3E1B]">
        <button
          onClick={() => setPagina((p) => Math.max(1, p - 1))}
          disabled={pagina === 1}
          className="px-3 py-1 border rounded disabled:opacity-50"
        >
          Anterior
        </button>

        <span>
          Página {pagina} de {totalPaginas}
        </span>

        <button
          onClick={() => setPagina((p) => Math.min(totalPaginas, p + 1))}
          disabled={pagina === totalPaginas}
          className="px-3 py-1 border rounded disabled:opacity-50"
        >
          Siguiente
        </button>
      </div>
    </section>
  );
}
