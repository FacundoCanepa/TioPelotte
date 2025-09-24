
'use client';

import { useState, useTransition } from 'react';
import { useGetSuppliers } from '@/components/hooks/useGetSuppliers';
import { createSupplier } from '@/components/hooks/useCreateSupplier';
import { SupplierTable } from './SupplierTable';
import { SearchBar } from '@/components/ui/SearchBar';
import { Pagination } from '@/components/ui/Pagination';
import { SupplierForm } from './SupplierForm';
import { SupplierType } from '@/types/supplier';

export function SuppliersSection() {
  const { data, isLoading, isError, error, page, pageSize, q } = useGetSuppliers();
  const [isCreating, setIsCreating] = useState(false);
  const [isPending, startTransition] = useTransition();
  const [saveError, setSaveError] = useState<string | null>(null);

  const handleCreate = () => {
    setIsCreating(true);
    setSaveError(null);
  };

  const handleCancel = () => {
    setIsCreating(false);
    setSaveError(null);
  };

  const handleSave = (supplier: Partial<SupplierType>) => {
    startTransition(async () => {
      try {
        await createSupplier(supplier);
        setIsCreating(false);
      } catch (e) {
        if (e instanceof Error) {
          setSaveError(e.message);
        } else {
          setSaveError('Ocurrió un error inesperado al guardar el proveedor.');
        }
      }
    });
  };

  return (
    <div>
      <div className="flex justify-between items-center mb-4">
        <SearchBar q={q} placeholder="Buscar por nombre" />
        <button onClick={handleCreate} className="px-4 py-2 bg-blue-500 text-white rounded-md hover:bg-blue-600">
          Crear Proveedor
        </button>
      </div>

      {isCreating && (
        <div className="my-4 p-4 border rounded-md">
          <h2 className="text-lg font-semibold mb-2">Crear Nuevo Proveedor</h2>
          {saveError && <p className="text-red-500 mb-2">{saveError}</p>}
          <SupplierForm 
            onSave={handleSave} 
            onCancel={handleCancel} 
            isLoading={isPending} 
          />
        </div>
      )}

      <div className="mt-4">
        {isLoading && <p>Cargando proveedores...</p>}
        {isError && <p>Error al cargar los proveedores: {error?.message || 'Ocurrió un error'}</p>}
        {data && (
          <>
            <SupplierTable suppliers={data.items} />
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
