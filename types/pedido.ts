import { ItemType } from "./item";

export type PedidoType = {
  id: number;
  documentId?: string;
  items: ItemType[];
  total: number;
  estado: string;
  tipoEntrega: string;
  tipoPago: string;
  zona: string;
  direccion: string;
  referencias?: string;
  telefono?: string;
  nombre?: string;
  nombreApellido?: string;
  createdAt: string;
};