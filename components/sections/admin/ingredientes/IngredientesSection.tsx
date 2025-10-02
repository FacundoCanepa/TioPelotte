"use client";

import { Loader2, PlusCircle } from "lucide-react";
import IngredientFilters from "./IngredientFilters";
import IngredientForm from "./IngredientForm";
import IngredientTable from "./IngredientTable";
import { useIngredientesAdmin } from "./hooks/useIngredientesAdmin";
import { LowStockSummary } from "./LowStockSummary";

export default function IngredientesSection() {
  const {
    ingredientes,
    loading,
    search,
    setSearch,
    filterUnidad,
    setFilterUnidad,
    filterCategoria,
    setFilterCategoria,
    filterLowStock,
    setFilterLowStock,
    orderBy,
    setOrderBy,
    unidades,
    showForm,
    setShowForm,
    form,
    setForm,
    saveIngrediente,
    editIngrediente,
    deleteIngrediente,
    startNew,
    lowStockIngredientes,
    lowStockThreshold,
  } = useIngredientesAdmin();

  if (loading) {
    return (
      <div className="w-full flex justify-center py-20">
        <Loader2 className="h-8 w-8 animate-spin text-[#8B4513]" />
      </div>
    );
  }

  return (
    <section className="space-y-6 lg:space-y-8 p-4 sm:p-6">
      <header className="flex flex-col sm:flex-row justify-between items-start gap-4">
        <div>
          <h1 className="text-2xl sm:text-3xl font-bold text-[#8B4513] font-garamond">
            Gestión de ingredientes
          </h1>
          <p className="text-sm text-gray-600">
            Creá, editá y controlá el stock de todos tus ingredientes.
          </p>
        </div>
        <button 
          onClick={startNew}
          className="inline-flex items-center gap-2 rounded-lg bg-[#8B4513] text-white px-4 py-2 min-h-[44px] hover:opacity-90 transition-opacity whitespace-nowrap"
        >
          <PlusCircle className="h-4 w-4" />
          Crear ingrediente
        </button>
      </header>

      {showForm && (
        <IngredientForm form={form} setForm={setForm} onSave={saveIngrediente} onCancel={() => setShowForm(false)} />
      )}

      {!showForm && (
        <div className="space-y-6">
          <IngredientFilters
            search={search}
            setSearch={setSearch}
            filterUnidad={filterUnidad}
            setFilterUnidad={setFilterUnidad}
            filterCategoria={filterCategoria}
            setFilterCategoria={setFilterCategoria}
            unidades={unidades}
            filterLowStock={filterLowStock}
            setFilterLowStock={setFilterLowStock}
          />

          <LowStockSummary
            ingredientes={lowStockIngredientes}
            threshold={lowStockThreshold}
          />

          <IngredientTable
            ingredientes={ingredientes}
            onEdit={editIngrediente}
            onDelete={deleteIngrediente}
            orderBy={orderBy}
            setOrderBy={setOrderBy}
          />
        </div>
      )}
    </section>
  );
}
