"use client";

import { motion } from "framer-motion";
import { useGetRecipes } from "@/components/hooks/useGetRecipes";
import Button from "@/components/ui/Buttones";
import Link from "next/link";
import { Loader } from "lucide-react";
import Image from "next/image";

const RecetasSection = () => {
  const { recipes, loading } = useGetRecipes();

  return (
    <section className="relative py-20 px-4 md:px-10 ">
      <div className="max-w-7xl mx-auto">
        <h2 className="text-center text-3xl md:text-5xl font-bold text-[#8B4513] mb-8">
          Recetas con amor
        </h2>
        <p className="text-center max-w-2xl mx-auto text-[#6B4E2F] mb-16">
          Inspirate con nuestras recetas artesanales elaboradas con productos de Tío Pelotte. ¡Fáciles, ricas y caseras!
        </p>

        {loading ? (
          <div className="flex justify-center items-center min-h-[300px]">
            <Loader className="w-10 h-10 animate-spin text-[#8B4513]" />
          </div>
        ) : (
          <div className="flex flex-col gap-16">
            {recipes.map((receta, index) => (
              <motion.div
                key={receta.id}
                className={`flex flex-col-reverse lg:flex-row ${
                  index % 2 === 0 ? "lg:flex-row" : "lg:flex-row-reverse"
                } bg-white/30 backdrop-blur-md rounded-xl shadow-md overflow-hidden`}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.6, delay: index * 0.1 }}
              >
                <div className="w-full lg:w-1/2 p-6 flex flex-col justify-center">
                  <h3 className="text-2xl md:text-3xl font-semibold text-[#8B4513] mb-4">
                    {receta.titulo}
                  </h3>
                  <p className="text-[#6B4E2F] mb-4">{receta.descripcion}</p>
                  <ul className="text-sm text-[#6B4E2F] mb-6">
                    <li><strong>Tiempo:</strong> {receta.tiempo}</li>
                    <li><strong>Porciones:</strong> {receta.porciones}</li>
                    <li>
                      <strong>Productos usados:</strong>
                      <ul className="list-disc ml-6 mt-1">
                        {receta.products.map((prod) => (
                          <li key={prod.id}>{prod.productName}</li>
                        ))}
                      </ul>
                    </li>
                  </ul>
                  <Link href={`/recetas/${receta.slug}`}>
                    <Button className="bg-[#8B4513] text-white hover:bg-[#A0522D] transition-all duration-300">
                      Ver más
                    </Button>
                  </Link>
                </div>

                <div className="w-full lg:w-1/2 relative h-[250px] sm:h-[400px]">
                  <Image
                    src={receta.img?.url || "/no-image.jpg"}
                    alt={receta.titulo}
                    fill
                    className="object-cover"
                    sizes="(max-width: 768px) 100vw, 50vw"
                  />
                </div>
              </motion.div>
            ))}
          </div>
        )}
      </div>
    </section>
  );
};

export default RecetasSection;