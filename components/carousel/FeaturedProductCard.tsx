"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Image from "next/image";
import { ShoppingCart, Eye, Minus, Plus } from "lucide-react";
import { ProductType } from "@/types/product";
import { useCartStore } from "@/store/cart-store";
import { cn } from "@/lib/utils";
import { toast } from "sonner";
import { resolveStrapiMediaUrl } from "@/lib/media";

interface Props {
  product: ProductType;
}

const FeaturedProductCard = ({ product }: Props) => {
  const router = useRouter();
  const addToCart = useCartStore((state) => state.addToCart);

  const unidad = product.unidadMedida?.trim().toLowerCase() || "";
  const isByWeight = unidad === "kg";
  const step = isByWeight ? 0.25 : 1;
  const min = isByWeight ? 0.25 : 1;
  const [quantity, setQuantity] = useState<number>(min);
  const [isAdding, setIsAdding] = useState(false);

  const toFixedStep = (val: number) => Math.round(val * 100) / 100;
  const increment = () => setQuantity((prev) => toFixedStep(prev + step));
  const decrement = () =>
    setQuantity((prev) => (prev > min ? toFixedStep(prev - step) : prev));

  const formatQuantity = (qty: number) => {
    if (unidad === "kg") return qty >= 1 ? `${qty} Kg` : `${qty * 1000} gr`;
    if (unidad === "unidad")
      return `${qty} ${qty === 1 ? "Unidad" : "Unidades"}`;
    if (unidad === "planchas")
      return `${qty} ${qty === 1 ? "Plancha" : "Planchas"}`;
    return `${qty}`;
  };

  const fullImageUrl =
    resolveStrapiMediaUrl(product.img) ?? "/placeholder.jpg";

  const handleAddToCart = async () => {
    setIsAdding(true);
    try {
      addToCart(product, quantity);
            toast.success(`${product.productName} agregado al carrito`, {
        duration: 2500,
        icon: "🛒",
      });
    } finally {
      setIsAdding(false);
    }
  };

  return (
    <article className="group bg-white rounded-2xl shadow-sm hover:shadow-lg transition-all duration-300 overflow-hidden border border-[#E6D2B5]">
      <div className="relative aspect-square overflow-hidden">
        {product.isOffer && (
          <span className="absolute top-3 left-3 bg-red-500 text-white text-xs font-bold px-2 py-1 rounded-full z-10">
            OFERTA
          </span>
        )}

        <Image
          src={fullImageUrl}
          alt={product.productName}
          fill
          className="object-cover group-hover:scale-105 transition-transform duration-300"
          sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 25vw"
        />

        <div className="absolute inset-0 bg-black/0 group-hover:bg-black/20 transition-colors duration-300 flex items-center justify-center opacity-0 group-hover:opacity-100">
          <button
            onClick={() => router.push(`/productos/${product.slug}`)}
            className="bg-white/90 hover:bg-white text-[#8B4513] p-2 rounded-full shadow-lg transition-all"
            aria-label="Ver producto"
          >
            <Eye size={20} />
          </button>
        </div>
      </div>

      <div className="p-4 space-y-3">
        <div>
          <h3 className="font-garamond text-lg font-semibold text-[#8B4513] line-clamp-1">
            {product.productName}
          </h3>
          <p className="text-sm text-stone-600 line-clamp-2 mt-1">
            {product.descriptionCorta || product.description}
          </p>
        </div>

        <div className="flex items-center justify-between">
          <span className="text-xl font-bold text-[#D16A45]">
            ${product.price.toLocaleString("es-AR")}
          </span>
          {unidad && <span className="text-xs text-stone-500">por {unidad}</span>}
        </div>

        <div className="flex items-center justify-between gap-3">
          <div className="flex items-center gap-2">
            <button
              onClick={decrement}
              className="w-8 h-8 rounded-full bg-[#FFD966] hover:bg-[#F5C741] text-[#8B4513] flex items-center justify-center transition-colors"
              aria-label="Disminuir cantidad"
            >
              <Minus size={14} />
            </button>
            <span className="w-12 text-center font-medium text-sm">
              {formatQuantity(quantity)}
            </span>
            <button
              onClick={increment}
              className="w-8 h-8 rounded-full bg-[#FFD966] hover:bg-[#F5C741] text-[#8B4513] flex items-center justify-center transition-colors"
              aria-label="Aumentar cantidad"
            >
              <Plus size={14} />
            </button>
          </div>

          <button
            onClick={handleAddToCart}
            disabled={isAdding}
            className={cn(
              "flex items-center gap-2 px-4 py-2 rounded-xl font-semibold text-sm transition-all",
              isAdding
                ? "bg-gray-300 text-gray-500 cursor-not-allowed"
                : "bg-[#8B4513] hover:bg-[#6B3410] text-white"
            )}
            aria-label="Agregar al carrito"
          >
            <ShoppingCart size={16} />
            {isAdding ? "Agregando..." : "Agregar"}
          </button>
        </div>
      </div>
    </article>
  );
};

export default FeaturedProductCard;
