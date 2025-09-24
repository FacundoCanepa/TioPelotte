import { IngredientType } from "./ingredient";
import { IngredientSupplierPrice } from "./ingredient-supplier-price";

export type SupplierType = {
  id?: number | null;
  documentId: string;
  name: string;
  phone?: string | null;
  active?: boolean | null;
  ingredientes?: IngredientType[];
  ingredient_supplier_prices?: IngredientSupplierPrice[];
};