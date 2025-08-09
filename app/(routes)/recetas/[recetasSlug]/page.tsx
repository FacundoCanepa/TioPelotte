import RecipeDetail from "./components/RecipeDetail";

export const metadata = {
  title: "Receta artesanal | TÍO PELOTTE",
  description: "Una receta deliciosa hecha con ingredientes frescos y amor artesanal.",
  openGraph: {
    title: "Receta artesanal | TÍO PELOTTE",
    description: "Disfrutá de nuestras recetas clásicas y caseras. Hechas con pasión.",
    type: "article",
    images: [
      {
        url: "https://tiopelotte.ar/opengraph-recetas.jpg",
        width: 1200,
        height: 630,
        alt: "Receta artesanal de TÍO PELOTTE",
      },
    ],
  },
};

export default async function Page({
  params,
}: {
  params: Promise<{ recetasSlug: string }>;
}) {
  const { recetasSlug } = await params;

  return <RecipeDetail slug={recetasSlug} />;
}
