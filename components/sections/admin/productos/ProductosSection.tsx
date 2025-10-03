"use client";

import { useEffect, useMemo, useState } from "react";
import { Loader2, PlusCircle, SlidersHorizontal } from "lucide-react";
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
  const [isFiltersOpen, setIsFiltersOpen] = useState(false);
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
      <div aria-busy="true" className="p-4 sm:p-6 space-y-4">
        <div className="h-10 w-1/3 rounded-lg bg-black/5 animate-pulse" />
        <div className="h-8 w-1/2 rounded-lg bg-black/5 animate-pulse" />
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
          {Array.from({ length: 4 }).map((_, i) => (
            <div key={i} className="h-60 rounded-xl bg-black/5 animate-pulse" />
          ))}
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div role="alert" aria-live="assertive" className="rounded-2xl border p-4 bg-white/70 max-w-xl mx-auto my-10">
        <p className="font-semibold text-lg text-red-700">Ocurrió un problema</p>
        <p className="opacity-80">No pudimos cargar la información. Por favor, intentá de nuevo más tarde.</p>
        <button onClick={reload} className="mt-4 inline-flex items-center gap-2 rounded-xl border bg-[#8B4513] text-white px-4 py-2 cursor-pointer hover:opacity-90 transition-opacity">
          Reintentar
        </button>
      </div>
    );
  }

  return (
    <div className="flex flex-col lg:flex-row gap-6 p-4 sm:p-6">
      {/* -- Filtros (Drawer en mobile, Sidebar en desktop) -- */}
      <aside className={`fixed inset-y-0 left-0 z-20 w-72 bg-white shadow-lg transform ${isFiltersOpen ? "translate-x-0" : "-translate-x-full"} transition-transform lg:static lg:transform-none lg:shadow-none lg:border-r lg:w-80 lg:flex-shrink-0`}>
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
          onClose={() => setIsFiltersOpen(false)} // para cerrar en mobile
        />
      </aside>

      {isFiltersOpen && <div className="fixed inset-0 bg-black/30 z-10 lg:hidden" onClick={() => setIsFiltersOpen(false)}></div>}

      {/* -- Contenido Principal -- */}
      <main className="flex-1 space-y-6 lg:ml-72">
        <header className="flex flex-col sm:flex-row justify-between items-start gap-4">
          <div>
            <h1 className="text-2xl sm:text-3xl font-bold text-[#8B4513] font-garamond">
              Gestión de productos
            </h1>
            <p className="text-sm text-gray-600">
              Creá, editá y administrá todos los productos de tu catálogo.
            </p>
          </div>
          <div className="flex gap-2">
            <button
              onClick={() => setIsFiltersOpen(true)}
              className="lg:hidden inline-flex items-center gap-2 rounded-lg border px-4 py-2 min-h-[44px] hover:bg-gray-100 transition-colors"
            >
              <SlidersHorizontal className="h-4 w-4" />
              <span className="sm:hidden">Filtros</span>
              <span className="hidden sm:inline">Filtrar y ordenar</span>
            </button>
            <button 
              onClick={startNew}
              className="inline-flex items-center gap-2 rounded-lg bg-[#8B4513] text-white px-4 py-2 min-h-[44px] hover:opacity-90 transition-opacity"
            >
              <PlusCircle className="h-4 w-4" />
              Crear producto
            </button>
          </div>
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
              onCancel={() => setShowForm(false)}
            />
            <ProductPreview product={form} />
          </>
        )}

        {!showForm && (
          <ProductTable
            productos={sorted}
            onEdit={editProducto}
            onDelete={deleteProducto}
            orderBy={orderBy}
            setOrderBy={setOrderBy}
          />
        )}

        {!showForm && sorted.length === 0 && (
          <div className="rounded-2xl border-2 border-dashed p-8 bg-white/70 text-center">
            <p className="font-semibold text-lg">No se encontraron productos</p>
            <p className="text-gray-600 mb-4">Probá ajustando los filtros o creá uno nuevo.</p>
            <button onClick={startNew} className="mt-3 rounded-xl bg-[#8B4513] text-white px-5 py-2.5 cursor-pointer hover:opacity-90 transition-opacity">
              Crear nuevo producto
            </button>
          </div>
        )}
      </main>
    </div>
  );
}
