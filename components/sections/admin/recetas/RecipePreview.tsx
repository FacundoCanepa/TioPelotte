'use client';

import Image from 'next/image';
import { Recipe } from '@/types/recipe';
import { Clock, Users, Utensils } from 'lucide-react';

type Props = { recipe?: Recipe };

export default function RecipePreview({ recipe }: Props) {
  if (!recipe) {
    return (
      <div className="h-full flex flex-col items-center justify-center text-center p-6 bg-gray-50 rounded-lg border-2 border-dashed">
        <Utensils className="w-12 h-12 text-gray-400 mb-4"/>
        <h3 className="font-semibold text-lg text-gray-700">Vista Previa</h3>
        <p className="text-sm text-gray-500">Completa los datos del formulario para ver cómo se verá tu receta.</p>
      </div>
    );
  }

  // Renderiza el contenido de preparación como HTML si es necesario o usa `whitespace-pre-wrap`.
  const preparationContent = (recipe.preparacion || '')
    .split(/\n+/)
    .map((line, index) => <p key={index}>{line}</p>);

  return (
    <div className="bg-white rounded-xl shadow-lg overflow-hidden border">
      <div className="p-4 sm:p-6">
        <h2 className="text-2xl font-bold text-gray-800 font-garamond">{recipe.titulo || 'Título de la Receta'}</h2>
        <p className="text-gray-600 mt-2">{recipe.descripcion || 'Descripción breve de la receta.'}</p>
      </div>
      
      {recipe?.imagen?.url && (
        <div className="relative aspect-video w-full">
          <Image
            src={recipe.imagen.url}
            alt={recipe.imagen.alternativeText || recipe.titulo || 'Imagen de la receta'}
            fill
            sizes="(max-width: 768px) 100vw, 33vw"
            className="object-cover"
          />
        </div>
      )}

      <div className="p-4 sm:p-6 space-y-4">
        <div className="flex flex-wrap items-center gap-4 text-sm text-gray-700">
          {recipe.tiempo && <span className="flex items-center gap-2"><Clock size={16} /> {recipe.tiempo}</span>}
          {recipe.porciones && <span className="flex items-center gap-2"><Users size={16} /> {recipe.porciones}</span>}
        </div>

        <div className="border-t pt-4">
          <h3 className="font-semibold text-lg text-gray-800">Preparación</h3>
          <div className="prose prose-sm max-w-none text-gray-700 mt-2 space-y-2">
            {preparationContent}
          </div>
        </div>

        {recipe.productosRelacionados && recipe.productosRelacionados.length > 0 && (
          <div className="border-t pt-4">
            <h3 className="font-semibold text-lg text-gray-800">Ingredientes</h3>
            <div className="flex flex-wrap gap-2 mt-2">
                {recipe.productosRelacionados.map((prod, index) => (
                    <span key={index} className="bg-amber-100 text-amber-800 text-xs font-medium px-2.5 py-1 rounded-full">
                        {prod.productName}
                    </span>
                ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
