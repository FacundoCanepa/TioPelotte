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
  updatedAt: string | null;
  
  // Medias provenientes de Strapi
  img: number | StrapiMedia | StrapiMedia[] | null;
  img_carousel?: number | StrapiMedia | (StrapiMedia | number)[] | null;

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
    id?: number;
    documentId?: string;
    ingredienteName: string;
    ingredienteNameProducion?: string | null;
  }[];

  porciones?: string;

  tiempoEstimado?: string;

  stock?: number;
  stockUpdatedAt?: string;

  // Campos auxiliares de admin (opcionales)
  imgPreview?: string | null;
  img_carousel_preview?: string[] | null;
};