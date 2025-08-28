import { ItemType } from "./item";

/** Estados soportados en la UI */
export type PedidoEstado = "Pendiente" | "En camino" | "Entregado" | "Cancelado";
/** Tipos de entrega soportados en la UI */
export type PedidoEntrega = "domicilio" | "local";

/** Línea de item flexible (soporta tu ItemType y también el shape que viene serializado en JSON) */
export type PedidoLineItem =
  | ItemType
  | {
      title?: string;
      product_name?: string;
      quantity?: number;
      unit_price?: number;
      // variantes que a veces llegan:
      price?: number;
      qty?: number;
    };

/** Puede venir como array ya parseado o como string JSON */
export type PedidoItems = PedidoLineItem[] | string | null;

export type PedidoType = {
  id: number;
  documentId: string;            // ← requerido para actualizar por /api/pedidos/:id
  items?: PedidoItems;           // ← array o string JSON
  total: number;

  estado: PedidoEstado;
  tipoEntrega: PedidoEntrega;
  tipoPago: string;

  zona?: string | null;
  direccion?: string | null;
  referencias?: string | null;

  telefono?: string | null;
  nombre?: string | null;
  nombreApellido?: string | null;

  payment_id?: string | null;    // si usás MP u otro gateway
  createdAt: string;
  updatedAt?: string | null;
};
