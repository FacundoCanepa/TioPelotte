"use client";

interface Props {
  tipoEntrega: "domicilio" | "local" | null;
  setTipoEntrega: (val: "domicilio" | "local") => void;
}

export default function CheckoutDeliverySelector({ tipoEntrega, setTipoEntrega }: Props) {
  return (
    <div className="space-y-2">
      <label className="text-sm font-medium text-[#5A3E1B]">
        Método de entrega
      </label>

      <div className="flex gap-4">
        <button
          type="button"
          onClick={() => setTipoEntrega("domicilio")}
          className={`flex-1 px-4 py-2 rounded-md text-sm border transition 
            ${
              tipoEntrega === "domicilio"
                ? "bg-[#FFD966] border-[#FFD966] text-[#5A3E1B] font-semibold shadow"
                : "bg-white border-[#E0E0E0] text-[#8B4513] hover:bg-[#fef6dd]"
            } cursor-pointer`}
        >
          Entrega a domicilio
        </button>

        <button
          type="button"
          onClick={() => setTipoEntrega("local")}
          className={`flex-1 px-4 py-2 rounded-md text-sm border transition 
            ${
              tipoEntrega === "local"
                ? "bg-[#FFD966] border-[#FFD966] text-[#5A3E1B] font-semibold shadow"
                : "bg-white border-[#E0E0E0] text-[#8B4513] hover:bg-[#fef6dd]"
            } cursor-pointer`}
        >
          Retiro en el local
        </button>
      </div>
    </div>
  );
}
