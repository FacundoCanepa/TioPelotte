"use client"

interface Props {
  value: string
  setValue: (val: string) => void
}

const SortSelector = ({ value, setValue }: Props) => (
  <select
    value={value}
    onChange={(e) => setValue(e.target.value)}
    className="text-sm p-2 border rounded"
  >
    <option value="">Ordenar</option>
    <option value="priceAsc">Precio: menor a mayor</option>
    <option value="priceDesc">Precio: mayor a menor</option>
  </select>
)

export default SortSelector
