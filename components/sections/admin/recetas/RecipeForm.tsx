"use client";

import { useEffect, useMemo, useState } from 'react';
import { useRecipesStore } from '@/store/admin/recipes-store';
import { Recipe, RecipeCreateInput } from '@/types/recipe';
import { slugifyEs } from '@/utils/slug';
import { searchProducts, ProductLite } from '@/lib/admin/recipes-api';
import { toast } from 'sonner';
import UploadImageMain from '@/components/ui/upload/UploadImageMain';
import { useImageUpload } from '@/components/sections/admin/productos/hooks/useImageUpload';
import { toMediaURL } from '@/utils/media';

type Props = { onClose?: () => void };

export default function RecipeForm({ onClose }: Props) {
  const { selectedRecipe, createRecipe, updateRecipe, setSelectedRecipe } = useRecipesStore();
  const editing = !!selectedRecipe?.documentId;

  const [titulo, setTitulo] = useState(selectedRecipe?.titulo ?? '');
  const [slug, setSlug] = useState(selectedRecipe?.slug ?? '');
  const [slugEdited, setSlugEdited] = useState(false);
  const [descripcion, setDescripcion] = useState(selectedRecipe?.descripcion ?? '');
  const [preparacion, setPreparacion] = useState(selectedRecipe?.preparacion ?? '');
  const [tiempo, setTiempo] = useState(selectedRecipe?.tiempo ?? '');
  const [porciones, setPorciones] = useState(selectedRecipe?.porciones ?? '');
  const [published, setPublished] = useState(!!selectedRecipe?.publishedAt);
  // Campo legacy (ID manual) oculto en UI; mantenido para compatibilidad
  const [imagenId, setImagenId] = useState<number | undefined>(undefined);
  // Imagen (upload)
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
    // Si el query está vacío, traemos los primeros productos para sugerir
    searchProducts(productQuery)
      .then((items) => alive && setProductOptions(items))
      .finally(() => alive && setProductLoading(false));
    return () => {
      alive = false;
    };
  }, [productQuery, productosRelacionados]);

  const availableProductOptions = useMemo(() =>
    productOptions.filter((p) => !productosRelacionados.some((x) => x.documentId === p.documentId)),
    [productOptions, productosRelacionados]
  );

  const canSave = useMemo(() => {
    return titulo.trim().length > 0 && descripcion.trim().length > 0 && preparacion.trim().length > 0;
  }, [titulo, descripcion, preparacion]);

  const onSubmit = async () => {
    if (!canSave) {
      toast.error('Completá los campos obligatorios');
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
      productosRelacionados: productosRelacionados.map((p) => ({ documentId: p.documentId })),
    } as RecipeCreateInput;

    try {
      if (editing && selectedRecipe?.documentId) {
        const r = await updateRecipe(selectedRecipe.documentId, payload);
        toast.success('Receta actualizada');
        setSelectedRecipe(r);
      } else {
        const r = await createRecipe(payload);
        toast.success('Receta creada');
        setSelectedRecipe(r);
      }
      onClose?.();
    } catch (e: any) {
      console.error(e);
      toast.error('Ocurrió un error al guardar');
    }
  };

  const onCancel = () => {
    onClose?.();
  };

  return (
    <div className="space-y-3">
      <div className="grid grid-cols-1 gap-3 md:grid-cols-2">
        <div>
          <label htmlFor="titulo" className="block text-sm font-medium">Título*</label>
          <input
            id="titulo"
            aria-label="Título de la receta"
            value={titulo}
            onChange={(e) => setTitulo(e.target.value)}
            className="mt-1 w-full rounded-xl border border-gray-300 bg-white px-3 py-2 shadow-sm focus:border-amber-600 focus:outline-none"
            placeholder="Ej: Tarta de manzana"
          />
        </div>
        <div>
          <label htmlFor="slug" className="block text-sm font-medium">Slug</label>
          <input
            id="slug"
            aria-label="Slug de la receta"
            value={slug}
            onChange={(e) => { setSlug(e.target.value); setSlugEdited(true); }}
            className="mt-1 w-full rounded-xl border border-gray-300 bg-white px-3 py-2 shadow-sm focus:border-amber-600 focus:outline-none"
            placeholder="tarta-de-manzana"
          />
        </div>
      </div>

      <div>
        <div className="mb-1 text-sm font-medium">Imagen principal</div>
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
        <label htmlFor="descripcion" className="block text-sm font-medium">Descripción*</label>
        <textarea
          id="descripcion"
          aria-label="Descripción breve"
          value={descripcion}
          onChange={(e) => setDescripcion(e.target.value)}
          className="mt-1 w-full rounded-xl border border-gray-300 bg-white px-3 py-2 shadow-sm focus:border-amber-600 focus:outline-none"
          rows={3}
          placeholder="Breve resumen de la receta"
        />
      </div>

      <div>
        <label htmlFor="preparacion" className="block text-sm font-medium">Preparación*</label>
        <textarea
          id="preparacion"
          aria-label="Preparación de la receta"
          value={preparacion}
          onChange={(e) => setPreparacion(e.target.value)}
          className="mt-1 w-full rounded-xl border border-gray-300 bg-white px-3 py-2 shadow-sm focus:border-amber-600 focus:outline-none"
          rows={8}
          placeholder="Pasos en líneas, soporta markdown simple"
        />
      </div>

      <div className="grid grid-cols-1 gap-3 md:grid-cols-3">
        <div>
          <label htmlFor="tiempo" className="block text-sm font-medium">Tiempo</label>
          <input
            id="tiempo"
            aria-label="Tiempo de preparación"
            value={tiempo}
            onChange={(e) => setTiempo(e.target.value)}
            placeholder="50 minutos"
            className="mt-1 w-full rounded-xl border border-gray-300 bg-white px-3 py-2 shadow-sm focus:border-amber-600 focus:outline-none"
          />
        </div>
        <div>
          <label htmlFor="porciones" className="block text-sm font-medium">Porciones</label>
          <input
            id="porciones"
            aria-label="Cantidad de porciones"
            value={porciones}
            onChange={(e) => setPorciones(e.target.value)}
            placeholder="4 personas"
            className="mt-1 w-full rounded-xl border border-gray-300 bg-white px-3 py-2 shadow-sm focus:border-amber-600 focus:outline-none"
          />
        </div>
        <div className="flex items-center gap-3 pt-6">
          <input id="published" type="checkbox" checked={published} onChange={(e) => setPublished(e.target.checked)} />
          <label htmlFor="published" className="text-sm">Publicada</label>
        </div>
      </div>

      <div>
        <div className="mb-1 text-sm font-medium">Productos relacionados</div>
        <div className="grid grid-cols-1 gap-2 md:grid-cols-2">
          <div>
            <input
              aria-label="Buscar productos para agregar"
              value={productQuery}
              onChange={(e) => setProductQuery(e.target.value)}
              placeholder="Buscar producto por nombre..."
              className="w-full rounded-xl border border-gray-300 bg-white px-3 py-2 shadow-sm focus:border-amber-600 focus:outline-none"
            />
            {!!availableProductOptions.length && (
              <ul className="mt-1 max-h-40 overflow-auto rounded-xl border border-gray-200 bg-white shadow">
                {availableProductOptions.map((p) => (
                  <li
                    key={p.documentId}
                    className="cursor-pointer px-3 py-2 hover:bg-amber-50"
                    onClick={() => {
                      if (!productosRelacionados.find((x) => x.documentId === p.documentId)) {
                        setProductosRelacionados([...productosRelacionados, p]);
                      }
                      setProductQuery('');
                      setProductOptions([]);
                    }}
                  >
                    <div className="text-sm font-medium">{p.productName}</div>
                    <div className="text-xs text-gray-500">{p.slug}</div>
                  </li>
                ))}
              </ul>
            )}
            <div className="mt-1 text-xs text-gray-600">
              {productLoading ? 'Buscando...' : (!availableProductOptions.length ? 'Escribí para filtrar o dejalo vacío para sugerencias' : '')}
            </div>
          </div>
          <div>
            <div className="rounded-xl border border-gray-200 p-2">
              {productosRelacionados.length === 0 && (
                <div className="text-sm text-gray-500">Sin productos seleccionados</div>
              )}
              <ul className="space-y-1">
                {productosRelacionados.map((p) => (
                  <li key={p.documentId} className="flex items-center justify-between rounded-lg bg-gray-50 px-2 py-1 text-sm">
                    <span>{p.productName}</span>
                    <button
                      className="text-xs text-red-600 hover:underline"
                      onClick={() => setProductosRelacionados(productosRelacionados.filter((x) => x.documentId !== p.documentId))}
                    >
                      Quitar
                    </button>
                  </li>
                ))}
              </ul>
            </div>
          </div>
        </div>
      </div>

      <div className="hidden">
        <label htmlFor="imagenId" className="block text-sm font-medium">Imagen (ID de media en Strapi)</label>
        <input
          id="imagenId"
          aria-label="ID de la imagen en Strapi"
          value={imagenId ?? ''}
          onChange={(e) => setImagenId(e.target.value ? Number(e.target.value) : undefined)}
          placeholder="Ej: 42"
          className="mt-1 w-40 rounded-xl border border-gray-300 bg-white px-3 py-2 shadow-sm focus:border-amber-600 focus:outline-none"
        />
        <div className="mt-1 text-xs text-gray-600">Usá el selector de imágenes del panel para obtener el ID.</div>
      </div>

      <div className="flex items-center justify-end gap-2 pt-2">
        <button onClick={onCancel} className="rounded-xl border border-gray-300 bg-white px-4 py-2 shadow-sm hover:bg-gray-50">Cancelar</button>
        <button
          onClick={onSubmit}
          disabled={!canSave}
          className="rounded-xl bg-amber-600 px-4 py-2 text-white shadow hover:bg-amber-700 disabled:opacity-50"
        >
          {editing ? 'Guardar cambios' : 'Crear receta'}
        </button>
      </div>
    </div>
  );
}
