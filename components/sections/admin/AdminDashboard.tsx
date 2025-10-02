"use client";

import BestSellingProducts from "./BestSellingProducts";
import { useEffect, useState } from "react";
import type { PedidoType } from "@/types/pedido";
import {
  Loader2,
  DollarSign,
  Truck,
  CheckCircle,
  Clock,
  CreditCard,
  HandCoins,
  HelpCircle,
  Store,
  Ban,
} from "lucide-react";
import ResumenCard from "./ResumenCard";
import VentasChart from "./VentasChart";
import PedidosTable from "./PedidosTable";

export default function AdminDashboard() {
  const [pedidos, setPedidos] = useState<PedidoType[]>([]);
  const [loading, setLoading] = useState(true);

  const [filtroEstado, setFiltroEstado] = useState<string>("Todos");
  const [ordenFecha, setOrdenFecha] = useState<string>("recientes");
  const [ordenPrecio, setOrdenPrecio] = useState<string>("ninguno");
  const [fechaDesde, setFechaDesde] = useState<string>("");
  const [fechaHasta, setFechaHasta] = useState<string>("");

  const [filtroEntrega, setFiltroEntrega] = useState<string>("Todos");
  const [filtroPago, setFiltroPago] = useState<string>("Todos");

  useEffect(() => {
    const fetchPedidos = async () => {
      try {
        const res = await fetch("/api/pedidos?populate=*");
        const json = await res.json();
        setPedidos(Array.isArray(json?.data) ? json.data : []);

      } catch (err) {
        console.error("Error al obtener pedidos:", err);
      } finally {
        setLoading(false);
      }
    };
    fetchPedidos();
  }, []);

  const pedidosFiltrados = pedidos.filter((p) => {
    const fecha = new Date(p.createdAt);
    const desde = fechaDesde ? new Date(fechaDesde) : null;
    const hasta = fechaHasta ? new Date(fechaHasta) : null;
    return (
      (filtroEstado === "Todos" || p.estado === filtroEstado) &&
      (!desde || fecha >= desde) &&
      (!hasta || fecha <= hasta)
    );
  });

  let pedidosOrdenados = [...pedidosFiltrados];

  if (ordenFecha === "recientes") {
    pedidosOrdenados.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
  } else if (ordenFecha === "antiguos") {
    pedidosOrdenados.sort((a, b) => new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime());
  }

  if (ordenPrecio === "mayor") {
    pedidosOrdenados.sort((a, b) => b.total - a.total);
  } else if (ordenPrecio === "menor") {
    pedidosOrdenados.sort((a, b) => a.total - b.total);
  }

  const resumenFiltrado = pedidos.filter((p) => {
    return (
      (filtroEntrega === "Todos" || p.tipoEntrega === filtroEntrega) &&
      (filtroPago === "Todos" || p.tipoPago?.toLowerCase() === filtroPago.toLowerCase())
    );
  });

  const entregados = resumenFiltrado.filter((p) => p.estado === "Entregado");
  const pendientes = resumenFiltrado.filter((p) => p.estado === "Pendiente");
  const enCamino = resumenFiltrado.filter((p) => p.estado === "En camino");
  const cancelados = resumenFiltrado.filter((p) => p.estado === "Cancelado");

  const totalVendido = resumenFiltrado.reduce((acc, p) => acc + p.total, 0);

  const porMercadoPago = resumenFiltrado.filter((p) => p.tipoPago?.toLowerCase() === "mercado pago").length;
  const porEfectivo = resumenFiltrado.filter((p) => p.tipoPago === "efectivo").length;
  const porAElegir = resumenFiltrado.filter((p) => p.tipoPago?.toLowerCase().includes("elegís")).length;

  const porDomicilio = resumenFiltrado.filter((p) => p.tipoEntrega === "domicilio").length;
  const porLocal = resumenFiltrado.filter((p) => p.tipoEntrega === "local").length;

  const monthly: Record<string, number> = {};
  entregados.forEach((p) => {
    const d = new Date(p.createdAt);
    const key = `${d.getFullYear()}-${d.getMonth()}`;
    monthly[key] = (monthly[key] || 0) + p.total;
  });

  const labels = Object.keys(monthly).sort().map((k) => {
    const [y, m] = k.split("-").map(Number);
    return new Date(y, m).toLocaleString("es-AR", { month: "short" });
  });

  const values = Object.keys(monthly).sort().map((k) => monthly[k]);

  if (loading) {
    return (
      <div className="w-full flex justify-center py-10">
        <Loader2 className="h-6 w-6 animate-spin text-[#8B4513]" />
      </div>
    );
  }

  return (
    <div className="space-y-6 lg:space-y-10">
      <h1 className="text-2xl sm:text-3xl font-semibold text-[#8B4513] font-garamond">Panel de administración</h1>

      <VentasChart labels={labels} values={values} />

      <section className="space-y-4">
        <h2 className="text-xl font-semibold text-[#8B4513]">Filtrar pedidos</h2>
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
          <select value={filtroEstado} onChange={(e) => setFiltroEstado(e.target.value)} className="border p-2 rounded-md bg-white text-[#5A3E1B] w-full min-h-[44px]">
            <option value="Todos">Estado: Todos</option>
            <option value="Pendiente">Pendientes</option>
            <option value="En camino">En camino</option>
            <option value="Entregado">Entregados</option>
            <option value="Cancelado">Cancelados</option>
          </select>
          <select value={ordenFecha} onChange={(e) => setOrdenFecha(e.target.value)} className="border p-2 rounded-md bg-white text-[#5A3E1B] w-full min-h-[44px]">
            <option value="recientes">Fecha: Más recientes</option>
            <option value="antiguos">Fecha: Más antiguos</option>
          </select>
          <select value={ordenPrecio} onChange={(e) => setOrdenPrecio(e.target.value)} className="border p-2 rounded-md bg-white text-[#5A3E1B] w-full min-h-[44px]">
            <option value="ninguno">Precio: Sin ordenar</option>
            <option value="mayor">Precio: Más alto</option>
            <option value="menor">Precio: Más bajo</option>
          </select>
          <div className="flex flex-col sm:flex-row items-start sm:items-center gap-2">
            <label htmlFor="fechaDesde" className="text-sm text-[#5A3E1B]">De:</label>
            <input type="date" id="fechaDesde" value={fechaDesde} onChange={(e) => setFechaDesde(e.target.value)} className="border p-2 rounded-md bg-white text-[#5A3E1B] w-full min-h-[44px]" />
            <label htmlFor="fechaHasta" className="text-sm text-[#5A3E1B]">Hasta:</label>
            <input type="date" id="fechaHasta" value={fechaHasta} onChange={(e) => setFechaHasta(e.target.value)} className="border p-2 rounded-md bg-white text-[#5A3E1B] w-full min-h-[44px]" />
          </div>
        </div>
      </section>

      <div className="relative overflow-x-auto lg:overflow-visible bg-white rounded-xl shadow p-4 md:p-0">
        <h2 className="text-xl font-semibold text-[#8B4513] mb-4 p-4 md:p-0">Últimos pedidos</h2>
        <PedidosTable pedidos={pedidosOrdenados.slice(0, 20)} />
      </div>

      <section className="space-y-4">
        <h2 className="text-xl font-semibold text-[#8B4513]">Filtrar resumen y métricas</h2>
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4">
          <select value={filtroEntrega} onChange={(e) => setFiltroEntrega(e.target.value)} className="border p-2 rounded-md bg-white text-[#5A3E1B] w-full min-h-[44px]">
            <option value="Todos">Entrega: Todas</option>
            <option value="domicilio">Domicilio</option>
            <option value="local">Local</option>
          </select>
          <select value={filtroPago} onChange={(e) => setFiltroPago(e.target.value)} className="border p-2 rounded-md bg-white text-[#5A3E1B] w-full min-h-[44px]">
            <option value="Todos">Pago: Todos</option>
            <option value="efectivo">Efectivo</option>
            <option value="mercado pago">Mercado Pago</option>
            <option value="Elegís al momento de pagar">Elegís al momento de pagar</option>
          </select>
        </div>
      </section>

      <section className="space-y-4">
        <h2 className="text-xl font-semibold text-[#8B4513]">Resumen de estados</h2>
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-4">
          <ResumenCard title="Total vendido" value={`$${totalVendido.toLocaleString("es-AR")}`} icon={<DollarSign className="h-6 w-6" />} />
          <ResumenCard title="Entregados" value={entregados.length} icon={<CheckCircle className="h-6 w-6" />} />
          <ResumenCard title="En camino" value={enCamino.length} icon={<Truck className="h-6 w-6" />} />
          <ResumenCard title="Pendientes" value={pendientes.length} icon={<Clock className="h-6 w-6" />} />
          <ResumenCard title="Cancelados" value={cancelados.length} icon={<Ban className="h-6 w-6" />} />
        </div>
      </section>

      <section className="space-y-4">
        <h2 className="text-xl font-semibold text-[#8B4513]">Métodos de pago</h2>
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4">
          <ResumenCard title="Mercado Pago" value={porMercadoPago} icon={<CreditCard className="h-6 w-6" />} />
          <ResumenCard title="Efectivo" value={porEfectivo} icon={<HandCoins className="h-6 w-6" />} />
          <ResumenCard title="A elección" value={porAElegir} icon={<HelpCircle className="h-6 w-6" />} />
        </div>
      </section>

      <section className="space-y-4">
        <h2 className="text-xl font-semibold text-[#8B4513]">Tipo de entrega</h2>
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-2 gap-4">
          <ResumenCard title="Domicilio" value={porDomicilio} icon={<Truck className="h-6 w-6" />} />
          <ResumenCard title="Local" value={porLocal} icon={<Store className="h-6 w-6" />} />
        </div>
      </section>

      <BestSellingProducts pedidos={resumenFiltrado} />
    </div>
  );
}
