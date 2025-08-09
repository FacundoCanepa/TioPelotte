export type Category = {
  id: number;
  categoryNames: string;
  slug: string;
  description?: string;
  mainImage: {
    url: string;
    alternativeText?: string;
  };
  [key: string]: any;
};