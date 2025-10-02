'use client';

import { useEffect, useMemo, useState } from 'react';
import { useRecipesStore } from '@/store/admin/recipes-store';
import { Recipe, RecipeCreateInput } from '@/types/recipe';
import { slugifyEs } from '@/utils/slug';
import { searchProducts, ProductLite } from '@/lib/admin/recipes-api';
import { toast } from 'sonner';
import UploadImageMain from '@/components/ui/upload/UploadImageMain';
import { useImageUpload } from '@/components/sections/admin/productos/hooks/useImageUpload';
import { toMediaURL } from '@/utils/media';
import { Check, ChevronLeft, Loader2 } from 'lucide-react';

type Props = { onClose?: () => void };

export default function RecipeForm({ onClose }: Props) {
  const { selectedRecipe, createRecipe, updateRecipe, setSelectedRecipe, loading: recipeLoading } = useRecipesStore();
  const editing = !!selectedRecipe?.documentId;

  const [titulo, setTitulo] = useState(selectedRecipe?.titulo ?? '');
  const [slug, setSlug] = useState(selectedRecipe?.slug ?? '');
  const [slugEdited, setSlugEdited] = useState(false);
  const [descripcion, setDescripcion] = useState(selectedRecipe?.descripcion ?? '');
  const [preparacion, setPreparacion] = useState(selectedRecipe?.preparacion ?? '');
  const [tiempo, setTiempo] = useState(selectedRecipe?.tiempo ?? '');
  const [porciones, setPorciones] = useState(selectedRecipe?.porciones ?? '');
  const [published, setPublished] = useState(!!selectedRecipe?.publishedAt);
  const [imagen, setImagen] = useState<{ id: number } | null>(null);
  const [imagenPreview, setImagenPreview] = useState<string>(toMediaURL(selectedRecipe?.imagen?.url || ''));
  const { uploadImages, loading: uploading } = useImageUpload();

  const [productQuery, setProductQuery] = useState('');
  const [productOptions, setProductOptions] = useState<ProductLite[]>([]);
  const [productLoading, setProductLoading] = useState(false);
  const [productosRelacionados, setProductosRelacionados] = useState<{
    documentId: string;
    productName: string;
    slug: string;
  }[]>(selectedRecipe?.productosRelacionados || []);

  useEffect(() => {
    if (!slugEdited) setSlug(slugifyEs(titulo));
  }, [titulo, slugEdited]);

  useEffect(() => {
    let alive = true;
    setProductLoading(true);
    searchProducts(productQuery)
      .then((items) => alive && setProductOptions(items))
      .finally(() => alive && setProductLoading(false));
    return () => { alive = false; };
  }, [productQuery]);

  const availableProductOptions = useMemo(() => 
    productOptions.filter(p => !productosRelacionados.some(x => x.documentId === p.documentId)),
    [productOptions, productosRelacionados]
  );

  const canSave = useMemo(() => 
    titulo.trim().length > 0 && descripcion.trim().length > 0 && preparacion.trim().length > 0,
    [titulo, descripcion, preparacion]
  );

  const onSubmit = async () => {
    if (!canSave) {
      toast.error('Completa los campos obligatorios: título, descripción y preparación.');
      return;
    }
    
    const payload: RecipeCreateInput = {
      titulo: titulo.trim(),
      slug: slug.trim(),
      descripcion: descripcion.trim(),
      preparacion: preparacion.trim(),
      tiempo: tiempo.trim(),
      porciones: porciones.trim(),
      published,
      imagenId: imagen?.id,
      productosRelacionados: productosRelacionados.map(p => ({ documentId: p.documentId })),
    } as RecipeCreateInput;

    try {
      let newRecipe: Recipe;
      if (editing && selectedRecipe?.documentId) {
        newRecipe = await updateRecipe(selectedRecipe.documentId, payload);
        toast.success('Receta actualizada correctamente');
      } else {
        newRecipe = await createRecipe(payload);
        toast.success('Receta creada con éxito');
      }
      setSelectedRecipe(newRecipe);
      onClose?.();
    } catch (e: any) {
      console.error(e);
      toast.error('Error al guardar la receta. Revisa los datos e intenta de nuevo.');
    }
  };

  const inputStyles = "w-full rounded-lg border bg-white px-3 py-2 text-sm shadow-sm focus:border-amber-600 focus:outline-none focus:ring-2 focus:ring-amber-600/40 min-h-[44px]";
  const labelStyles = "block text-sm font-medium text-gray-700 mb-1";

  return (
    <div className="bg-white p-4 sm:p-6 rounded-xl shadow-sm border space-y-6">
      <div className="flex items-center justify-between">
        <h2 className="text-xl font-semibold text-gray-800">{editing ? 'Editar Receta' : 'Nueva Receta'}</h2>
        <button onClick={onClose} className="text-sm text-gray-600 hover:text-gray-800 flex items-center gap-1"><ChevronLeft size={16}/> Volver</button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div className="md:col-span-2">
          <label htmlFor="titulo" className={labelStyles}>Título*</label>
          <input id="titulo" value={titulo} onChange={(e) => setTitulo(e.target.value)} className={inputStyles} placeholder="Ej: Tarta de manzana" />
        </div>
        <div className="md:col-span-2">
          <label htmlFor="slug" className={labelStyles}>Slug</label>
          <input id="slug" value={slug} onChange={(e) => { setSlug(e.target.value); setSlugEdited(true); }} className={inputStyles} placeholder="tarta-de-manzana" />
        </div>
      </div>

      <div>
        <label className={labelStyles}>Imagen Principal</label>
        <UploadImageMain
          value={imagen}
          preview={imagenPreview}
          uploadImages={async (files) => {
            const { ids, urls } = await uploadImages(files);
            if (ids?.[0] && urls?.[0]) {
              setImagen(ids[0]);
              setImagenPreview(urls[0]);
            }
            return { ids, urls };
          }}
          onChange={(val, prev) => {
            setImagen(val);
            setImagenPreview(prev);
          }}
          loading={uploading}
        />
      </div>

      <div>
        <label htmlFor="descripcion" className={labelStyles}>Descripción*</label>
        <textarea id="descripcion" value={descripcion} onChange={(e) => setDescripcion(e.target.value)} className={inputStyles} rows={3} placeholder="Un resumen delicioso de esta receta..." />
      </div>

      <div>
        <label htmlFor="preparacion" className={labelStyles}>Preparación*</label>
        <textarea id="preparacion" value={preparacion} onChange={(e) => setPreparacion(e.target.value)} className={inputStyles} rows={8} placeholder="1. Precalentar el horno...\n2. Mezclar los ingredientes..." />
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <div>
          <label htmlFor="tiempo" className={labelStyles}>Tiempo</label>
          <input id="tiempo" value={tiempo} onChange={(e) => setTiempo(e.target.value)} placeholder="50 min" className={inputStyles} />
        </div>
        <div>
          <label htmlFor="porciones" className={labelStyles}>Porciones</label>
          <input id="porciones" value={porciones} onChange={(e) => setPorciones(e.target.value)} placeholder="4 pers." className={inputStyles} />
        </div>
        <div className="flex items-end pb-2">
          <div className="flex items-center gap-2">
            <input id="published" type="checkbox" checked={published} onChange={(e) => setPublished(e.target.checked)} className="h-4 w-4 rounded" />
            <label htmlFor="published" className="text-sm text-gray-700">Publicar</label>
          </div>
        </div>
      </div>

      <div>
        <label className={labelStyles}>Ingredientes / Productos Relacionados</label>
        <div className="space-y-3">
            <input
              value={productQuery}
              onChange={(e) => setProductQuery(e.target.value)}
              placeholder="Buscar producto..."
              className={inputStyles}
            />
            {productLoading && <p className="text-sm text-gray-500">Buscando...</p>}
            <div className="max-h-[120px] overflow-auto flex flex-wrap gap-2">
              {availableProductOptions.map(p => (
                  <button key={p.documentId} onClick={() => { setProductosRelacionados([...productosRelacionados, p]); setProductQuery(''); }} className="text-xs bg-gray-100 text-gray-700 px-2 py-1 rounded-full hover:bg-gray-200">
                      + {p.productName}
                  </button>
              ))}
            </div>

          <div className="flex flex-wrap gap-2 pt-2 border-t mt-2">
            {productosRelacionados.map(p => (
              <div key={p.documentId} className="flex items-center justify-between bg-amber-100 text-amber-800 px-2 py-1 rounded-full text-sm">
                <span>{p.productName}</span>
                <button onClick={() => setProductosRelacionados(productosRelacionados.filter(x => x.documentId !== p.documentId))} className="ml-2 text-xs hover:text-red-600">x</button>
              </div>
            ))}
            {productosRelacionados.length === 0 && <p className="text-sm text-gray-400">No hay ingredientes asignados.</p>}
          </div>
        </div>
      </div>

      <div className="flex items-center justify-end gap-3 pt-4 border-t">
        <button onClick={onClose} className="px-4 py-2 rounded-lg border bg-white shadow-sm hover:bg-gray-50 text-sm">Cancelar</button>
        <button
          onClick={onSubmit}
          disabled={!canSave || recipeLoading}
          className="inline-flex items-center justify-center rounded-lg bg-amber-600 px-6 py-2 text-sm font-semibold text-white shadow-sm hover:bg-amber-700 disabled:opacity-50 min-h-[44px]"
        >
          {recipeLoading ? <Loader2 className="animate-spin h-5 w-5" /> : (editing ? 'Guardar Cambios' : 'Crear Receta')}
        </button>
      </div>
    </div>
  );
}
