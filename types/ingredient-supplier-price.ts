import { Ingredient } from "./ingredient";
import { Supplier } from "./supplier";

export type IngredientSupplierPrice = {
  id: number;
  ingrediente: Ingredient;
  supplier: Supplier;
  unitPrice: number;
  currency: string;
  unit: string;
  minOrderQty: number;
  validFrom: string;
};
