import { IngredientType } from "./ingredient";
import { SupplierType } from "./supplier";

export type IngredientSupplierPrice = {
  id: number;
  ingrediente: IngredientType;
  supplier: SupplierType;
  unitPrice: number;
  currency: string;
  unit: string;
  minOrderQty: number;
  validFrom: string;
};
