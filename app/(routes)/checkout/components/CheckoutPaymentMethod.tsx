"use client";

interface Props {
  metodoPago: "mercado pago" | "efectivo" | "Elegís al momento de pagar";
  setMetodoPago: (
    val: "mercado pago" | "efectivo" | "Elegís al momento de pagar"
  ) => void;
}

export default function CheckoutPaymentMethod({ metodoPago, setMetodoPago }: Props) {
  return (
    <div className="space-y-2">
      <label className="text-sm font-medium text-[#5A3E1B]">Método de pago</label>
      <div className="flex flex-col gap-3">
        <button
          type="button"
          onClick={() => setMetodoPago("mercado pago")}
          className={`w-full px-4 py-3 rounded-md text-sm border transition cursor-pointer text-left
            ${metodoPago === "mercado pago"
              ? "bg-[#FFD966] border-[#FFD966] text-[#5A3E1B] font-semibold shadow"
              : "bg-white border-[#E0E0E0] text-[#8B4513] hover:bg-[#fef6dd]"}`}
        >
          Pagar ahora con Mercado Pago (tarjeta, débito, QR)
        </button>

        <button
          type="button"
          onClick={() => setMetodoPago("efectivo")}
          className={`w-full px-4 py-3 rounded-md text-sm border transition cursor-pointer text-left
            ${metodoPago === "efectivo"
              ? "bg-[#FFD966] border-[#FFD966] text-[#5A3E1B] font-semibold shadow"
              : "bg-white border-[#E0E0E0] text-[#8B4513] hover:bg-[#fef6dd]"}`}
        >
          💵 Efectivo — Señá el 10% ahora y pagá el resto al retirar/recibir 
        </button>
      </div>
    </div>
  );
}