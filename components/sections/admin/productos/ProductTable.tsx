'use client';

import Image from 'next/image';
import { Pencil, Trash2, ImageOff, AlertTriangle, Star, CheckCircle2 } from 'lucide-react';
import { ProductType } from '@/types/product';
import { LOW_STOCK_THRESHOLD } from '@/lib/inventory';
import { toMediaURL } from '@/utils/media';

interface Props {
  productos: ProductType[];
  onEdit: (p: ProductType) => void;
  onDelete: (documentId: string) => void;
  orderBy: { field: keyof ProductType; direction: 'asc' | 'desc' };
  setOrderBy: (val: { field: keyof ProductType; direction: 'asc' | 'desc' }) => void;
}

function formatCurrency(n?: number) {
  try {
    return new Intl.NumberFormat('es-AR', { style: 'currency', currency: 'ARS', maximumFractionDigits: 0 }).format(n ?? 0);
  } catch {
    return `$${n ?? 0}`;
  }
}

export default function ProductTable({ productos, onEdit, onDelete }: Props) {
  return (
    <div className='grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4 sm:gap-6'>
      {productos.map((p) => {
        const url = toMediaURL(Array.isArray(p.img) ? p.img[0]?.url : (p.img as any)?.url);
        const lowStock = typeof p.stock === 'number' && p.stock <= LOW_STOCK_THRESHOLD;

        return (
          <div key={p.documentId} className='overflow-hidden rounded-2xl shadow-sm bg-white flex flex-col border border-transparent hover:border-[#8B4513] transition-all duration-300 group'>
            <div className='relative aspect-[4/3] w-full overflow-hidden'>
              {url ? (
                <Image
                  src={url}
                  alt={p.productName ?? 'Producto'}
                  fill
                  className='object-cover w-full h-full transition-transform duration-300 group-hover:scale-105'
                  sizes='(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 33vw'
                />
              ) : (
                <div className='w-full h-full bg-gray-100 flex items-center justify-center text-gray-400'>
                  <ImageOff className='h-10 w-10' />
                </div>
              )}
              <div className='absolute top-2 right-2 flex flex-col gap-2'>
                {p.isOffer && (
                  <span className='inline-flex items-center gap-1.5 rounded-full bg-yellow-500/90 px-2.5 py-1 text-xs font-semibold text-white shadow-md'>
                    <Star className='h-3.5 w-3.5' />
                    Oferta
                  </span>
                )}
                {lowStock && (
                  <span className='inline-flex items-center gap-1.5 rounded-full bg-red-600/90 px-2.5 py-1 text-xs font-semibold text-white shadow-md'>
                    <AlertTriangle className='h-3.5 w-3.5' />
                    Stock Bajo
                  </span>
                )}
              </div>
              {!p.active && (
                  <div className='absolute inset-0 bg-white/60 flex items-center justify-center'>
                    <span className='font-semibold text-gray-600'>Inactivo</span>
                  </div>
              )}
            </div>

            <div className='p-4 flex flex-col flex-grow'>
              <h3 className='text-base font-bold text-[#4A2E15] capitalize truncate group-hover:text-[#8B4513]'>
                {p.productName}
              </h3>
              {p.category?.categoryNames && (
                <p className='text-xs text-gray-500 mb-2'>{p.category.categoryNames}</p>
              )}

              <div className='mt-auto space-y-2 pt-2'>
                  <div className='flex justify-between items-center'>
                    <span className='text-sm font-medium text-gray-600'>Precio:</span>
                    <span className='text-lg font-semibold text-[#8B4513]'>{formatCurrency(p.price as any)}</span>
                  </div>
                  <div className='flex justify-between items-center'>
                    <span className='text-sm font-medium text-gray-600'>Stock:</span>
                    <span className={`font-semibold ${lowStock ? 'text-red-600' : 'text-gray-800'}`}>{p.stock ?? 0}</span>
                  </div>
              </div>
            </div>
            
            <div className='p-3 bg-gray-50/70 border-t flex gap-2'>
              <button
                onClick={() => onEdit(p)}
                className='flex-1 inline-flex items-center justify-center gap-2 rounded-lg px-3 py-2 text-sm font-semibold text-gray-700 bg-white border border-gray-300 hover:bg-gray-100 min-h-[40px] transition-colors focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-[#8B4513]'
              >
                <Pencil className='h-4 w-4' />
                Editar
              </button>
              <button
                onClick={() => onDelete(p.documentId)}
                className='inline-flex items-center justify-center rounded-lg p-2.5 text-red-600 bg-white border border-gray-300 hover:bg-red-50 hover:text-red-700 min-h-[40px] aspect-square transition-colors focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-red-500'
                aria-label={`Eliminar ${p.productName}`}
              >
                <Trash2 className='h-4 w-4' />
              </button>
            </div>
          </div>
        );
      })}
    </div>
  );
}
