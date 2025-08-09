"use client";

import { useCartStore } from "@/store/cart-store";
import { useRouter } from "next/navigation";
import Button from "@/components/ui/Buttones";

export default function CartSummary() {
  const getTotalPrice = useCartStore((state) => state.getTotalPrice);
  const clearCart = useCartStore((state) => state.clearCart);
  const router = useRouter();

  return (
    <div className="mt-10 border-t pt-6 flex flex-col items-end gap-4">
      <p className="text-lg font-semibold text-[#8B4513]">
        Total general: ${getTotalPrice().toLocaleString("es-AR")}
      </p>
      <div className="flex gap-3 flex-wrap justify-end">
        <Button onClick={clearCart} className="bg-red-200 text-[#8B4513] hover:bg-red-300">
          Vaciar carrito
        </Button>
        <Button
          onClick={() => router.push("/checkout")}
          className="bg-[#FFD966] text-[#8B4513] hover:bg-[#6B8E23]"
        >
          Finalizar compra
        </Button>
      </div>
    </div>
  );
}
