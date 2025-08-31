"use client";

import Image from 'next/image';
import { Recipe } from '@/types/recipe';

type Props = { recipe?: Recipe };

export default function RecipePreview({ recipe }: Props) {
  if (!recipe) {
    return <div className="text-sm text-gray-500">Completá el formulario para ver la vista previa.</div>;
  }

  const firstParagraphs = (recipe.preparacion || '').split(/\n\n+/).slice(0, 2).join('\n\n');

  return (
    <article className="rounded-2xl bg-[#FBE6D4] p-4 shadow-sm">
      <h2 className="mb-2 text-xl font-semibold">{recipe.titulo}</h2>
      {recipe?.imagen?.url && (
        <div className="relative mb-3 aspect-[16/9] w-full overflow-hidden rounded-xl">
          {/* Using next/image for optimization; add sizes to silence warning when using fill */}
          <Image
            src={recipe.imagen.url}
            alt={recipe.imagen.alternativeText || recipe.titulo}
            fill
            sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 600px"
            className="object-cover"
          />
        </div>
      )}
      <div className="mb-3 flex gap-3 text-sm text-gray-700">
        {recipe.tiempo && <span className="rounded-full bg-white px-2 py-1 shadow">⏱ {recipe.tiempo}</span>}
        {recipe.porciones && <span className="rounded-full bg-white px-2 py-1 shadow">🍽 {recipe.porciones}</span>}
      </div>
      <p className="mb-2 text-gray-800">{recipe.descripcion}</p>
      <pre className="whitespace-pre-wrap rounded-xl bg-white/60 p-3 text-sm text-gray-800 shadow">{firstParagraphs}</pre>
    </article>
  );
}
