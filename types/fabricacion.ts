export type FabricacionLine = {
  id?: number;
  cantidad: number;
  unidad: string;
  mermaPct: number;
  nota: string | null;
};

export type FabricacionProduct = {
  id?: number;
  documentId: string;
  productName: string;
  slug?: string;
  price?: number | null;
  unidadMedida?: string | null;
};

export type Fabricacion = {
  id?: number;
  documentId: string;
  nombre: string;
  batchSize: number;
  mermaPct: number;
  costoManoObra: number;
  costoEmpaque: number;
  overheadPct: number;
  margenObjetivoPct: number;
  ingredientesCostoTotal: number;
  costoTotalBatch: number;
  costoUnitario: number | null;
  precioSugerido: number;
  margenRealPct: number;
  lastCalculatedAt?: string | null;
  createdAt?: string;
  updatedAt?: string;
  publishedAt?: string | null;
  product?: FabricacionProduct | null;
  lineas?: FabricacionLine[];
};

export type FabricacionListResponse = {
  items: Fabricacion[];
  meta?: {
    pagination?: {
      page?: number;
      pageSize?: number;
      pageCount?: number;
      total?: number;
    };
  };
};
