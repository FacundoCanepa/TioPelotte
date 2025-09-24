
export type IngredientType = {
  id: number;
  documentId: string;
  ingredienteName: string;
  stock: number;
  unidadMedida: string;
  precio: number;
  stockUpdatedAt?: string | null;
};
