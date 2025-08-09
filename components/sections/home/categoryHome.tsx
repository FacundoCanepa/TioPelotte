"use client";

import { motion } from "framer-motion";
import Image from "next/image";
import { useState } from "react";
import { useRouter } from "next/navigation";
import SkeletonCategory from "../../ui/SkeletonCategory";
import SectionHeader from "../../ui/SectionHeader";
import { useGetCategory } from "@/components/hooks/useGetCategory";
import type { Category } from "@/types/category";
import { ResponseType } from "@/types/response";

const CategoryHome = () => {
  const { loading, result } = useGetCategory() as ResponseType;
  const [expandedId, setExpandedId] = useState<string | null>(null);
  const router = useRouter();

  const handleClick = (categoryId: string, slug: string) => {
    if (window.innerWidth < 1024) {
      if (expandedId === categoryId) {
        router.push(`/productos?category=${slug}`);
      } else {
        setExpandedId(categoryId);
      }
    } else {
      router.push(`/productos?category=${slug}`);
    }
  };

  return (
    <section className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
      <SectionHeader
        title="¿Qué te gustaría disfrutar hoy?"
        subtitle="Descubrí nuestras especialidades frescas y artesanales."
      />

      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {loading ? (
          <SkeletonCategory />
        ) : (
          result &&
          result.map((category: Category) => {
            const isExpanded = expandedId === String(category.id);

            return (
              <motion.div
                key={category.id}
                layout
                whileHover={{ scale: 1.02 }}
                onClick={() => handleClick(String(category.id), category.slug)}
                className="group relative h-56 w-full cursor-pointer overflow-hidden rounded-lg shadow-sm"
                role="button"
                aria-label={`Ver productos de ${category.categoryNames}`}
                aria-expanded={isExpanded}
              >
                <Image
                  src={`${category.mainImage.url}`}
                  alt={category.categoryNames}
                  fill
                  sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 33vw"
                  className="object-cover transition-transform duration-500 group-hover:scale-105"
                />
                <motion.div
                  className="absolute inset-0 flex items-end justify-center bg-black/40 p-4 opacity-0 transition-opacity group-hover:opacity-100"
                  animate={{ opacity: isExpanded ? 1 : 0 }}
                >
                  <span className="text-white text-lg md:text-xl font-garamond italic tracking-wide">
                    {category.categoryNames}
                  </span>
                </motion.div>
                {!isExpanded && (
                  <span className="absolute inset-x-0 bottom-4 pointer-events-none text-center text-white text-lg font-garamond italic drop-shadow-lg">
                    {category.categoryNames}
                  </span>
                )}
              </motion.div>
            );
          })
        )}
      </div>
    </section>
  );
};

export default CategoryHome;