"use client";

import SkeletonCategory from "../../ui/SkeletonCategory";
import { useGetCategory } from "@/components/hooks/useGetCategory";
import { ResponseType } from "@/types/response";
import type { Category } from "@/types/category";
import { useState } from "react";
import { useRouter } from "next/navigation";
import Image from "next/image";

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
    <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
      <h2 className="text-center font-garamond text-[4vh] md:text-[6vh] sm:pb-1 italic tracking-wide">
        ¿Qué te gustaría disfrutar hoy?
      </h2>
      <p className="text-center text-lg font-garamond italic text-stone-600 mb-2 border-b-2 border-dashed border-black/50 md:border-0">
        Descubrí nuestras especialidades frescas y artesanales.
      </p>

      <div className="flex overflow-x-auto rounded-xl h-[400px] lg:h-[400px]">
        {loading ? (
          <SkeletonCategory />
        ) : (
          result &&
          result.map((category: Category) => {
            const isExpandedMobile = expandedId === String(category.id);

            return (
              <div
                key={category.id}
                onClick={() => handleClick(String(category.id), category.slug)}
                className={`
                  group relative flex-shrink-0 cursor-pointer
                  overflow-hidden 
                  transition-all duration-500 ease-in-out
                  ${isExpandedMobile ? "flex-[3]" : "flex-[1]"}
                  lg:flex-[1] lg:hover:flex-[3]
                  w-[280px] lg:w-auto
                `}
              >
                <Image
                  src={`${category.mainImage.url}`}
                  alt={category.categoryNames}
                  fill
                  className="absolute inset-0 object-cover scale-110 group-hover:scale-100 transition-transform duration-500"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-black/50 to-transparent z-10" />
                <div
                  className="
                    absolute bottom-6 left-1/2 transform -translate-x-1/2 z-20
                    bg-white/10 text-white px-5 py-2 rounded-lg
                    text-xl font-garamond italic tracking-wide shadow-md
                    backdrop-blur-sm transition-all duration-500
                    group-hover:text-2xl
                  "
                >
                  {category.categoryNames}
                </div>
              </div>
            );
          })
        )}
      </div>
    </div>
  );
};

export default CategoryHome;