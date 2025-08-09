"use client";

import { useEffect, useState } from "react";
import { RecetaType } from "@/types/receta";
import { motion } from "framer-motion";
import Image from "next/image";
import Link from "next/link";
import { Loader2, AlertCircle } from "lucide-react";

type Props = {
  slug: string;
};

export default function RecipeDetail({ slug }: Props) {
  const [receta, setReceta] = useState<RecetaType | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    const fetchReceta = async () => {
      try {
        const res = await fetch(
          `${process.env.NEXT_PUBLIC_BACKEND_URL}/api/recetas?filters[slug][$eq]=${slug}&populate[img]=true&populate[products][populate]=img`
        );
        const json = await res.json();
        const data = json.data?.[0];

        if (!data) {
          setError("No se encontró la receta.");
          return;
        }

        const attrs = data;
        setReceta({
          id: data.id,
          titulo: attrs.titulo,
          slug: attrs.slug,
          descripcion: attrs.descripcion,
          tiempo: attrs.tiempo,
          porciones: attrs.porciones,
          preparacion: attrs.preparacion,
          img: attrs.img || null,
            products:
              attrs.products?.map((prod: any) => ({
                id: prod.id,
                productName: prod.productName,
                slug: prod.slug,
                price: Number(prod.price),
                img: prod.img || [],
              })) || [],

        });
      } catch (err) {
        setError("Error al obtener los datos de la receta.");
      } finally {
        setLoading(false);
      }
    };

    fetchReceta();
  }, [slug]);

  if (loading)
    return (
      <div className="flex justify-center items-center h-[60vh]">
        <Loader2 className="h-10 w-10 animate-spin text-[#8B4513]" />
      </div>
    );

  if (error || !receta)
    return (
      <div className="flex flex-col justify-center items-center h-[60vh] text-center px-6">
        <AlertCircle className="h-10 w-10 mb-4 text-red-500" />
        <p className="text-xl font-semibold text-[#8B4513]">
          {error || "Receta no encontrada"}
        </p>
      </div>
    );

  return (
    <section className="px-6 py-16 lg:px-32 max-w-screen-xl mx-auto text-[#5C3D2E]">
      <motion.h1
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6 }}
        className="text-4xl sm:text-5xl font-extrabold mb-6 text-center tracking-tight"
      >
        {receta.titulo}
      </motion.h1>

      <div className="grid lg:grid-cols-2 gap-10 items-center mb-14">
        {receta.img?.url && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.3, duration: 0.5 }}
            className="relative h-[300px] w-full rounded-xl overflow-hidden shadow-xl"
          >
            <Image
              src={receta.img.url}
              alt={receta.titulo}
              fill
              className="object-cover object-center"
            />
          </motion.div>
        )}

        <div className="space-y-4">
          <p className="text-lg sm:text-xl leading-relaxed italic text-[#6B4E2F]">
            {receta.descripcion}
          </p>
          <div className="flex flex-wrap gap-6 mt-4 text-[#8B4513] text-base font-medium">
            <span>
              ⏱ <strong>Tiempo:</strong> {receta.tiempo}
            </span>
            <span>
              🍽 <strong>Porciones:</strong> {receta.porciones}
            </span>
          </div>
        </div>
      </div>

      {receta.preparacion && (
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
          className="bg-[#FFF3E0] border-l-4 border-[#D16A45] px-6 py-10 sm:px-10 sm:py-12 rounded-2xl shadow-inner mb-16"
        >
          <h2 className="text-2xl sm:text-3xl font-bold mb-6 text-[#8B4513]">
            🧑‍🍳 Preparación paso a paso
          </h2>
          <p className="whitespace-pre-line leading-8 text-lg tracking-wide">
            {receta.preparacion}
          </p>
        </motion.div>
      )}

      {receta.products.length > 0 && (
        <div className="mt-10">
          <h3 className="text-2xl sm:text-3xl font-bold text-center mb-10 text-[#8B4513]">
            Productos usados en esta receta
          </h3>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-8">
            {receta.products.map((product) => (
              <Link
                key={product.id}
                href={`/productos/${product.slug}`}
                className="group rounded-2xl shadow-xl transition duration-300 overflow-hidden bg-[#FFF4E8] border border-[#F0D6C0] hover:shadow-2xl"
              >
                {product.img[0]?.url && (
                  <div className="relative h-44 w-full overflow-hidden">
                    <Image
                      src={product.img[0].url}
                      alt={product.productName}
                      fill
                      className="object-cover group-hover:scale-105 transition-transform duration-300"
                    />
                  </div>
                )}
                <div className="p-4 text-center">
                  <p className="text-lg font-semibold text-[#8B4513] group-hover:text-[#D16A45] transition">
                    {product.productName}
                  </p>
                  {product.price !== undefined && (
                    <p className="text-sm text-[#5C3D2E] mt-1">
                      ${product.price.toLocaleString("es-AR")}
                    </p>
                  )}
                </div>
              </Link>
            ))}
          </div>
        </div>
      )}

      <div className="mt-20 text-center">
        <Link
          href="/recetas"
          className="inline-block text-[#8B4513] underline hover:text-[#D16A45] transition"
        >
          ← Volver a recetas
        </Link>
      </div>
    </section>
  );
}
