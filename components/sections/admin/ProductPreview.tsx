"use client";
import Image from "next/image";
import type { ProductType } from "@/types/product";

interface Props {
  product: Partial<ProductType> & { imgPreview?: string | null };
}

export default function ProductPreview({ product }: Props) {
  return (
    <div className="bg-white p-4 rounded-xl shadow space-y-2">
      {product.imgPreview && (
        <Image
          src={product.imgPreview}
          alt={product.productName || "imagen"}
          width={300}
          height={300}
          className="w-full h-40 object-cover rounded"
        />
      )}
      <h3 className="font-semibold text-[#5A3E1B] text-lg">
        {product.productName || "Nuevo producto"}
      </h3>
      {product.descriptionCorta && (
        <p className="text-sm text-gray-600">{product.descriptionCorta}</p>
      )}
      {product.price !== undefined && (
        <p className="text-[#8B4513] font-semibold">
          ${product.price?.toLocaleString("es-AR")}
        </p>
      )}
    </div>
  );
}