"use client";

import { useEffect, useState } from "react";
import { useSearchParams } from "next/navigation";
import { useCartStore } from "@/store/cart-store";
import { toast } from "sonner";

export function useConfirmPedido() {
  const searchParams = useSearchParams();
  const payment_id = searchParams.get("payment_id");
  const clearCart = useCartStore((state) => state.clearCart);

  const [estado, setEstado] = useState("Confirmando tu pedido...");

  useEffect(() => {
    toast.success("¡Tu pedido fue realizado con éxito!");

    const crearPedido = async () => {
      if (!payment_id) return;

      const res = await fetch("/api/verificar-pago", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ payment_id }),
      });

      const data = await res.json();
      if (data.status === "ok") {
        setEstado("¡Pedido confirmado! 🎉 Gracias por tu compra.");
        clearCart();
      } else {
        setEstado("Ocurrió un problema al confirmar tu pedido.");
      }
    };

    crearPedido();
  }, [payment_id]);

  return { estado };
}
