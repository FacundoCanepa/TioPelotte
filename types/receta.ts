export type RecetaType = {
  id: number;
  titulo: string;
  slug: string;
  descripcion: string;
  tiempo: string;
  porciones: string;
  preparacion: string;
  img: {
    url: string;
  } | null;
  products: {
    id: number;
    productName: string;
    slug: string;
    price: number;
    img: { url: string }[];
  }[];
};
