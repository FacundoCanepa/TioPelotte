import {Category} from "./categoria_ingrediente"
import type { SupplierType } from "./supplier";

export type IngredientType = {
  id: number;
  documentId: string;
  ingredienteName: string;
  Stock: number;
  unidadMedida: string;
  precio: number;
  stockUpdatedAt?: string | null;
  categoria_ingrediente: Category
  supplier?: SupplierType;
  minOrderQty?: number;
  validFrom?: string;
};