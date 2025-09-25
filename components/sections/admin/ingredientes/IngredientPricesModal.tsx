'use client';

import { useEffect, useMemo, useState } from 'react';
import { AlertCircle, ChevronDown, ChevronUp, Loader2, PackageOpen, X } from 'lucide-react';

import type { CheapestByCategoryItem } from '@/lib/pricing/cheapest-by-category';
import type { IngredientType } from '@/types/ingredient';

type IngredientPricesModalProps = {
  ingredient: IngredientType | null;
  open: boolean;
  onClose: () => void;
};

type RequestState = 'idle' | 'loading' | 'success' | 'error';
type SortDirection = 'asc' | 'desc' | null;

function getIngredientIdentifier(ingredient: IngredientType | null) {
  if (!ingredient) return '';
  const documentId = ingredient.documentId?.trim?.() ?? '';
  if (documentId) return documentId;
  const id = Number.isFinite(ingredient.id) ? ingredient.id : null;
  return id !== null ? String(id) : '';
}

function formatCurrency(value: number, currency: string) {
  const formatter = new Intl.NumberFormat('es-AR', {
    style: 'currency',
    currency: currency?.toUpperCase?.() || 'ARS',
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  });

  return formatter.format(Number.isFinite(value) ? value : 0);
}

function formatDate(value: string | null | undefined) {
  if (!value) return '-';
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return '-';
  return date.toLocaleDateString('es-AR', {
    day: '2-digit',
    month: '2-digit',
    year: 'numeric',
  });
}

