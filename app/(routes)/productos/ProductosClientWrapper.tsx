"use client";

import ProductosSection from "./components/ProductosSection";
import { useSearchParams } from "next/navigation";

const ProductosClientWrapper = () => {
  const searchParams = useSearchParams();
  const categoryFromUrl = searchParams.get("category") || "";

  return <ProductosSection categoryFromUrl={categoryFromUrl} />;
};

export default ProductosClientWrapper;
