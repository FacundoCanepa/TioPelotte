import {Category} from "./categoria_ingrediente"
import type { SupplierType } from "./supplier";

export type IngredientType = {
  id: number;
  documentId: string;
  ingredienteName: string;
  ingredienteNameProducion?: string | null;
  Stock: number;
  unidadMedida: string;
  quantityNeto?: number | null;
  precio: number;
  stockUpdatedAt?: string | null;
  updatedAt?: string | null;
  categoria_ingrediente: Category;
  supplier?: SupplierType;
  minOrderQty?: number;
  validFrom?: string;
};