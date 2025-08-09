"use client";

import useEmblaCarousel from "embla-carousel-react";
import Autoplay from "embla-carousel-autoplay";
import { useRef, useEffect, useState } from "react";
import { ChevronLeft, ChevronRight } from "lucide-react";
import Image from "next/image";

interface Props {
  images: string[];
}

const HistoriaCarousel = ({ images }: Props) => {
  const autoplay = useRef(Autoplay({ delay: 4000, stopOnInteraction: false }));
  const [emblaRef, emblaApi] = useEmblaCarousel(
    {
      align: "start",
      loop: true,
      dragFree: false,
    },
    [autoplay.current]
  );

  const [canScrollPrev, setCanScrollPrev] = useState(false);
  const [canScrollNext, setCanScrollNext] = useState(false);

  useEffect(() => {
    if (!emblaApi) return;

    const updateButtons = () => {
      setCanScrollPrev(emblaApi.canScrollPrev());
      setCanScrollNext(emblaApi.canScrollNext());
    };

    emblaApi.on("select", updateButtons);
    updateButtons();
  }, [emblaApi]);

  return (
    <div className="relative">
      <div
        className="overflow-hidden rounded-3xl border border-[#e0cfc0] shadow-xl"
        ref={emblaRef}
      >
        <div className="flex">
          {images.map((img, index) => (
            <div key={index} className="min-w-full aspect-[4/3] relative">
              <Image
                src={`${process.env.NEXT_PUBLIC_MEDIA_URL}${img}`}
                alt={`Historia imagen ${index + 1}`}
                fill
                className="object-cover"
              />
            </div>
          ))}
        </div>
      </div>

      {/* Controles */}
      <button
        onClick={() => emblaApi?.scrollPrev()}
        disabled={!canScrollPrev}
        className="absolute left-2 top-1/2 -translate-y-1/2 p-2 bg-white/80 rounded-full shadow hover:bg-white cursor-pointer"
        aria-label="Anterior"
      >
        <ChevronLeft className="w-5 h-5 text-[#8B4513]" />
      </button>

      <button
        onClick={() => emblaApi?.scrollNext()}
        disabled={!canScrollNext}
        className="absolute right-2 top-1/2 -translate-y-1/2 p-2 bg-white/80 rounded-full shadow hover:bg-white cursor-pointer"
        aria-label="Siguiente"
      >
        <ChevronRight className="w-5 h-5 text-[#8B4513]" />
      </button>
    </div>
  );
};

export default HistoriaCarousel;