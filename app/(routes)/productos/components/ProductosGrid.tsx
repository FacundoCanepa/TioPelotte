"use client";

import ProductGridCard from "./ProductGridCard";
import { ProductType } from "@/types/product";

interface ProductosGridProps {
  products: ProductType[];
  loading?: boolean;
}

const ProductosGrid = ({ products, loading }: ProductosGridProps) => {
  if (loading) {
    return (
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6" />
    );
  }

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
      {products.map((product) => (
        <ProductGridCard key={product.id} product={product} />
      ))}
    </div>
  );
};

export default ProductosGrid;