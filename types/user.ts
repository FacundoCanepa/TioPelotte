import { PedidoType } from "./pedido";

export type UserType = {
  id: number;
  username: string;
  email: string;
  jwt: string;
  telefono?: string;
  zona?: string;
  direccion?: string;
  referencias?: string;
  pedidos?: PedidoType[];
};