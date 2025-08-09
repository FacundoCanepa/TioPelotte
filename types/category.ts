export type Category = {
  id: number;
  documentId: string;
  categoryNames: string;
  slug: string;
  description?: string;
  mainImage: {
    url: string;
    alternativeText?: string;
  };
  [key: string]: any;
};