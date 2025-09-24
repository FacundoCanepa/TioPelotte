
import { IngredientType } from "./ingredient";

export type SupplierType = {
  id: number;
  name: string;
  phone: number;
  active: boolean;
  ingredientes?: IngredientType[];
};
