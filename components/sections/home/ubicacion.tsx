"use client";

import AnimatedSection from "../../ui/AnimatedWrapper";
import Button from "../../ui/Buttones";
import { useRouter } from "next/navigation";
import Image from "next/image";
import { MapPin, Clock, Truck, LucideIcon } from "lucide-react";
import { motion } from "framer-motion";

type InfoItem = {
  icon: LucideIcon;
  label: string;
  content: React.ReactNode;
};

const Ubicacion = () => {
  const router = useRouter();

  const info: InfoItem[] = [
    {
      icon: MapPin,
      label: "Dirección",
      content: "Calle 197 y 44, La Plata, Buenos Aires.",
    },
    {
      icon: Truck,
      label: "Zona de entregas",
      content: "La Plata y alrededores.",
    },
    {
      icon: Clock,
      label: "Horarios",
      content: (
        <>
          Martes a Sábados: 8:30 a 13:00 hs y 16:30 a 20:30 hs
          <br />
          Domingos: 8:30 a 13:00 hs
          <br />
          Lunes: cerrado <em>(excepto los días 29)</em>
        </>
      ),
    },
  ];

  return (
    <AnimatedSection className="relative py-16 overflow-hidden">
      <Image
        src={`${process.env.NEXT_PUBLIC_MEDIA_URL}/Screenshot_9_a42d7f50b2.png`}
        fill
        className="absolute inset-0 object-cover -z-20"
        alt="Fondo decorativo cálido"
      />

      <div className="absolute inset-0 bg-[#FBE0C2] opacity-60 -z-10" />

      <div className="absolute top-0 left-0 w-full overflow-hidden leading-[0] rotate-180">
        <svg
          viewBox="0 0 1440 100"
          preserveAspectRatio="none"
          className="w-full h-[80px]"
        >
          <path fill="#FBE6D4" d="M0,100 C480,0 960,100 1440,0 L1440,100 L0,100 Z" />
        </svg>
      </div>

      <section
        aria-labelledby="ubicacion-heading"
        className="relative z-10 px-4"
      >
        <div className="max-w-6xl mx-auto grid md:grid-cols-2 gap-10 items-center">
          <motion.div
            initial={{ opacity: 0, y: 40 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, amount: 0.3 }}
            transition={{ duration: 0.6 }}
            className="space-y-6 text-center md:text-left md:bg-white/20 md:shadow-md md:p-10 md:rounded-lg md:backdrop-blur-sm"
          >
            <h2
              id="ubicacion-heading"
              className="font-garamond italic text-3xl md:text-5xl tracking-wide"
            >
              Nuestra ubicación
            </h2>

            <div className="space-y-5 text-stone-700 font-garamond italic text-sm md:text-base leading-relaxed">
              {info.map(({ icon: Icon, label, content }) => (
                <div
                  key={label}
                  className="flex items-start gap-3 justify-center md:justify-start"
                >
                  <Icon
                    className="w-5 h-5 text-stone-800 mt-1"
                    aria-hidden="true"
                  />
                  <p>
                    <strong>{label}:</strong> {content}
                  </p>
                </div>
              ))}
            </div>

            <Button
              className="mt-4"
              onClick={() => router.push("/ubicacion")}
              aria-label="Cómo llegar"
            >
              Cómo llegar
            </Button>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            whileInView={{ opacity: 1, scale: 1 }}
            viewport={{ once: true, amount: 0.3 }}
            transition={{ duration: 0.6, delay: 0.2 }}
            className="w-full h-[300px] md:h-[400px] flex justify-center"
          >
            <iframe
              title="Mapa de ubicación de Tío Pelotte"
              src="https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d1943.441186044965!2d-58.04923693284867!3d-34.99505193558028!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x95a2c2ff1e9727d7%3A0x221e187cd7ad3b9d!2sT%C3%ADo%20Pelotte%20(La%20pasta%20de%20mi%20pueblo)!5e0!3m2!1ses!2sar!4v1747165963286!5m2!1ses!2sar"
              className="rounded-xl shadow-lg w-full h-full"
              style={{ border: 0 }}
              allowFullScreen
              loading="lazy"
              referrerPolicy="no-referrer-when-downgrade"
            />
          </motion.div>
        </div>
      </section>

      <div className="absolute bottom-0 left-0 w-full overflow-hidden leading-[0]">
        <svg
          viewBox="0 0 1440 100"
          preserveAspectRatio="none"
          className="w-full h-[80px]"
        >
          <path fill="#FBE6D4" d="M0,100 C480,0 960,100 1440,0 L1440,100 L0,100 Z" />
        </svg>
      </div>
    </AnimatedSection>
  );
};

export default Ubicacion;