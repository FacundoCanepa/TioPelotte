
import { IngredientType } from "./ingredient";
import {IngredientSupplierPrice} from "./ingredient-supplier-price"
export type SupplierType = {
  id: number;
  documentId: string;    
  name: string;
  phone: number;
  active: boolean;
  ingredientes?: IngredientType[];
  ingredient_supplier_prices?: IngredientSupplierPrice[];
};
