"use client";

import { useCartStore } from "@/store/cart-store";
import Image from "next/image";
import { useRouter } from "next/navigation";
import Button from "@/components/ui/Buttones";
import { Trash2 } from "lucide-react";

const formatQuantity = (qty: number, unidad: string) => {
  const u = unidad?.trim().toLowerCase();
  if (u === "kg") return qty >= 1 ? `${qty} Kg` : `${qty * 1000} gr`;
  if (u === "unidad") return `${qty} Unidad`;
  if (u === "planchas") return `${qty} Planchas`;
  return `${qty}`;
};

export default function CartPage() {
  const router = useRouter();
  const cart = useCartStore((state) => state.cart);
  const removeFromCart = useCartStore((state) => state.removeFromCart);
  const updateQuantity = useCartStore((state) => state.updateQuantity);
  const clearCart = useCartStore((state) => state.clearCart);
  const getTotalPrice = useCartStore((state) => state.getTotalPrice);

  const handleIncrement = (id: number, current: number, unidad: string) => {
    const step = unidad === "kg" ? 0.25 : 1;
    updateQuantity(id, Math.round((current + step) * 100) / 100);
  };

  const handleDecrement = (id: number, current: number, unidad: string) => {
    const step = unidad === "kg" ? 0.25 : 1;
    const min = step;
    if (current > min) {
      updateQuantity(id, Math.round((current - step) * 100) / 100);
    }
  };

  if (cart.length === 0) {
    return (
      <div className="min-h-screen py-20 px-6 text-center text-[#8B4513] ">
        <h2 className="text-3xl font-garamond italic">Tu carrito está vacío 🧺</h2>
        <Button
          onClick={() => router.push("/productos")}
          className="mt-6 bg-[#FFD966] hover:bg-[#e6c753] text-[#5A3E1B] cursor-pointer"
        >
          Ver productos
        </Button>
      </div>
    );
  }

  return (
    <div className="min-h-screen py-10 px-4 md:px-12">
      <h1 className="text-4xl font-garamond text-[#5A3E1B] mb-10 text-center">Revisá tu pedido</h1>

      <div className="space-y-6">
        {cart.map((item) => (
          <div
            key={item.product.id}
            className="bg-white/40 rounded-xl shadow-lg flex flex-col md:flex-row items-center gap-4 p-5 border border-[#E0E0E0] transition-transform hover:scale-[1.01]"
          >
            <Image
              src={item.product.img?.[0]?.url || "/placeholder.jpg"}
              alt={item.product.productName}
              width={100}
              height={100}
              className="rounded-md object-cover w-24 h-24"
            />
            <div className="flex-1 w-full">
              <h2 className="font-garamond text-lg text-[#5A3E1B]">{item.product.productName}</h2>
              <p className="text-sm text-stone-600">{item.product.descriptionCorta}</p>
              <p className="text-sm mt-1 text-[#D16A45]">
                {formatQuantity(item.quantity, item.product.unidadMedida)} × ${item.product.price.toLocaleString("es-AR")}
              </p>
              <p className="text-sm font-semibold text-[#5A3E1B] mt-1">
                Total: ${(item.quantity * item.product.price).toLocaleString("es-AR")}
              </p>
            </div>

            <div className="flex items-center gap-2">
              <button
                onClick={() => handleDecrement(item.product.id, item.quantity, item.product.unidadMedida)}
                className="bg-[#FFD966] text-[#5A3E1B] px-2 py-1 rounded font-bold hover:bg-[#f5c741] cursor-pointer"
              >
                –
              </button>
              <span className="text-sm font-medium w-14 text-center">
                {formatQuantity(item.quantity, item.product.unidadMedida)}
              </span>
              <button
                onClick={() => handleIncrement(item.product.id, item.quantity, item.product.unidadMedida)}
                className="bg-[#FFD966] text-[#5A3E1B] px-2 py-1 rounded font-bold hover:bg-[#f5c741] cursor-pointer"
              >
                +
              </button>
              <button
                onClick={() => removeFromCart(item.product.id)}
                className="ml-2 text-[#D16A45] hover:text-red-600 cursor-pointer"
                aria-label="Eliminar producto"
              >
                <Trash2 size={18} />
              </button>
            </div>
          </div>
        ))}
      </div>

      <div className="mt-12 border-t border-[#5A3E1B]  pt-6 flex flex-col items-end gap-4">
        <p className="text-lg font-semibold text-[#5A3E1B]">
          Total general: ${getTotalPrice().toLocaleString("es-AR")}
        </p>
        <div className="flex gap-3 flex-wrap justify-end">
          <Button
            onClick={clearCart}
            className="bg-red-100 text-[#5A3E1B] hover:bg-red-200 cursor-pointer"
          >
            Vaciar carrito
          </Button>
          <Button
            onClick={() => router.push("/checkout")}
            className="bg-[#FFD966] text-[#5A3E1B] hover:bg-[#6B8E23] cursor-pointer"
          >
            Finalizar compra
          </Button>
        </div>
      </div>
    </div>
  );
}
