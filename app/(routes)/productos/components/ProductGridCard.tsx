"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";
import { ProductType } from "@/types/product";
import { Card, CardContent } from "@/components/ui/card";
import Button from "@/components/ui/Buttones";
import { useCartStore } from "@/store/cart-store";
import Image from "next/image";
import { toast } from "sonner";
import { resolveStrapiMediaUrl } from "@/lib/media";

interface Props {
  product: ProductType;
}

const ProductGridCard = ({ product }: Props) => {
  const router = useRouter();
  const addToCart = useCartStore((state) => state.addToCart);


  const unidad = product.unidadMedida?.trim().toLowerCase() || "";
  const isByWeight = unidad === "kg";
  const step = isByWeight ? 0.25 : 1;
  const min = isByWeight ? 0.25 : 1;

  const [quantity, setQuantity] = useState<number>(min);

  const toFixedStep = (val: number) => Math.round(val * 100) / 100;

  const increment = () => setQuantity((prev) => toFixedStep(prev + step));
  const decrement = () =>
    setQuantity((prev) => (prev > min ? toFixedStep(prev - step) : prev));

const formatQuantity = (qty: number) => {
  if (unidad === "unidad") {
    return `${qty} ${qty === 1 ? "Unidad" : "Unidades"}`;
  }

  if (unidad === "planchas") {
    return `${qty} ${qty === 1 ? "Plancha" : "Planchas"}`;
  }

  if (unidad === "kg") {
    if (qty < 1) {
      const gramos = qty * 1000;
      return `${gramos} gr`;
    }
    return `${qty} kg`;
  }

  return `${qty}`;
};


  const displayUnit =
    unidad === "kg"
      ? " /kg"
      : unidad === "unidad"
      ? " /unidad"
      : unidad === "planchas"
      ? " /planchas"
      : "";

  return (
    <Card className="bg-[#FFF4E3] border-none rounded-2xl shadow-sm overflow-visible hover:shadow-md transition-all duration-300 flex flex-col h-auto md:h-auto">
      <CardContent className="flex flex-col flex-1 p-4 gap-3">
        <div className="relative rounded-xl aspect-[4/3] w-full overflow-hidden">
          {product.isOffer && (
            <span className="absolute top-2 left-2 bg-[#FFD966] text-[#8B4513] text-[11px] font-bold px-2 py-1 rounded-full shadow z-10">
              OFERTA
            </span>
          )}
          <Image
            src={resolveStrapiMediaUrl(product.img) ?? "/placeholder.jpg"}
            alt={product.productName}
            fill
            className="object-cover object-center hover:scale-105 transition-transform duration-500"
            sizes="(max-width: 768px) 100vw, (max-width: 1200px) 33vw, 25vw"
          />
        </div>

        <div className="flex flex-col flex-1 gap-2 mt-4">
          <div className="flex flex-col gap-1">
            <h3 className="line-clamp-1 text-lg font-garamond italic text-[#8B4513]">
              {product.productName}
            </h3>

            <p className="text-sm text-stone-600 line-clamp-2">
              {product.description}
            </p>

            <span className="text-[#D16A45] font-semibold text-base">
              ${product.price.toLocaleString("es-AR")}
              <span className="text-sm text-stone-500">{displayUnit}</span>
            </span>
          </div>

          <div className="mt-auto">
            <div className="grid grid-cols-[auto_1fr_auto] items-center gap-3 md:gap-4">
              <div className="flex items-center gap-2">
                <button
                  onClick={decrement}
                  aria-label="Restar cantidad"
                  className="cursor-pointer min-w-[2rem] px-2 py-1 rounded bg-[#FFD966] text-[#8B4513] font-bold hover:bg-[#f5c741]"
                >
                  –
                </button>
                <span className="text-sm font-medium w-20 text-center">
                  {formatQuantity(quantity)}
                </span>
                <button
                  onClick={increment}
                  aria-label="Sumar cantidad"
                  className="cursor-pointer min-w-[2rem] px-2 py-1 rounded bg-[#FFD966] text-[#8B4513] font-bold hover:bg-[#f5c741]"
                >
                  +
                </button>
              </div>

              <span className="text-xs text-stone-500 text-center">
                {unidad || ""}
              </span>

              <Button
                onClick={() => {
                  addToCart(product, quantity);
                  toast.success(`${product.productName} agregado al carrito`, {
                    duration: 2500,
                    icon: "🛒",
                  });
                }}
                className="bg-[#FFD966] text-[#8B4513] hover:bg-[#6B8E23]"
              >
                Añadir
              </Button>
            </div>
          </div>

          <Button
            onClick={() => router.push(`/productos/${product.slug}`)}
            variant="outline"
            className="border border-[#8B4513] text-[#8B4513] hover:bg-[#FFD966] mt-1"
          >
            Ver más
          </Button>
        </div>
      </CardContent>
    </Card>
  );
};

export default ProductGridCard;
