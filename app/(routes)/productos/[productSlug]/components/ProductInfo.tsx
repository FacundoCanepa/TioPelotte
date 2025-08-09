"use client";

import {
  ShoppingCart,
  Info,
  Package,
  Timer,
  Users,
  Soup,
} from "lucide-react";
import { ProductType } from "@/types/product";

interface Props {
  product: ProductType;
}

const ProductInfo = ({ product }: Props) => {
  const unidad = product.unidadMedida?.trim().toLowerCase();

  return (
    <div className="space-y-6">
      <h1 className="text-4xl font-garamond font-bold text-[#8B4513] leading-tight">
        {product.productName}
      </h1>

      <div className="text-stone-700 text-base leading-relaxed space-y-2">
        {product.descriptionCorta && (
          <p className="font-semibold">{product.descriptionCorta}</p>
        )}
        <p>{product.description}</p>
      </div>

      <div className="space-y-2 text-[#6B8E23] text-sm font-medium">
        <div className="flex items-center gap-2">
          <Soup className="w-4 h-4" />
          <span>Sabor: {product.taste}</span>
        </div>
        <div className="flex items-center gap-2">
          <Package className="w-4 h-4" />
          <span>Presentación: por {unidad}</span>
        </div>
        {product.porciones && (
          <div className="flex items-center gap-2">
            <Users className="w-4 h-4" />
            <span>Porciones: {product.porciones}</span>
          </div>
        )}
        {product.tiempoEstimado && (
          <div className="flex items-center gap-2">
            <Timer className="w-4 h-4" />
            <span>Tiempo estimado: {product.tiempoEstimado}</span>
          </div>
        )}
        {product.ingredientes && product.ingredientes.length > 0 && (
          <div className="flex items-start gap-2">
            <Info className="w-4 h-4 mt-0.5" />
            <span className="text-pretty">
              Ingredientes:{" "}
              {product.ingredientes
                .map((ing) => ing.ingredienteName)
                .join(", ")}
            </span>
          </div>
        )}
      </div>

      <div className="text-3xl font-bold text-[#D16A45]">
        ${product.price.toFixed(2)}
        <span className="text-base font-normal text-stone-500 ml-1">
          / {unidad}
        </span>
      </div>

      <button className="mt-4 inline-flex items-center gap-2 px-6 py-3 bg-[#D16A45] hover:bg-[#b45733] text-white text-base font-semibold rounded-xl shadow transition-transform hover:scale-105">
        <ShoppingCart className="w-5 h-5" />
        Agregar al carrito
      </button>
    </div>
  );
};

export default ProductInfo;
