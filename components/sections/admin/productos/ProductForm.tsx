"use client";

import { Dispatch, SetStateAction } from "react";
import UploadImageMain from "@/components/ui/upload/UploadImageMain";
import UploadCarouselGallery from "@/components/ui/upload/UploadCarouselGallery";

interface Props {
  form: any;
  setForm: Dispatch<SetStateAction<any>>;
  ingredientes: any[];
 onMainUpload: (
    files: FileList | File[]
  ) => Promise<{ ids: { id: number }[]; urls: string[] }>;
  onCarouselUpload: (
    files: FileList | File[]
  ) => Promise<{ ids: { id: number }[]; urls: string[] }>;
  uploading: boolean;
  onSave: () => void;
}

export default function ProductForm({ form, setForm, ingredientes, onMainUpload, onCarouselUpload, uploading, onSave }: Props) {

  const sabores = [
    "fideos",
    "sorrentinos",
    "ravioles",
    "especiales",
    "ñoquis",
    "canelones",
    "filetto",
    "queso",
    "flan",
    "chocotorta",
    "pastafrola",
  ];

  const unidades = ["kg", "planchas", "unidad"];

  return (
    <div className="bg-white p-6 rounded-xl shadow space-y-6">
      <div className="grid md:grid-cols-2 gap-4">
        <div className="space-y-1">
          <label className="text-sm font-semibold text-[#5A3E1B]">Nombre</label>
          <input
            type="text"
            value={form.productName}
            onChange={(e) => setForm({ ...form, productName: e.target.value })}
            className="w-full rounded-md border border-[#e6cdb0] bg-[#fff7ee] px-3 py-2 text-sm text-[#5A3E1B]"
            placeholder="Ej: Canelones de Pollo"
          />
        </div>

        <div className="space-y-1">
          <label className="text-sm font-semibold text-[#5A3E1B]">Descripción corta</label>
          <input
            type="text"
            value={form.descriptionCorta}
            onChange={(e) => setForm({ ...form, descriptionCorta: e.target.value })}
            className="w-full rounded-md border border-[#e6cdb0] bg-[#fff7ee] px-3 py-2 text-sm text-[#5A3E1B]"
            placeholder="Ej: Casero, fresco, relleno..."
          />
        </div>

        <div className="space-y-1">
          <label className="text-sm font-semibold text-[#5A3E1B]">Sabor</label>
          <select
            value={form.taste || ""}
            onChange={(e) => setForm({ ...form, taste: e.target.value })}
            className="w-full rounded-md border border-[#e6cdb0] bg-[#fff7ee] px-3 py-2 text-sm text-[#5A3E1B]"
          >
            <option value="" disabled>Seleccionar sabor</option>
            {sabores.map((sabor) => (
              <option key={sabor} value={sabor}>{sabor}</option>
            ))}
          </select>
        </div>

        <div className="space-y-1">
          <label className="text-sm font-semibold text-[#5A3E1B]">Unidad de medida</label>
          <select
            value={form.unidadMedida || ""}
            onChange={(e) => setForm({ ...form, unidadMedida: e.target.value })}
            className="w-full rounded-md border border-[#e6cdb0] bg-[#fff7ee] px-3 py-2 text-sm text-[#5A3E1B]"
          >
            <option value="" disabled>Seleccionar unidad</option>
            {unidades.map((u) => (
              <option key={u} value={u}>{u}</option>
            ))}
          </select>
        </div>

        <div className="space-y-1">
          <label className="text-sm font-semibold text-[#5A3E1B]">Categoría</label>
          <select
            value={form.category || ""}
            onChange={(e) => setForm({ ...form, category: Number(e.target.value) })}
            className="w-full rounded-md border border-[#e6cdb0] bg-[#fff7ee] px-3 py-2 text-sm text-[#5A3E1B]"
          >
            <option value="" disabled>Seleccionar categoría</option>
            <option value={2}>Pastas</option>
            <option value={3}>Postres</option>
            <option value={1}>Quesos</option>
            <option value={4}>Salsas</option>
          </select>
        </div>
      </div>

      <div className="space-y-1">
        <label className="text-sm font-semibold text-[#5A3E1B]">Slug (automático)</label>
        <input
          type="text"
          value={form.slug}
          readOnly
          className="w-full rounded-md border border-[#e6cdb0] bg-gray-100 px-3 py-2 text-sm text-[#5A3E1B]"
        />
      </div>

      <div className="space-y-1">
        <label className="text-sm font-semibold text-[#5A3E1B]">Descripción completa</label>
        <textarea
          value={form.description}
          onChange={(e) => setForm({ ...form, description: e.target.value })}
          className="w-full rounded-md border border-[#e6cdb0] bg-[#fff7ee] px-3 py-2 text-sm text-[#5A3E1B] h-24"
          placeholder="Detalle del producto, elaboración, etc."
        />
      </div>

      <div className="grid md:grid-cols-4 gap-4">
        <div className="space-y-1">
          <label className="text-sm font-semibold text-[#5A3E1B]">Precio</label>
          <input
            type="number"
            step="0.01"
            value={form.price}
            onChange={(e) => setForm({ ...form, price: Number(e.target.value) })}
            className="w-full rounded-md border border-[#e6cdb0] bg-[#fff7ee] px-3 py-2 text-sm text-[#5A3E1B]"
          />
        </div>

        <div className="space-y-1">
          <label className="text-sm font-semibold text-[#5A3E1B]">Stock</label>
          <input
            type="number"
            value={form.stock}
            onChange={(e) => setForm({ ...form, stock: Number(e.target.value) })}
            className="w-full rounded-md border border-[#e6cdb0] bg-[#fff7ee] px-3 py-2 text-sm text-[#5A3E1B]"
          />
        </div>

        <div className="space-y-1">
          <label className="text-sm font-semibold text-[#5A3E1B]">Porciones</label>
          <input
            type="text"
            value={form.porciones}
            onChange={(e) => setForm({ ...form, porciones: e.target.value })}
            className="w-full rounded-md border border-[#e6cdb0] bg-[#fff7ee] px-3 py-2 text-sm text-[#5A3E1B]"
            placeholder="Ej: 2 personas"
          />
        </div>

        <div className="space-y-1">
          <label className="text-sm font-semibold text-[#5A3E1B]">Tiempo estimado</label>
          <input
            type="text"
            value={form.tiempoEstimado}
            onChange={(e) => setForm({ ...form, tiempoEstimado: e.target.value })}
            className="w-full rounded-md border border-[#e6cdb0] bg-[#fff7ee] px-3 py-2 text-sm text-[#5A3E1B]"
            placeholder="Ej: 6 minutos"
          />
        </div>
      </div>

      <div className="flex flex-wrap gap-6 pt-2">
        <label className="flex items-center gap-2 text-sm">
          <input type="checkbox" checked={form.isOffer} onChange={(e) => setForm({ ...form, isOffer: e.target.checked })} /> Oferta
        </label>
        <label className="flex items-center gap-2 text-sm">
          <input type="checkbox" checked={form.isFeatured} onChange={(e) => setForm({ ...form, isFeatured: e.target.checked })} /> Destacado
        </label>
        <label className="flex items-center gap-2 text-sm">
          <input type="checkbox" checked={form.active} onChange={(e) => setForm({ ...form, active: e.target.checked })} /> Activo
        </label>
      </div>

      <div>
        <label className="block text-sm font-semibold text-[#5A3E1B] mb-2">Ingredientes relacionados</label>
        <div className="border rounded-lg p-3 bg-[#fff7ee] max-h-44 overflow-y-auto space-y-1">
          {ingredientes.map((ing: any) => (
            <label key={ing.id} className="flex items-center gap-2 text-sm text-[#5A3E1B]">
              <input
                type="checkbox"
                checked={form.ingredientes.includes(ing.id)}
                onChange={(e) => {
                  const checked = e.target.checked;
                  setForm((prev: any) => ({
                    ...prev,
                    ingredientes: checked
                      ? [...prev.ingredientes, ing.id]
                      : prev.ingredientes.filter((id: number) => id !== ing.id),
                  }));
                }}
              />
              {ing.ingredienteName}
            </label>
          ))}
        </div>
      </div>

      <div className="grid md:grid-cols-2 gap-6">
        <div className="space-y-2">
          <label className="text-sm font-semibold text-[#5A3E1B]">Imagen principal</label>
          <UploadImageMain
            value={form.img}
            preview={form.imgPreview}
            uploadImages={onMainUpload}
            onChange={(val, prev) => setForm({ ...form, img: val, imgPreview: prev })}
            loading={uploading}
          />
        </div>

        <div className="space-y-2">
          <label className="text-sm font-semibold text-[#5A3E1B]">Carrusel de imágenes</label>
          <UploadCarouselGallery
            values={form.img_carousel}
            previews={form.img_carousel_preview}
            uploadImages={onCarouselUpload}
            onChange={(ids, prevs) => setForm({ ...form, img_carousel: ids, img_carousel_preview: prevs })}
            loading={uploading}
          />
        </div>
      </div>

      <div>
        <button onClick={onSave} className="mt-6 w-full bg-[#8B4513] text-white px-6 py-3 rounded-md hover:bg-[#6e3a1c] transition font-semibold">
          Guardar producto
        </button>
      </div>
    </div>
  );
}