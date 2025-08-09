"use client";

import { usePedidoContext } from "./PedidoProvider";
import { Phone, Loader2 } from "lucide-react";
import { useUserStore } from "@/store/user-store";
import { useEffect } from "react";

export default function ConsultarPedidoForm() {
  const { telefono, setTelefono, buscarPedido, loading } = usePedidoContext();
  const user = useUserStore((state) => state.user);

  useEffect(() => {
    if (user?.telefono && telefono === "") {
      setTelefono(user.telefono);
    }
  }, [user, telefono, setTelefono]);

  const handleInput = (e: React.ChangeEvent<HTMLInputElement>) => {
    const onlyNumbers = e.target.value.replace(/\D/g, "");
    setTelefono(onlyNumbers);
  };

  return (
    <div className="space-y-5">
      <div className="relative">
        <Phone className="absolute left-3 top-1/2 -translate-y-1/2 text-[#5A3E1B] w-4 h-4" />
        <input
          type="text"
          inputMode="numeric"
          pattern="[0-9]*"
          placeholder="Ej: 2211234567"
          value={telefono}
          onChange={handleInput}
          className="w-full pl-10 border border-[#e4d3b1] rounded-xl px-4 py-2 text-sm shadow-md focus:outline-none focus:ring-2 focus:ring-[#FFD966] bg-white"
        />
      </div>
      <button
        onClick={buscarPedido}
        disabled={loading || telefono.trim() === ""}
        className="bg-[#FFD966] hover:bg-[#f5c741] text-[#5A3E1B] px-4 py-2 rounded-xl w-full font-semibold shadow-lg transition-all flex items-center justify-center gap-2"
      >
        {loading && <Loader2 className="animate-spin w-4 h-4" />}
        {loading ? "Buscando pedido..." : "Consultar pedido"}
      </button>
    </div>
  );
}
