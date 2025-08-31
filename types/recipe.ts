export type RelatedProductRef = {
  documentId: string;
  productName: string;
  slug: string;
};

export type Recipe = {
  id?: number; // internal, not used in UI
  documentId: string; // UUID used for updates/deletes
  titulo: string;
  slug: string;
  descripcion: string;
  tiempo: string;
  porciones: string;
  preparacion: string;
  imagen?: { url: string; alternativeText?: string | null } | null;
  productosRelacionados?: RelatedProductRef[];
  createdAt?: string;
  updatedAt?: string;
  publishedAt?: string | null;
};

export type RecipeCreateInput = Omit<
  Recipe,
  'id' | 'documentId' | 'imagen' | 'productosRelacionados' | 'createdAt' | 'updatedAt'
> & {
  published?: boolean; // convenience for UI switch
  productosRelacionados?: { documentId: string; slug?: string; productName?: string }[];
  // If available from image picker; server maps to Strapi media relation
  imagenId?: number;
};

export type RecipeUpdateInput = Partial<RecipeCreateInput>;

export type RecipesListResponse = {
  data: Recipe[];
  meta: {
    pagination: {
      page: number;
      pageSize: number;
      pageCount: number;
      total: number;
    };
    counts?: {
      total: number;
      published: number;
    };
  };
};

