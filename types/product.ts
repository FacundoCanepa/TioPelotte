export type ProductType = {
  id: number;
  documentId: string;
  productName: string;
  slug: string;
  description: string;
  descriptionCorta: string | null;

  img: {
    id: number;
    url: string;
  }[];

  img_carousel?: {
    id: number;
    url: string;
        alternativeText?: string;
  }[];

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
  };

  ingredientes?: {
    ingredienteName: string;
  }[];

  porciones?: string;

  tiempoEstimado?: string;

  stock?: number;
  stockUpdatedAt?: string;
};