"use client"

interface Props {
  value: string
  setValue: (val: string) => void
}

const SearchInput = ({ value, setValue }: Props) => (
  <input
    type="text"
    placeholder="Buscar producto..."
    value={value}
    onChange={(e) => setValue(e.target.value)}
    className="text-sm px-3 py-2 border rounded w-full"
  />
)

export default SearchInput
