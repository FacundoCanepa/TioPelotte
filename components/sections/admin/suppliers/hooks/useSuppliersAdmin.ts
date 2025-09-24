"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import { toast } from "sonner";
import { SupplierType } from "@/types/supplier";

function createDefaultForm(): Partial<SupplierType> {
  return {
    name: "",
    phone: undefined,
    active: true,
    ingredientes: [],
    ingredient_supplier_prices: [],
  };
}

type ActiveFilter = "all" | "active" | "inactive";

type SupplierStats = {
  total: number;
  active: number;
};

export function useSuppliersAdmin() {
  const [suppliers, setSuppliers] = useState<SupplierType[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [search, setSearch] = useState("");
  const [filterActive, setFilterActive] = useState<ActiveFilter>("all");
  const [form, setForm] = useState<Partial<SupplierType>>(createDefaultForm());
  const [showForm, setShowForm] = useState(false);
  const [saving, setSaving] = useState(false);
  const [stats, setStats] = useState<SupplierStats>({ total: 0, active: 0 });

  const fetchSuppliers = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);
      const res = await fetch("/api/admin/suppliers", { cache: "no-store" });
      if (!res.ok) {
        const text = await res.text();
        throw new Error(text || "Error al cargar proveedores");
      }
      const json = await res.json();
      const items: SupplierType[] = Array.isArray(json?.items)
        ? json.items
        : Array.isArray(json?.data)
        ? json.data
        : [];

      setSuppliers(items);
      const totalCount = json?.totalCount ?? json?.meta?.totalCount ?? items.length;
      const activeCount =
        json?.activeCount ??
        json?.meta?.activeCount ??
        items.filter((supplier) => supplier.active).length;
      setStats({ total: totalCount, active: activeCount });
    } catch (err) {
      console.error("❌ Error cargando proveedores", err);
      const message = err instanceof Error ? err.message : "Error desconocido";
      setError(message);
      toast.error("No se pudieron cargar los proveedores");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchSuppliers();
  }, [fetchSuppliers]);

  const resetForm = useCallback(() => {
    setForm(createDefaultForm());
    setShowForm(false);
  }, []);

  const startNew = useCallback(() => {
    setForm(createDefaultForm());
    setShowForm(true);
  }, []);

  const editSupplier = useCallback((supplier: SupplierType) => {
    setForm({
      id: supplier.id,
      documentId: supplier.documentId,
      name: supplier.name,
      phone: supplier.phone,
      active: supplier.active,
      ingredientes: supplier.ingredientes ?? [],
      ingredient_supplier_prices: supplier.ingredient_supplier_prices ?? [],
    });
    setShowForm(true);
  }, []);

  const saveSupplier = useCallback(async () => {
    if (!form.name?.trim()) {
      toast.error("El nombre del proveedor es obligatorio");
      return;
    }

    const payload = {
      name: form.name.trim(),
      phone: form.phone ?? null,
      active: form.active ?? true,
      ingredientes: form.ingredientes ?? [],
      ingredient_supplier_prices: form.ingredient_supplier_prices ?? [],
    };

    const isEditing = Boolean(form.documentId);
    const url = isEditing
      ? `/api/admin/suppliers/${form.documentId}`
      : "/api/admin/suppliers";
    const method = isEditing ? "PATCH" : "POST";

    try {
      setSaving(true);
      const res = await fetch(url, {
        method,
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });

      if (!res.ok) {
        const text = await res.text();
        throw new Error(text || "Error al guardar el proveedor");
      }

      toast.success(isEditing ? "Proveedor actualizado" : "Proveedor creado");
      await fetchSuppliers();
      resetForm();
    } catch (err) {
      console.error("❌ Error guardando proveedor", err);
      const message = err instanceof Error ? err.message : "Error inesperado";
      toast.error(message);
    } finally {
      setSaving(false);
    }
  }, [fetchSuppliers, form, resetForm]);

  const deleteSupplier = useCallback(
    async (supplier: SupplierType) => {
      if (!supplier.documentId) {
        toast.error("No se encontró el identificador del proveedor");
        return;
      }

      const confirmDelete = window.confirm(
        `¿Seguro que deseas eliminar al proveedor "${supplier.name}"?`
      );
      if (!confirmDelete) return;

      try {
        const res = await fetch(`/api/admin/suppliers/${supplier.documentId}`, {
          method: "DELETE",
        });

        if (!res.ok && res.status !== 204) {
          const text = await res.text();
          throw new Error(text || "Error al eliminar el proveedor");
        }

        toast.success("Proveedor eliminado");
        if (form.documentId && form.documentId === supplier.documentId) {
          resetForm();
        }
        fetchSuppliers();
      } catch (err) {
        console.error("❌ Error eliminando proveedor", err);
        const message = err instanceof Error ? err.message : "Error inesperado";
        toast.error(message);
      }
    },
    [fetchSuppliers, form.documentId, resetForm]
  );

  const filteredSuppliers = useMemo(() => {
    const normalizedSearch = search.trim().toLowerCase();
    return suppliers
      .filter((supplier) => {
        if (!normalizedSearch) return true;
        const matchesName = supplier.name
          .toLowerCase()
          .includes(normalizedSearch);
        const matchesPhone = supplier.phone
          ? String(supplier.phone).includes(normalizedSearch)
          : false;
        return matchesName || matchesPhone;
      })
      .filter((supplier) => {
        if (filterActive === "active") return supplier.active;
        if (filterActive === "inactive") return !supplier.active;
        return true;
      })
      .sort((a, b) => a.name.localeCompare(b.name));
  }, [suppliers, search, filterActive]);

  return {
    suppliers: filteredSuppliers,
    loading,
    error,
    search,
    setSearch,
    filterActive,
    setFilterActive,
    form,
    setForm,
    showForm,
    startNew,
    editSupplier,
    resetForm,
    saveSupplier,
    deleteSupplier,
    saving,
    stats,
  };
}