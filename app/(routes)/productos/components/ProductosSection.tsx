"use client";

import { useFilteredProducts } from "@/components/hooks/useFilteredProducts";
import AnimatedSection from "@/components/ui/AnimatedWrapper";
import ProductosFilters from "../filters/ProductosFilters";
import ProductosGrid from "./ProductosGrid";
import ProductosPagination from "./ProductosPagination";
import { SlidersHorizontal, ArrowUpDown, X } from "lucide-react";
import { useEffect, useState } from "react";
import { AnimatePresence, motion } from "framer-motion";

interface ProductosSectionProps {
  categoryFromUrl?: string;
}

const ProductosSection = ({ categoryFromUrl = "" }: ProductosSectionProps) => {
  const {
    products,
    totalFiltered,
    filters,
    setFilters,
    currentPage,
    setPage,
    totalPages,
    loading,
  } = useFilteredProducts();

  const { category, search, priceRange, onlyOffers, sort, unidad } = filters;
  const [minPrice, maxPrice] = priceRange;
  const [showMobileFilters, setShowMobileFilters] = useState(false);

  useEffect(() => {
    if (categoryFromUrl) {
      setFilters((prev) => ({ ...prev, category: categoryFromUrl }));
    }
  }, [categoryFromUrl, setFilters]);

  const toggleSortOrder = () => {
    setFilters((f) => ({
      ...f,
      sort: f.sort === "priceDesc" ? "priceAsc" : "priceDesc",
    }));
  };

  const handleClearFilters = () => {
    setFilters({
      search: "",
      category: "",
      sort: "",
      onlyOffers: false,
      unidad: "",
      priceRange: ["", ""],
    });
    setPage(1);
  };

  return (
    <AnimatedSection className="bg-[#FBE6D4]">
      <section
        aria-label="Listado de productos"
        className="max-w-screen-2xl mx-auto px-4 sm:px-6 lg:px-10 py-10 sm:py-16"
      >
        <header className="text-center mb-10">
          <h2 className="text-[#8B4513] text-3xl sm:text-4xl font-garamond italic">
            Nuestra selección de productos
          </h2>
          <p className="text-stone-500 italic font-garamond text-base sm:text-lg">
            Filtrá y descubrí las pastas que más se ajustan a vos
          </p>
          <p className="text-[#8B4513]/70 text-sm mt-2">
            {totalFiltered} productos encontrados
          </p>
        </header>

        {/* Controles móviles */}
        <div className="flex justify-between gap-2 mb-6 md:hidden">
          <button
            onClick={toggleSortOrder}
            aria-label="Ordenar por precio"
            className="flex items-center gap-2 px-4 py-2 rounded-xl bg-[#FFF4E3] text-[#8B4513] shadow-sm border border-[#E6D2B5] active:scale-95 transition-all"
          >
            <ArrowUpDown size={18} />
            {sort === "priceDesc" ? "Mayor precio" : "Menor precio"}
          </button>
          <button
            onClick={() => setShowMobileFilters(true)}
            aria-label="Abrir filtros"
            className="flex items-center gap-2 px-4 py-2 rounded-xl bg-[#FFF4E3] text-[#8B4513] shadow-sm border border-[#E6D2B5] active:scale-95 transition-all"
          >
            <SlidersHorizontal size={18} /> Filtrar
          </button>
        </div>

        <div className="flex flex-col md:flex-row gap-8 relative">
          {/* Filtros desktop */}
          <aside
            aria-label="Filtros de productos"
            className="hidden md:block w-full md:max-w-xs shrink-0"
          >
            <ProductosFilters
              selected={category}
              setSelected={(val) => setFilters((f) => ({ ...f, category: val }))}
              search={search}
              setSearch={(val) => setFilters((f) => ({ ...f, search: val }))}
              minPrice={minPrice ? minPrice.toString() : ""}
              setMinPrice={(val) =>
                setFilters((f) => ({ ...f, priceRange: [val, f.priceRange[1]] }))
              }
              maxPrice={maxPrice ? maxPrice.toString() : ""}
              setMaxPrice={(val) =>
                setFilters((f) => ({ ...f, priceRange: [f.priceRange[0], val] }))
              }
              onlyOffers={onlyOffers}
              setOnlyOffers={(val) =>
                setFilters((f) => ({ ...f, onlyOffers: val }))
              }
              sortOrder={
                sort === "priceAsc" ? "asc" : sort === "priceDesc" ? "desc" : ""
              }
              setSortOrder={(val) =>
                setFilters((f) => ({
                  ...f,
                  sort:
                    val === "asc"
                      ? "priceAsc"
                      : val === "desc"
                      ? "priceDesc"
                      : "",
                }))
              }
              unidad={unidad}
              setUnidad={(val) => setFilters((f) => ({ ...f, unidad: val }))}
            />
            <button
              onClick={handleClearFilters}
              className="mt-6 w-full px-4 py-2 rounded-xl bg-[#FFD966] text-[#8B4513] hover:bg-[#F5C741] transition-all shadow-sm font-semibold text-sm"
            >
              Limpiar filtros
            </button>
          </aside>

          {/* Listado de productos */}
          <main className="flex-1" aria-label="Productos">
            {loading ? (
              <div className="flex flex-col items-center justify-center min-h-[40vh] text-[#8B4513] text-center animate-pulse">
                <span className="text-2xl font-garamond italic">
                  Cargando productos...
                </span>
                <p className="text-sm mt-2 text-stone-500">
                  Un momento, el Tío Pelotte los está preparando 🍝
                </p>
              </div>
            ) : products.length === 0 ? (
              <div className="flex flex-col items-center justify-center text-center bg-[#FFF4E3] border border-[#EAD9C1] text-[#8B4513] rounded-xl p-6 shadow-sm mt-6 animate-fade-in min-h-[40vh]">
                <div className="text-5xl mb-3">🍝</div>
                <h3 className="text-2xl font-garamond italic mb-2">
                  No encontramos productos
                </h3>
                <p className="text-sm text-stone-600 max-w-md">
                  Probá cambiar los filtros o buscar otro tipo de pasta. ¡Seguro
                  tenemos algo que te va a encantar!
                </p>
                <button
                  onClick={handleClearFilters}
                  className="mt-6 px-5 py-2 rounded-full bg-[#FFD966] text-[#8B4513] hover:bg-[#F5C741] transition-all shadow-sm font-semibold text-sm"
                >
                  Limpiar filtros
                </button>
              </div>
            ) : (
              <>
                <ProductosGrid products={products} loading={false} />
                <ProductosPagination
                  totalPages={totalPages}
                  currentPage={currentPage}
                  setPage={setPage}
                />
              </>
            )}
          </main>
        </div>

        {/* Panel de filtros móviles */}
        <AnimatePresence>
          {showMobileFilters && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="fixed inset-0 z-50 flex md:hidden"
            >
              <motion.aside
                initial={{ x: "-100%" }}
                animate={{ x: 0 }}
                exit={{ x: "-100%" }}
                transition={{ duration: 0.3 }}
                className="w-4/5 max-w-xs h-full bg-[#FBE6D4] p-6 overflow-y-auto"
                aria-label="Filtros de productos"
              >
                <div className="flex justify-between items-center mb-4">
                  <h3 className="text-lg font-semibold text-[#8B4513]">Filtros</h3>
                  <button
                    onClick={() => setShowMobileFilters(false)}
                    aria-label="Cerrar filtros"
                    className="text-[#8B4513]"
                  >
                    <X size={20} />
                  </button>
                </div>
                <ProductosFilters
                  selected={category}
                  setSelected={(val) =>
                    setFilters((f) => ({ ...f, category: val }))
                  }
                  search={search}
                  setSearch={(val) =>
                    setFilters((f) => ({ ...f, search: val }))
                  }
                  minPrice={minPrice ? minPrice.toString() : ""}
                  setMinPrice={(val) =>
                    setFilters((f) => ({
                      ...f,
                      priceRange: [val, f.priceRange[1]],
                    }))
                  }
                  maxPrice={maxPrice ? maxPrice.toString() : ""}
                  setMaxPrice={(val) =>
                    setFilters((f) => ({
                      ...f,
                      priceRange: [f.priceRange[0], val],
                    }))
                  }
                  onlyOffers={onlyOffers}
                  setOnlyOffers={(val) =>
                    setFilters((f) => ({ ...f, onlyOffers: val }))
                  }
                  sortOrder={
                    sort === "priceAsc"
                      ? "asc"
                      : sort === "priceDesc"
                      ? "desc"
                      : ""
                  }
                  setSortOrder={(val) =>
                    setFilters((f) => ({
                      ...f,
                      sort:
                        val === "asc"
                          ? "priceAsc"
                          : val === "desc"
                          ? "priceDesc"
                          : "",
                    }))
                  }
                  unidad={unidad}
                  setUnidad={(val) =>
                    setFilters((f) => ({ ...f, unidad: val }))
                  }
                />
                <button
                  onClick={handleClearFilters}
                  className="mt-6 w-full px-4 py-2 rounded-xl bg-[#FFD966] text-[#8B4513] hover:bg-[#F5C741] transition-all shadow-sm font-semibold text-sm"
                >
                  Limpiar filtros
                </button>
              </motion.aside>
              <div
                className="flex-1 bg-black/40"
                onClick={() => setShowMobileFilters(false)}
                aria-label="Cerrar filtros"
              />
            </motion.div>
          )}
        </AnimatePresence>
      </section>
    </AnimatedSection>
  );
};

export default ProductosSection;