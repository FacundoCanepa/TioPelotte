"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import { ProductType } from "@/types/product";

interface Category {
  id: number;
  documentId: string;
  categoryNames: string;
}

export function useProductAdmin() {
  const [products, setProducts] = useState<ProductType[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const categoriesFetched = useRef(false);
  const [ingredientes, setIngredientes] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<unknown>(null);

  const fetchProducts = useCallback(async () => {
    try {
      setLoading(true);
      const res = await fetch("/api/admin/products", { cache: "no-store" });
      const json = await res.json();
      setProducts(Array.isArray(json?.data) ? json.data : []);
    } catch (err) {
      setError(err);
    } finally {
      setLoading(false);
    }
  }, []);

  const fetchCategories = useCallback(async () => {
    if (categoriesFetched.current) return;
    try {
      const res = await fetch(
        `${process.env.NEXT_PUBLIC_BACKEND_URL}/api/categories?fields[0]=documentId&fields[1]=categoryNames&fields[2]=id&pagination[pageSize]=100`,
        { cache: "no-store" }
      );
      const json = await res.json();
      setCategories(Array.isArray(json?.data) ? json.data : []);
      categoriesFetched.current = true;
    } catch {
      /* ignore */
    }
  }, []);

  const fetchIngredientes = useCallback(async () => {
    try {
      const res = await fetch("/api/admin/ingredients", { cache: "no-store" });
      const json = await res.json();
      setIngredientes(Array.isArray(json?.data) ? json.data : []);
    } catch {
      /* ignore */
    }
  }, []);

  useEffect(() => {
    fetchProducts();
    fetchCategories();
    fetchIngredientes();
  }, [fetchProducts, fetchCategories, fetchIngredientes]);

  const cleanPayload = (payload: any) => ({
    ...payload,
    unidadMedida: payload.unidadMedida?.trim().toLowerCase(),
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
  });

  const createProduct = async (form: any) => {
    const payload = cleanPayload(form);
    const res = await fetch("/api/admin/products", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      cache: "no-store",
      body: JSON.stringify(payload),
    });
    if (!res.ok) throw new Error("Error al crear producto");
    await fetchProducts();
    return res.json();
  };

  const updateProduct = async (id: number | string, form: any) => {
    const payload = cleanPayload(form);
    const res = await fetch(`/api/admin/products/${id}`, {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      cache: "no-store",
      body: JSON.stringify(payload),
    });
    if (!res.ok) throw new Error("Error al actualizar producto");
    await fetchProducts();
    return res.json();
  };

  const removeProduct = async (id: number | string) => {
    const res = await fetch(`/api/admin/products/${id}`, {
      method: "DELETE",
      cache: "no-store",
    });
    if (!res.ok) throw new Error("Error al eliminar producto");
    setProducts((prev) => prev.filter((p) => String(p.id) !== String(id) && p.documentId !== id));
  };

  return {
    products,
    categories,
    ingredientes,
    loading,
    error,
    reload: fetchProducts,
    createProduct,
    updateProduct,
    removeProduct,
  };
}
