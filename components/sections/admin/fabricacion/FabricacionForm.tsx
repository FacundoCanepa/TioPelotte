"use client";

import * as Dialog from '@radix-ui/react-dialog';
import { X } from 'lucide-react';
import { useEffect, useMemo, useState } from 'react';
import AsyncSelect from 'react-select/async';
import { useDebouncedCallback } from 'use-debounce';
import type { FabricacionDoc, FabricacionPayload } from '@/types/fabricacion';
import LineaEditor from './LineaEditor';
import ComputedSnapshot from './ComputedSnapshot';
import RecalculateButton from './RecalculateButton';
import { fetchProductOptions, type ProductOption } from './product-options';

const defaultSnapshot = {
  ingredientesCostoTotal: null,
  costoTotalBatch: null,
  costoUnitario: null,
  precioSugerido: null,
  margenRealPct: null,
  lastCalculatedAt: null,
};

type FormState = {
  nombre: string;
  productId: number | null;
  batchSize: number;
  mermaPct: number | null;
  costoManoObra: number | null;
  costoEmpaque: number | null;
  overheadPct: number | null;
  margenObjetivoPct: number | null;
  lineas: FabricacionDoc['lineas'];
};

type FormErrors = {
  nombre?: string;
  batchSize?: string;
  lineas?: string[];
};

type Props = {
  open: boolean;
  mode: 'create' | 'edit';
  initialData: FabricacionDoc | null;
  loading: boolean;
  saving: boolean;
  recalculating?: boolean;
  onClose: () => void;
  onSubmit: (payload: FabricacionPayload) => Promise<void>;
  onRecalculate?: () => void;
};

const loadProductOptions = (inputValue: string) => fetchProductOptions(inputValue, 20);

function buildInitialState(data: FabricacionDoc | null): FormState {
  if (!data) {
    return {
      nombre: '',
      productId: null,
      batchSize: 1,
      mermaPct: null,
      costoManoObra: null,
      costoEmpaque: null,
      overheadPct: null,
      margenObjetivoPct: null,
      lineas: [],
    };
  }
  return {
    nombre: data.nombre,
    productId: data.product?.id ?? null,
    batchSize: data.batchSize ?? 1,
    mermaPct: data.mermaPct ?? null,
    costoManoObra: data.costoManoObra ?? null,
    costoEmpaque: data.costoEmpaque ?? null,
    overheadPct: data.overheadPct ?? null,
    margenObjetivoPct: data.margenObjetivoPct ?? null,
    lineas: data.lineas.map((linea) => ({ ...linea })),
  };
}

