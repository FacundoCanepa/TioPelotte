"use client";

import { useCartStore } from "@/store/cart-store";
import Image from "next/image";
import { Trash2 } from "lucide-react";

const formatQuantity = (qty: number, unidad: string) => {
  const u = unidad?.trim().toLowerCase();
  if (u === "kg") return qty >= 1 ? `${qty} Kg` : `${qty * 1000} gr`;
  if (u === "unidad") return `${qty} Unidad`;
  if (u === "planchas") return `${qty} Planchas`;
  return `${qty}`;
};

export default function CheckoutProductsList() {
  const cart = useCartStore((state) => state.cart);
  const updateQuantity = useCartStore((state) => state.updateQuantity);
  const removeFromCart = useCartStore((state) => state.removeFromCart);

  const increment = (id: number, qty: number, unidad: string) => {
    const step = unidad === "kg" ? 0.25 : 1;
    updateQuantity(id, Math.round((qty + step) * 100) / 100);
  };

  const decrement = (id: number, qty: number, unidad: string) => {
    const step = unidad === "kg" ? 0.25 : 1;
    const min = step;
    if (qty > min) {
      updateQuantity(id, Math.round((qty - step) * 100) / 100);
    }
  };

  return (
    <div className="divide-y bg-[#FFF8EB] rounded-2xl border p-6  divide-[#E0E0E0]">
      {cart.map((item) => (
        <div
          key={item.product.id}
          className="py-4 flex flex-col sm:flex-row sm:items-center gap-4"
        >
          {/* Imagen */}
          <div className="w-20 h-20 relative shrink-0">
            <Image
              src={item.product.img?.[0]?.url || "/placeholder.jpg"}
              alt={item.product.productName}
              fill
              className="object-cover rounded-md"
            />
          </div>

          {/* Nombre + unidad + cantidad */}
          <div className="flex-1 w-full">
            <div className="flex justify-between items-start flex-wrap">
              <div>
                <h3 className="text-[#8B4513] font-garamond text-lg">
                  {item.product.productName}
                </h3>
                <p className="text-sm text-[#D16A45]">
                  ${item.product.price.toLocaleString("es-AR")} /{" "}
                  {item.product.unidadMedida}
                </p>
              </div>

              <div className="text-[#5A3E1B] text-base font-semibold mt-1 sm:mt-0">
                ${Math.round(item.quantity * item.product.price).toLocaleString("es-AR")}
              </div>
            </div>

            {/* Cantidad + eliminar */}
            <div className="mt-3 flex items-center gap-2 flex-wrap">
              <button
                onClick={() =>
                  decrement(item.product.id, item.quantity, item.product.unidadMedida)
                }
                className="w-8 h-8 bg-[#FFD966] text-[#5A3E1B] rounded-md hover:bg-[#f5c741] cursor-pointer"
              >
                –
              </button>
              <span className="text-sm font-medium w-14 text-center">
                {formatQuantity(item.quantity, item.product.unidadMedida)}
              </span>
              <button
                onClick={() =>
                  increment(item.product.id, item.quantity, item.product.unidadMedida)
                }
                className="w-8 h-8 bg-[#FFD966] text-[#5A3E1B] rounded-md hover:bg-[#f5c741] cursor-pointer"
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
        </div>
      ))}
    </div>
  );
}
