import { Suspense } from "react";
import ProductosClientWrapper from "./ProductosClientWrapper";
import type { Metadata } from "next";

export async function generateMetadata(): Promise<Metadata> {
  return {
    title: "Productos artesanales – TÍO PELOTTE",
    description:
      "Descubrí nuestras pastas frescas y ofertas semanales. Comprá ravioles, sorrentinos, fideos y más.",
    openGraph: {
      title: "Productos artesanales – TÍO PELOTTE",
      description: "Comprá pastas artesanales frescas con envío a domicilio.",
      url: "https://tiopelotte.com/productos",
      siteName: "TÍO PELOTTE",
      locale: "es_AR",
      type: "website",
    },
  };
}

export default function ProductosPage() {
  return (
    <Suspense fallback={null}>
      <ProductosClientWrapper />
    </Suspense>
  );
}