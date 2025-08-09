export type IngredientType = {
  id: number;
  documentId: string;
  nombre: string;
  stock: number;
  unidadMedida: string;
  precio: number;
  stockUpdatedAt?: string | null;
};