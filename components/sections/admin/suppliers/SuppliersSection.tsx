
'use client';

import { useState, useTransition } from 'react';
import { useGetSuppliers } from '@/components/hooks/useGetSuppliers';
import { createSupplier, updateSupplier, deleteSupplier } from '@/actions/supplier-actions';
import { SupplierTable } from './SupplierTable';
import { SearchBar } from '@/components/ui/SearchBar';
import { Pagination } from '@/components/ui/Pagination';
import { SupplierForm } from './SupplierForm';
import { SupplierType } from '@/types/supplier';

export function SuppliersSection() {
  const { data, isLoading, isError, error, page, pageSize, q, refetch } = useGetSuppliers();
  const [isCreating, setIsCreating] = useState(false);
  const [editingSupplier, setEditingSupplier] = useState<Partial<SupplierType> | null>(null);
  const [isPending, startTransition] = useTransition();
  const [saveError, setSaveError] = useState<string | null>(null);

  const handleCreate = () => {
    setEditingSupplier(null);
    setIsCreating(true);
    setSaveError(null);
  };

  const handleEdit = (supplier: SupplierType) => {
    setIsCreating(false);
    setEditingSupplier(supplier);
    setSaveError(null);
  };

  const handleCancel = () => {
    setIsCreating(false);
    setEditingSupplier(null);
    setSaveError(null);
  };

  const handleSave = (supplierData: Partial<SupplierType>) => {
    startTransition(async () => {
      try {
        if (editingSupplier) {
          await updateSupplier(editingSupplier.id!, supplierData);
        } else {
          await createSupplier(supplierData);
        }
        refetch(); // Re-fetch data
        setIsCreating(false);
        setEditingSupplier(null);
      } catch (e) {
        if (e instanceof Error) {
          setSaveError(e.message);
        } else {
          setSaveError('Ocurrió un error inesperado al guardar el proveedor.');
        }
      }
    });
  };

  const handleDelete = (supplierId: number) => {
    if (window.confirm('¿Estás seguro de que quieres eliminar este proveedor?')) {
      startTransition(async () => {
        try {
          await deleteSupplier(supplierId);
          refetch(); // Re-fetch data
        } catch (e) {
          if (e instanceof Error) {
            setSaveError(e.message);
          } else {
            setSaveError('Ocurrió un error inesperado al eliminar el proveedor.');
          }
        }
      });
    }
  };

  const formTitle = editingSupplier ? 'Editar Proveedor' : 'Crear Nuevo Proveedor';

  return (
    <div>
      <div className="flex justify-between items-center mb-4">
        <SearchBar q={q} placeholder="Buscar por nombre" />
        <button onClick={handleCreate} className="px-4 py-2 bg-blue-500 text-white rounded-md hover:bg-blue-600">
          Crear Proveedor
        </button>
      </div>

      {(isCreating || editingSupplier) && (
        <div className="my-4 p-4 border rounded-md shadow-lg bg-white">
          <h2 className="text-xl font-semibold mb-4">{formTitle}</h2>
          {saveError && <p className="text-red-500 mb-2">Error: {saveError}</p>}
          <SupplierForm 
            onSave={handleSave} 
            onCancel={handleCancel} 
            isLoading={isPending} 
            existingSupplier={editingSupplier || undefined}
          />
        </div>
      )}

      <div className="mt-4">
        {isLoading && <p>Cargando proveedores...</p>}
        {isError && <p>Error al cargar los proveedores: {error?.message || 'Ocurrió un error'}</p>}
        {data && (
          <>
            <SupplierTable suppliers={data.items} onEdit={handleEdit} onDelete={handleDelete} />
            <Pagination
              currentPage={page}
              pageSize={pageSize}
              total={data.meta.pagination.total}
            />
          </>
        )}
      </div>
    </div>
  );
}
