"use client";

import { useGetOfferProducts } from "@/components/hooks/useGetOfertProducts";
import { useGetDessertProducts } from "@/components/hooks/useGetDessertProducts";

import CaroseText from "@/components/sections/shared/caroseText";
import FeaturedProducts from "@/components/sections/home/FeaturedProducts";
import ProductCarouselSection from "@/components/sections/home/product-carousel/ProductCarouselSection";
import NuestraHistoria from "@/components/sections/home/nuestraHistoria";
import Ubicacion from "@/components/sections/home/ubicacion";
import CommentsUser from "@/components/sections/home/commentsUsers";
import CategoryHome from "@/components/sections/home/categoryHome";
import RedesSociales from "@/components/sections/home/redesSociales";

export default function Home() {
  const offerProducts = useGetOfferProducts();
  const dessertProducts = useGetDessertProducts();

  return (
    <>
      <CaroseText />

      <FeaturedProducts />

      <NuestraHistoria />

      <ProductCarouselSection
        title="Dulzura artesanal"
        subtitle="Los más tentadores"
        products={dessertProducts}
      />

      <Ubicacion />

      <ProductCarouselSection
        title="Ofertas semanales"
        subtitle="Aprovechá estas promos"
        products={offerProducts}
      />

      <CommentsUser />
      <CategoryHome />
      <RedesSociales />
    </>
  );
}