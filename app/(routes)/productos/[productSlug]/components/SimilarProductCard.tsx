"use client";

import { ProductType } from "@/types/product";
import Image from "next/image";
import Link from "next/link";

const SimilarProductCard = ({ product }: { product: ProductType }) => {
  const img = product.img?.[0]?.url || "/placeholder.jpg";

  return (
    <div className="group bg-[#FFF4E8] border border-[#F0D6C0] rounded-2xl shadow-sm overflow-hidden transition hover:shadow-lg hover:scale-[1.02] flex flex-col h-full w-[250px] mx-auto relative">
      {/* Etiqueta Oferta */}
      {product.isOffer && (
        <div className="absolute top-2 left-2 bg-[#D16A45] text-white text-xs px-2 py-1 rounded-full shadow z-10">
          Oferta
        </div>
      )}

      {/* Imagen */}
      <div className="w-full h-40 relative">
        <Image
          src={img}
          alt={product.productName}
          fill
          className="object-cover rounded-t-2xl"
        />
      </div>

      {/* Info */}
      <div className="flex flex-col flex-grow items-center justify-between p-4 text-center gap-2">
        <div>
          <h3 className="text-lg font-garamond italic text-[#8B4513] mb-1">
            {product.productName}
          </h3>
          <p className="text-sm text-[#6B8E23] line-clamp-2">
            {product.descriptionCorta}
          </p>
        </div>

        <div className="text-[#8B4513] font-semibold text-base">
          ${product.price}
        </div>

        <Link
          href={`/productos/${product.slug}`}
          className="mt-2 text-sm px-4 py-2 bg-[#FFD966] text-[#8B4513] rounded-full hover:bg-[#f0c94b] transition font-semibold"
        >
          Ver producto
        </Link>
      </div>
    </div>
  );
};

export default SimilarProductCard;
