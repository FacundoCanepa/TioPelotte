"use client";

import Image from "next/image";
import { ArrowUpDown, Pencil, Trash2, Check, AlertTriangle, Star, ImageOff } from "lucide-react";
import { ProductType } from "@/types/product";
import { LOW_STOCK_THRESHOLD } from "@/lib/inventory";

interface Props {
  productos: ProductType[];
  onEdit: (p: ProductType) => void;
  onDelete: (documentId: string) => void;
  orderBy: { field: keyof ProductType; direction: "asc" | "desc" };
  setOrderBy: (val: { field: keyof ProductType; direction: "asc" | "desc" }) => void;
}

// Base pública para completar URLs relativas (si hiciera falta)
const BASE_MEDIA =
  process.env.NEXT_PUBLIC_MEDIA_URL ||
  process.env.NEXT_PUBLIC_BACKEND_URL ||
  "";

function ensureAbsoluteUrl(u?: string | null): string | null {
  if (!u || typeof u !== "string") return null;
  if (u.startsWith("http")) return u;
  // si es relativa y tenemos base, la preprendemos
  return BASE_MEDIA ? `${BASE_MEDIA}${u}` : u;
}

/** Devuelve la URL de la imagen principal del producto (maneja array/objeto/string) */
function getMainImageUrl(p: any): string | null {
  const media = p?.img;

  // Caso: array (tu payload actual)
  if (Array.isArray(media) && media.length > 0) {
    const first = media[0];
    const raw =
      first?.formats?.thumbnail?.url ||
      first?.formats?.small?.url ||
      first?.url ||
      null;
    return ensureAbsoluteUrl(raw);
  }

  // Caso: objeto single
  if (media && typeof media === "object") {
    const raw =
      media?.formats?.thumbnail?.url ||
      media?.formats?.small?.url ||
      media?.url ||
      null;
    return ensureAbsoluteUrl(raw);
  }

  // Caso: string (por si algún flujo guarda la URL directa)
  if (typeof media === "string") {
    return ensureAbsoluteUrl(media);
  }

  return null;
}

function formatCurrency(n?: number) {
  try {
    return new Intl.NumberFormat("es-AR", { style: "currency", currency: "ARS", maximumFractionDigits: 0 }).format(n ?? 0);
  } catch {
    return `$${n ?? 0}`;
  }
}