export function IngredientPricesModal({
  ingredient,
  open,
  onClose,
}: IngredientPricesModalProps) {
  const [state, setState] = useState<RequestState>('idle');
  const [comparisons, setComparisons] = useState<CheapestByCategoryItem[]>([]);
  const [error, setError] = useState<string | null>(null);
  const [sortDirection, setSortDirection] = useState<SortDirection>(null);

  const ingredientIdentifier = useMemo(
    () => getIngredientIdentifier(ingredient),
    [ingredient]
  );

  useEffect(() => {
    if (!open) {
      setState('idle');
      setComparisons([]);
      setError(null);
      setSortDirection(null);
      return;
    }

    if (!ingredientIdentifier) {
      setComparisons([]);
      setState('success');
      return;
    }

    let cancelled = false;

    async function fetchPrices() {
      try {
        setState('loading');
        setError(null);

        const params = new URLSearchParams();
        const documentId = ingredient?.documentId?.trim?.();
        if (documentId) {
          params.set('ingredientDocumentId', documentId);
        } else if (ingredientIdentifier) {
          params.set('ingredientId', ingredientIdentifier);
        }

        if (params.size === 0) {
          setComparisons([]);
          setState('success');
          return;
        }

        const res = await fetch(
          `/api/admin/cheapest-by-category?${params.toString()}`,
          { cache: 'no-store' }
        );

        const json = (await res.json()) as {
          ok?: boolean;
          data?: CheapestByCategoryItem[];
          message?: string;
        };

        if (!res.ok || json?.ok === false) {
          throw new Error(json?.message || 'No se pudieron cargar los precios');
        }

        const items = Array.isArray(json?.data) ? json.data : [];

        if (!cancelled) {
          setComparisons(items);
          setState('success');
        }
      } catch (fetchError) {
        if (cancelled) return;
        const message =
          fetchError instanceof Error
            ? fetchError.message
            : 'Error desconocido al cargar precios';
        setError(message);
        setState('error');
        setComparisons([]);
      }
    }

    fetchPrices();

    return () => {
      cancelled = true;
    };
  }, [ingredient, ingredientIdentifier, open]);

  const cheapestItem = useMemo(() => {
    const pricedItems = comparisons.filter((item) => item.cheapest !== null);
    if (pricedItems.length === 0) return null;

    return pricedItems.reduce((min, current) =>
      current.cheapest!.price < min.cheapest!.price ? current : min
    );
  }, [comparisons]);

  const sortedComparisons = useMemo(() => {
    let sorted = [...comparisons];
    if (sortDirection) {
      sorted.sort((a, b) => {
        const priceA = a.cheapest?.price ?? Infinity;
        const priceB = b.cheapest?.price ?? Infinity;
        return sortDirection === 'asc' ? priceA - priceB : priceB - priceA;
      });
    } else {
      sorted.sort((a, b) => {
        const nameA = a.ingredientName?.toLocaleLowerCase?.() ?? '';
        const nameB = b.ingredientName?.toLocaleLowerCase?.() ?? '';
        if (nameA < nameB) return -1;
        if (nameA > nameB) return 1;
        return 0;
      });
    }
    return sorted;
  }, [comparisons, sortDirection]);

  const handleSortByPrice = () => {
    setSortDirection((current) => {
      if (current === null) return 'asc';
      if (current === 'asc') return 'desc';
      return null;
    });
  };

  const selectedIngredientId = ingredient?.id ?? null;

  const hasItems = sortedComparisons.length > 0;
  const hasAnyPrice = sortedComparisons.some((item) => item.cheapest !== null);

  const renderPriceSummary = (
    summary: CheapestByCategoryItem['cheapest'],
    fallbackUnit: string
  ) => {
    if (!summary) {
      return <span className="text-sm text-[#7C5F39]">Sin precio</span>;
    }

    const unit = summary.unit?.trim() || fallbackUnit || 'unidad';
    const currency = summary.currency?.trim() || 'ARS';
    const priceLabel = `${formatCurrency(summary.price, currency)} / ${unit}`;

    return (
      <div className="flex flex-col gap-0.5">
        <span className="font-semibold text-[#4A2E15]">{priceLabel}</span>
        {summary.validFrom ? (
          <span className="text-xs text-gray-500">
            Vigente desde {formatDate(summary.validFrom)}
          </span>
        ) : null}
      </div>
    );
  };

  if (!open || !ingredient) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 px-4 py-6">
      <div
        role="dialog"
        aria-modal="true"
        className="w-full max-w-2xl overflow-hidden rounded-2xl bg-white shadow-xl"
      >
        <div className="flex items-start justify-between border-b border-gray-200 px-6 py-4">
          <div>
            <h2 className="text-lg font-semibold text-[#5A3E1B]">Comparar precios</h2>
            <p className="text-sm text-gray-500">
              {ingredient.ingredienteName
                ? `Ingrediente: ${ingredient.ingredienteName}`
                : ''}
            </p>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="rounded-full p-1 text-gray-500 transition hover:bg-gray-100 hover:text-gray-700"
            aria-label="Cerrar"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        <div className="px-6 py-5">
          {state === 'loading' && (
            <div className="flex flex-col items-center justify-center gap-2 py-10 text-sm text-gray-500">
              <Loader2 className="h-6 w-6 animate-spin text-[#8B4513]" />
              <span>Cargando precios...</span>
            </div>
          )}

          {state === 'error' && (
            <div className="flex items-start gap-3 rounded-lg border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
              <AlertCircle className="mt-0.5 h-5 w-5" />
              <div>
                <p className="font-semibold">No pudimos cargar los precios</p>
                <p>{error ?? 'Intentá nuevamente en unos minutos.'}</p>
              </div>
            </div>
          )}

          {state === 'success' && !hasItems && (
            <div className="flex flex-col items-center justify-center gap-2 rounded-2xl border border-dashed border-[#EADBC8] bg-[#FFFCF7] px-6 py-12 text-center text-sm text-[#5A3E1B]">
              <PackageOpen className="h-10 w-10 text-[#C19A6B]" />
              <p className="text-base font-semibold">
                No encontramos ingredientes para comparar
              </p>
              <p className="text-sm text-[#7C5F39]">
                Verificá que el ingrediente tenga asignada una categoría con
                otros productos.
              </p>
            </div>
          )}

          {state === 'success' && hasItems && (
            <div className="space-y-5">
              {!hasAnyPrice && (
                <div className="flex flex-col items-center justify-center gap-2 rounded-2xl border border-dashed border-[#EADBC8] bg-[#FFFCF7] px-6 py-12 text-center text-sm text-[#5A3E1B]">
                  <PackageOpen className="h-10 w-10 text-[#C19A6B]" />
                  <p className="text-base font-semibold">
                    Aún no hay precios cargados
                  </p>
                  <p className="text-sm text-[#7C5F39]">
                    Agregá precios desde la sección de proveedores para comparar
                    ofertas.
                  </p>
                </div>
              )}

              {hasAnyPrice && (
                <div className="overflow-hidden rounded-xl border border-[#EADBC8]">
                  <table className="min-w-full divide-y divide-[#F0E4D4] text-sm text-[#4A2E15]">
                    <thead className="bg-[#FBE6D4] text-left text-xs uppercase tracking-wide text-[#5A3E1B]">
                      <tr>
                        <th className="p-3">Ingrediente</th>
                        <th className="p-3">Proveedor</th>
                        <th
                          className="p-3 transition-colors hover:bg-opacity-80"
                          onClick={handleSortByPrice}
                          style={{ cursor: 'pointer' }}
                        >
                          <div className="flex items-center gap-1">
                            <span>Precio</span>
                            {sortDirection === 'asc' && <ChevronUp className="h-4 w-4" />}
                            {sortDirection === 'desc' && <ChevronDown className="h-4 w-4" />}
                          </div>
                        </th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-[#F0E4D4]">
                      {sortedComparisons.map((item) => {
                        const isSelected =
                          item.ingredientId === selectedIngredientId;
                        const isCheapest =
                          item.ingredientId === cheapestItem?.ingredientId;

                        return (
                          <tr
                            key={item.ingredientId}
                            className={`transition ${
                              isSelected
                                ? 'bg-[#FFF5E6]'
                                : 'hover:bg-[#FFF8EC]'
                            }`}
                          >
                            <td className="p-3 font-medium align-top">
                              <div className="flex items-center gap-2">
                                <span>{item.ingredientName}</span>
                                {isSelected && (
                                  <span className="rounded-full bg-[#EADBC8] px-2 py-0.5 text-xs font-semibold text-[#5A3E1B]">
                                    Seleccionado
                                  </span>
                                )}
                                {isCheapest && (
                                  <span className="rounded-full bg-green-100 px-2 py-0.5 text-xs font-semibold text-green-800">
                                    Más barato
                                  </span>
                                )}
                              </div>
                            </td>
                            <td className="p-3 align-top">
                              {item.cheapest?.supplierName || '-'}
                            </td>
                            <td className="p-3 align-top">
                              {renderPriceSummary(
                                item.cheapest,
                                item.unit
                              )}
                            </td>
                          </tr>
                        );
                      })}
                    </tbody>
                  </table>
                </div>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

export default IngredientPricesModal;
