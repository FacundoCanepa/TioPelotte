'use server';

import { revalidatePath } from 'next/cache';
import { SupplierType } from '@/types/supplier';
import { sanitizeSupplierPayload } from '@/app/api/admin/suppliers/strapi-helpers';

const API_URL = process.env.NEXT_PUBLIC_BACKEND_URL;

// A simple generic type for API responses that wrap data in a `data` property
type ApiDataResponse<T> = {
  data: T;
}

async function handleResponse<T>(response: Response): Promise<T> {
  const data = await response.json();
  if (!response.ok) {
    // Assuming the error response has a `message` property
    throw new Error(data.message || 'Ocurrió un error en la operación.');
  }
  return data;
}

export async function createSupplier(supplierData: Partial<SupplierType>): Promise<SupplierType> {
  let sanitized: Record<string, unknown>;
  try {
    sanitized = sanitizeSupplierPayload({ data: supplierData });
  } catch (error) {
    const message = error instanceof Error ? error.message : 'Datos inválidos del proveedor';
    throw new Error(message);
  }

  const response = await fetch(`${API_URL}/api/suppliers`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ data: sanitized }),
  });
  const result = await handleResponse<ApiDataResponse<SupplierType>>(response);
  revalidatePath('/admin/suppliers');
  return result.data;
}

export async function updateSupplier(documentId: string, supplierData: Partial<SupplierType>): Promise<SupplierType> {
  let sanitized: Record<string, unknown>;
  try {
    sanitized = sanitizeSupplierPayload({ data: supplierData });
  } catch (error) {
    const message = error instanceof Error ? error.message : 'Datos inválidos del proveedor';
    throw new Error(message);
  }

  const response = await fetch(`${API_URL}/api/suppliers/${documentId}`, {
    method: 'PUT',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ data: sanitized }),
  });
  const result = await handleResponse<ApiDataResponse<SupplierType>>(response);
  revalidatePath('/admin/suppliers');
  return result.data;
}

export async function deleteSupplier(documentId: string): Promise<void> {
  const response = await fetch(`${API_URL}/api/suppliers/${documentId}`, {
    method: 'DELETE',
  });
  // A DELETE request might not return a JSON body, so we handle it differently
  if (!response.ok) {
    if (response.status !== 204) { // 204 No Content is a success status for DELETE
      const data = await response.json().catch(() => ({})); // Try to parse error, default to empty object
      throw new Error(data.message || 'Error al eliminar el proveedor');
    }
  }
  revalidatePath('/admin/suppliers');
}