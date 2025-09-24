import type { IngredientType } from "@/types/ingredient";
import type { IngredientSupplierPrice } from "@/types/ingredient-supplier-price";

export type IngredientWithPrices = IngredientType & {
  ingredient_supplier_prices?: IngredientSupplierPrice[] | null;
};

export type CheapestByCategoryItem = {
  categoryId: number | null;
  categoryName: string;
  ingredientId: number;
  ingredientName: string;
  unit: string;
  supplierId: number | null;
  supplierName: string;
  price: number;
  currency: string;
  validFrom?: string;
};

function isSupplierActive(price: IngredientSupplierPrice): boolean {
  const active = price.supplier?.active;
  return active !== false;
}

function isPriceEffective(price: IngredientSupplierPrice, now: Date): boolean {
  const rawValidFrom = price.validFrom;
  if (!rawValidFrom) return true;
  const validFromDate = new Date(rawValidFrom);
  if (Number.isNaN(validFromDate.getTime())) return true;
  return validFromDate.getTime() <= now.getTime();
}

export function computeCheapestByCategory(
  ingredients: IngredientWithPrices[]
): CheapestByCategoryItem[] {
  if (!Array.isArray(ingredients) || ingredients.length === 0) {
    return [];
  }

  const now = new Date();
  const results: CheapestByCategoryItem[] = [];

  ingredients.forEach((ingredient) => {
    if (!ingredient || typeof ingredient !== "object") return;

    const category = ingredient.categoria_ingrediente ?? null;
    const prices = Array.isArray(ingredient.ingredient_supplier_prices)
      ? ingredient.ingredient_supplier_prices
      : [];

    const validPrices = prices.filter((price) => {
      if (!price) return false;
      const supplierActive = isSupplierActive(price);
      const effective = isPriceEffective(price, now);
      const unitPrice = Number.isFinite(price.unitPrice)
        ? price.unitPrice
        : Number(price.unitPrice);
      return supplierActive && effective && Number.isFinite(unitPrice);
    });

    if (validPrices.length === 0) {
      return;
    }

    const cheapest = validPrices.reduce((best, current) => {
      if (!best) return current;
      const bestPrice = Number(best.unitPrice);
      const currentPrice = Number(current.unitPrice);
      if (!Number.isFinite(bestPrice)) return current;
      if (!Number.isFinite(currentPrice)) return best;
      return currentPrice < bestPrice ? current : best;
    }, validPrices[0]);

    if (!cheapest) return;

    results.push({
      categoryId: category?.id ?? null,
      categoryName: category?.nombre ?? "",
      ingredientId: ingredient.id,
      ingredientName: ingredient.ingredienteName,
      unit: ingredient.unidadMedida,
      supplierId: cheapest.supplier?.id ?? null,
      supplierName: cheapest.supplier?.name ?? "",
      price: Number(cheapest.unitPrice) || 0,
      currency: cheapest.currency ?? "",
      validFrom: cheapest.validFrom || undefined,
    });
  });

  return results;
}