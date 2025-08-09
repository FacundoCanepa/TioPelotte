"use client";

import { Receipt } from "lucide-react";

interface Props {
  subtotal: number;
  envio: number;
  total: number;
   metodoPago: "mercado pago" | "efectivo" | "Elegís al momento de pagar";
}

export default function CheckoutResumen({ subtotal, envio, total, metodoPago }: Props) {
  const senia = metodoPago === "efectivo" ? Math.round(total * 0.1) : null;

  return (
    <div className="bg-[#FFF8EB] rounded-2xl border border-[#E0E0E0] shadow-lg p-6 space-y-6">
      {/* Header */}
      <div className="flex items-center gap-2 text-[#8B4513]">
        <Receipt size={20} />
        <h3 className="text-lg font-semibold tracking-wide">Resumen del pedido</h3>
      </div>

      {/* Totales */}
      <div className="space-y-3 text-sm text-[#5A3E1B]">
        <div className="flex justify-between">
          <span className="font-medium">Subtotal</span>
          <span className="font-semibold">
            ${subtotal.toLocaleString("es-AR")}
          </span>
        </div>

        <div className="flex justify-between">
          <span className="font-medium">Costo de envío</span>
          <span className="font-semibold">
            {envio ? `$${envio.toLocaleString("es-AR")}` : "$0"}
          </span>
        </div>

        <div className="border-t border-[#E0E0E0] pt-3 flex justify-between items-center">
          <span className="text-base font-semibold tracking-wide">Total</span>
          <span className="text-lg font-bold text-[#D16A45]">
            ${total.toLocaleString("es-AR")}
          </span>
        </div>

        {senia !== null && (
          <div className="bg-white border border-[#E0E0E0] rounded-md p-3 mt-2">
            <p className="text-sm text-[#5A3E1B]">
              Deberás señar el <strong>10%</strong> para confirmar tu pedido:
            </p>
            <p className="text-lg font-bold text-[#D16A45] mt-1">
              ${senia.toLocaleString("es-AR")}
            </p>
          </div>
        )}
      </div>

      {/* Frase final */}
      <p className="text-xs italic text-[#8B4513] text-center">
        ¡Gracias por apoyar la pasta artesanal! 🍝💛
      </p>
    </div>
  );
}
