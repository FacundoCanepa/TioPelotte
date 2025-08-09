// components/sections/historia/HistoriaItem.tsx
"use client";

import { motion } from "framer-motion";
import HistoriaCarousel from "./HistoriaCarousel";

interface Props {
  year: string;
  title: string;
  description: string;
  note: string;
  images: string[];
  iconColor: string;
  reversed?: boolean;
}

const HistoriaItem = ({ year, title, description, note, images, iconColor, reversed = false }: Props) => {
  return (
    <motion.div
      className={`relative flex flex-col md:flex-row ${
        reversed ? "md:flex-row-reverse" : ""
      } items-center gap-10`}
      initial={{ opacity: 0, y: 30 }}
      whileInView={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5 }}
      viewport={{ once: true }}
    >
      {/* Carrusel de imagenes */}
      <div className="w-full md:w-1/2">
        <HistoriaCarousel images={images} />
      </div>

      {/* Texto */}
      <div className="w-full md:w-1/2 text-[#8B4513] space-y-4">
        <h3 className="text-2xl font-serif font-semibold">
          {year} — {title}
        </h3>
        <p className="text-gray-700 font-sans text-base leading-relaxed">
          {description}
        </p>
        <p className="text-sm italic" style={{ color: iconColor }}>{note}</p>
      </div>
    </motion.div>
  );
};

export default HistoriaItem;
