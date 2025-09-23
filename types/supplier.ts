import { IngredientType } from "./ingredient";
import { IngredientSupplierPrice } from "./ingredient-supplier-price";

export type Supplier = {
  id: number;
  name: string;
  phone: number;
  active: boolean;
  ingredientas: IngredientType[];
  ingredient_supplier_prices: IngredientSupplierPrice[];
};
