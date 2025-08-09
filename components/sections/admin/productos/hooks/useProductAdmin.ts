"use client";

import { useEffect, useState } from "react";
import { ProductType } from "@/types/product";
import { toast } from "sonner";
import { useImageUpload } from "./useImageUpload";

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
    category: null,
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

export function useProductAdmin() {
  const [productos, setProductos] = useState<ProductType[]>([]);
  const [ingredientes, setIngredientes] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [filterOffer, setFilterOffer] = useState("all");
  const [filterActive, setFilterActive] = useState("all");
  const [filterUnidad, setFilterUnidad] = useState("all");
  const [filterLowStock, setFilterLowStock] = useState(false);
 const [orderBy, setOrderBy] = useState<{
    field: keyof ProductType;
    direction: "asc" | "desc";
  }>({
    field: "productName",
    direction: "asc",
  });
  const [showForm, setShowForm] = useState(false);
  const [editingId, setEditingId] = useState<number | null>(null);
  const [form, setForm] = useState<any>(defaultForm());
const { uploadImages, loading: uploading } = useImageUpload();

  const fetchProductos = async () => {
    try {
      const res = await fetch("/api/admin/products");
      const json = await res.json();
      setProductos(Array.isArray(json?.data) ? json.data : []);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const fetchIngredientes = async () => {
    try {
      const res = await fetch("/api/admin/ingredients");
      const json = await res.json();
      setIngredientes(Array.isArray(json?.data) ? json.data : []);
    } catch (err) {
      console.error(err);
    }
  };

  useEffect(() => {
    fetchProductos();
    fetchIngredientes();
  }, []);

  useEffect(() => {
    setForm((prev: any) => ({
      ...prev,
      slug: generateSlug(prev.productName),
    }));
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

  const cleanPayload = (payload: any) => {
    return {
      ...payload,
img: Array.isArray(payload.img)
        ? payload.img[0]?.id ?? null
        : (payload.img as any)?.id ?? payload.img ?? null,
      img_carousel: Array.isArray(payload.img_carousel)
        ? payload.img_carousel.map((i: any) => i.id || i)
        : [],
      ingredientes: Array.isArray(payload.ingredientes)
        ? payload.ingredientes.map((i: any) => i.id || i)
        : [],
      recetas: Array.isArray(payload.recetas)
        ? payload.recetas.map((r: any) => r.id || r)
        : [],
    };
  };

  const saveProducto = async () => {
    try {
      const url = editingId
        ? `/api/admin/products/${form.documentId}`
        : "/api/admin/products";
      const method = editingId ? "PUT" : "POST";

      const { imgPreview, img_carousel_preview, ...rest } = form;
      if (!editingId) delete (rest as any).documentId;

      const payload = cleanPayload(rest);

      const res = await fetch(url, {
        method,
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });

      const responseText = await res.text();
      console.log("📨 Respuesta del servidor:", responseText);

      if (!res.ok) {
        console.error("🔴 Error al guardar. Status:", res.status);
        throw new Error(`Error al guardar: ${res.status}`);
      }

      toast.success("Guardado correctamente");
      setShowForm(false);
      setEditingId(null);
      setForm(defaultForm());
      fetchProductos();
    } catch (err) {
      console.error("❌ Error en saveProducto:", err);
      toast.error("Error al guardar el producto");
    }
  };

  const editProducto = (p: ProductType) => {
    setForm({
      ...p,
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
    setEditingId(p.id);
    setShowForm(true);
  };

  const deleteProducto = async (documentId: string) => {
    if (!confirm("¿Eliminar producto?")) return;
    try {
      const res = await fetch(`/api/admin/products/${documentId}`, {
        method: "DELETE",
      });
      if (!res.ok) throw new Error();
      toast.success("Producto eliminado");
      fetchProductos();
    } catch (err) {
      toast.error("Error al eliminar");
    }
  };

  const startNew = () => {
    setForm(defaultForm());
    setEditingId(null);
    setShowForm(true);
  };

  const unidades = Array.from(new Set(productos.map((p) => p.unidadMedida)));

  const filtered = productos
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

  const sorted = [...filtered].sort((a, b) => {
    const dir = orderBy.direction === "asc" ? 1 : -1;
    if (orderBy.field === "price" || orderBy.field === "stock") {
      return (a[orderBy.field] as number) > (b[orderBy.field] as number)
        ? dir
        : -dir;
    }
    return (
      String(a[orderBy.field] ?? "").localeCompare(
        String(b[orderBy.field] ?? "")
      ) * dir
    );
  });

  return {
    productos: sorted,
    ingredientes,
    loading,
    search,
    setSearch,
    filterOffer,
    setFilterOffer,
    filterActive,
    setFilterActive,
    filterUnidad,
    setFilterUnidad,
    filterLowStock,
    setFilterLowStock,
    orderBy,
    setOrderBy,
    unidades,
    showForm,
    setShowForm,
    form,
    setForm,
    uploadMainImage,
    uploadCarouselImages,
    uploading,
    saveProducto,
    editProducto,
    deleteProducto,
    startNew,
  };
}
