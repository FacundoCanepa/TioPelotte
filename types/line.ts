import { Ingredient } from "./ingredient";

export type Line = {
  id: number;
  Ingredientes: Ingredient[];
  qty: number;
  unit: string;
  unitPrice: number;
  subtotal: number;
};
