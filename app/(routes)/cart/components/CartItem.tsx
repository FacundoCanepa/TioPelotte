"use client";

import Image from "next/image";
import { Trash2 } from "lucide-react";
import { resolveStrapiMediaUrl } from "@/lib/media";
import { useCartStore } from "@/store/cart-store";
import type { CartItem as CartItemType } from "@/store/cart-store";

interface Props {
 item: CartItemType;
}

const formatQuantity = (qty: number, unidad: string) => {
  const u = unidad?.trim().toLowerCase();
  if (u === "kg") return qty >= 1 ? `${qty} Kg` : `${qty * 1000} gr`;
  if (u === "unidad") return `${qty} Unidad`;
  if (u === "planchas") return `${qty} Planchas`;
  return `${qty}`;
};

export default function CartItem({ item }: Props) {
  const removeFromCart = useCartStore((state) => state.removeFromCart);
  const updateQuantity = useCartStore((state) => state.updateQuantity);

  const handleIncrement = () => {
    const step = item.product.unidadMedida === "kg" ? 0.25 : 1;
    updateQuantity(item.product.id, Math.round((item.quantity + step) * 100) / 100);
  };

  const handleDecrement = () => {
    const step = item.product.unidadMedida === "kg" ? 0.25 : 1;
    const min = step;
    if (item.quantity > min) {
      updateQuantity(item.product.id, Math.round((item.quantity - step) * 100) / 100);
    }
  };

  const imageUrl = resolveStrapiMediaUrl(item.product.img) ?? "/placeholder.jpg";

  return (
    <div className="bg-[#FFF4E3] rounded-xl p-4 flex flex-col md:flex-row items-center gap-4 shadow-sm">
      <Image
        src={imageUrl}
        alt={item.product.productName}
        width={100}
        height={100}
        className="rounded-lg object-cover w-24 h-24"
      />
      <div className="flex-1">
        <h2 className="font-garamond text-lg text-[#8B4513]">{item.product.productName}</h2>
        <p className="text-sm text-stone-600">{item.product.descriptionCorta}</p>
        <p className="text-sm mt-1 text-[#D16A45]">
          {formatQuantity(item.quantity, item.product.unidadMedida)} × ${item.product.price.toLocaleString("es-AR")}
        </p>
        <p className="text-sm font-semibold text-[#8B4513] mt-1">
          Total: ${(item.quantity * item.product.price).toLocaleString("es-AR")}
        </p>
      </div>
      <div className="flex items-center gap-2">
        <button
          onClick={handleDecrement}
          className="bg-[#FFD966] text-[#8B4513] px-2 py-1 rounded font-bold hover:bg-[#f5c741]"
        >
          –
        </button>
        <span className="text-sm font-medium w-14 text-center">
          {formatQuantity(item.quantity, item.product.unidadMedida)}
        </span>
        <button
          onClick={handleIncrement}
          className="bg-[#FFD966] text-[#8B4513] px-2 py-1 rounded font-bold hover:bg-[#f5c741]"
        >
          +
        </button>
        <button
          onClick={() => removeFromCart(item.product.id)}
          className="ml-2 text-[#D16A45] hover:text-red-600"
          aria-label="Eliminar producto"
        >
          <Trash2 size={18} />
        </button>
      </div>
    </div>
  );
} 
