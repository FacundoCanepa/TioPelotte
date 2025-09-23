import { IngredientType } from "./ingredient";
import { Supplier } from "./supplier";

export type IngredientSupplierPrice = {
  id: number;
  ingrediente: IngredientType;
  supplier: Supplier;
  unitPrice: number;
  currency: string;
  unit: string;
  minOrderQty: number;
  validFrom: string;
};
