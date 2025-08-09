"use client";

import { googleReviews } from "@/types/comments";
import { Star } from "lucide-react";
import AnimatedSection from "../../ui/AnimatedWrapper";
import Image from "next/image";
import { motion } from "framer-motion";

const CommentsUser = () => {
  return (
  <section
    role="region"
    aria-labelledby="testimonios-heading"
    className="relative overflow-hidden py-16 bg-[#FFF4E3]"
  >
    {/* SVG decorativo arriba */}
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

    {/* Contenido con animación */}
    <AnimatedSection className="relative z-10 max-w-6xl mx-auto px-4">
      <h2
        id="testimonios-heading"
        className="text-center text-3xl md:text-4xl font-garamond italic text-stone-800 mb-12"
      >
        Opiniones de nuestros clientes
      </h2>

      <ul role="list" className="grid gap-8 md:grid-cols-2 lg:grid-cols-3">
        {googleReviews.map((review, index) => (
          <motion.li
            key={index}
            role="article"
            aria-label={`Testimonio de ${review.name}`}
            initial={{ opacity: 0, y: 40 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, amount: 0.3 }}
            transition={{ duration: 0.5, delay: index * 0.1 }}
            className="bg-white/80 backdrop-blur-sm rounded-2xl shadow-md hover:shadow-lg transition-shadow p-6 flex flex-col"
          >
            <div className="flex items-center gap-4 mb-4">
              <Image
                src={`${process.env.NEXT_PUBLIC_MEDIA_URL}${review.avatar}`}
                alt={`Foto de ${review.name}`}
                width={64}
                height={64}
                className="w-16 h-16 rounded-full object-cover border border-stone-300"
              />
              <div>
                <p className="font-semibold text-stone-700">{review.name}</p>
                <span className="text-xs text-stone-500">{review.date}</span>
              </div>
            </div>
            <div
              className="flex items-center gap-1 mb-3"
              aria-label={`Calificación: ${review.rating} de 5 estrellas`}
            >
              {Array.from({ length: review.rating }).map((_, i) => (
                <Star
                  key={i}
                  size={16}
                  fill="#facc15"
                  stroke="#facc15"
                  aria-hidden="true"
                />
              ))}
            </div>
            <p className="text-sm md:text-base text-stone-700 italic flex-1">
              &quot;{review.comment}&quot;
            </p>
          </motion.li>
        ))}
      </ul>
    </AnimatedSection>

    {/* SVG decorativo abajo */}
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
)
};

export default CommentsUser;