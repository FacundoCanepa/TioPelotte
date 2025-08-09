"use client";

import { PedidoProvider } from "./PedidoProvider";
import ConsultarPedidoForm from "./ConsultarPedidoForm";
import PedidoResultado from "./PedidoResultado";
import { Search } from "lucide-react";

export default function ConsultarPedidoPage() {
  return (
    <PedidoProvider>
      <div className="min-h-screen bg-[#FBE6D4] py-16 px-4 sm:px-6 lg:px-8">
        <div className="max-w-3xl mx-auto space-y-10">
          <h1 className="text-center font-garamond italic text-5xl text-[#5A3E1B]">
            Seguimiento de tu pedido
          </h1>

          <div className="bg-[#FFF8EB] p-6 md:p-8 rounded-2xl shadow-xl space-y-6 border border-[#ecd7b7]">
            <div className="flex items-center gap-2 text-[#5A3E1B]">
              <Search />
              <h2 className="text-xl font-semibold">Consultá con tu número de teléfono</h2>
            </div>
            <ConsultarPedidoForm />
          </div>

          <PedidoResultado />
        </div>
      </div>
    </PedidoProvider>
  );
}
