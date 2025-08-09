"use client";

import useEmblaCarousel from "embla-carousel-react";
import { ChevronLeft, ChevronRight } from "lucide-react";
import { useCallback, useEffect, useState } from "react";
import type { ProductType } from "@/types/product";
import SimilarProductCard from "@/app/(routes)/productos/[productSlug]/components/SimilarProductCard";

interface Props {
  products: ProductType[];
}

const SimilarProductCarouselWrapper = ({ products }: Props) => {
  const [emblaRef, emblaApi] = useEmblaCarousel(
    {
      align: "start",
      slidesToScroll: 1,
      containScroll: "trimSnaps",
      dragFree: false,
      loop: true,
    },
    []
  );

  const scrollPrev = useCallback(() => emblaApi?.scrollPrev(), [emblaApi]);
  const scrollNext = useCallback(() => emblaApi?.scrollNext(), [emblaApi]);

  const [showButtons, setShowButtons] = useState(false);

  useEffect(() => {
    if (products.length > 4) {
      setShowButtons(true);
    }
  }, [products]);

  return (
    <div className="relative px-2 sm:px-4 md:px-8">
      <div className="overflow-hidden" ref={emblaRef}>
        <div className="flex">
          {products.map((product) => (
            <div
              key={product.id}
                className="shrink-0 w-full sm:w-1/2 lg:w-1/3 2xl:basis-[20%] px-2"
            >
              <SimilarProductCard product={product} />
            </div>
          ))}
        </div>
      </div>

      {showButtons && (
        <>
          <button
            onClick={scrollPrev}
            aria-label="Anterior"
            className="cursor-pointer hidden lg:flex absolute left-[calc(-4rem)] top-1/2 -translate-y-1/2 z-30 bg-white p-2 rounded-full shadow hover:bg-[#6B8E23] hover:text-white transition"
          >
            <ChevronLeft size={24} />
          </button>

          <button
            onClick={scrollNext}
            aria-label="Siguiente"
            className="cursor-pointer hidden lg:flex absolute right-[calc(-4rem)] top-1/2 -translate-y-1/2 z-30 bg-white p-2 rounded-full shadow hover:bg-[#6B8E23] hover:text-white transition"
          >
            <ChevronRight size={24} />
          </button>
        </>
      )}
    </div>
  );
};

export default SimilarProductCarouselWrapper;
