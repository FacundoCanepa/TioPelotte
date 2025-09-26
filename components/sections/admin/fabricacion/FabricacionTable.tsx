"use client";
import { FabricacionDoc, FabricacionListMeta } from '@/types/fabricacion';
import RecalculateButton from './RecalculateButton';

type Props = {
  items: FabricacionDoc[];
  loading: boolean;
  meta: FabricacionListMeta;
  onEdit: (id: number) => void;
  onDelete: (id: number) => void;
  onRecalculate: (id: number) => void;
  onPageChange: (page: number) => void;
  deletingId: number | null;
  recalculatingId: number | null;
};

const numberFormatter = new Intl.NumberFormat('es-AR', { minimumFractionDigits: 2, maximumFractionDigits: 2 });
const currencyFormatter = new Intl.NumberFormat('es-AR', {
  style: 'currency',
  currency: 'ARS',
  minimumFractionDigits: 2,
  maximumFractionDigits: 2,
});
const dateFormatter = new Intl.DateTimeFormat('es-AR', { dateStyle: 'short', timeStyle: 'short' });

function formatCurrency(value: number | null | undefined) {
  if (value === null || value === undefined) return '—';
  return currencyFormatter.format(value);
}

function formatPercent(value: number | null | undefined) {
  if (value === null || value === undefined) return '—';
  return `${numberFormatter.format(value)}%`;
}

function formatDate(value: string | null | undefined) {
  if (!value) return '—';
  const parsed = new Date(value);
  if (Number.isNaN(parsed.getTime())) return value;
  return dateFormatter.format(parsed);
}

export default function FabricacionTable({
  items,
  loading,
  meta,
  onEdit,
  onDelete,
  onRecalculate,
  onPageChange,
  deletingId,
  recalculatingId,
}: Props) {
  const totalPages = Math.max(1, meta.pageCount || Math.ceil((meta.total || items.length || 1) / (meta.pageSize || 10)));
  const currentPage = Math.min(meta.page || 1, totalPages);

  return (
    <div className="space-y-4">
      <div className="overflow-x-auto">
        <table className="min-w-full divide-y divide-[#f0dcc3]">
          <thead className="bg-[#fef1e4]">
            <tr>
              {['Nombre', 'Producto', 'Batch', 'Líneas', 'Costo unitario', 'Margen real', 'Actualizado', 'Acciones'].map((header) => (
                <th key={header} className="px-4 py-3 text-left text-xs font-semibold uppercase tracking-wide text-[#5A3E1B]">
                  {header}
                </th>
              ))}
            </tr>
          </thead>
          <tbody className="divide-y divide-[#f0dcc3] bg-white">
            {loading ? (
              <tr>
                <td colSpan={8} className="px-4 py-6">
                  <div className="h-8 w-full animate-pulse rounded-lg bg-amber-100" />
                </td>
              </tr>
            ) : items.length === 0 ? (
              <tr>
                <td colSpan={8} className="px-4 py-8 text-center text-sm text-[#8c6d4c]">
                  No hay fabricaciones registradas todavía.
                </td>
              </tr>
            ) : (
              items.map((item) => {
                const lineCount = item.lineas.length;
                const costoUnitario = item.snapshots?.costoUnitario ?? null;
                const margenReal = item.product?.price ? item.snapshots?.margenRealPct : null;
                const lastCalculated = item.snapshots?.lastCalculatedAt;
                const stale = item.needsRecalculation || !lastCalculated;
                return (
                  <tr key={item.id} className="hover:bg-[#fff7ee]">
                    <td className="px-4 py-3">
                      <div className="flex flex-col">
                        <span className="font-medium text-[#5A3E1B]">{item.nombre}</span>
                        {stale && (
                          <span className="mt-1 inline-flex w-fit rounded-full bg-amber-100 px-2 py-0.5 text-xs font-semibold text-amber-700">
                            Desactualizado
                          </span>
                        )}
                      </div>
                    </td>
                    <td className="px-4 py-3 text-sm text-[#5A3E1B]">
                      {item.product ? item.product.productName : '—'}
                    </td>
                    <td className="px-4 py-3 text-sm text-[#5A3E1B]">{numberFormatter.format(item.batchSize)}</td>
                    <td className="px-4 py-3 text-sm text-[#5A3E1B]">{lineCount}</td>
                    <td className="px-4 py-3 text-sm text-[#5A3E1B]">{formatCurrency(costoUnitario)}</td>
                    <td className="px-4 py-3 text-sm text-[#5A3E1B]">{margenReal !== null ? formatPercent(margenReal) : '—'}</td>
                    <td className="px-4 py-3 text-sm text-[#5A3E1B]">{formatDate(lastCalculated)}</td>
                    <td className="px-4 py-3">
                      <div className="flex flex-wrap gap-2">
                        <button
                          type="button"
                          onClick={() => onEdit(item.id)}
                          className="rounded-lg border border-amber-500 px-3 py-1 text-xs font-semibold text-amber-700 transition hover:bg-amber-50"
                        >
                          Editar
                        </button>
                        <RecalculateButton
                          onClick={() => onRecalculate(item.id)}
                          loading={recalculatingId === item.id}
                          size="sm"
                        />
                        <button
                          type="button"
                          onClick={() => onDelete(item.id)}
                          disabled={deletingId === item.id}
                          className="rounded-lg border border-red-400 px-3 py-1 text-xs font-semibold text-red-600 transition hover:bg-red-50 disabled:cursor-not-allowed disabled:opacity-60"
                        >
                          {deletingId === item.id ? 'Eliminando…' : 'Eliminar'}
                        </button>
                      </div>
                    </td>
                  </tr>
                );
              })
            )}
          </tbody>
        </table>
      </div>

      <div className="flex items-center justify-between text-sm text-[#5A3E1B]">
        <span>
          Página {currentPage} de {totalPages}
        </span>
        <div className="flex gap-2">
          <button
            type="button"
            onClick={() => onPageChange(Math.max(1, currentPage - 1))}
            disabled={currentPage <= 1 || loading}
            className="rounded-lg border border-[#e6cdb0] px-3 py-1 text-xs font-semibold text-[#5A3E1B] transition hover:bg-[#fff7ee] disabled:cursor-not-allowed disabled:opacity-60"
          >
            Anterior
          </button>
          <button
            type="button"
            onClick={() => onPageChange(Math.min(totalPages, currentPage + 1))}
            disabled={currentPage >= totalPages || loading}
            className="rounded-lg border border-[#e6cdb0] px-3 py-1 text-xs font-semibold text-[#5A3E1B] transition hover:bg-[#fff7ee] disabled:cursor-not-allowed disabled:opacity-60"
          >
            Siguiente
          </button>
        </div>
      </div>
    </div>
  );
}
