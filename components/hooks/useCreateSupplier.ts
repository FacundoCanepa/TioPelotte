"use server";

import { revalidatePath } from "next/cache";
import { SupplierType } from "@/types/supplier";
import { sanitizeSupplierPayload } from "@/app/api/admin/suppliers/strapi-helpers";

function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === "object" && value !== null;
}

export async function createSupplier(supplierData: Partial<SupplierType>) {
  const STRAPI_URL = `${process.env.NEXT_PUBLIC_BACKEND_URL}/api/suppliers`;
  const STRAPI_TOKEN = process.env.STRAPI_ADMIN_TOKEN || process.env.STRAPI_API_TOKEN;

  if (!STRAPI_TOKEN) {
    throw new Error("Token de autenticación no disponible");
  }

  let sanitizedPayload: Record<string, unknown>;
  try {
    sanitizedPayload = sanitizeSupplierPayload({ data: supplierData });
  } catch (error) {
    const message = error instanceof Error ? error.message : "Datos del proveedor inválidos";
    throw new Error(message);
  }

  const res = await fetch(STRAPI_URL, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${STRAPI_TOKEN}`,
    },
    body: JSON.stringify({ data: sanitizedPayload }),
  });

  const text = await res.text();
  let parsed: unknown = null;
  if (text) {
    try {
      parsed = JSON.parse(text);
    } catch {
      parsed = text;
    }
  }

  if (!res.ok) {
    let message = "Error al crear el proveedor";
    if (isRecord(parsed) && isRecord(parsed.error) && typeof parsed.error.message === "string") {
      message = parsed.error.message;
    }
    throw new Error(message);
  }

  if (!isRecord(parsed)) {
    throw new Error(`Error al procesar la respuesta del servidor: ${text}`);
  }

  revalidatePath("/admin/suppliers");

  return parsed;
}