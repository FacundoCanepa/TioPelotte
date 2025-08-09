"use client";

import { useParams } from "next/navigation";
import { useGetProductBySlug } from "@/components/hooks/useGetProductBySlug";
import ProductDetail from "./components/ProductDetail";

export default function Page() {
  const { productSlug } = useParams();
  const { product, loading, error } = useGetProductBySlug(productSlug as string);

  if (loading) {
    return (
      <section className="min-h-screen flex items-center justify-center bg-[#FBE6D4] text-[#8B4513]">
        <div className="text-xl font-semibold animate-pulse">Cargando producto...</div>
      </section>
    );
  }

  if (error) {
    return (
      <section className="min-h-screen flex items-center justify-center bg-[#FBE6D4] text-red-600">
        <div className="text-xl font-semibold">Error: {error}</div>
      </section>
    );
  }

  if (!product) {
    return (
      <section className="min-h-screen flex items-center justify-center bg-[#FBE6D4] text-[#8B4513]">
        <div className="text-xl font-semibold">Producto no encontrado</div>
      </section>
    );
  }

  return <ProductDetail product={product} />;
}