export default function FabricacionForm({
  open,
  mode,
  initialData,
  loading,
  saving,
  recalculating,
  onClose,
  onSubmit,
  onRecalculate,
}: Props) {
  const [form, setForm] = useState<FormState>(() => buildInitialState(initialData));
  const [errors, setErrors] = useState<FormErrors>({});
  const [productOption, setProductOption] = useState<ProductOption | null>(null);

  useEffect(() => {
    if (open) {
      setForm(buildInitialState(initialData));
      setErrors({});
      if (initialData?.product) {
        setProductOption({
          value: initialData.product.id,
          label: initialData.product.productName,
          product: initialData.product,
        });
      } else {
        setProductOption(null);
      }
    }
  }, [open, initialData]);

  const handleLineChange = (lineas: FormState['lineas']) => {
    setForm((prev) => ({ ...prev, lineas }));
  };

  const validate = (): boolean => {
    const nextErrors: FormErrors = {};
    if (!form.nombre.trim()) {
      nextErrors.nombre = 'El nombre es obligatorio';
    }
    if (!Number.isFinite(form.batchSize) || form.batchSize < 1) {
      nextErrors.batchSize = 'El batch debe ser mayor o igual a 1';
    }
    const lineErrors = form.lineas.map(() => '');
    if (form.lineas.length === 0) {
      lineErrors.push('Agregá al menos un ingrediente');
    } else {
      form.lineas.forEach((linea, index) => {
        if (!linea.ingredient) {
          lineErrors[index] = 'Seleccioná un ingrediente';
          return;
        }
        if (!Number.isFinite(linea.cantidad) || linea.cantidad <= 0) {
          lineErrors[index] = 'Ingresá una cantidad válida';
          return;
        }
        if (!linea.unidad || !linea.unidad.trim()) {
          lineErrors[index] = 'Definí una unidad';
        }
      });
    }
    if (lineErrors.some(Boolean)) {
      nextErrors.lineas = lineErrors;
    }
    setErrors(nextErrors);
    return Object.keys(nextErrors).length === 0;
  };

  const handleSubmit = async () => {
    if (!validate()) return;
    const payload: FabricacionPayload = {
      nombre: form.nombre.trim(),
      productId: form.productId ?? null,
      batchSize: Number(form.batchSize) || 1,
      mermaPct: form.mermaPct ?? undefined,
      costoManoObra: form.costoManoObra ?? undefined,
      costoEmpaque: form.costoEmpaque ?? undefined,
      overheadPct: form.overheadPct ?? undefined,
      margenObjetivoPct: form.margenObjetivoPct ?? undefined,
      lineas: form.lineas.map((linea) => ({
        id: linea.id,
        ingredientId: linea.ingredient?.id ?? null,
        cantidad: Math.max(0, linea.cantidad),
        unidad: linea.unidad.trim(),
        mermaPct: linea.mermaPct == null ? undefined : Math.max(0, linea.mermaPct),
        nota: linea.nota?.trim() ? linea.nota.trim() : null,
      })),
    };
    await onSubmit(payload);
  };

  const missingIngredientPrice = useMemo(
    () => form.lineas.some((linea) => linea.ingredient && (!linea.ingredient.price || linea.ingredient.price <= 0)),
    [form.lineas],
  );

  const snapshot = initialData?.snapshots ?? defaultSnapshot;

  const debouncedProductChange = useDebouncedCallback((option: ProductOption | null) => {
    setForm((prev) => ({ ...prev, productId: option?.value ?? null }));
  }, 50);

  return (
    <Dialog.Root open={open} onOpenChange={(value) => (!value ? onClose() : undefined)}>
      <Dialog.Portal>
        <Dialog.Overlay className="fixed inset-0 bg-black/40" />
        <Dialog.Content className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <div className="max-h-[90vh] w-full max-w-5xl overflow-y-auto rounded-3xl bg-white p-6 shadow-xl">
            <div className="flex items-start justify-between gap-4">
              <div>
                <Dialog.Title className="text-xl font-semibold text-[#5A3E1B]">
                  {mode === 'edit' ? 'Editar fabricación' : 'Nueva fabricación'}
                </Dialog.Title>
                <Dialog.Description className="text-sm text-[#8c6d4c]">
                  Completa los datos y guardá para mantener tus costos actualizados.
                </Dialog.Description>
              </div>
              <button
                type="button"
                onClick={onClose}
                className="rounded-full p-2 text-[#8c6d4c] transition hover:bg-[#f5e2ce]"
                aria-label="Cerrar"
              >
                <X className="h-5 w-5" />
              </button>
            </div>

            {loading ? (
              <div className="mt-6 space-y-4">
                <div className="h-10 w-full animate-pulse rounded-xl bg-amber-100" />
                <div className="h-40 w-full animate-pulse rounded-xl bg-amber-100" />
              </div>
            ) : (
              <div className="mt-6 grid gap-6 lg:grid-cols-[2fr,1fr]">
                <div className="space-y-6">
                  <div className="grid gap-4 sm:grid-cols-2">
                    <div className="flex flex-col gap-1">
                      <label className="text-sm font-semibold text-[#5A3E1B]">Nombre *</label>
                      <input
                        type="text"
                        value={form.nombre}
                        onChange={(event) => setForm((prev) => ({ ...prev, nombre: event.target.value }))}
                        className={`w-full rounded-lg border px-3 py-2 text-sm text-[#5A3E1B] focus:border-amber-500 focus:outline-none focus:ring-2 focus:ring-amber-200 ${
                          errors.nombre ? 'border-red-400 bg-red-50' : 'border-[#e6cdb0] bg-white'
                        }`}
                        placeholder="Ej. Salsa fileto 5kg"
                      />
                      {errors.nombre && <p className="text-xs text-red-600">{errors.nombre}</p>}
                    </div>
                    <div className="flex flex-col gap-1">
                      <label className="text-sm font-semibold text-[#5A3E1B]">Producto</label>
                      <AsyncSelect
                        cacheOptions
                        loadOptions={loadProductOptions}
                        defaultOptions
                        value={productOption}
                        onChange={(option) => {
                          const next = option ? (option as ProductOption) : null;
                          setProductOption(next);
                          debouncedProductChange(next);
                        }}
                        isClearable
                        placeholder="Buscar producto..."
                        classNamePrefix="fabricacion-form-select"
                        styles={{
                          control: (base) => ({
                            ...base,
                            backgroundColor: '#fff7ee',
                            borderColor: '#e6cdb0',
                            borderRadius: 12,
                            minHeight: 42,
                          }),
                          menu: (base) => ({ ...base, zIndex: 50 }),
                        }}
                        noOptionsMessage={() => 'Sin resultados'}
                      />
                    </div>
                    <div className="flex flex-col gap-1">
                      <label className="text-sm font-semibold text-[#5A3E1B]">Batch size *</label>
                      <input
                        type="number"
                        min={1}
                        step="0.01"
                        value={form.batchSize}
                        onChange={(event) => {
                          const valueNumber = Number(event.target.value);
                          setForm((prev) => ({ ...prev, batchSize: Number.isFinite(valueNumber) ? valueNumber : prev.batchSize }));
                        }}
                        className={`w-full rounded-lg border px-3 py-2 text-sm text-[#5A3E1B] focus:border-amber-500 focus:outline-none focus:ring-2 focus:ring-amber-200 ${
                          errors.batchSize ? 'border-red-400 bg-red-50' : 'border-[#e6cdb0] bg-white'
                        }`}
                      />
                      {errors.batchSize && <p className="text-xs text-red-600">{errors.batchSize}</p>}
                    </div>
                    <div className="flex flex-col gap-1">
                      <label className="text-sm font-semibold text-[#5A3E1B]">Merma %</label>
                      <input
                        type="number"
                        min={0}
                        step="0.1"
                        value={form.mermaPct ?? ''}
                        onChange={(event) => {
                          const valueNumber = event.target.value === '' ? null : Number(event.target.value);
                          setForm((prev) => ({
                            ...prev,
                            mermaPct: valueNumber === null || !Number.isFinite(valueNumber) ? null : Math.max(0, valueNumber),
                          }));
                        }}
                        className="w-full rounded-lg border border-[#e6cdb0] bg-white px-3 py-2 text-sm text-[#5A3E1B] focus:border-amber-500 focus:outline-none focus:ring-2 focus:ring-amber-200"
                        placeholder="0"
                      />
                    </div>
                    <div className="flex flex-col gap-1">
                      <label className="text-sm font-semibold text-[#5A3E1B]">Costo mano de obra</label>
                      <input
                        type="number"
                        min={0}
                        step="0.01"
                        value={form.costoManoObra ?? ''}
                        onChange={(event) => {
                          const valueNumber = event.target.value === '' ? null : Number(event.target.value);
                          setForm((prev) => ({
                            ...prev,
                            costoManoObra:
                              valueNumber === null || !Number.isFinite(valueNumber) ? null : Math.max(0, valueNumber),
                          }));
                        }}
                        className="w-full rounded-lg border border-[#e6cdb0] bg-white px-3 py-2 text-sm text-[#5A3E1B] focus:border-amber-500 focus:outline-none focus:ring-2 focus:ring-amber-200"
                      />
                    </div>
                    <div className="flex flex-col gap-1">
                      <label className="text-sm font-semibold text-[#5A3E1B]">Costo empaque</label>
                      <input
                        type="number"
                        min={0}
                        step="0.01"
                        value={form.costoEmpaque ?? ''}
                        onChange={(event) => {
                          const valueNumber = event.target.value === '' ? null : Number(event.target.value);
                          setForm((prev) => ({
                            ...prev,
                            costoEmpaque:
                              valueNumber === null || !Number.isFinite(valueNumber) ? null : Math.max(0, valueNumber),
                          }));
                        }}
                        className="w-full rounded-lg border border-[#e6cdb0] bg-white px-3 py-2 text-sm text-[#5A3E1B] focus:border-amber-500 focus:outline-none focus:ring-2 focus:ring-amber-200"
                      />
                    </div>
                    <div className="flex flex-col gap-1">
                      <label className="text-sm font-semibold text-[#5A3E1B]">Overhead %</label>
                      <input
                        type="number"
                        min={0}
                        step="0.1"
                        value={form.overheadPct ?? ''}
                        onChange={(event) => {
                          const valueNumber = event.target.value === '' ? null : Number(event.target.value);
                          setForm((prev) => ({
                            ...prev,
                            overheadPct:
                              valueNumber === null || !Number.isFinite(valueNumber) ? null : Math.max(0, valueNumber),
                          }));
                        }}
                        className="w-full rounded-lg border border-[#e6cdb0] bg-white px-3 py-2 text-sm text-[#5A3E1B] focus:border-amber-500 focus:outline-none focus:ring-2 focus:ring-amber-200"
                      />
                    </div>
                    <div className="flex flex-col gap-1">
                      <label className="text-sm font-semibold text-[#5A3E1B]">Margen objetivo %</label>
                      <input
                        type="number"
                        min={0}
                        step="0.1"
                        value={form.margenObjetivoPct ?? ''}
                        onChange={(event) => {
                          const valueNumber = event.target.value === '' ? null : Number(event.target.value);
                          setForm((prev) => ({
                            ...prev,
                            margenObjetivoPct:
                              valueNumber === null || !Number.isFinite(valueNumber) ? null : Math.max(0, valueNumber),
                          }));
                        }}
                        className="w-full rounded-lg border border-[#e6cdb0] bg-white px-3 py-2 text-sm text-[#5A3E1B] focus:border-amber-500 focus:outline-none focus:ring-2 focus:ring-amber-200"
                      />
                    </div>
                  </div>

                  <LineaEditor value={form.lineas} onChange={handleLineChange} errors={errors.lineas} />
                  {errors.lineas && form.lineas.length === 0 && (
                    <p className="text-sm text-red-600">Agregá al menos un ingrediente antes de guardar.</p>
                  )}
                </div>

                <div className="space-y-4">
                  <ComputedSnapshot snapshot={snapshot} productPrice={initialData?.product?.price ?? null} />
                  {missingIngredientPrice && (
                    <div className="rounded-2xl border border-amber-300 bg-amber-50 p-3 text-sm text-[#5A3E1B]">
                      Algunos ingredientes no tienen un precio vigente. El costo puede estar subestimado.
                    </div>
                  )}
                  {onRecalculate && mode === 'edit' && (
                    <RecalculateButton onClick={onRecalculate} loading={recalculating} />
                  )}
                </div>
              </div>
            )}

            <div className="mt-6 flex flex-col gap-3 border-t border-[#f0dcc3] pt-4 sm:flex-row sm:justify-end">
              <button
                type="button"
                onClick={onClose}
                className="rounded-xl border border-[#e6cdb0] px-4 py-2 text-sm font-semibold text-[#5A3E1B] transition hover:bg-[#fff7ee]"
              >
                Cancelar
              </button>
              <button
                type="button"
                onClick={handleSubmit}
                disabled={saving}
                className="rounded-xl bg-amber-600 px-4 py-2 text-sm font-semibold text-white shadow transition hover:bg-amber-700 disabled:cursor-not-allowed disabled:opacity-60"
              >
                {saving ? 'Guardando…' : 'Guardar'}
              </button>
            </div>
          </div>
        </Dialog.Content>
      </Dialog.Portal>
    </Dialog.Root>
  );
}
