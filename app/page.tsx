import type { Metadata } from "next";
import Home from "@/components/sections/Home";

export async function generateMetadata(): Promise<Metadata> {
  return {
    title: "TÍO PELOTTE – Pastas frescas artesanales en La Plata",
    description:
      "Fábrica artesanal de pastas frescas. Ravioles, sorrentinos, fideos, postres y más. Envíos a domicilio en zona sur de La Plata.",
    openGraph: {
      title: "TÍO PELOTTE – Pastas frescas artesanales en La Plata",
      description:
        "Conocé nuestros productos destacados: ravioles, sorrentinos, ñoquis, postres y más. Entregas en Abasto, Los Hornos, Olmos y alrededores.",
      url: "https://tiopelotte.com",
      siteName: "TÍO PELOTTE",
      locale: "es_AR",
      type: "website",
      images: [
        {
          url: "https://loved-ducks-790a0f88b6.media.strapiapp.com/favicon_c2f46db7cc.ico", 
          width: 1200,
          height: 630,
          alt: "Pastas artesanales TÍO PELOTTE",
        },
      ],
    },
    twitter: {
      card: "summary_large_image",
      title: "TÍO PELOTTE – Pastas artesanales",
      description:
        "Descubrí nuestras pastas frescas y ofertas semanales. Ravioles, sorrentinos, fideos y mucho más.",
      images: ["https://loved-ducks-790a0f88b6.media.strapiapp.com/favicon_c2f46db7cc.ico"], 
    },
  };
}

export default function Page() {
  return <Home />;
}
