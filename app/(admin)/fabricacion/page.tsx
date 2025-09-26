
import { FabricacionTableClient } from "@/components/admin/fabricacion/FabricacionTableClient";
import { fetchFabricaciones, fetchIngredientsWithPricing } from "@/lib/fabricacion/data-fetching";

export default async function FabricacionPage() {
  const [fabricaciones, ingredientsCatalog] = await Promise.all([
    fetchFabricaciones(),
    fetchIngredientsWithPricing(),
  ]);

  return (
    <div className="container mx-auto px-4 py-8">
      <h1 className="text-3xl font-bold text-gray-800 mb-6">Análisis de Costos de Fabricación</h1>
      <FabricacionTableClient initialFabricaciones={fabricaciones} initialPricingCatalog={ingredientsCatalog} />
    </div>
  );
}
