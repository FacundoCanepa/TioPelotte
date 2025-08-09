"use client";
import { CheckCircle } from "lucide-react";

export default function SuccessMessage({ estado }: { estado: string }) {
  return (
    <>
      <CheckCircle size={64} className="mx-auto text-green-600" />
      <h1 className="text-3xl font-bold font-garamond">{estado}</h1>
      <p className="text-sm text-[#8B4513]">
        En breve nos pondremos en contacto para coordinar la entrega o el retiro del pedido.
      </p>
    </>
  );
}
