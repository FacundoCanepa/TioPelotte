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
  cheapest: PriceComparison | null;
  mostExpensive: PriceComparison | null;
};

export type PriceComparison = {
  supplierId: number | null;
  supplierName: string;
  price: number;
  currency: string;
  unit: string;
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

function buildPriceComparison(
  price: IngredientSupplierPrice,
  fallbackUnit: string
): PriceComparison {
  const supplier = price.supplier ?? {};
  const unit = price.unit?.trim?.() || fallbackUnit || "";

  return {
    supplierId: supplier?.id ?? null,
    supplierName: supplier?.name ?? "",
    price: Number(price.unitPrice) || 0,
    currency: price.currency ?? "",
    unit,
    validFrom: price.validFrom || undefined,
  };
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

    const sortedPrices = validPrices
      .map((price) => ({ price, value: Number(price.unitPrice) }))
      .filter(({ value }) => Number.isFinite(value))
      .sort((a, b) => a.value - b.value)
      .map(({ price }) => price);

    const fallbackUnit = ingredient.unidadMedida ?? "";
    const cheapest = sortedPrices[0] ?? null;
    const mostExpensive = sortedPrices.length > 0 ? sortedPrices[sortedPrices.length - 1] : null;

    results.push({
      categoryId: category?.id ?? null,
      categoryName: category?.nombre ?? "",
      ingredientId: ingredient.id,
      ingredientName: ingredient.ingredienteName,
      unit: fallbackUnit,
      cheapest: cheapest ? buildPriceComparison(cheapest, fallbackUnit) : null,
      mostExpensive: mostExpensive ? buildPriceComparison(mostExpensive, fallbackUnit) : null,
    });
  });

  return results;
}