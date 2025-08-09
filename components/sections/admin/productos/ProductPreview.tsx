"use client";

import Image from "next/image";
import { ProductType } from "@/types/product";

export default function ProductPreview({ product }: { product: Partial<ProductType> & { img_carousel_preview?: string[] } }) {

  return (
    <div className="bg-white border border-[#E6D4C3] rounded-xl p-6 mt-6 shadow-sm space-y-4">
      <h3 className="text-2xl font-semibold text-[#8B4513] font-garamond">Vista previa</h3>

      <div className="flex flex-col md:flex-row gap-6">
        {product.img_carousel_preview?.[0] && (
          <div className="flex-shrink-0 w-full md:w-52">
              <Image
                src={product.img_carousel_preview[0]}
                alt={product.productName || "Producto sin nombre"}
                width={300}
                height={300}
                className="rounded-lg object-cover w-full h-40"
              />
          </div>
        )}

        <div className="space-y-2 text-sm text-[#5A3E1B] w-full">
          <p><span className="font-bold">Nombre:</span> {product.productName}</p>
          <p><span className="font-bold">Sabor:</span> {product.taste}</p>
          <p><span className="font-bold">Descripción corta:</span> {product.descriptionCorta}</p>
          <p><span className="font-bold">Precio:</span> ${product.price}</p>
          <p><span className="font-bold">Stock:</span> {product.stock} ({product.unidadMedida})</p>
          <p><span className="font-bold">Porciones:</span> {product.porciones}</p>
          <p><span className="font-bold">Tiempo estimado:</span> {product.tiempoEstimado}</p>
          <p><span className="font-bold">Descripción completa:</span> {product.description}</p>
        </div>
      </div>
         {product.img_carousel_preview && product.img_carousel_preview.length > 0 && (
        <div className="flex gap-2 flex-wrap pt-4">
            {product.img_carousel_preview.map((src, idx) => (
              <Image
                key={idx}
                src={src}
                alt={`${product.productName || "Producto sin nombre"}-${idx}`}
                width={80}
                height={80}
                className="h-20 w-20 object-cover rounded"
              />
            ))}
        </div>
      )}
    </div>
  );
}
