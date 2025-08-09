"use client";

import useEmblaCarousel from "embla-carousel-react";
import Autoplay from "embla-carousel-autoplay";
import { useRef } from "react";
import { useRouter } from "next/navigation";
import Image from "next/image";
import Button from "@/components/ui/Buttones";
import { motion } from "framer-motion";

export const datacaroseltop = [
  {
    id: 1,
    title: "Pastas caseras todos los días",
    description: "Frescas, artesanales y con ingredientes de primera calidad.",
    href: "/productos",
    buttonLabel: "Ver productos",
    img: "/premium_photo_1661962560564_220abc8b6bf2_f9f2261ff0.avif",
    alt: "Plato de pastas frescas",
  },
  {
    id: 2,
    title: "Envíos a tu casa",
    description:
      "Realizá tu pedido online y recibilo en Abasto, Olmos, Los Hornos y Etcheverry.",
    href: "/ubicacion",
    buttonLabel: "Ver zonas",
    img: "/photo_1587314168485_3236d6710814_540f67c874.jpg",
    alt: "Caja con pastas para envío a domicilio",
  },
  {
    id: 3,
    title: "¡Conocé nuestras ofertas!",
    description:
      "Descubrí los combos y descuentos semanales. Solo en tienda online.",
    href: "/productos?ofertas=true",
    buttonLabel: "Ver descuentos",
    img: "/photo_1563599175592_c58dc214deff_c3e47ec8bb.jpg",
    alt: "Variedad de pastas en oferta",
  },
  {
    id: 4,
    title: "Nuestra historia",
    description: "Desde hace años, llevando el sabor del pueblo a tu mesa.",
    href: "/historia",
    buttonLabel: "Leer historia",
    img: "/photo_1465911817134_741b5e473a1b_732b198613.avif",
    alt: "Chef amasando pastas artesanales",
  },
];

const CaroseText = () => {
  const router = useRouter();
  const autoplay = useRef(Autoplay({ delay: 4000, stopOnInteraction: false }));
  const [emblaRef] = useEmblaCarousel(
    {
      loop: true,
      align: "start",
      dragFree: false,
    },
    [autoplay.current]
  );

  return (
    <div
      role="region"
      aria-label="Carrusel de bienvenida"
      className="w-full relative bg-[#FBE6D4] overflow-hidden"
    >
      <div className="overflow-hidden" ref={emblaRef}>
        <div className="flex">
          {datacaroseltop.map(
            ({ id, title, description, href, img, buttonLabel, alt }) => (
              <div
                key={id}
                className="shrink-0 w-full"
                aria-roledescription="slide"
              >
                <div className="relative h-[40vh] md:h-[50vh]">
                  <Image
                    src={`${process.env.NEXT_PUBLIC_MEDIA_URL}${img}`}
                    alt={alt}
                    fill
                    priority={id === 1}
                    className="object-cover"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t " />
                  <div className="absolute inset-0 bg-black/20 mix-blend-multiply" />
                  <div className="relative z-10 h-full w-full flex flex-col items-center justify-center text-center px-4 text-[#4B2E2E]">
                    <motion.h2
                      className="text-3xl md:text-5xl font-garamond italic tracking-wide mb-4"
                      initial={{ opacity: 0, y: 20 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ duration: 0.6, delay: 0.2 }}
                    >
                      {title}
                    </motion.h2>
                    <motion.p
                      className="text-base md:text-xl font-garamond italic mb-4"
                      initial={{ opacity: 0, y: 20 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ duration: 0.6, delay: 0.4 }}
                    >
                      {description}
                    </motion.p>
                    <motion.div
                      initial={{ opacity: 0, scale: 0.95 }}
                      animate={{ opacity: 1, scale: 1 }}
                      transition={{ duration: 0.4, delay: 0.6 }}
                    >
                      <Button
                        onClick={() => router.push(href)}
                        className="bg-[#6B8E23] text-white font-semibold tracking-wide mt-4 hover:bg-[#557a1b] transition-colors"
                      >
                        {buttonLabel}
                      </Button>
                    </motion.div>
                  </div>
                </div>
              </div>
            )
          )}
        </div>
      </div>

      {/* SVG ONDA ABAJO */}
      <div
        className="absolute bottom-0 left-0 w-full overflow-hidden leading-[0] pointer-events-none"
        aria-hidden="true"
      >
        <svg
          viewBox="0 0 1440 100"
          preserveAspectRatio="none"
          className="w-full h-[80px]"
        >
          <path
            fill="#FBE6D4"
            d="M0,100 C480,0 960,100 1440,0 L1440,100 L0,100 Z"
          />
        </svg>
      </div>
    </div>
  );
};

export default CaroseText;
