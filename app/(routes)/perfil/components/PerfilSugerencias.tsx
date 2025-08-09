"use client";

import { useGetOfferProducts } from "@/components/hooks/useGetOfertProducts";
import ProductCarouselSection from "@/components/sections/home/product-carousel/ProductCarouselSection";
import { useUserStore } from "@/store/user-store";

export default function PerfilSugerencias() {
  const products = useGetOfferProducts();
  const user = useUserStore((state) => state.user);

  const username = user?.username?.split(" ")[0] || "¡Hola!";

  return (
    <div className="relative">
      <ProductCarouselSection
        title={` ${username}, estas ofertas son para vos`}
        subtitle="Productos seleccionados con amor para tu próxima comida 🍝"
        buttonText="Ver todos los productos"
        buttonHref="/productos"
        products={products}
      />

      <p className="md:hidden text-sm text-center text-[#8B4513] mt-2 animate-pulse">
        👉 Deslizá para ver más
      </p>
    </div>
  );
}
