// app/(routes)/recetas/page.tsx
import { Metadata } from "next";
import RecetasSection from "./components/RecetasSection";

export const metadata: Metadata = {
  title: "Recetas Artesanales | TÍO PELOTTE",
  description: "Descubrí recetas con nuestras pastas frescas artesanales. Ñoquis, ravioles, canelones y más, con todo el sabor de TÍO PELOTTE.",
  openGraph: {
    title: "Recetas Artesanales | TÍO PELOTTE",
    description: "Recetas con nuestros productos frescos. Preparaciones simples, caseras y llenas de sabor.",
    url: "https://tu-dominio.com/recetas",
    siteName: "TÍO PELOTTE",
    type: "website",
    images: [
      {
        url: "https://tu-dominio.com/opengraph-recetas.jpg",
        width: 1200,
        height: 630,
        alt: "Platos con pastas artesanales de TÍO PELOTTE",
      },
    ],
  },
};

export default function RecetasPage() {
  return <RecetasSection />;
}
