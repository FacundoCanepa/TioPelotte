import {IngredientType} from "./ingredient"
import {IngredientSupplierPrice} from "./ingredient-supplier-price"

export type Category = {
  id: number;
  documentId: string;
  nombre: string;
  description?: string;
  ingredientes: IngredientType[];
  ingredient_supplier_prices: IngredientSupplierPrice[];
};