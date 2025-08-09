"use client";
import { useRouter } from "next/navigation";

export default function SuccessActions() {
  const router = useRouter();

  return (
    <div className="flex flex-col sm:flex-row gap-4 justify-center mt-6">
      <button
        onClick={() => router.push("/consultarPedido")}
        className="bg-[#FFD966] hover:bg-[#f5c741] text-[#5A3E1B] px-5 py-2 rounded-md text-sm font-medium"
      >
        Consultar mi pedido
      </button>

      <button
        onClick={() => router.push("/productos")}
        className="bg-white border border-[#E0E0E0] hover:bg-[#fff4d3] text-[#5A3E1B] px-5 py-2 rounded-md text-sm font-medium"
      >
        Seguir comprando
      </button>
    </div>
  );
}
