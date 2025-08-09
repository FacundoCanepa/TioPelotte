"use client";

import { useState, useEffect, useRef } from "react";
import { ChevronLeft, ChevronRight } from "lucide-react";
import Image from "next/image";

interface Image {
  id: number;
  url: string;
  alternativeText?: string;
}

interface Props {
  images: Image[];
  productName: string;
}

const ProductImageCarousel = ({ images, productName }: Props) => {
  const [currentIndex, setCurrentIndex] = useState(0);
  const [isPaused, setIsPaused] = useState(false);
  const timeoutRef = useRef<NodeJS.Timeout | null>(null);

  const next = () => {
    setCurrentIndex((prev) => (prev + 1) % images.length);
  };

  const prev = () => {
    setCurrentIndex((prev) => (prev - 1 + images.length) % images.length);
  };

  useEffect(() => {
    if (isPaused) return;

    timeoutRef.current = setTimeout(() => {
      next();
    }, 4000);

    return () => {
      if (timeoutRef.current) clearTimeout(timeoutRef.current);
    };
  }, [currentIndex, isPaused]);

  const slideStyle = {
    transform: `translateX(-${currentIndex * 100}%)`,
    transition: "transform 0.5s ease-in-out",
  };

  return (
    <div
      className="w-full space-y-4"
      onMouseEnter={() => setIsPaused(true)}
      onMouseLeave={() => setIsPaused(false)}
    >
      <div
        className="relative w-full aspect-[4/3] p-[6px] rounded-[28px] bg-[#FBE6D4]"
        style={{
          backgroundImage:
            "radial-gradient(circle, #8B4513 0%, #8B4513 30%, #FBE6D4 100%)",
        }}
      >
        <div className="rounded-[20px] overflow-hidden w-full h-full bg-[#FBE6D4] shadow-md">
          <div className="flex h-full" style={slideStyle}>
            {images.map((img) => (
              <Image
                key={img.id}
                src={img.url}
                alt={img.alternativeText || productName}
                width={800}
                height={800}
                className="w-full h-full flex-shrink-0 object-cover object-center"
              />
            ))}
          </div>

          <button
            onClick={prev}
            className="absolute top-1/2 left-3 transform -translate-y-1/2 bg-white/70 backdrop-blur-sm rounded-full p-2 shadow hover:scale-110 transition cursor-pointer z-20"
          >
            <ChevronLeft className="w-5 h-5 text-[#8B4513]" />
          </button>
          <button
            onClick={next}
            className="absolute top-1/2 right-3 transform -translate-y-1/2 bg-white/70 backdrop-blur-sm rounded-full p-2 shadow hover:scale-110 transition cursor-pointer z-20"
          >
            <ChevronRight className="w-5 h-5 text-[#8B4513]" />
          </button>
        </div>
      </div>

      <div className="flex gap-2 overflow-x-auto overflow-y-hidden">
        {images.map((img, index) => (
          <button
            key={img.id}
            onClick={() => setCurrentIndex(index)}
            className={`w-16 h-16 rounded-lg overflow-hidden border-2 transition-transform cursor-pointer hover:scale-105 hover:border-[#D16A45] ${
              currentIndex === index
                ? "border-[#D16A45]"
                : "border-transparent"
            }`}
          >
            <Image
              src={img.url}
              alt={img.alternativeText || productName}
              width={64}
              height={64}
              className="w-full h-full object-cover"
            />
          </button>
        ))}
      </div>
    </div>
  );
};

export default ProductImageCarousel;
