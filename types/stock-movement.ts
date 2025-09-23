import { ProductType } from "./product";
import { IngredientType } from "./ingredient";

export type StockMovement = {
  id: number;
  product: ProductType;
  ingredientas: IngredientType[];
  quantity: number;
  unit: string;
  type: string;
  reason: string;
  note: string;
  performedBy: string;
  sourceOrder: string;
  resultingStock: number;
};
