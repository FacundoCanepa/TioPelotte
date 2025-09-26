"use client";

import { useEffect, useMemo } from 'react';
import { toast } from 'sonner';
import FabricacionFilters from './FabricacionFilters';
import FabricacionTable from './FabricacionTable';
import FabricacionForm from './FabricacionForm';
import { useFabricacionAdminStore } from './hooks/useFabricacionAdmin';

export default function FabricacionSection() {
  const {
    filters,
    meta,
    items,
    loading,
    showForm,
    formMode,
    current,
    formLoading,
    saving,
    deletingId,
    recalculatingId,
    fetchList,
    setFilters,
    openCreate,
    openEdit,
    closeForm,
    saveFabricacion,
    removeFabricacion,
    triggerRecalculate,
  } = useFabricacionAdminStore();

  useEffect(() => {
    fetchList().catch((error) => {
      console.error('[fabricacion-ui] initial fetch error', error);
      toast.error('No se pudieron cargar las fabricaciones');
    });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const headerSubtitle = useMemo(() => {
    const total = meta.total ?? items.length;
    return total === 1 ? '1 fabricación registrada' : `${total} fabricaciones registradas`;
  }, [items.length, meta.total]);

  const handleSearch = (search: string) => {
    setFilters({ search });
    fetchList({ search }).catch((error) => {
      console.error('[fabricacion-ui] search error', error);
      toast.error('No se pudo aplicar el filtro');
    });
  };

  const handleStatusChange = (status: 'all' | 'draft' | 'published') => {
    setFilters({ status });
    fetchList({ status }).catch((error) => {
      console.error('[fabricacion-ui] status error', error);
      toast.error('No se pudo aplicar el filtro');
    });
  };

  const handleProductChange = (productId: number | null) => {
    setFilters({ productId });
    fetchList({ productId: productId ?? null }).catch((error) => {
      console.error('[fabricacion-ui] product filter error', error);
      toast.error('No se pudo aplicar el filtro');
    });
  };

  const handlePageChange = (page: number) => {
    setFilters({ page });
    fetchList({ page }).catch((error) => {
      console.error('[fabricacion-ui] pagination error', error);
      toast.error('No se pudieron cargar los resultados');
    });
  };

  const handleDelete = async (id: number) => {
    const confirmed = window.confirm('¿Seguro que deseas eliminar esta fabricación?');
    if (!confirmed) return;
    try {
      await removeFabricacion(id);
    } catch (error) {
      console.error('[fabricacion-ui] delete error', error);
      toast.error('No se pudo eliminar la fabricación');
    }
  };

  const handleSave = async (payload: Parameters<typeof saveFabricacion>[0]) => {
    try {
      await saveFabricacion(payload);
    } catch (error) {
      console.error('[fabricacion-ui] save error', error);
      const message = error instanceof Error ? error.message : 'Error guardando la fabricación';
      toast.error(message);
      throw error;
    }
  };

  const handleRecalculate = async (id: number) => {
    try {
      await triggerRecalculate(id);
    } catch (error) {
      console.error('[fabricacion-ui] recalc error', error);
      const message = error instanceof Error ? error.message : 'Error recalculando costos';
      toast.error(message);
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-2xl font-semibold text-[#5A3E1B]">Fórmulas de fabricación</h1>
          <p className="text-sm text-[#8c6d4c]">{headerSubtitle}</p>
        </div>
        <button
          type="button"
          onClick={openCreate}
          className="inline-flex items-center justify-center rounded-xl bg-amber-600 px-4 py-2 text-sm font-semibold text-white shadow hover:bg-amber-700"
        >
          Nueva fabricación
        </button>
      </div>

      <div className="rounded-2xl bg-[#fef6ef] p-4 shadow-sm">
        <FabricacionFilters
          filters={filters}
          onSearchChange={handleSearch}
          onStatusChange={handleStatusChange}
          onProductChange={handleProductChange}
          onReset={() => {
            setFilters({ search: '', status: 'all', productId: null, page: 1 });
            fetchList({ search: '', status: 'all', productId: null, page: 1 }).catch((error) => {
              console.error('[fabricacion-ui] reset filters error', error);
              toast.error('No se pudieron restablecer los filtros');
            });
          }}
        />
      </div>

      <div className="rounded-2xl bg-white p-4 shadow">
        <FabricacionTable
          items={items}
          loading={loading}
          meta={meta}
          onEdit={(id) => openEdit(id).catch(() => {})}
          onDelete={handleDelete}
          onRecalculate={handleRecalculate}
          onPageChange={handlePageChange}
          deletingId={deletingId}
          recalculatingId={recalculatingId}
        />
      </div>

      <FabricacionForm
        open={showForm}
        mode={formMode}
        initialData={current}
        loading={formLoading}
        saving={saving}
        onClose={closeForm}
        onSubmit={handleSave}
        onRecalculate={current ? () => handleRecalculate(current.id) : undefined}
        recalculating={current ? recalculatingId === current.id : false}
      />
    </div>
  );
}
