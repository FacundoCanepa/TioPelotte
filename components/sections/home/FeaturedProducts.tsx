"use client";

import AnimatedSection from "@/components/ui/AnimatedWrapper";
import ProductCarousel from "@/components/ui/ProductCarousel";
import SkeletonCarousel from "@/components/ui/skeletonSchema";
import { useGetFeaturedProducts } from "@/components/hooks/useGetFeaturedProducts";
import { motion } from "framer-motion";

export default function FeaturedProducts() {
  const { loading, result, error } = useGetFeaturedProducts();

  if (error) {
    return (
      <section
        role="alert"
        aria-live="assertive"
        className="py-16 px-4"
      >
        <div className="max-w-7xl mx-auto text-center">
          <p className="text-red-600">Error al cargar productos destacados</p>
        </div>
      </section>
    );
  }

  if (loading) {
    return (
      <section
        aria-busy="true"
        className="relative py-20 px-4 overflow-hidden bg-gradient-to-b "
      >
        <div className="max-w-7xl mx-auto">
          <div className="text-center mb-12">
            <h2 className="text-3xl md:text-4xl font-garamond italic text-[#8B4513]">
              Nuestros Destacados
            </h2>
            <p className="text-stone-600 mt-2">Pastas que enamoran</p>
          </div>
          <SkeletonCarousel count={4} />
        </div>
      </section>
    );
  }

  if (!result || result.length === 0) return null;

  return (
    <section
      aria-labelledby="featured-heading"
      className="relative py-20 overflow-hidden bg-gradient-to-b "
    >
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

      <AnimatedSection className="relative z-10 px-4">
        <div className="max-w-7xl mx-auto">
          <motion.div
            initial={{ opacity: 0, y: 40 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, amount: 0.4 }}
            transition={{ duration: 0.6 }}
            className="text-center mb-12"
          >
            <h2
              id="featured-heading"
              className="text-3xl md:text-5xl font-garamond italic text-[#8B4513]"
            >
              Nuestros Destacados
            </h2>
            <p className="text-stone-700 mt-3">Pastas que enamoran</p>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 50 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, amount: 0.2 }}
            transition={{ duration: 0.8 }}
          >
            <ProductCarousel products={result} />
          </motion.div>
        </div>
      </AnimatedSection>

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
}
