// components/sections/historia/HistoriaIntro.tsx
"use client";

import { Heart, Sparkles, Soup, UtensilsCrossed } from "lucide-react";
import { motion } from "framer-motion";

const HistoriaIntro = () => {
  return (
    <section className="relative bg-[#FFDBB5] text-[#8B4513] pt-24 pb-40 px-6 overflow-hidden">
      {/* Imagen de fondo con textura artesanal */}
      <div
        className="absolute inset-0 z-0 bg-cover bg-center opacity-10 mix-blend-multiply filter sepia"
        style={{ backgroundImage: `url(${process.env.NEXT_PUBLIC_MEDIA_URL}/photo_1465911817134_741b5e473a1b_732b198613.avif)` }}
      />

      {/* SVG superior animado más suave */}
      <motion.svg
        className="absolute top-0 left-0 w-full h-24 text-[#FBE6D4]"
        viewBox="0 0 1440 320"
        fill="currentColor"
        preserveAspectRatio="none"
        xmlns="http://www.w3.org/2000/svg"
        animate={{ y: [0, -2, 0] }}
        transition={{ repeat: Infinity, duration: 10, ease: "easeInOut" }}
      >
        <path d="M0,32 C240,160 960,-40 1440,128 L1440,0 L0,0 Z" />
      </motion.svg>

      <div className="relative z-10 max-w-4xl mx-auto text-center space-y-8">
        <h2 className="text-3xl md:text-4xl font-serif font-semibold flex justify-center items-center gap-3">
          <span className="inline-flex items-center justify-center w-10 h-10 rounded-full bg-[#8B4513]/10">
            <Heart className="w-5 h-5 text-[#8B4513]" />
          </span>
          Mucho más que pastas
        </h2>

        <p className="text-base md:text-lg leading-relaxed font-sans text-[#5c3b1e]">
          Desde una cocina familiar, con harina en las manos y la receta escrita a mano, <br />
          nació el sueño de TÍO PELOTTE. Un proyecto que creció con amor, tradición y aroma a salsa recién hecha.
        </p>

        <div className="flex justify-center gap-6 md:gap-8 text-sm md:text-base flex-wrap max-w-xl mx-auto">
          {[
            { icon: <Heart className="w-4 h-4" />, label: "Hecho con amor" },
            { icon: <Sparkles className="w-4 h-4" />, label: "Recetas de familia" },
            { icon: <Soup className="w-4 h-4" />, label: "Sabores reales" },
            { icon: <UtensilsCrossed className="w-4 h-4" />, label: "Cocina de pueblo" },
          ].map(({ icon, label }, index) => (
            <div
              key={index}
              className="flex items-center gap-2 px-3 py-2 rounded-xl bg-[#FBE6D4] shadow"
            >
              <span className="inline-flex w-8 h-8 rounded-full bg-white items-center justify-center shadow-sm">
                {icon}
              </span>
              {label}
            </div>
          ))}
        </div>
      </div>

      {/* SVG inferior animado más suave */}
      <motion.svg
        className="absolute bottom-0 left-0 w-full h-40 text-[#FBE6D4]"
        viewBox="0 0 1440 320"
        fill="currentColor"
        preserveAspectRatio="none"
        xmlns="http://www.w3.org/2000/svg"
        animate={{ y: [0, 2, 0] }}
        transition={{ repeat: Infinity, duration: 10, ease: "easeInOut" }}
      >
        <path d="M0,224 C360,320 1080,160 1440,240 L1440,320 L0,320 Z" />
      </motion.svg>
    </section>
  );
};

export default HistoriaIntro;
