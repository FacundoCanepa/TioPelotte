import { Product } from "./product";
import { Ingredient } from "./ingredient";

export type StockMovement = {
  id: number;
  product: Product;
  ingredientas: Ingredient[];
  quantity: number;
  unit: string;
  type: string;
  reason: string;
  note: string;
  performedBy: string;
  sourceOrder: string;
  resultingStock: number;
};
