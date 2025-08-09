"use server";

import { revalidatePath } from "next/cache";

export async function addPedido(pedidoData: any) {
  const STRAPI_URL = "https://loved-ducks-790a0f88b6.strapiapp.com/api/pedidos";
  const STRAPI_TOKEN = process.env.STRAPI_API_TOKEN;

  if (!STRAPI_TOKEN) {
    throw new Error("Token de autenticación no disponible");
  }

  const payload = {
    data: pedidoData,
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

    const data = JSON.parse(text);

    if (!res.ok) {
      throw new Error(data?.error?.message || "Error al crear el pedido");
    }

    revalidatePath("/admin/pedidos");

    return data;
  } catch (error) {
    throw error;
  }
}
