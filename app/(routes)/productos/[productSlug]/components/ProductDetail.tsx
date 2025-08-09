"use client";


import { useState } from "react";
import { ProductType } from "@/types/product";
import ProductImageCarousel from "./ProductImageCarousel";
import {
  ShoppingCart,
  Timer,
  ChefHat,
  Soup,
  Info,
  Package,
  Users,
  Minus,
  Plus,
} from "lucide-react";
import SimilarProductsCarousel from "./SimilarProductsCarousel";
import { useCartStore } from "@/store/cart-store";
import { toast } from "sonner";
import { ArrowLeft } from "lucide-react";
import Link from "next/link";

interface Props {
  product: ProductType;
}

const ProductDetail = ({ product }: Props) => {

  const addToCart = useCartStore((state) => state.addToCart);
  const unidad = product.unidadMedida?.trim().toLowerCase();
  const isKg = unidad === "kg";
  const step = isKg ? 0.25 : 1;
  const min = isKg ? 0.25 : 1;

  const [cantidad, setCantidad] = useState(min);

  const handleDecrease = () => {
    setCantidad((prev) => Math.max(prev - step, min));
  };

  const handleIncrease = () => {
    setCantidad((prev) => Number((prev + step).toFixed(2)));
  };

  const formatCantidad = () => {
    if (unidad === "kg") {
      return cantidad < 1 ? `${cantidad * 1000} gr` : `${cantidad} Kg`;
    }

    if (unidad === "unidad") {
      return `${cantidad} ${cantidad > 1 ? "Unidades" : "Unidad"}`;
    }

    if (unidad === "planchas") {
      return `${cantidad} ${cantidad > 1 ? "Planchas" : "Plancha"}`;
    }

    return `${cantidad} ${unidad}`;
  };
  const handleAddToCart = () => {
    addToCart(product, cantidad);
    toast.success(`${product.productName} agregado al carrito`, {
      duration: 2500,
      icon: "🛒",
    });
  };


  const carouselImages = product?.img_carousel ?? product?.img ?? [];

  return (
    <section className="bg-[#FBE6D4] text-[#8B4513]">
      <div className="max-w-6xl mx-auto px-6 md:px-12 py-16 grid grid-cols-1 md:grid-cols-2 gap-10 md:min-h-[500px]">
        {/* Carrusel de imágenes */}
        <ProductImageCarousel
          images={carouselImages}
          productName={product.productName}
        />

        {/* Información del producto */}
        <div className="flex flex-col justify-start gap-6 h-full">
          <h1 className="text-4xl font-garamond font-bold leading-snug">
            {product.productName}
          </h1>

          <div className="text-lg text-stone-700 leading-relaxed space-y-2">
            {product.descriptionCorta && (
              <p className="font-semibold">{product.descriptionCorta}</p>
            )}
            <p>{product.description}</p>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-[#6B8E23] font-medium text-base">
            <div className="flex items-center gap-2">
              <Soup className="w-5 h-5" />
              <span>Sabor: {product.taste}</span>
            </div>
            <div className="flex items-center gap-2">
              <Package className="w-5 h-5" />
              <span>Unidad: {unidad}</span>
            </div>
            {product?.category?.categoryNames && (
              <div className="flex items-center gap-2">
                <ChefHat className="w-5 h-5" />
                <span>Categoría: {product.category.categoryNames}</span>
              </div>
            )}
            {product?.porciones && (
              <div className="flex items-center gap-2">
                <Users className="w-5 h-5" />
                <span>Porciones: {product.porciones}</span>
              </div>
            )}
            {product?.tiempoEstimado && (
              <div className="flex items-center gap-2">
                <Timer className="w-5 h-5" />
                <span>Tiempo estimado: {product.tiempoEstimado}</span>
              </div>
            )}
            {product?.ingredientes && product.ingredientes.length > 0 && (
              <div className="sm:col-span-2 flex items-start gap-2">
                <Info className="w-5 h-5 mt-1" />
                <span className="text-pretty">
                  Ingredientes:{" "}
                  {product.ingredientes
                    .map((ing) => ing.ingredienteName)
                    .join(", ")}
                </span>
              </div>
            )}
          </div>

          {/* Precio */}
          <div className="text-3xl font-bold text-[#D16A45]">
            ${product.price.toFixed(2)}
            <span className="text-base font-normal text-stone-500 ml-1">
              / {unidad}
            </span>
          </div>

          {/* Selector de cantidad */}
          <div className="flex items-center gap-4 mt-2">
            <span className="text-[#8B4513] font-semibold">Cantidad:</span>
            <div className="flex items-center gap-2">
              <button
                onClick={handleDecrease}
                className="w-9 h-9 rounded-full bg-[#D16A45] hover:bg-[#b45733] text-white font-bold shadow flex items-center justify-center cursor-pointer transition"
              >
                <Minus className="w-4 h-4" />
              </button>

              <span className="min-w-[90px] text-center text-base font-medium text-[#8B4513]">
                {formatCantidad()}
              </span>

              <button
                onClick={handleIncrease}
                className="w-9 h-9 rounded-full bg-[#D16A45] hover:bg-[#b45733] text-white font-bold shadow flex items-center justify-center cursor-pointer transition"
              >
                <Plus className="w-4 h-4" />
              </button>
            </div>
          </div>

          {/* Botón agregar al carrito */}
     <button
            onClick={handleAddToCart}
            className="mt-4 inline-flex items-center gap-2 justify-center px-6 py-3 bg-[#D16A45] hover:bg-[#b45733] text-white text-base font-semibold rounded-xl shadow transition-transform hover:scale-105 cursor-pointer"
          >            <ShoppingCart className="w-5 h-5" />
            Agregar al carrito
          </button>
          <Link
  href="/productos"
  className="inline-flex items-center gap-2 text-sm md:text-base text-[#8B4513] font-semibold bg-[#FFD966] hover:bg-[#f5c741] px-4 py-2 rounded-xl shadow-sm transition-all w-fit"
  aria-label="Volver al listado de productos"
>
  <ArrowLeft className="w-4 h-4" />
  Volver a productos
</Link>

        </div>
      </div>

      {/* Carrusel de productos similares */}
      <SimilarProductsCarousel product={product} />
    </section>
  );
};

export default ProductDetail;
