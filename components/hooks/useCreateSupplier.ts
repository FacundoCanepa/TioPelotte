"use server";

import { revalidatePath } from "next/cache";
import { SupplierType } from "@/types/supplier";

export async function createSupplier(supplierData: Partial<SupplierType>) {
  const STRAPI_URL = `${process.env.NEXT_PUBLIC_BACKEND_URL}/api/suppliers`;
  const STRAPI_TOKEN = process.env.STRAPI_ADMIN_TOKEN || process.env.STRAPI_API_TOKEN;

  if (!STRAPI_TOKEN) {
    throw new Error("Token de autenticación no disponible");
  }

  const payload = {
    data: supplierData,
  };

  try {
    const res = await fetch(STRAPI_URL, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${STRAPI_TOKEN}`,
      },
      body: JSON.stringify(payload),
    });

    const text = await res.text();

    try {
      const data = JSON.parse(text);
      if (!res.ok) {
        throw new Error(data?.error?.message || "Error al crear el proveedor");
      }
      
      revalidatePath("/admin/suppliers");
      
      return data;

    } catch (error) {
      // Handle cases where response is not JSON
      throw new Error(`Error al procesar la respuesta del servidor: ${text}`);
    }

  } catch (error) {
    throw error;
  }
}
