"use client";

import AnimatedSection from "../../ui/AnimatedWrapper";
import { useRouter } from "next/navigation";
import Button from "../../ui/Buttones";
import Image from "next/image";
import { motion } from "framer-motion";

const timeline = [
  {
    text: "Más de 30 años de tradición nos avalan.",
    image:
      `${process.env.NEXT_PUBLIC_MEDIA_URL}/photo_1676833475462_7f7c3e2c2c2f_1_765a2a1486.avif`,
    alt: "Doña Rosa preparando ravioles",
  },
  {
    text: "Desde los primeros ravioles de Doña Rosa hasta nuestras pastas frescas de hoy, cada creación está llena de amor y dedicación.",
    image:
      `${process.env.NEXT_PUBLIC_MEDIA_URL}/unnamed_6_f8038e9c38.webp`,
    alt: "Pastas frescas actuales",
  },
];

const NuestraHistoria = () => {
  const router = useRouter();

  return (
    <section
      role="region"
      aria-labelledby="historia-heading"
      className="relative overflow-hidden py-16"
    >
      {/* Imagen de fondo decorativa */}
      <Image
        src={`${process.env.NEXT_PUBLIC_MEDIA_URL}/premium_photo_1661962560564_220abc8b6bf2_f9f2261ff0.avif`}
        fill
        className="absolute inset-0 object-cover -z-20"
        alt="Decoración fondo"
      />

      {/* Capa de color encima de la imagen */}
      <div
        className="absolute inset-0 bg-[#FBE0C2] opacity-60 -z-10"
        aria-hidden="true"
      />

      {/* SVG arriba */}
      <div
        className="absolute top-0 left-0 w-full overflow-hidden leading-[0] rotate-180"
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

      {/* Contenido */}
      <AnimatedSection className="relative z-10 max-w-5xl mx-auto px-4">
        <h2
          id="historia-heading"
          className="text-center font-garamond italic text-3xl md:text-5xl text-[#8B4513] mb-12"
        >
          Nuestra Historia
        </h2>

        <ol className="relative ml-4 border-l-2 border-amber-300 space-y-12">
          {timeline.map((item, index) => (
            <motion.li
              key={index}
              initial={{ opacity: 0, y: 40 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, amount: 0.4 }}
              transition={{ duration: 0.6, delay: index * 0.2 }}
              className="pl-8 flex flex-col gap-4 md:flex-row md:items-center md:gap-8"
            >
              <div className="relative w-full md:w-56 h-40 rounded-lg overflow-hidden shadow-md">
                <Image
                  src={item.image}
                  alt={item.alt}
                  fill
                  className="object-cover"
                />
              </div>
              <p className="font-garamond italic text-sm md:text-base text-stone-700 leading-relaxed">
                {item.text}
              </p>
            </motion.li>
          ))}
        </ol>

        <div className="mt-10 text-center">
          <Button
            onClick={() => router.push("/historia")}
            variant="secondary"
            size="md"
            aria-label="Ver más sobre nuestra historia"
          >
            ver más
          </Button>
        </div>
      </AnimatedSection>

      {/* SVG abajo */}
      <div
        className="absolute bottom-0 left-0 w-full overflow-hidden leading-[0]"
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
    </section>
  );
};

export default NuestraHistoria;