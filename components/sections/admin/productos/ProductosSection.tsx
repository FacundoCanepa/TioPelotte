"use client";

import { useEffect, useMemo, useState } from "react";
import { Loader2 } from "lucide-react";
import { toast } from "sonner";
import ProductFilters from "./ProductFilters";
import ProductForm from "./ProductForm";
import ProductTable from "./ProductTable";
import ProductPreview from "./ProductPreview";
import { useProductAdmin } from "./hooks/useProductAdmin";
import { useImageUpload } from "./hooks/useImageUpload";
import { ProductType } from "@/types/product";
import { toMediaURL } from "@/utils/media";
import { LOW_STOCK_THRESHOLD } from "@/lib/inventory";


const generateSlug = (text: string) =>
  text
    .toLowerCase()
    .trim()
    .replace(/\s+/g, "-")
    .replace(/[^a-z0-9-]/g, "");

function defaultForm() {
  return {
    productName: "",
    slug: "",
    description: "",
    descriptionCorta: "",
    taste: "",
    unidadMedida: "",
    category: "",
    price: 0,
    stock: 0,
    porciones: "",
    tiempoEstimado: "",
    isOffer: false,
    isFeatured: false,
    active: true,
    ingredientes: [],
    recetas: [],
    img: null,
    imgPreview: "",
    img_carousel: [],
    img_carousel_preview: [],
    documentId: "",
  };
}

