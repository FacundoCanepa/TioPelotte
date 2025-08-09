"use client"

interface Props {
  value: boolean
  setValue: (val: boolean) => void
}

const OnlyOffersSwitch = ({ value, setValue }: Props) => (
  <label className="flex items-center gap-2 text-sm">
    <input
      type="checkbox"
      checked={value}
      onChange={(e) => setValue(e.target.checked)}
    />
    Solo ofertas
  </label>
)

export default OnlyOffersSwitch
