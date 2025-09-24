
'use client';

import { useGetSuppliers } from "@/components/hooks/useGetSuppliers";
import { SupplierTable } from "./SupplierTable";
import { SearchBar } from "@/components/ui/SearchBar";
import { Pagination } from "@/components/ui/Pagination";

export function SuppliersSection() {
  const { data, isLoading, isError, error, page, pageSize, q } = useGetSuppliers();

  return (
    <div>
      <SearchBar q={q} placeholder="Buscar por nombre" />
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
