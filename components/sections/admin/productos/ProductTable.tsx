"use client";

import { ArrowUpDown, Pencil, Trash2, Check, AlertTriangle, Star } from "lucide-react";
import { ProductType } from "@/types/product";

interface Props {
  productos: ProductType[];
  onEdit: (p: ProductType) => void;
  onDelete: (documentId: string) => void;
  orderBy: { field: keyof ProductType; direction: "asc" | "desc" };
  setOrderBy: (val: { field: keyof ProductType; direction: "asc" | "desc" }) => void;
}

export default function ProductTable({ productos, onEdit, onDelete, orderBy, setOrderBy }: Props) {
  return (
    <div className="overflow-x-auto bg-[#FFFCF7] rounded-xl shadow-lg border border-[#EADBC8]">
      <table className="min-w-full text-sm text-[#4A2E15]">
        <thead className="bg-[#FBE6D4] text-[#5A3E1B] uppercase text-xs tracking-wide">
          <tr>
            <th className="p-3 text-left cursor-pointer" onClick={() => setOrderBy({ field: "productName", direction: orderBy.direction === "asc" ? "desc" : "asc" })}>Nombre <ArrowUpDown className="inline h-3 w-3 ml-1" /></th>
            <th className="p-3 text-left cursor-pointer" onClick={() => setOrderBy({ field: "price", direction: orderBy.direction === "asc" ? "desc" : "asc" })}>Precio <ArrowUpDown className="inline h-3 w-3 ml-1" /></th>
            <th className="p-3 text-left cursor-pointer" onClick={() => setOrderBy({ field: "stock", direction: orderBy.direction === "asc" ? "desc" : "asc" })}>Stock <ArrowUpDown className="inline h-3 w-3 ml-1" /></th>
            <th className="p-3 text-left">Unidad</th>
            <th className="p-3 text-left">Sabor</th>
            <th className="p-3 text-left">Porciones</th>
            <th className="p-3 text-left">Tiempo</th>
            <th className="p-3 text-left">Categoría</th>
            <th className="p-3 text-center">Oferta</th>
            <th className="p-3 text-center">Destacado</th>
            <th className="p-3 text-center">Activo</th>
            <th className="p-3 text-left">Últ. stock</th>
            <th className="p-3 text-center">Acciones</th>
          </tr>
        </thead>
        <tbody>
          {productos.map((p) => (
            <tr key={p.id} className="border-b last:border-0 hover:bg-[#FFF8EC] transition">
              <td className="p-3 capitalize font-medium flex items-center gap-2">
                  {p.stock !== undefined && p.stock <= 5 && (
                  <AlertTriangle className="h-4 w-4 text-red-600" />
                )}
                {p.productName}
              </td>
              <td className="p-3 font-semibold">${p.price}</td>
              <td className="p-3">{p.stock}</td>
              <td className="p-3 text-xs font-medium bg-[#f2e8da] text-[#5A3E1B] px-2 py-1 rounded-md inline-block">{p.unidadMedida}</td>
              <td className="p-3 text-xs text-[#5A3E1B] italic">{p.taste}</td>
              <td className="p-3 text-xs">{p.porciones || "-"}</td>
              <td className="p-3 text-xs">{p.tiempoEstimado || "-"}</td>
              <td className="p-3 text-xs font-medium text-[#5A3E1B] px-2 py-1 rounded-md">
                {p.category?.categoryNames?.trim() || "-"}
              </td>
              <td className="p-3 text-center">{p.isOffer && <Check className="h-4 w-4 text-green-600" />}</td>
              <td className="p-3 text-center">{p.isFeatured && <Star className="h-4 w-4 text-yellow-500" />}</td>
              <td className="p-3 text-center">{p.active ? <Check className="h-4 w-4 text-green-600" /> : null}</td>
              <td className="p-3 text-xs text-gray-500">{p.stockUpdatedAt ? new Date(p.stockUpdatedAt).toLocaleString("es-AR") : "-"}</td>
              <td className="p-3 text-center flex justify-center gap-3">
                <button onClick={() => onEdit(p)} className="text-[#8B4513] hover:text-[#5A3E1B] transition">
                  <Pencil className="h-4 w-4" />
                </button>
                <button onClick={() => onDelete(p.documentId)} className="text-red-600 hover:text-red-800 transition">
                  <Trash2 className="h-4 w-4" />
                </button>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}