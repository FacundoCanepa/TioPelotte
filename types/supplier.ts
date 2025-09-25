import type { IngredientType } from "./ingredient";
import type { IngredientSupplierPrice } from "./ingredient-supplier-price";

export type SupplierType = {
  id: number;
  documentId: string;
  name: string;
  phone: string | null;
  active: boolean | null;
  ingredientes: IngredientType[];
  ingredient_supplier_prices: IngredientSupplierPrice[];
};