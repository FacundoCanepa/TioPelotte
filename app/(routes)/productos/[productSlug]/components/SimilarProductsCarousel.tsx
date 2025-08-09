"use client";

import { useGetSimilarProducts } from "@/components/hooks/useSimilarProducts";
import { ProductType } from "@/types/product";
import SimilarProductCarouselWrapper from "./SimilarProductCarouselWrapper";
import { Sparkles, ChevronLeft, ChevronRight } from "lucide-react";

interface Props {
  product: ProductType;
}

const SimilarProductsCarousel = ({ product }: Props) => {
  const categorySlug = product?.category?.slug ?? "";
  const productId = product?.id;

  const { similarProducts, loading, error } = useGetSimilarProducts({
    categorySlug,
    excludeProductId: productId,
  });

  if (loading)
    return (
      <p className="text-center text-[#8B4513]">Cargando productos similares...</p>
    );
  if (error)
    return <p className="text-center text-red-600">Error: {error}</p>;
  if (!similarProducts?.length)
    return (
      <p className="text-center text-[#8B4513]">No hay productos similares.</p>
    );

  return (
    <section className="w-full max-w-[90rem] mx-auto py-12 px-4">
      <div className="text-center mb-6">
        <h3 className="font-garamond text-3xl md:text-5xl italic text-[#8B4513] flex items-center justify-center gap-2">
          <Sparkles className="w-6 h-6 text-[#FFD966]" />
          También te pueden gustar
        </h3>
      </div>

      {/* Carrusel */}
      <SimilarProductCarouselWrapper products={similarProducts} />

      {/* Indicador visual mobile: deslizar */}
      <div className="sm:hidden flex items-center justify-center gap-2 mt-6 animate-pulse">
        <ChevronLeft className="w-6 h-6 text-[#8B4513]" />
        <span className="text-base font-semibold text-[#8B4513]">
          Deslizá para ver más productos
        </span>
        <ChevronRight className="w-6 h-6 text-[#8B4513]" />
      </div>
    </section>
  );
};

export default SimilarProductsCarousel;
