import { SupplierType } from "@/types/supplier";
import { formatPrecioUnitario } from "@/lib/pricing/normalize";
import { CirclePlus, Pencil, Send, Trash2, ChevronDown } from "lucide-react";
import { useState } from "react";

interface SupplierTableProps {
  suppliers: SupplierType[];
  onEdit: (supplier: SupplierType) => void;
  onDelete: (supplier: SupplierType) => void;
  onAddPrice: (supplier: SupplierType) => void;
  onSendMessage: (supplier: SupplierType) => void;
  disableSendMessage?: boolean;
}

export function SupplierTable({
  suppliers,
  onEdit,
  onDelete,
  onAddPrice,
  onSendMessage,
  disableSendMessage = false,
}: SupplierTableProps) {
  const [expandedSupplier, setExpandedSupplier] = useState<string | null>(null);

  const toggleProducts = (supplierId: string) => {
    if (expandedSupplier === supplierId) {
      setExpandedSupplier(null);
    } else {
      setExpandedSupplier(supplierId);
    }
  };

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
      {suppliers.map((supplier) => (
        <div key={supplier.documentId} className="p-4 rounded-lg border shadow-sm flex flex-col space-y-3">
          <div className="flex justify-between items-start">
            <div>
              <h3 className="font-semibold text-lg text-gray-800">{supplier.name}</h3>
              <p className="text-sm text-gray-600">{supplier.phone || "Sin teléfono"}</p>
            </div>
            <span
              className={`px-2 py-1 text-xs font-semibold rounded-full ${supplier.active ? "bg-green-100 text-green-800" : "bg-red-100 text-red-800"}`}>
              {supplier.active ? "Activo" : "Inactivo"}
            </span>
          </div>

          <div className="flex flex-wrap gap-2 max-h-[100px] overflow-auto">
            {supplier.ingredientes?.map((ingrediente) => (
                <span key={ingrediente.id} className="text-xs bg-blue-100 text-blue-800 px-2 py-1 rounded-full">
                {ingrediente.ingredienteName}
                </span>
            ))}
          </div>

          {supplier.ingredient_supplier_prices && supplier.ingredient_supplier_prices.length > 0 && (
            <button onClick={() => toggleProducts(supplier.documentId)} className="text-sm text-amber-600 flex items-center gap-1">
              Ver precios <ChevronDown className={`w-4 h-4 transition-transform ${expandedSupplier === supplier.documentId ? "rotate-180" : ""}`} />
            </button>
          )}

          {expandedSupplier === supplier.documentId && (
            <div className="border-t pt-3 mt-3">
                {supplier.ingredient_supplier_prices?.map(price => (
                    <div key={price.id} className="text-xs flex justify-between py-1">
                        <span>{price.ingrediente?.ingredienteName}</span>
                        <span className="font-medium">${price.unitPrice}/{price.unit}</span>
                    </div>
                ))}
            </div>
           )}

          <div className="flex items-center justify-end gap-3 pt-3 border-t mt-auto">
             <button
                onClick={() => onSendMessage(supplier)}
                className={`text-amber-600 transition hover:text-amber-800 ${
                  disableSendMessage ? "cursor-not-allowed opacity-50 hover:text-amber-600" : ""
                }`}>
                <Send className="h-5 w-5" />
             </button>
             <button onClick={() => onAddPrice(supplier)} className="text-emerald-600 transition hover:text-emerald-800">
                <CirclePlus className="h-5 w-5" />
             </button>
             <button onClick={() => onEdit(supplier)} className="text-indigo-600 transition hover:text-indigo-900">
                <Pencil className="h-5 w-5" />
             </button>
             <button onClick={() => onDelete(supplier)} className="text-red-600 transition hover:text-red-900">
                <Trash2 className="h-5 w-5" />
             </button>
          </div>
        </div>
      ))}
    </div>
  );
}