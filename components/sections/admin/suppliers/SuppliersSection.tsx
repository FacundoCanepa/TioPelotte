"use client";

import { useCallback, useMemo, useState } from "react";
import { Loader2, Plus } from "lucide-react";
import { SupplierType } from "@/types/supplier";
import { AddSupplierPriceModal } from "./AddSupplierPriceModal";
import { SupplierForm } from "./SupplierForm";
import { SupplierTable } from "./SupplierTable";
import { useSuppliersAdmin } from "./hooks/useSuppliersAdmin";
import { useLowStockIngredients } from "@/components/hooks/useLowStockIngredients";
import { formatIngredientStockLabel } from "@/lib/inventory";
import { toast } from "sonner";

export default function SuppliersSection() {
  const {
    suppliers,
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
    refreshSuppliers,
  } = useSuppliersAdmin();

  const {
    lowStockIngredientes,
    isLoading: loadingLowStock,
    isError: lowStockError,
    error: lowStockErrorData,
    refetch: refetchLowStock,
    isFetching: refreshingLowStock,
  } = useLowStockIngredients();

  const lowStockListForMessage = useMemo(
    () => lowStockIngredientes.map(formatIngredientStockLabel).join(", "),
    [lowStockIngredientes]
  );

  const canSendLowStockMessage =
    !loadingLowStock && lowStockIngredientes.length > 0 && !lowStockError;

  const handleSendMessage = useCallback(
    async (supplier: SupplierType) => {
      if (loadingLowStock || refreshingLowStock) {
        toast.info("Todavía estamos cargando el stock actual.");
        return;
      }

      if (lowStockError) {
        toast.error("No se pudo obtener la información de stock.");
        return;
      }

      if (lowStockIngredientes.length === 0) {
        toast.info("No hay ingredientes con stock bajo en este momento.");
        return;
      }

      const defaultMessage = `Hola, ¿cómo va ${supplier.name}? Te quería encargar ${lowStockListForMessage}.`;

      let finalMessage = defaultMessage;

      if (typeof window !== "undefined") {
        const editedMessage = window.prompt(
          "Revisá y editá el mensaje antes de enviarlo:",
          defaultMessage
        );

        if (editedMessage === null) {
          toast.info("Mensaje cancelado.");
          return;
        }

        finalMessage =
          editedMessage.trim().length > 0 ? editedMessage : defaultMessage;
      }

      let copiedToClipboard = false;
      if (typeof navigator !== "undefined" && navigator.clipboard?.writeText) {
        try {
          await navigator.clipboard.writeText(finalMessage);
          copiedToClipboard = true;
          toast.success("Mensaje copiado al portapapeles.");
        } catch (clipboardError) {
          console.error("❌ Error copiando el mensaje", clipboardError);
        }
      }

      if (!copiedToClipboard && typeof window !== "undefined") {
        window.prompt(
          "Copiá el mensaje para enviarlo al proveedor:",
          finalMessage
        );
      }

      if (typeof window !== "undefined" && supplier.phone) {
        const sanitizedPhone = supplier.phone.replace(/\D+/g, "");
        if (sanitizedPhone) {
          const whatsappUrl = `https://wa.me/${sanitizedPhone}?text=${encodeURIComponent(finalMessage)}`;
          window.open(whatsappUrl, "_blank", "noopener,noreferrer");
        }
      }
    },
    [
      loadingLowStock,
      refreshingLowStock,
      lowStockError,
      lowStockIngredientes,
      lowStockListForMessage,
    ]
  );

  const lowStockErrorMessage =
    lowStockError && lowStockErrorData instanceof Error
      ? lowStockErrorData.message
      : lowStockError
      ? "No se pudieron cargar los ingredientes con bajo stock"
      : null;

  const lowStockCountLabel = loadingLowStock
    ? "cargando..."
    : `${lowStockIngredientes.length}`;

  const [priceModalSupplier, setPriceModalSupplier] = useState<SupplierType | null>(null);
  const [showPriceModal, setShowPriceModal] = useState(false);

  const openPriceModal = (supplier: SupplierType) => {
    setPriceModalSupplier(supplier);
    setShowPriceModal(true);
  };

  const closePriceModal = () => {
    setShowPriceModal(false);
    setPriceModalSupplier(null);
  };

  const handlePriceSuccess = async () => {
    await refreshSuppliers();
  };
  const isEditing = Boolean(form.documentId);
  const formTitle = isEditing ? "Editar proveedor" : "Nuevo proveedor";

  if (loading && suppliers.length === 0) {
    return (
      <div className="w-full flex justify-center py-10">
        <Loader2 className="h-6 w-6 animate-spin text-[#8B4513]" />
      </div>
    );
  }

  return (
    <section className="space-y-6">
      <header className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-3xl font-semibold text-[#8B4513] font-garamond">
            Gestión de proveedores
          </h1>
          <p className="text-sm text-gray-600">
            Total: {stats.total} · Activos: {stats.active} · Ingredientes con bajo
            stock: {lowStockCountLabel}
          </p>
        </div>
        <button
          onClick={startNew}
          className="inline-flex items-center gap-2 rounded-2xl bg-[#8B4513] px-4 py-2 text-white shadow hover:bg-[#5A3E1B] transition"
        >
          <Plus className="h-4 w-4" />
          Nuevo proveedor
        </button>
      </header>

      <div className="flex flex-col sm:flex-row gap-3">
        <input
          type="text"
          value={search}
          onChange={(event) => setSearch(event.target.value)}
          placeholder="Buscar por nombre o teléfono"
          className="w-full sm:max-w-sm rounded-xl border border-gray-300 px-3 py-2 text-sm shadow-sm focus:border-[#8B4513] focus:outline-none focus:ring-2 focus:ring-[#8B4513]/40"
        />
        <select
          value={filterActive}
          onChange={(event) =>
            setFilterActive(
              event.target.value as "all" | "active" | "inactive"
            )
          }
          className="w-full sm:w-48 rounded-xl border border-gray-300 bg-white px-3 py-2 text-sm shadow-sm focus:border-[#8B4513] focus:outline-none focus:ring-2 focus:ring-[#8B4513]/40"
        >
          <option value="all">Todos los estados</option>
          <option value="active">Solo activos</option>
          <option value="inactive">Solo inactivos</option>
        </select>
      </div>

      {error && (
        <div className="rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
          {error}
        </div>
      )}

      {lowStockErrorMessage && (
        <div className="rounded-xl border border-amber-200 bg-amber-50 px-4 py-3 text-sm text-amber-900">
          {lowStockErrorMessage}
          <button
            onClick={() => refetchLowStock()}
            className="ml-3 text-xs font-semibold text-amber-700 underline-offset-2 hover:underline"
          >
            Reintentar
          </button>
        </div>
      )}

      {showForm && (
        <div className="space-y-4 rounded-2xl bg-white p-5 shadow">
          <div className="flex items-center justify-between">
            <h2 className="text-xl font-semibold text-[#8B4513]">{formTitle}</h2>
            <button
              onClick={resetForm}
              className="text-sm text-gray-500 hover:text-gray-700"
            >
              Cancelar
            </button>
          </div>
          <SupplierForm
            form={form}
            setForm={setForm}
            onSave={saveSupplier}
            onCancel={resetForm}
            saving={saving}
          />
        </div>
      )}

      <div className="rounded-2xl bg-white p-4 shadow">
        {loading && suppliers.length > 0 ? (
          <div className="flex justify-center py-6">
            <Loader2 className="h-6 w-6 animate-spin text-[#8B4513]" />
          </div>
        ) : (
          <SupplierTable
            suppliers={suppliers}
            onEdit={editSupplier}
            onDelete={deleteSupplier}
            onAddPrice={openPriceModal}
            onSendMessage={handleSendMessage}
            disableSendMessage={!canSendLowStockMessage}
          />
        )}
      </div>
      <AddSupplierPriceModal
        supplier={priceModalSupplier}
        open={showPriceModal}
        onClose={closePriceModal}
        onSuccess={handlePriceSuccess}
      />
    </section>
  );
}