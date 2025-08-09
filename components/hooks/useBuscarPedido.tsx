"use client";

import { useState } from "react";
import type { PedidoType } from "@/types/pedido";

export function useBuscarPedido() {
  const [telefono, setTelefono] = useState("");
  const [pedido, setPedido] = useState<PedidoType | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const buscarPedido = async () => {
    if (!telefono.trim()) return;

    setLoading(true);
    setError("");
    setPedido(null);

    try {
      const url = `${process.env.NEXT_PUBLIC_BACKEND_URL}/api/pedidos?filters[telefono][$eq]=${telefono}&sort=createdAt:desc&pagination[limit]=1`;

      const res = await fetch(url);
      const data = await res.json();


      if (data?.data?.length > 0) {
        setPedido(data.data[0]);
      } else {
        setError("No encontramos ningún pedido con ese número.");
      }
    } catch (err) {
      setError("Ocurrió un error al consultar el pedido.");
    } finally {
      setLoading(false);
    }
  };

  return {
    telefono,
    setTelefono,
    pedido,
    loading,
    error,
    buscarPedido,
  };
}