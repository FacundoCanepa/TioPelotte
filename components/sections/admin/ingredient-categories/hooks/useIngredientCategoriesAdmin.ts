"use client";

import { useMemo, useState } from "react";
import { useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import type { Category } from "@/types/categoria_ingrediente";
import { useGetIngredientCategories } from "@/components/hooks/useGetIngredientCategories";

export type CategoryFormState = {
  id?: number;
  documentId?: string;
  nombre: string;
};

const EMPTY_FORM: CategoryFormState = {
  nombre: "",
};

export function useIngredientCategoriesAdmin() {
  const queryClient = useQueryClient();
  const { data, isLoading, isError, error, refetch } = useGetIngredientCategories();

  const [search, setSearch] = useState("");
  const [showForm, setShowForm] = useState(false);
  const [form, setForm] = useState<CategoryFormState>(EMPTY_FORM);
  const [saving, setSaving] = useState(false);
  const [deletingId, setDeletingId] = useState<string | null>(null);

  const categories = useMemo<Category[]>(
    () => (Array.isArray(data) ? data : []),
    [data]
  );

  const normalizedSearch = search.trim().toLowerCase();
  const filteredCategories = useMemo(() => {
    if (!normalizedSearch) {
      return [...categories].sort((a, b) =>
        (a.nombre ?? "").localeCompare(b.nombre ?? "", "es", { sensitivity: "base" })
      );
    }

    return categories
      .filter((category) => {
        const name = category.nombre?.toLowerCase?.() ?? "";
        return name.includes(normalizedSearch);
      })
      .sort((a, b) =>
        (a.nombre ?? "").localeCompare(b.nombre ?? "", "es", { sensitivity: "base" })
      );
  }, [categories, normalizedSearch]);

  const total = categories.length;
  const errorMessage = isError
    ? error instanceof Error
      ? error.message
      : "No se pudieron cargar las categorías"
    : null;

  const resetForm = () => {
    setForm(EMPTY_FORM);
    setShowForm(false);
  };

  const startNew = () => {
    setForm(EMPTY_FORM);
    setShowForm(true);
  };

  const editCategory = (category: Category) => {
    setForm({
      id: category.id,
      documentId: category.documentId,
      nombre: category.nombre ?? "",
    });
    setShowForm(true);
  };

  const invalidateCategories = async () => {
    await queryClient.invalidateQueries({ queryKey: ["ingredient-categories"] });
    await refetch();
  };

  const saveCategory = async () => {
    if (!form.nombre.trim()) {
      toast.error("El nombre es obligatorio");
      return;
    }

    setSaving(true);
    try {
      const isEditing = Boolean(form.documentId || form.id);
      const identifier = form.documentId || (form.id ? String(form.id) : "");
      if (isEditing && !identifier) {
        toast.error("No se pudo identificar la categoría");
        return;
      }
      const url = isEditing
        ? `/api/admin/ingredient-categories/${identifier}`
        : "/api/admin/ingredient-categories";
      const method = isEditing ? "PUT" : "POST";

      const res = await fetch(url, {
        method,
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          nombre: form.nombre,
        }),
      });

      if (res.status === 204) {
        toast.success(isEditing ? "Categoría actualizada" : "Categoría creada");
        await invalidateCategories();
        resetForm();
        return;
      }

      if (!res.ok) {
        let errorMessage = isEditing
          ? "No se pudo actualizar la categoría"
          : "No se pudo crear la categoría";
        try {
          const json = await res.json();
          if (json?.error) {
            errorMessage = json.error as string;
          }
        } catch (parseError) {
          console.error("[useIngredientCategoriesAdmin][saveCategory] parse error", parseError);
        }
        throw new Error(errorMessage);
      }

      toast.success(isEditing ? "Categoría actualizada" : "Categoría creada");
      await invalidateCategories();
      resetForm();
    } catch (error) {
      console.error("[useIngredientCategoriesAdmin] save error", error);
      toast.error(
        error instanceof Error
          ? error.message
          : "Ocurrió un error al guardar la categoría"
      );
    } finally {
      setSaving(false);
    }
  };

  const deleteCategory = async (category: Category) => {
    const identifier = category.documentId || (category.id ? String(category.id) : "");
    if (!identifier) {
      toast.error("No se pudo identificar la categoría");
      return;
    }

    setDeletingId(identifier);
    try {
      const res = await fetch(`/api/admin/ingredient-categories/${identifier}`, {
        method: "DELETE",
      });

      if (res.status !== 204 && !res.ok) {
        let message = "No se pudo eliminar la categoría";
        try {
          const json = await res.json();
          if (json?.error) {
            message = json.error as string;
          }
        } catch (parseError) {
          console.error("[useIngredientCategoriesAdmin][deleteCategory] parse error", parseError);
        }
        throw new Error(message);
      }

      toast.success("Categoría eliminada");
      await invalidateCategories();
    } catch (error) {
      console.error("[useIngredientCategoriesAdmin] delete error", error);
      toast.error(
        error instanceof Error ? error.message : "Ocurrió un error al eliminar"
      );
    } finally {
      setDeletingId(null);
    }
  };

  const isEditing = Boolean(form.documentId || form.id);

  return {
    categories: filteredCategories,
    total,
    loading: isLoading,
    error: errorMessage,
    search,
    setSearch,
    showForm,
    startNew,
    editCategory,
    deleteCategory,
    form,
    setForm,
    saveCategory,
    resetForm,
    saving,
    deletingId,
    isEditing,
  };
}
