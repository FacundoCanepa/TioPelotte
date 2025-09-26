"use client";

import { FabricacionSnapshot } from '@/types/fabricacion';

const currencyFormatter = new Intl.NumberFormat('es-AR', {
  style: 'currency',
  currency: 'ARS',
  minimumFractionDigits: 2,
  maximumFractionDigits: 2,
});

const percentFormatter = new Intl.NumberFormat('es-AR', {
  minimumFractionDigits: 2,
  maximumFractionDigits: 2,
});

const dateFormatter = new Intl.DateTimeFormat('es-AR', { dateStyle: 'short', timeStyle: 'short' });

type Props = {
  snapshot?: FabricacionSnapshot | null;
  productPrice?: number | null;
};

function formatCurrency(value: number | null | undefined) {
  if (value === null || value === undefined) return '—';
  return currencyFormatter.format(value);
}

function formatPercent(value: number | null | undefined) {
  if (value === null || value === undefined) return '—';
  return `${percentFormatter.format(value)}%`;
}

function formatDate(value: string | null | undefined) {
  if (!value) return '—';
  const parsed = new Date(value);
  if (Number.isNaN(parsed.getTime())) return value;
  return dateFormatter.format(parsed);
}

export default function ComputedSnapshot({ snapshot, productPrice }: Props) {
  return (
    <div className="rounded-2xl bg-[#fff7ee] p-4">
      <h3 className="text-sm font-semibold uppercase tracking-wide text-[#5A3E1B]">Costos calculados</h3>
      <div className="mt-4 grid gap-4 sm:grid-cols-2">
        <Metric label="Costo total ingredientes" value={formatCurrency(snapshot?.ingredientesCostoTotal ?? null)} />
        <Metric label="Costo total por batch" value={formatCurrency(snapshot?.costoTotalBatch ?? null)} />
        <Metric label="Costo unitario" value={formatCurrency(snapshot?.costoUnitario ?? null)} />
        <Metric label="Precio sugerido" value={formatCurrency(snapshot?.precioSugerido ?? null)} />
        <Metric label="Margen real" value={productPrice ? formatPercent(snapshot?.margenRealPct ?? null) : '—'} />
        <Metric label="Último cálculo" value={formatDate(snapshot?.lastCalculatedAt ?? null)} />
      </div>
      <p className="mt-2 text-xs text-[#8c6d4c]">
        Estos valores se actualizan cuando presionás “Recalcular costos”.
      </p>
    </div>
  );
}

type MetricProps = {
  label: string;
  value: string;
};

function Metric({ label, value }: MetricProps) {
  return (
    <div className="flex flex-col rounded-xl border border-[#f0dcc3] bg-white px-3 py-2">
      <span className="text-xs font-medium uppercase text-[#a57c52]">{label}</span>
      <span className="text-sm font-semibold text-[#5A3E1B]">{value}</span>
    </div>
  );
}
