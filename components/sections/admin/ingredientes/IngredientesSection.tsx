"use client";

import { Loader2 } from "lucide-react";
import IngredientFilters from "./IngredientFilters";
import IngredientForm from "./IngredientForm";
import IngredientTable from "./IngredientTable";
import { useIngredientesAdmin } from "./hooks/useIngredientesAdmin";

export default function IngredientesSection() {
  const {
    ingredientes,
    loading,
    search,
    setSearch,
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
    saveIngrediente,
    editIngrediente,
    deleteIngrediente,
    startNew,
  } = useIngredientesAdmin();

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
            Gestión de ingredientes
          </h1>
          <p className="text-sm text-gray-600">
            Crear, editar y eliminar ingredientes
          </p>
        </div>
        <IngredientFilters
          search={search}
          setSearch={setSearch}
          filterUnidad={filterUnidad}
          setFilterUnidad={setFilterUnidad}
          unidades={unidades}
          filterLowStock={filterLowStock}
          setFilterLowStock={setFilterLowStock}
          onNew={startNew}
        />
      </header>

      {showForm && (
        <IngredientForm form={form} setForm={setForm} onSave={saveIngrediente} />
      )}

      <IngredientTable
        ingredientes={ingredientes}
        onEdit={editIngrediente}
        onDelete={deleteIngrediente}
        orderBy={orderBy}
        setOrderBy={setOrderBy}
      />
    </section>
  );
}
