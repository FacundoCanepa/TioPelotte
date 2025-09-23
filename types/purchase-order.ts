import { IngredientType } from "./ingredient";
import { Line } from "./line";

export type PurchaseOrder = {
  id: number;
  code: string;
  estado: string;
  total: number;
  notes: string;
  orderedAt: string;
  expectedAt: string;
  receivedAt: string;
  Line: Line[];
  Ingredientes: IngredientType[];
  city: number;
};
