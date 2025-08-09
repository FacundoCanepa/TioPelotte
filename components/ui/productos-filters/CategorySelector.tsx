"use client"

interface Props {
  value: string
  setValue: (val: string) => void
  categories: { slug: string; categoryNames: string }[]
}

const CategorySelector = ({ value, setValue, categories }: Props) => (
  <select
    value={value}
    onChange={(e) => setValue(e.target.value)}
    className="text-sm p-2 border rounded"
  >
    <option value="">Todas las categorías</option>
    {Array.isArray(categories) &&
      categories.map((cat) => (
        <option key={cat.slug} value={cat.slug}>
          {cat.categoryNames}
        </option>
      ))}
  </select>
)

export default CategorySelector
