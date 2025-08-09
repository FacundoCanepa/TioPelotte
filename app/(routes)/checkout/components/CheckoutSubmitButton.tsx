"use client";

import Button from "@/components/ui/Buttones";

interface Props {
  label?: string;
}

export default function CheckoutSubmitButton({ label = "Confirmar pedido" }: Props) {
  return (
    <Button type="submit" className="w-full bg-[#FFD966] text-[#5A3E1B] hover:bg-[#f5c741]">
      {label}
    </Button>
  );
}