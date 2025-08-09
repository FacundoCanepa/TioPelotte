"use client";

import { useCartStore } from "@/store/cart-store";
import { useUserStore } from "@/store/user-store";
import { zonas } from "@/app/(routes)/ubicacion/components/zonas";
import type { ItemType } from "@/types/item";

interface Props {
  total: number;
}

export default function MercadoPagoButton({ total }: Props) {
  const tipoPago = useCartStore((state) => state.tipoPago);

  const handleClick = async () => {
    try {
      const cartStore = useCartStore.getState();
      const userId = useUserStore.getState().user?.id;

      const items: ItemType[] = cartStore.cart.map((item) => ({
        title: `${item.product.productName} · ${item.quantity} ${item.product.unidadMedida}`,
        quantity: 1,
        unit_price: Math.round(item.quantity * item.product.price),
        productName: item.product.productName,
      }));


      if (cartStore.tipoEntrega === "domicilio" && cartStore.zona) {
        const zonaSeleccionada = zonas.find((z) => z.nombre === cartStore.zona);
        if (zonaSeleccionada) {
          const costoEnvio = parseInt(zonaSeleccionada.precio.replace(/[$.]/g, ""));
          items.push({
            title: "Envío a domicilio",
            quantity: 1 ,
            unit_price: costoEnvio,
            productName: undefined ,
          });
        }
      }

      const body = {
        items,
        tipoEntrega: cartStore.tipoEntrega,
        zona: cartStore.zona,
        direccion: cartStore.direccion,
        referencias: cartStore.referencias,
        tipoPago: cartStore.tipoPago,
        total: total,
        nombre: cartStore.nombre,
        telefono: cartStore.telefono,
        userId,
      };

      const res = await fetch("/api/mercadopago", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(body),
      });

      const data = await res.json();
      if (data?.url) {
        window.location.href = data.url;
      } else {
        alert("Error al generar pago");
      }
    } catch (err) {
    }
  };

  return (
    <button
      type="button"
      onClick={handleClick}
      className="mt-4 bg-[#2ecc71] hover:bg-[#27ae60] text-white w-full py-2 rounded-md"
    >
      Ir a pagar
    </button>
  );
}
