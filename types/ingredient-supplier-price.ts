import type { IngredientType } from "./ingredient";
import type { SupplierType } from "./supplier";
import {Category} from "./categoria_ingrediente"

export type IngredientSupplierPrice = {
  id: number;
  ingrediente: IngredientType;
  supplier: SupplierType;
  unitPrice: number;
  currency: string;
  unit: string;
  minOrderQty: number;
  validFrom: string;
  categoria_ingrediente: Category ;
};