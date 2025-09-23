import { IngredientType } from "./ingredient";

export type Line = {
  id: number;
  Ingredientes: IngredientType[];
  qty: number;
  unit: string;
  unitPrice: number;
  subtotal: number;
};
