"use client";

import { Loader2 } from "lucide-react";
import ProductFilters from "./ProductFilters";
import ProductForm from "./ProductForm";
import ProductTable from "./ProductTable";
import ProductPreview from "./ProductPreview";
import { useProductAdmin } from "./hooks/useProductAdmin";

export default function ProductosSection() {
  const {
    productos,
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
  } = useProductAdmin();

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
            onMainUpload={uploadMainImage}
            onCarouselUpload={uploadCarouselImages}
            uploading={uploading}
            onSave={saveProducto}
          />
          <ProductPreview product={form} />
        </>
      )}

      <ProductTable
        productos={productos}
        onEdit={editProducto}
        onDelete={deleteProducto}
        orderBy={orderBy}
        setOrderBy={setOrderBy}
      />
    </section>
  );
}