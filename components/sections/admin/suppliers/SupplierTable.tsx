import { SupplierType } from "@/types/supplier";
import { CirclePlus, Pencil, Trash2 } from "lucide-react";

interface SupplierTableProps {
  suppliers: SupplierType[];
  onEdit: (supplier: SupplierType) => void;
  onDelete: (supplier: SupplierType) => void;
  onAddPrice: (supplier: SupplierType) => void;
}

export function SupplierTable({ suppliers, onEdit, onDelete, onAddPrice }: SupplierTableProps) {
  const cheapestPriceByIngredientId = new Map<number, number>();
  const collator = new Intl.Collator("es-ES", { sensitivity: "base" });

  const formatDate = (value?: string | null) => {
    if (!value) {
      return "Sin fecha";
    }

    const parsed = new Date(value);

    if (Number.isNaN(parsed.getTime())) {
      return value;
    }

    return parsed.toLocaleDateString("es-AR");
  };

  const formatUnitPrice = (
    unitPrice?: number | null,
    currency?: string | null,
    unit?: string | null
  ) => {
    if (typeof unitPrice !== "number" || Number.isNaN(unitPrice)) {
      return "N/D";
    }

    const formattedPrice = unitPrice.toLocaleString("es-AR", {
      minimumFractionDigits: 2,
      maximumFractionDigits: 2,
    });

    const currencyPrefix = currency ?? "$";
    const normalizedUnit = unit?.trim?.() ?? "";
    const unitSuffix = normalizedUnit ? `/${normalizedUnit}` : "";

    return `${currencyPrefix} ${formattedPrice}${unitSuffix}`;
  };

  const formatMinOrderQty = (value?: number | null) => {
    if (typeof value !== "number" || Number.isNaN(value)) {
      return "N/D";
    }

    return value.toLocaleString("es-AR");
  };

  suppliers.forEach((supplier) => {
    supplier.ingredient_supplier_prices?.forEach((price) => {
      const ingredientId = price.ingrediente?.id;
      const unitPrice = price.unitPrice;

      if (typeof ingredientId !== "number" || typeof unitPrice !== "number" || Number.isNaN(unitPrice)) {
        return;
      }

      const previous = cheapestPriceByIngredientId.get(ingredientId);

      if (previous === undefined || unitPrice < previous) {
        cheapestPriceByIngredientId.set(ingredientId, unitPrice);
      }
    });
  });

  return (
    <div className="overflow-x-auto rounded-xl border border-gray-200 bg-white shadow-lg">
      <table className="min-w-full text-sm text-gray-800">
        <thead className="bg-gray-100 text-xs uppercase tracking-wider text-gray-600">
          <tr>
            <th scope="col" className="px-6 py-3 text-left font-semibold">
              Nombre
            </th>
            <th scope="col" className="px-6 py-3 text-left font-semibold">
              Teléfono
            </th>
            <th scope="col" className="px-6 py-3 text-left font-semibold">
              Ingredientes
            </th>
            <th scope="col" className="px-6 py-3 text-left font-semibold">
              Estado
            </th>
            <th scope="col" className="px-6 py-3 text-center font-semibold">
              Acciones
            </th>
          </tr>
        </thead>
        <tbody className="divide-y divide-gray-200">
          {suppliers.length === 0 ? (
            <tr>
              <td colSpan={5} className="px-6 py-6 text-center text-sm text-gray-500">
                No se encontraron proveedores con los filtros aplicados.
              </td>
            </tr>
          ) : (
            suppliers.map((supplier) => {
              const sortedPrices = [...(supplier.ingredient_supplier_prices ?? [])].sort((a, b) => {
                const aName = a.ingrediente?.ingredienteName ?? "";
                const bName = b.ingrediente?.ingredienteName ?? "";

                return collator.compare(aName, bName);
              });

              return (
                <tr
                  key={supplier.documentId || String(supplier.id) || supplier.name}
                  className="transition hover:bg-gray-50"
                >
                  <td className="whitespace-nowrap px-6 py-4 font-medium">{supplier.name}</td>
                  <td className="whitespace-nowrap px-6 py-4">
                    {supplier.phone && supplier.phone.trim() !== ""
                      ? supplier.phone
                      : "Sin teléfono"}
                  </td>
                  <td className="px-6 py-4">
                    <div className="flex flex-wrap gap-1">
                      {supplier.ingredientes?.length ? (
                        supplier.ingredientes.map((ingredient) => (
                          <span
                            key={ingredient.id}
                            className="rounded-full bg-blue-100 px-2 py-1 text-xs font-medium text-blue-800"
                          >
                            {ingredient.ingredienteName}
                          </span>
                        ))
                      ) : (
                        <span className="text-xs text-gray-500">Sin ingredientes</span>
                      )}
                    </div>

                    {sortedPrices.length > 0 && (
                      <div className="mt-3 overflow-hidden rounded-lg border border-gray-200">
                        <table className="w-full text-left text-xs">
                          <thead className="bg-gray-50 text-[10px] uppercase tracking-wide text-gray-500">
                            <tr>
                              <th scope="col" className="px-2 py-1 font-semibold">
                                Ingrediente
                              </th>
                              <th scope="col" className="px-2 py-1 font-semibold">
                                $/unit
                              </th>
                              <th scope="col" className="px-2 py-1 font-semibold">
                                Vigente desde
                              </th>
                              <th scope="col" className="px-2 py-1 font-semibold">
                                Mínimo
                              </th>
                              <th scope="col" className="px-2 py-1 text-center font-semibold">
                                Estado
                              </th>
                            </tr>
                          </thead>
                          <tbody>
                            {sortedPrices.map((price, index) => {
                              const ingredientId = price.ingrediente?.id;
                              const ingredientName = price.ingrediente?.ingredienteName ?? "Ingrediente sin nombre";
                              const cheapestUnitPrice =
                                typeof ingredientId === "number"
                                  ? cheapestPriceByIngredientId.get(ingredientId)
                                  : undefined;
                              const isCheapest =
                                typeof price.unitPrice === "number" &&
                                typeof ingredientId === "number" &&
                                cheapestUnitPrice !== undefined &&
                                price.unitPrice === cheapestUnitPrice;

                              return (
                                <tr
                                  key={`${price.id}-${ingredientId ?? index}`}
                                  className={index === 0 ? "" : "border-t border-gray-100"}
                                >
                                  <td className="px-2 py-1">{ingredientName}</td>
                                  <td className="px-2 py-1">
                                  {formatUnitPrice(
                                      price.unitPrice,
                                      price.currency,
                                      price.unit?.trim?.() ||
                                        price.ingrediente?.unidadMedida?.trim?.() ||
                                        ""
                                    )}
                                  </td>
                                  <td className="px-2 py-1">{formatDate(price.validFrom)}</td>
                                  <td className="px-2 py-1">{formatMinOrderQty(price.minOrderQty)}</td>
                                  <td className="px-2 py-1 text-center">
                                    {isCheapest ? (
                                      <span className="inline-flex items-center rounded-full bg-emerald-100 px-2 py-0.5 text-[10px] font-semibold text-emerald-700">
                                        Más barato
                                      </span>
                                    ) : (
                                      <span className="text-[10px] text-gray-400">—</span>
                                    )}
                                  </td>
                                </tr>
                              );
                            })}
                          </tbody>
                        </table>
                      </div>
                    )}
                  </td>
                  <td className="whitespace-nowrap px-6 py-4">
                    {supplier.active === true ? (
                      <span className="inline-flex rounded-full bg-green-100 px-2 text-xs font-semibold leading-5 text-green-800">
                        Activo
                      </span>
                    ) : supplier.active === false ? (
                      <span className="inline-flex rounded-full bg-red-100 px-2 text-xs font-semibold leading-5 text-red-800">
                        Inactivo
                      </span>
                    ) : (
                      <span className="inline-flex rounded-full bg-gray-100 px-2 text-xs font-semibold leading-5 text-gray-700">
                        Sin estado
                      </span>
                    )}
                  </td>
                  <td className="px-6 py-4">
                    <div className="flex items-center justify-center gap-4">
                      <button
                        onClick={() => onAddPrice(supplier)}
                        className="text-emerald-600 transition hover:text-emerald-800"
                      >
                        <CirclePlus className="h-5 w-5" />
                      </button>
                      <button
                        onClick={() => onEdit(supplier)}
                        className="text-indigo-600 transition hover:text-indigo-900"
                      >
                        <Pencil className="h-5 w-5" />
                      </button>
                      <button
                        onClick={() => onDelete(supplier)}
                        className="text-red-600 transition hover:text-red-900"
                      >
                        <Trash2 className="h-5 w-5" />
                      </button>
                    </div>
                  </td>
                </tr>
              );
            })
          )}
        </tbody>
      </table>
    </div>
  );
}