
import { FabricacionParams, IngredientPricing } from "@/lib/fabricacion/costing";
import { strapiFetch } from "@/app/api/admin/suppliers/strapi-helpers";

// This is a mock function. Replace with your actual Strapi fetching logic.
async function fetchFromStrapi(endpoint: string): Promise<any> {
  const res = await strapiFetch(`/api/${endpoint}?populate=deep`);
  if (!res.ok) {
    throw new Error(`Failed to fetch ${endpoint}`);
  }
  const { data } = await res.json();
  return data;
}

export async function fetchFabricaciones(): Promise<FabricacionParams[]> {
  // Replace with your actual Strapi data for fabrications
  const strapiData = await fetchFromStrapi('fabricacions');
  return strapiData.map((item: any) => ({
    fabricacionId: item.id.toString(),
    nombre: item.attributes.nombre,
    batchSize: item.attributes.batchSize || 1,
    mermaPctGlobal: item.attributes.mermaPctGlobal || 0,
    costoManoObra: item.attributes.costoManoObra || 0,
    costoEmpaque: item.attributes.costoEmpaque || 0,
    overheadPct: item.attributes.overheadPct || 0,
    margenObjetivoPct: item.attributes.margenObjetivoPct || 0,
    precioVentaActual: item.attributes.precioVentaActual || null,
    lineas: item.attributes.lineas.map((linea: any) => ({
      lineaId: linea.id.toString(),
      ingredientId: linea.ingrediente.data.id.toString(),
      ingredientName: linea.ingrediente.data.attributes.ingredienteName,
      quantity: linea.quantity,
      unit: linea.unit,
      mermaPct: linea.mermaPct || 0,
    })),
  }));
}

export async function fetchIngredientsWithPricing(): Promise<Record<string, IngredientPricing>> {
  const ingredientsData = await fetchFromStrapi('ingredients');
  const catalog: Record<string, IngredientPricing> = {};

  for (const ingredient of ingredientsData) {
    const ingredientId = ingredient.id.toString();
    catalog[ingredientId] = {
      ingredientId,
      ingredientName: ingredient.attributes.ingredienteName,
      baseUnit: ingredient.attributes.unidadMedida, // Assuming this is the base unit
      options: ingredient.attributes.ingredient_supplier_prices.data.map((price: any) => ({
        optionId: price.id.toString(),
        supplierId: price.attributes.supplier.data.id.toString(),
        supplierName: price.attributes.supplier.data.attributes.name,
        price: price.attributes.unitPrice,
        quantity: price.attributes.quantityNeto || 1,
        unit: price.attributes.unit,
        unitPriceBase: price.attributes.precioUnitarioBase,
        baseUnit: price.attributes.unidadBase,
      })),
    };
  }

  return catalog;
}
