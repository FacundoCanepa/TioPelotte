export type StrapiMedia = {
  id: number;
  url: string;
  alternativeText?: string;
};

export type ProductType = {
  id: number;
  documentId: string;
  productName: string;
  slug: string;
  description: string;
  descriptionCorta: string | null;

  // Medias provenientes de Strapi
  img: StrapiMedia | StrapiMedia[] | number | null;
  img_carousel?: (StrapiMedia | number)[] | null;

  unidadMedida: string;
  taste: string;
  price: number;
  active: boolean;
  isFeatured: boolean | null;
  isOffer: boolean | null;

  category: {
    id: number;
    categoryNames: string;
    slug: string;
    documentId?: string;
  };

  ingredientes?: {
    ingredienteName: string;
  }[];

  porciones?: string;

  tiempoEstimado?: string;

  stock?: number;
  stockUpdatedAt?: string;

  // Campos auxiliares de admin (opcionales)
  imgPreview?: string | null;
  img_carousel_preview?: string[] | null;
};