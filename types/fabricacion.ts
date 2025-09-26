export type ProductLite = {
  id: number;
  documentId?: string | null;
  productName: string;
  slug?: string | null;
  price?: number | null;
};

export type IngredienteLite = {
  id: number;
  documentId?: string | null;
  ingredienteName: string;
  unidadMedida?: string | null;
  price?: number | null;
};

export type FabricacionLine = {
  id?: number;
  ingredient: IngredienteLite | null;
  cantidad: number;
  unidad: string;
  mermaPct?: number | null;
  nota?: string | null;
};

export type FabricacionSnapshot = {
  ingredientesCostoTotal: number | null;
  costoTotalBatch: number | null;
  costoUnitario: number | null;
  precioSugerido: number | null;
  margenRealPct: number | null;
  lastCalculatedAt: string | null;
};

export type FabricacionDoc = {
  id: number;
  documentId?: string | null;
  nombre: string;
  product: ProductLite | null;
  batchSize: number;
  mermaPct: number | null;
  costoManoObra: number | null;
  costoEmpaque: number | null;
  overheadPct: number | null;
  margenObjetivoPct: number | null;
  lineas: FabricacionLine[];
  snapshots: FabricacionSnapshot;
  updatedAt?: string | null;
  publishedAt?: string | null;
  createdAt?: string | null;
  needsRecalculation: boolean;
};

export type FabricacionListMeta = {
  page: number;
  pageSize: number;
  pageCount: number;
  total: number;
};

export type FabricacionListResponse = {
  items: FabricacionDoc[];
  meta: FabricacionListMeta;
};

export type FabricacionPayloadLine = {
  id?: number;
  ingredientId: number | null;
  cantidad: number;
  unidad: string;
  mermaPct?: number | null;
  nota?: string | null;
};

export type FabricacionPayload = {
  nombre: string;
  productId?: number | null;
  batchSize: number;
  mermaPct?: number | null;
  costoManoObra?: number | null;
  costoEmpaque?: number | null;
  overheadPct?: number | null;
  margenObjetivoPct?: number | null;
  lineas: FabricacionPayloadLine[];
};

export type FabricacionFiltersState = {
  search: string;
  status: 'all' | 'draft' | 'published';
  productId: number | null;
  page: number;
  pageSize: number;
};
