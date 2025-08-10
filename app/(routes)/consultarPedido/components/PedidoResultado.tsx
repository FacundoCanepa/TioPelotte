"use client";

import { usePedidoContext } from "./PedidoProvider";
import Image from "next/image";
import { useGetProductByName } from "@/components/hooks/useGetProductByName";
import SkeletonConsultarPedido from "@/components/ui/SkeletonConsultarPedido";
import type { PedidoType } from "@/types/pedido";
import type { ItemType } from "@/types/item";
import { resolveStrapiMediaUrl } from "@/lib/media";

function EstadoBadge({ estado }: { estado: string }) {
  const color =
    estado === "Pendiente"
      ? "bg-[#FFD966] text-[#5A3E1B]"
      : estado === "En camino"
      ? "bg-[#6B8E23] text-white"
      : estado === "Entregado"
      ? "bg-green-600 text-white"
      : estado === "Cancelado"
      ? "bg-red-600 text-white"
      : "bg-gray-400 text-white";

  return (
    <span className={`inline-block text-sm font-semibold px-3 py-1 rounded-full ${color}`}>
      {estado}
    </span>
  );
}

function PedidoInfoCard({ pedido }: { pedido: PedidoType }) {
  const info: { label: string; value?: string | number | null }[] = [
    { label: "Nombre", value: pedido.nombre },
    { label: "Total", value: `$${pedido.total?.toLocaleString("es-AR")}` },
    { label: "Entrega", value: pedido.tipoEntrega },
    { label: "Pago", value: pedido.tipoPago },
    { label: "Zona", value: pedido.zona },
    { label: "Dirección", value: pedido.direccion },
    { label: "Referencias", value: pedido.referencias },
  ];

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 gap-4 bg-white rounded-xl p-6 shadow-lg border font-garamond border-[#f1e0c4] text-[#5A3E1B] text-[17px] leading-relaxed">
      {info
        .filter((i) => i.value && i.value !== "")
        .map(({ label, value }) => (
          <p key={label}>
            <strong>{label}:</strong> {value}
          </p>
        ))}
    </div>
  );
}

function ProductoItemCard({ item }: { item: ItemType }) {
  const productName = item.product_name || item.productName;
  if (!productName) return null;
  const { product, loading, error } = useGetProductByName(productName);
  if (loading) return <SkeletonConsultarPedido />;
  if (error) {
    return (
      <div className="text-sm text-red-600 bg-white px-4 py-3 rounded-md shadow">
        Error al cargar <strong>{productName}</strong>
      </div>
    );
  }
  if (!product) return null;

  return (
    <div className="flex gap-5 bg-[#FFFDF8] rounded-2xl px-5 py-4 shadow-md hover:shadow-lg transition border border-[#f3e1c3]">
      <div className="w-28 h-28 md:w-32 md:h-32 relative rounded-xl overflow-hidden shrink-0">
        <Image
        src={resolveStrapiMediaUrl(product.img) ?? "/placeholder.jpg"}
          alt={product.productName}
          fill
          className="object-cover"
        />
      </div>
      <div className="flex-1 text-[#5A3E1B] font-garamond">
        <p className="font-semibold text-xl">{product.productName}</p>
        {product.descriptionCorta && (
          <p className="text-sm mt-1">{product.descriptionCorta}</p>
        )}
        <p className="text-sm mt-2 italic">
          {item.title} — ${item.unit_price.toLocaleString("es-AR")}
        </p>
      </div>
    </div>
  );
}

export default function PedidoResultado() {
  const { pedido, error } = usePedidoContext();

  if (error)
    return <p className="text-red-600 text-sm text-center mt-4">{error}</p>;

  if (!pedido) return null;

  return (
    <div className="mt-10 space-y-8">
      <div className="flex items-center justify-between">
        <h2 className="text-2xl font-semibold text-[#5A3E1B] font-garamond">📦 Estado de tu pedido:</h2>
        <EstadoBadge estado={pedido.estado} />
      </div>

      <PedidoInfoCard pedido={pedido} />

      <div>
        <h3 className="font-semibold text-[#5A3E1B] text-xl mb-4 mt-6 font-garamond">
          🛒 Productos incluidos:
        </h3>
        <div className="space-y-5">
          {pedido.items
            .filter((item) => item.product_name || item.productName)
            .map((item, index: number) => (
              <ProductoItemCard key={index} item={item as ItemType} />
            ))}
        </div>
      </div>
    </div>
  );
}
