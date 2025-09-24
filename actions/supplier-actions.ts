
'use server';

import { revalidatePath } from 'next/cache';
import { SupplierType } from '@/types/supplier';
import { ApiResponse } from '@/types/response';

const API_URL = process.env.NEXT_PUBLIC_API_URL;

async function handleResponse<T>(response: Response): Promise<T> {
  const data = await response.json();
  if (!response.ok) {
    throw new Error(data.message || 'Ocurrió un error en la operación.');
  }
  return data;
}

export async function createSupplier(supplierData: Partial<SupplierType>): Promise<SupplierType> {
  const response = await fetch(`${API_URL}/suppliers`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(supplierData),
  });
  const result = await handleResponse<ApiResponse<SupplierType>>(response);
  revalidatePath('/admin/suppliers'); // O la ruta que corresponda
  return result.data;
}

export async function updateSupplier(id: number, supplierData: Partial<SupplierType>): Promise<SupplierType> {
  const response = await fetch(`${API_URL}/suppliers/${id}`, {
    method: 'PATCH', // O 'PUT'
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(supplierData),
  });
  const result = await handleResponse<ApiResponse<SupplierType>>(response);
  revalidatePath('/admin/suppliers');
  return result.data;
}

export async function deleteSupplier(id: number): Promise<void> {
  const response = await fetch(`${API_URL}/suppliers/${id}`, {
    method: 'DELETE',
  });
  if (response.status !== 204) { // No Content
    const data = await response.json();
    throw new Error(data.message || 'Error al eliminar el proveedor');
  }
  revalidatePath('/admin/suppliers');
}
