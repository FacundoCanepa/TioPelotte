"use client";

import { Dispatch, SetStateAction, useCallback, useMemo, useState } from "react";
import UploadImageMain from "@/components/ui/upload/UploadImageMain";
import UploadCarouselGallery from "@/components/ui/upload/UploadCarouselGallery";

interface Props {
  form: any;
  setForm: Dispatch<SetStateAction<any>>;
  ingredientes: any[];
  categories: { id: number; documentId: string; categoryNames: string }[];
  onMainUpload: (files: FileList | File[]) => Promise<{ ids: { id: number }[]; urls: string[] }>;
  onCarouselUpload: (files: FileList | File[]) => Promise<{ ids: { id: number }[]; urls: string[] }>;
  uploading: boolean;
  onSave: () => void;
  onCancel: () => void;
}

export default function ProductForm({
  form,
  setForm,
  ingredientes,
  categories,
  onMainUpload,
  onCarouselUpload,
  uploading,
  onSave,
  onCancel,
}: Props) {
  const [errors, setErrors] = useState<Record<string, string>>({});

  const sabores = useMemo(
    () => ["pizzas" , "Lasaña" , "fideos", "sorrentinos", "ravioles", "especiales", "ñoquis", "canelones", "filetto", "queso", "flan", "chocotorta", "pastafrola"],
    []
  );
  const unidades = useMemo(() => ["kg", "planchas", "unidad"], []);

  const validate = useCallback((values: any) => {
    const e: Record<string, string> = {};

    const isEmpty = (v: any) => v == null || (typeof v === "string" && v.trim() === "");
    const isNumber = (v: any) => typeof v === "number" && !Number.isNaN(v);

    if (isEmpty(values.productName)) e.productName = "El nombre es obligatorio";
    if (isEmpty(values.descriptionCorta)) e.descriptionCorta = "La descripcion corta es obligatoria";
    if (isEmpty(values.taste)) e.taste = "El sabor es obligatorio";
    if (isEmpty(values.unidadMedida)) e.unidadMedida = "La unidad es obligatoria";
    if (isEmpty(values.category)) e.category = "La categoria es obligatoria";

    if (isEmpty(values.description)) e.description = "La descripcion es obligatoria";

    if (!isNumber(values.price) || values.price <= 0) e.price = "El precio debe ser un nǧmero mayor a 0";
    if (!isNumber(values.stock) || values.stock < 0) e.stock = "El stock debe ser un nǧmero mayor o igual a 0";

    if (isEmpty(values.porciones)) e.porciones = "Las porciones son obligatorias";
    if (isEmpty(values.tiempoEstimado)) e.tiempoEstimado = "El tiempo estimado es obligatorio";

    // imagen principal obligatoria (acepta número, array o objeto { id })
    const hasMainImage =
      (typeof values.img === "number" && values.img > 0) ||
      (Array.isArray(values.img) && values.img.length > 0) ||
      (values.img &&
        typeof values.img === "object" &&
        typeof (values.img as any).id === "number" &&
        (values.img as any).id > 0);
    if (!hasMainImage) e.img = "La imagen principal es obligatoria";

    return e;
  }, []);

  const handleSave = useCallback(() => {
    const e = validate(form);
    setErrors(e);
    if (Object.keys(e).length > 0) {
      // opcional: scrollear al primer error detectable
      const firstKey = Object.keys(e)[0];
      const el = document.querySelector(`[data-field="${firstKey}"]`);
      if (el && "scrollIntoView" in el) (el as HTMLElement).scrollIntoView({ behavior: "smooth", block: "center" });
      return;
    }
    onSave();
  }, [form, onSave, validate]);

  const errorText = (key: string) =>
    errors[key] ? <p className="text-xs text-red-600 mt-1">{errors[key]}</p> : null;

  const labelReq = (text: string) => (
    <span className="text-sm font-semibold text-[#5A3E1B]">
      {text} <span className="text-red-600">*</span>
    </span>
  );

  return (
    <div className="bg-white p-6 rounded-xl shadow space-y-6">
      <div className="grid md:grid-cols-2 gap-4">
        <div className="space-y-1" data-field="productName">
          <label className="text-sm font-semibold text-[#5A3E1B]">Nombre <span className="text-red-600">*</span></label>
          <input
            type="text"
            value={form.productName}
            onChange={(e) => {
              setForm({ ...form, productName: e.target.value });
              if (errors.productName) setErrors((prev) => ({ ...prev, productName: "" }));
            }}
            className={`w-full rounded-md border px-3 py-2 text-sm text-[#5A3E1B] bg-[#fff7ee] ${
              errors.productName ? "border-red-400" : "border-[#e6cdb0]"
            }`}
            placeholder="Ej: Canelones de Pollo"
          />
          {errorText("productName")}
        </div>

        <div className="space-y-1" data-field="descriptionCorta">
          <label className="text-sm font-semibold text-[#5A3E1B]">Descripcion corta <span className="text-red-600">*</span></label>
          <input
            type="text"
            value={form.descriptionCorta}
            onChange={(e) => {
              setForm({ ...form, descriptionCorta: e.target.value });
              if (errors.descriptionCorta) setErrors((prev) => ({ ...prev, descriptionCorta: "" }));
            }}
            className={`w-full rounded-md border px-3 py-2 text-sm text-[#5A3E1B] bg-[#fff7ee] ${
              errors.descriptionCorta ? "border-red-400" : "border-[#e6cdb0]"
            }`}
            placeholder="Ej: Casero, fresco, relleno..."
          />
          {errorText("descriptionCorta")}
        </div>

        <div className="space-y-1" data-field="taste">
          <label className="text-sm font-semibold text-[#5A3E1B]">Sabor <span className="text-red-600">*</span></label>
          <select
            value={form.taste || ""}
            onChange={(e) => {
              setForm({ ...form, taste: e.target.value });
              if (errors.taste) setErrors((prev) => ({ ...prev, taste: "" }));
            }}
            className={`w-full rounded-md border px-3 py-2 text-sm text-[#5A3E1B] bg-[#fff7ee] ${
              errors.taste ? "border-red-400" : "border-[#e6cdb0]"
            }`}
          >
            <option value="" disabled>Seleccionar sabor</option>
            {sabores.map((sabor) => (
              <option key={sabor} value={sabor}>{sabor}</option>
            ))}
          </select>
          {errorText("taste")}
        </div>

        <div className="space-y-1" data-field="unidadMedida">
          <label className="text-sm font-semibold text-[#5A3E1B]">Unidad de medida <span className="text-red-600">*</span></label>
          <select
            value={form.unidadMedida || ""}
            onChange={(e) => {
              setForm({ ...form, unidadMedida: e.target.value });
              if (errors.unidadMedida) setErrors((prev) => ({ ...prev, unidadMedida: "" }));
            }}
            className={`w-full rounded-md border px-3 py-2 text-sm text-[#5A3E1B] bg-[#fff7ee] ${
              errors.unidadMedida ? "border-red-400" : "border-[#e6cdb0]"
            }`}
          >
            <option value="" disabled>Seleccionar unidad</option>
            {unidades.map((u) => (
              <option key={u} value={u}>{u}</option>
            ))}
          </select>
          {errorText("unidadMedida")}
        </div>

        <div className="space-y-1" data-field="category">
          <label className="text-sm font-semibold text-[#5A3E1B]">Categoria <span className="text-red-600">*</span></label>
          <select
            value={form.category || ""}
            onChange={(e) => {
              setForm({ ...form, category: e.target.value });
              if (errors.category) setErrors((prev) => ({ ...prev, category: "" }));
            }}
            className={`w-full rounded-md border px-3 py-2 text-sm text-[#5A3E1B] bg-[#fff7ee] ${
              errors.category ? "border-red-400" : "border-[#e6cdb0]"
            }`}
          >
            <option value="" disabled>Seleccionar categoria</option>
            {categories.map((cat) => (
              <option key={cat.id} value={cat.documentId}>
                {cat.categoryNames}
              </option>
            ))}
          </select>
          {errorText("category")}
        </div>
      </div>

      <div className="space-y-1" data-field="slug">
        <label className="text-sm font-semibold text-[#5A3E1B]">Slug (automǭtico)</label>
        <input
          type="text"
          value={form.slug}
          readOnly
          className="w-full rounded-md border border-[#e6cdb0] bg-gray-100 px-3 py-2 text-sm text-[#5A3E1B]"
        />
      </div>

      <div className="space-y-1" data-field="description">
        <label className="text-sm font-semibold text-[#5A3E1B]">Descripcin completa <span className="text-red-600">*</span></label>
        <textarea
          value={form.description}
          onChange={(e) => {
            setForm({ ...form, description: e.target.value });
            if (errors.description) setErrors((prev) => ({ ...prev, description: "" }));
          }}
          className={`w-full rounded-md border px-3 py-2 text-sm text-[#5A3E1B] h-24 bg-[#fff7ee] ${
            errors.description ? "border-red-400" : "border-[#e6cdb0]"
          }`}
          placeholder="Detalle del producto, elaboracin, etc."
        />
        {errorText("description")}
      </div>

      <div className="grid md:grid-cols-4 gap-4">
        <div className="space-y-1" data-field="price">
          <label className="text-sm font-semibold text-[#5A3E1B]">Precio <span className="text-red-600">*</span></label>
          <input
            type="number"
            step="0.01"
            value={form.price}
            onChange={(e) => {
              const val = e.target.value === "" ? "" : Number(e.target.value);
              setForm({ ...form, price: val });
              if (errors.price) setErrors((prev) => ({ ...prev, price: "" }));
            }}
            className={`w-full rounded-md border px-3 py-2 text-sm text-[#5A3E1B] bg-[#fff7ee] ${
              errors.price ? "border-red-400" : "border-[#e6cdb0]"
            }`}
          />
          {errorText("price")}
        </div>

        <div className="space-y-1" data-field="stock">
          <label className="text-sm font-semibold text-[#5A3E1B]">Stock <span className="text-red-600">*</span></label>
          <input
            type="number"
            value={form.stock}
            onChange={(e) => {
              const val = e.target.value === "" ? "" : Number(e.target.value);
              setForm({ ...form, stock: val });
              if (errors.stock) setErrors((prev) => ({ ...prev, stock: "" }));
            }}
            className={`w-full rounded-md border px-3 py-2 text-sm text-[#5A3E1B] bg-[#fff7ee] ${
              errors.stock ? "border-red-400" : "border-[#e6cdb0]"
            }`}
          />
          {errorText("stock")}
        </div>

        <div className="space-y-1" data-field="porciones">
          <label className="text-sm font-semibold text-[#5A3E1B]">Porciones <span className="text-red-600">*</span></label>
          <input
            type="text"
            value={form.porciones}
            onChange={(e) => {
              setForm({ ...form, porciones: e.target.value });
              if (errors.porciones) setErrors((prev) => ({ ...prev, porciones: "" }));
            }}
            className={`w-full rounded-md border px-3 py-2 text-sm text-[#5A3E1B] bg-[#fff7ee] ${
              errors.porciones ? "border-red-400" : "border-[#e6cdb0]"
            }`}
            placeholder="Ej: 2 personas"
          />
          {errorText("porciones")}
        </div>

        <div className="space-y-1" data-field="tiempoEstimado">
          <label className="text-sm font-semibold text-[#5A3E1B]">Tiempo estimado <span className="text-red-600">*</span></label>
          <input
            type="text"
            value={form.tiempoEstimado}
            onChange={(e) => {
              setForm({ ...form, tiempoEstimado: e.target.value });
              if (errors.tiempoEstimado) setErrors((prev) => ({ ...prev, tiempoEstimado: "" }));
            }}
            className={`w-full rounded-md border px-3 py-2 text-sm text-[#5A3E1B] bg-[#fff7ee] ${
              errors.tiempoEstimado ? "border-red-400" : "border-[#e6cdb0]"
            }`}
            placeholder="Ej: 6 minutos"
          />
          {errorText("tiempoEstimado")}
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

      <div className="grid md:grid-cols-2 gap-6">
        <div className="space-y-2" data-field="img">
          <label className="text-sm font-semibold text-[#5A3E1B]">
            Imagen principal <span className="text-red-600">*</span>
          </label>
          <UploadImageMain
            value={form.img}
            preview={form.imgPreview}
            uploadImages={onMainUpload}
            onChange={(val, prev) => {
              setForm({ ...form, img: val, imgPreview: prev });
              if (errors.img) setErrors((prev) => ({ ...prev, img: "" }));
            }}
            loading={uploading}
          />
          {errorText("img")}
        </div>

        <div className="space-y-2">
          <label className="text-sm font-semibold text-[#5A3E1B]">Carrusel de imǭgenes</label>
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
        <label className="block text-sm font-semibold text-[#5A3E1B] mb-2">Ingredientes relacionados</label>
        <div className="border rounded-lg p-3 bg-[#fff7ee] max-h-44 overflow-y-auto space-y-1">
          {ingredientes.map((ing: any) => (
            <label key={ing.id} className="flex items-center gap-2 text-sm text-[#5A3E1B]">
              <input
                type="checkbox"
                checked={Array.isArray(form.ingredientes) ? form.ingredientes.includes(ing.id) : false}
                onChange={(e) => {
                  const checked = e.target.checked;
                  setForm((prev: any) => ({
                    ...prev,
                    ingredientes: checked
                      ? [...(prev.ingredientes || []), ing.id]
                      : (prev.ingredientes || []).filter((id: number) => id !== ing.id),
                  }));
                }}
              />
              {ing.ingredienteName}
              {ing.ingredienteNameProducion ? ` (${ing.ingredienteNameProducion})` : ""}
            </label>
          ))}
        </div>
      </div>

      <div className="flex justify-end gap-4 mt-6">
        <button
          type="button"
          onClick={onCancel}
          className="px-6 py-3 rounded-md text-sm font-semibold text-gray-700 bg-gray-100 hover:bg-gray-200 transition"
        >
          Cancelar
        </button>
        <button
          onClick={handleSave}
          className="bg-[#8B4513] text-white px-6 py-3 rounded-md hover:bg-[#6e3a1c] transition font-semibold disabled:opacity-60 disabled:cursor-not-allowed"
          disabled={uploading}
        >
          Guardar producto
        </button>
      </div>
    </div>
  );
}
