"use client"

interface Props {
  value: [number, number]
  setValue: (val: [number, number]) => void
}

const PriceRange = ({ value, setValue }: Props) => (
  <div className="flex flex-col text-sm">
    <span>Rango de precio</span>
    <div className="flex gap-2 mt-1">
      <input
        type="number"
        placeholder="Mín"
        value={value[0]}
        onChange={(e) => setValue([+e.target.value, value[1]])}
        className="p-1 border rounded w-full"
      />
      <input
        type="number"
        placeholder="Máx"
        value={value[1]}
        onChange={(e) => setValue([value[0], +e.target.value])}
        className="p-1 border rounded w-full"
      />
    </div>
  </div>
)

export default PriceRange
