"use client";

import { Loader2, RefreshCw } from 'lucide-react';
import { ButtonHTMLAttributes } from 'react';

type Props = {
  onClick: () => void;
  loading?: boolean;
  size?: 'sm' | 'md';
} & Omit<ButtonHTMLAttributes<HTMLButtonElement>, 'onClick'>;

export default function RecalculateButton({ onClick, loading, size = 'md', ...rest }: Props) {
  const baseClasses =
    'inline-flex items-center gap-1 rounded-lg bg-emerald-600 text-white transition hover:bg-emerald-700 disabled:cursor-not-allowed disabled:opacity-60';
  const sizeClasses = size === 'sm' ? 'px-3 py-1 text-xs font-semibold' : 'px-4 py-2 text-sm font-semibold';

  return (
    <button type="button" onClick={onClick} disabled={loading} className={`${baseClasses} ${sizeClasses}`} {...rest}>
      {loading ? <Loader2 className="h-4 w-4 animate-spin" /> : <RefreshCw className="h-4 w-4" />}
      <span>{loading ? 'Recalculando…' : 'Recalcular'}</span>
    </button>
  );
}
