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
        ? p.img[0]?.url
          ? `${process.env.NEXT_PUBLIC_BACKEND_URL}${p.img[0].url}`
          : ""
        : (p.img as { url?: string } | null)?.url
        ? `${process.env.NEXT_PUBLIC_BACKEND_URL}${(p.img as { url?: string }).url}`
        : "",
      img_carousel: Array.isArray(p.img_carousel)
        ? p.img_carousel.map((i: any) => ({ id: i.id }))
        : [],
      img_carousel_preview: Array.isArray(p.img_carousel)
        ? p.img_carousel.map((i: any) =>
            i.url.startsWith("/")
              ? `${process.env.NEXT_PUBLIC_BACKEND_URL}${i.url}`
              : i.url
          )
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
      .filter((p) => (filterLowStock ? (p.stock || 0) <= 5 : true));
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
      <div className="w-full flex justify-center py-10">
        <Loader2 className="h-6 w-6 animate-spin text-[#8B4513]" />
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
    </section>
  );
}
