"use client";

import { motion } from "framer-motion";
import {
  Map,
  MapPin,
  ChefHat,
  Soup,
  UtensilsCrossed,
  Locate,
  ShoppingBasket,
  Truck,
  ShoppingCart,
} from "lucide-react";
import SectionHeader from "@/components/ui/SectionHeader";
import dynamic from "next/dynamic";
const DeliveryMap = dynamic(() => import("./DeliveryMap"), { ssr: false });

const floatAnimation = {
  animate: { y: [0, -10, 0] },
   transition: {
    duration: 6,
    repeat: Infinity,
    ease: [0.42, 0, 0.58, 1] as [number, number, number, number],
  },
};

const UbicacionSection = () => {
  return (
    <section className="relative text-[#8B4513] pt-24 pb-32 px-4 md:px-10">
      {/* Fondo decorativo con íconos flotantes */}
      <div className="absolute inset-0 opacity-10 pointer-events-none z-0">
        <motion.div className="absolute top-10 left-10 rotate-12" {...floatAnimation}>
          <MapPin className="w-24 h-24" />
        </motion.div>
        <motion.div className="absolute top-1/3 right-10 -rotate-12" {...floatAnimation}>
          <Soup className="w-16 h-16" />
        </motion.div>
        <motion.div className="absolute bottom-20 left-1/4 rotate-45" {...floatAnimation}>
          <ChefHat className="w-32 h-32" />
        </motion.div>
        <motion.div className="absolute bottom-8 right-1/4 -rotate-45" {...floatAnimation}>
          <UtensilsCrossed className="w-20 h-20" />
        </motion.div>
        <motion.div className="absolute top-1/2 left-[5%] rotate-6" {...floatAnimation}>
          <Locate className="w-28 h-28" />
        </motion.div>
        <motion.div className="absolute top-[65%] right-[5%] -rotate-6" {...floatAnimation}>
          <Map className="w-24 h-24" />
        </motion.div>
        <motion.div className="absolute top-10 right-1/4 rotate-[15deg]" {...floatAnimation}>
          <ShoppingBasket className="w-20 h-20" />
        </motion.div>
        <motion.div className="absolute bottom-[20%] left-6 -rotate-[15deg]" {...floatAnimation}>
          <Truck className="w-24 h-24" />
        </motion.div>
        <motion.div className="absolute bottom-[10%] right-10 rotate-[60deg]" {...floatAnimation}>
          <ShoppingCart className="w-16 h-16" />
        </motion.div>
      </div>

      <div className="relative z-10 max-w-5xl mx-auto text-center">
        <SectionHeader
          title="Zonas de entrega"
          subtitle="Donde llegan nuestras pastas frescas"
        />

        <motion.p
          className="text-[#6B4A2C] max-w-xl mx-auto text-base md:text-lg mt-6 leading-relaxed"
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
          viewport={{ once: true }}
        >
          Podés retirarlas en nuestra fábrica ubicada en{" "}
          <strong>Av. 197 e/ 43 y 44, Olmos</strong>, o pedir desde la web
          para entrega a domicilio en zonas seleccionadas como Etcheverry, Miralagos,
          Haras del Sur, Campo de Roca y más.
        </motion.p>

        <div className="mt-16">
          <DeliveryMap />
        </div>

        {/* Bloque "Cómo llegar" */}
        <motion.div
          className="mt-12 flex flex-col md:flex-row items-center justify-center gap-4 bg-[#FBE6D4] px-6 py-5 rounded-xl shadow-md border border-[#8B4513]"
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
          viewport={{ once: true }}
        >
          <MapPin className="w-8 h-8 text-[#8B4513]" />
          <p className="text-[#6B4A2C] text-center md:text-left">
            ¿Querés venir a la fábrica? Te esperamos en{" "}
            <strong>Av. 197 e/ 43 y 44, Olmos</strong>.
          </p>
          <a
            href="https://maps.app.goo.gl/aD4s3s2MdpGxDVm26"
            target="_blank"
            rel="noopener noreferrer"
            className="bg-[#8B4513] text-white px-4 py-2 rounded-md text-sm hover:bg-[#6B4A2C] transition"
          >
            Cómo llegar
          </a>
        </motion.div>

        <motion.p
          className="text-sm italic text-[#6B4A2C] mt-6"
          initial={{ opacity: 0, y: 10 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.2 }}
          viewport={{ once: true }}
        >
          Si tu zona no figura, consultanos por WhatsApp para coordinar entregas especiales.
        </motion.p>
        <motion.div
  className="mt-4 flex justify-center"
  initial={{ opacity: 0, y: 10 }}
  whileInView={{ opacity: 1, y: 0 }}
  transition={{ duration: 0.5, delay: 0.3 }}
  viewport={{ once: true }}
>
  <a
    href="https://wa.me/5492213086600?text=Hola%20T%C3%ADo%20Pelotte%2C%20quiero%20saber%20si%20los%20pedidos%20llegan%20hasta%3A"
    target="_blank"
    rel="noopener noreferrer"
    className="inline-flex items-center gap-2 bg-green-600 hover:bg-green-700 text-white px-5 py-2 rounded-md text-sm shadow-md transition"
  >
    <svg
      xmlns="http://www.w3.org/2000/svg"
      className="h-5 w-5"
      fill="none"
      viewBox="0 0 24 24"
      stroke="currentColor"
    >
      <path
        strokeLinecap="round"
        strokeLinejoin="round"
        strokeWidth={2}
        d="M21 12.3c0-4.9-4-9-9-9s-9 4.1-9 9c0 1.6.4 3.1 1.2 4.5L3 21l4.3-1.1c1.3.8 2.8 1.2 4.4 1.2 5 0 9-4.1 9-9z"
      />
    </svg>
    Escribinos por WhatsApp
  </a>
</motion.div>

      </div>
    </section>
  );
};

export default UbicacionSection;