export default function ProductosSection() {
  const {
    products,
    categories,
    ingredientes,
    loading,
    error,
    reload,
    createProduct,
    updateProduct,
    removeProduct,
  } = useProductAdmin();

  const [search, setSearch] = useState("");
  const [filterOffer, setFilterOffer] = useState("all");
  const [filterActive, setFilterActive] = useState("all");
  const [filterUnidad, setFilterUnidad] = useState("all");
  const [filterLowStock, setFilterLowStock] = useState(false);
  const [orderBy, setOrderBy] = useState<{ field: keyof ProductType; direction: "asc" | "desc" }>({
    field: "productName",
    direction: "asc",
  });
  const [showForm, setShowForm] = useState(false);
  const [form, setForm] = useState<any>(defaultForm());
  const [editingId, setEditingId] = useState<string | null>(null);
  const { uploadImages, loading: uploading } = useImageUpload();

  useEffect(() => {
    setForm((prev: any) => ({ ...prev, slug: generateSlug(prev.productName) }));
  }, [form.productName]);

  const uploadMainImage = async (files: FileList | File[]) => {
    const { ids, urls } = await uploadImages(files);
    if (ids[0]) {
      setForm((prev: any) => ({ ...prev, img: ids[0], imgPreview: urls[0] }));
    }
    return { ids, urls };
  };

  const uploadCarouselImages = async (files: FileList | File[]) => {
    const { ids, urls } = await uploadImages(files);
    if (ids.length) {
      setForm((prev: any) => ({
        ...prev,
        img_carousel: [...prev.img_carousel, ...ids],
        img_carousel_preview: [...prev.img_carousel_preview, ...urls],
      }));
    }
    return { ids, urls };
  };

  const startNew = () => {
    setForm(defaultForm());
    setEditingId(null);
    setShowForm(true);
  };

  const editProducto = (p: ProductType) => {
    setForm({
      ...p,
      category: p.category?.documentId ?? "",
      ingredientes: Array.isArray(p.ingredientes)
        ? p.ingredientes.map((i: any) => i.id)
        : [],
      img: Array.isArray(p.img)
        ? p.img[0]?.id ?? null
        : (p.img as any)?.id ?? null,
        imgPreview: Array.isArray(p.img)
          ? toMediaURL(p.img[0]?.url || "")
          : toMediaURL((p.img as { url?: string } | null)?.url || ""),

      img_carousel: Array.isArray(p.img_carousel)
        ? p.img_carousel.map((i: any) => ({ id: i.id }))
        : [],
      img_carousel_preview: Array.isArray(p.img_carousel)
        ? p.img_carousel.map((i: any) => toMediaURL(i?.url || ""))
        : [],

      documentId: p.documentId,
    });
    setEditingId(p.documentId);
    setShowForm(true);
  };

  const saveProducto = async () => {
    try {
      const { imgPreview, img_carousel_preview, ...payload } = form;
      if (editingId) {
        await updateProduct(editingId, payload);
      } else {
        await createProduct(payload);
      }
      toast.success("Guardado correctamente");
      setShowForm(false);
      setForm(defaultForm());
      setEditingId(null);
    } catch (err) {
      console.error(err);
      toast.error("Error al guardar el producto");
    }
  };

  const deleteProducto = async (documentId: string) => {
    if (!confirm("¿Eliminar producto?")) return;
    try {
      await removeProduct(documentId);
      toast.success("Producto eliminado");
    } catch {
      toast.error("Error al eliminar");
    }
  };

  const unidades = useMemo(
    () => Array.from(new Set(products.map((p) => p.unidadMedida))),
    [products]
  );

  const filtered = useMemo(() => {
    return products
      .filter((p) =>
        p.productName.toLowerCase().includes(search.toLowerCase())
      )
      .filter((p) =>
        filterOffer === "all"
          ? true
          : filterOffer === "offer"
          ? p.isOffer
          : !p.isOffer
      )
      .filter((p) =>
        filterActive === "all"
          ? true
          : filterActive === "active"
          ? p.active
          : !p.active
      )
      .filter((p) =>
        filterUnidad === "all" ? true : p.unidadMedida === filterUnidad
      )
      .filter((p) =>
        filterLowStock ? (p.stock ?? 0) <= LOW_STOCK_THRESHOLD : true
      );
  }, [products, search, filterOffer, filterActive, filterUnidad, filterLowStock]);

  const sorted = useMemo(() => {
    const dir = orderBy.direction === "asc" ? 1 : -1;
    return [...filtered].sort((a, b) => {
      if (orderBy.field === "price" || orderBy.field === "stock") {
        return (
          (a[orderBy.field] as number) - (b[orderBy.field] as number)
        ) * dir;
      }
      return (
        String(a[orderBy.field] ?? "").localeCompare(
          String(b[orderBy.field] ?? "")
        ) * dir
      );
    });
  }, [filtered, orderBy]);

  if (loading) {
    return (
      <div aria-busy="true" className="space-y-3">
        {Array.from({ length: 6 }).map((_, i) => (
          <div key={i} className="h-10 rounded-md bg-black/5 animate-pulse" />
        ))}
      </div>
    );
  }

  if (error) {
    return (
      <div role="alert" aria-live="assertive" className="rounded-2xl border p-4 bg-white/70 max-w-xl">
        <p className="font-semibold">Ocurrió un problema</p>
        <p className="opacity-80">No pudimos cargar la información.</p>
        <button onClick={reload} className="mt-3 inline-flex items-center gap-2 rounded-xl border px-3 py-2 cursor-pointer hover:opacity-90">
          Reintentar
        </button>
      </div>
    );
  }

  return (
    <section className="space-y-6">
      <header className="flex flex-col sm:flex-row justify-between items-start gap-4">
        <div>
          <h1 className="text-3xl font-bold text-[#8B4513] font-garamond">
            Gestión de productos
          </h1>
          <p className="text-sm text-gray-600">
            Crear, editar y eliminar productos del catálogo
          </p>
        </div>
        <ProductFilters
          search={search}
          setSearch={setSearch}
          filterOffer={filterOffer}
          setFilterOffer={setFilterOffer}
          filterActive={filterActive}
          setFilterActive={setFilterActive}
          filterUnidad={filterUnidad}
          setFilterUnidad={setFilterUnidad}
          unidades={unidades}
          filterLowStock={filterLowStock}
          setFilterLowStock={setFilterLowStock}
          onNew={startNew}
        />
      </header>

      {showForm && (
        <>
          <ProductForm
            form={form}
            setForm={setForm}
            ingredientes={ingredientes}
            categories={categories}
            onMainUpload={uploadMainImage}
            onCarouselUpload={uploadCarouselImages}
            uploading={uploading}
            onSave={saveProducto}
          />
          <ProductPreview product={form} />
        </>
      )}

      <ProductTable
        productos={sorted}
        onEdit={editProducto}
        onDelete={deleteProducto}
        orderBy={orderBy}
        setOrderBy={setOrderBy}
      />

      {sorted.length === 0 && (
        <div className="rounded-2xl border p-6 bg-white/70 text-center">
          <p className="font-semibold">Aún no hay registros</p>
          <button onClick={startNew} className="mt-3 rounded-xl border px-4 py-2 cursor-pointer hover:opacity-90">Crear nuevo</button>
        </div>
      )}
    </section>
  );
}