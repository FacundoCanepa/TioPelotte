"use client";
import { useEffect, useState } from "react";
import SearchInput from "@/components/ui/productos-filters/SearchInput";
import { Loader2 } from "lucide-react";
import PedidosTable from "./PedidosTable";
import type { PedidoType } from "@/types/pedido";

export default function PedidosSection() {
  const [pedidos, setPedidos] = useState<PedidoType[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [estado, setEstado] = useState("Todos");
  const [entrega, setEntrega] = useState("Todos");

  useEffect(() => {
    const fetchPedidos = async () => {
      try {
        const res = await fetch("/api/pedidos?populate=*");
        const json = await res.json();
        setPedidos(Array.isArray(json?.data) ? json.data : []);
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    };
    fetchPedidos();
  }, []);

  const filtered = pedidos.filter((p) => {
    const matchSearch =
    (p.nombre?.toLowerCase() ?? "").includes(search.toLowerCase()) ||
      (p.documentId?.toLowerCase() ?? "").includes(search.toLowerCase());
    const matchEstado = estado === "Todos" || p.estado === estado;
    const matchEntrega = entrega === "Todos" || p.tipoEntrega === entrega;
    return matchSearch && matchEstado && matchEntrega;
  });

  if (loading) {
    return (
      <div className="w-full flex justify-center py-10">
        <Loader2 className="h-6 w-6 animate-spin text-[#8B4513]" />
      </div>
    );
  }

  return (
    <section className="space-y-6 lg:space-y-8 p-4 sm:p-6">
      <header>
        <h1 className="text-2xl sm:text-3xl font-bold text-[#8B4513] font-garamond">Gestión de pedidos</h1>
        <p className="text-sm text-gray-600">Filtrá y administrá todos los pedidos de tus clientes.</p>
      </header>

      <div className="flex flex-col sm:flex-row gap-4 flex-wrap">
        <div className="flex-grow min-w-[200px]">
          <SearchInput value={search} setValue={setSearch} />
        </div>
        <select
          value={estado}
          onChange={(e) => setEstado(e.target.value)}
          className="border p-2 rounded-lg bg-white text-[#5A3E1B] w-full sm:w-auto min-h-[44px] focus:ring-2 focus:ring-[#8B4513] focus:border-transparent"
        >
          <option value="Todos">Estado: Todos</option>
          <option value="Pendiente">Pendiente</option>
          <option value="En camino">En camino</option>
          <option value="Entregado">Entregado</option>
          <option value="Cancelado">Cancelado</option>
        </select>
        <select
          value={entrega}
          onChange={(e) => setEntrega(e.target.value)}
          className="border p-2 rounded-lg bg-white text-[#5A3E1B] w-full sm:w-auto min-h-[44px] focus:ring-2 focus:ring-[#8B4513] focus:border-transparent"
        >
          <option value="Todos">Entrega: Todas</option>
          <option value="domicilio">Domicilio</option>
          <option value="local">Local</option>
        </select>
      </div>

      <PedidosTable pedidos={filtered} />
    </section>
  );
}
