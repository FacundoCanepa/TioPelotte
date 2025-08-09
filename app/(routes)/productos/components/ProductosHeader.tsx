import SearchInput from "@/components/ui/productos-filters/SearchInput"
import CategorySelector from "@/components/ui/productos-filters/CategorySelector"
import SortSelector from "@/components/ui/productos-filters/SortSelector"
import OnlyOffersSwitch from "@/components/ui/productos-filters/OnlyOffersSwitch"
import PriceRange from "@/components/ui/productos-filters/PriceRange"

const ProductosHeader = ({ total, filters, setFilters, categories, layout = "vertical" }: any) => {
  const wrapperClasses =
    layout === "vertical"
      ? "flex flex-col gap-4"
      : "grid grid-cols-1 md:grid-cols-2 xl:grid-cols-4 gap-4"

  return (
    <div className="flex flex-col gap-6">
      <div className={wrapperClasses}>
        <SearchInput
          value={filters.search}
          setValue={(val) => setFilters((f: any) => ({ ...f, search: val }))}
        />
        <CategorySelector
          value={filters.category}
          setValue={(val) => setFilters((f: any) => ({ ...f, category: val }))}
          categories={categories}
        />
        <PriceRange
          value={filters.priceRange}
          setValue={(val) => setFilters((f: any) => ({ ...f, priceRange: val }))}
        />
        <SortSelector
          value={filters.sort}
          setValue={(val) => setFilters((f: any) => ({ ...f, sort: val }))}
        />
        <OnlyOffersSwitch
          value={filters.onlyOffers}
          setValue={(val) => setFilters((f: any) => ({ ...f, onlyOffers: val }))}
        />
      </div>
    </div>
  )
}

export default ProductosHeader