export default function ProductTable({ productos, onEdit, onDelete, orderBy, setOrderBy }: Props) {
  return (
    <div className="overflow-x-auto bg-[#FFFCF7] rounded-xl shadow-lg border border-[#EADBC8]">
      <table className="min-w-full text-sm text-[#4A2E15]">
        <thead className="bg-[#FBE6D4] text-[#5A3E1B] uppercase text-xs tracking-wide">
          <tr>
            <th
              className="p-3 text-left cursor-pointer"
              onClick={() =>
                setOrderBy({
                  field: "productName",
                  direction: orderBy.field === "productName" && orderBy.direction === "asc" ? "desc" : "asc",
                })
              }
            >
              Nombre <ArrowUpDown className="inline h-3 w-3 ml-1" />
            </th>
            <th
              className="p-3 text-left cursor-pointer"
              onClick={() =>
                setOrderBy({
                  field: "price",
                  direction: orderBy.field === "price" && orderBy.direction === "asc" ? "desc" : "asc",
                })
              }
            >
              Precio <ArrowUpDown className="inline h-3 w-3 ml-1" />
            </th>
            <th
              className="p-3 text-left cursor-pointer"
              onClick={() =>
                setOrderBy({
                  field: "stock",
                  direction: orderBy.field === "stock" && orderBy.direction === "asc" ? "desc" : "asc",
                })
              }
            >
              Stock <ArrowUpDown className="inline h-3 w-3 ml-1" />
            </th>
            <th className="p-3 text-left">Unidad</th>
            <th className="p-3 text-left">Sabor</th>
            <th className="p-3 text-left">Porciones</th>
            <th className="p-3 text-left">Tiempo</th>
            <th className="p-3 text-left">Categoría</th>
            <th className="p-3 text-center">Oferta</th>
            <th className="p-3 text-center">Destacado</th>
            <th className="p-3 text-center">Activo</th>
            <th
              className="p-3 text-left cursor-pointer"
              onClick={() =>
                setOrderBy({
                  field: "updatedAt",
                  direction: orderBy.field === "updatedAt" && orderBy.direction === "asc" ? "desc" : "asc",
                })
              }
            >
              Últ. stock <ArrowUpDown className="inline h-3 w-3 ml-1" />
            </th>
            <th className="p-3 text-center">Acciones</th>
          </tr>
        </thead>

        <tbody>
          {productos.map((p) => {
            const url = getMainImageUrl(p);
            const lowStock =
              typeof p.stock === "number" && p.stock <= LOW_STOCK_THRESHOLD;

            return (
              <tr
                key={p.id}
                className="border-b last:border-0 hover:bg-[#FFF8EC] transition-colors odd:bg-[#FFFBF3]"
              >
                {/* Nombre + miniatura */}
                <td className="p-3">
                  <div className="flex items-center gap-3">
                    <div className="relative h-12 w-12 shrink-0 overflow-hidden rounded-lg ring-1 ring-[#eadbc8] bg-[#f7eada]">
                      {url ? (
                        <Image
                          src={url}
                          alt={p.productName ?? "Producto"}
                          width={48}
                          height={48}
                          className="h-12 w-12 object-cover transition-transform duration-200 hover:scale-[1.03]"
                          sizes="48px"
                        />
                      ) : (
                        <div className="flex h-12 w-12 items-center justify-center text-[#9c7b55]">
                          <ImageOff className="h-5 w-5" aria-hidden="true" />
                          <span className="sr-only">Sin imagen</span>
                        </div>
                      )}
                      {lowStock && (
                        <span className="absolute -top-1 -right-1 rounded-full bg-white/90 p-0.5 shadow ring-1 ring-[#EADBC8]">
                          <AlertTriangle className="h-3.5 w-3.5 text-red-600" />
                        </span>
                      )}
                    </div>

                    <div className="flex min-w-0 flex-col">
                      <span className="truncate font-medium capitalize">
                        {p.productName}
                      </span>
                      <span className="text-[11px] text-[#8a6a45]">{p.slug}</span>
                    </div>
                  </div>
                </td>

                {/* Precio */}
                <td className="p-3 font-semibold">{formatCurrency(p.price as any)}</td>

                {/* Stock */}
                <td className="p-3">{p.stock}</td>

                {/* Unidad */}
                <td>
                  <span className="inline-block rounded-md bg-[#f2e8da] px-2 py-1 text-xs font-medium text-[#5A3E1B]">
                    {p.unidadMedida}
                  </span>
                </td>

                {/* Sabor */}
                <td className="p-3 text-xs text-[#5A3E1B] italic">{p.taste}</td>

                {/* Porciones */}
                <td className="p-3 text-xs">{p.porciones || "-"}</td>

                {/* Tiempo */}
                <td className="p-3 text-xs">{p.tiempoEstimado || "-"}</td>

                {/* Categoría */}
                <td className="p-3 text-xs font-medium text-[#5A3E1B]">
                  {p.category?.categoryNames?.trim() || "-"}
                </td>

                {/* Flags */}
                <td className="p-3 text-center">{p.isOffer ? <Check className="mx-auto h-4 w-4 text-green-600" /> : null}</td>
                <td className="p-3 text-center">{p.isFeatured ? <Star className="mx-auto h-4 w-4 text-yellow-500" /> : null}</td>
                <td className="p-3 text-center">{p.active ? <Check className="mx-auto h-4 w-4 text-green-600" /> : null}</td>

                {/* Último stock */}
                <td className="p-3 text-xs text-gray-600">
                  {p.updatedAt ? new Date(p.updatedAt).toLocaleString("es-AR") : "-"}
                </td>

                {/* Acciones */}
                <td className="p-3">
                  <div className="flex justify-center gap-3">
                    <button
                      onClick={() => onEdit(p)}
                      className="rounded-md p-1.5 text-[#8B4513] hover:bg-[#FBE6D4] hover:text-[#5A3E1B] transition"
                      aria-label={`Editar ${p.productName}`}
                    >
                      <Pencil className="h-4 w-4" />
                    </button>
                    <button
                      onClick={() => onDelete(p.documentId)}
                      className="rounded-md p-1.5 text-red-600 hover:bg-red-50 hover:text-red-700 transition"
                      aria-label={`Eliminar ${p.productName}`}
                    >
                      <Trash2 className="h-4 w-4" />
                    </button>
                  </div>
                </td>
              </tr>
            );
          })}
        </tbody>
      </table>
    </div>
  );
}