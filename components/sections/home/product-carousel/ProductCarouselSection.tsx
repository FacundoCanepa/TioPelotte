"use client";

import AnimatedSection from "@/components/ui/AnimatedWrapper";
import dynamic from "next/dynamic";
const ProductCarousel = dynamic(() => import("@/components/ui/ProductCarousel"));
import SkeletonCarousel from "@/components/ui/skeletonSchema";
import { useRouter } from "next/navigation";
import type { ProductType } from "@/types/product";
import Button from "@/components/ui/Buttones";

interface ProductState {
  loading: boolean;
  result: ProductType[] | null;
  error: string;
}

interface Props {
  title: string;
  subtitle: string;
  buttonText?: string;
  buttonHref?: string;
  products: ProductState;
}

const ProductCarouselSection = ({
  title,
  subtitle,
  buttonText,
  buttonHref,
  products,
}: Props) => {
  const { loading, result, error } = products;
  const router = useRouter();

  return (
    <AnimatedSection>
      <div className="w-full max-w-[90rem] mx-auto py-12 px-2 sm:px-4 lg:px-6">
        <div className="text-center mb-6">
          <h3 className="font-garamond text-3xl md:text-5xl italic tracking-wide">
            {title}
          </h3>
          <p className="text-stone-600 italic font-garamond text-lg mt-1">
            {subtitle}
          </p>
          {buttonText && buttonHref && (
            <Button className="mt-4" onClick={() => router.push(buttonHref)}>
              {buttonText}
            </Button>
          )}
        </div>

        <div className="mt-4">
          {loading && <SkeletonCarousel count={4} />}
          {!loading && error && (
            <p className="text-center text-stone-500">{error}</p>
          )}
          {!loading && !error && result && (
            <ProductCarousel products={result} />
          )}
        </div>
      </div>
    </AnimatedSection>
  );
};

export default ProductCarouselSection;
