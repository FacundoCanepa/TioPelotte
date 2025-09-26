import { IngredientType } from "@/types/ingredient";

export const LOW_STOCK_THRESHOLD = 5;

export function isLowStock(
  ingredient: IngredientType,
  threshold: number = LOW_STOCK_THRESHOLD
) {
  const stockValue = typeof ingredient.Stock === "number" ? ingredient.Stock : 0;
  return stockValue <= threshold;
}

export function formatIngredientStockLabel(ingredient: IngredientType) {
  const stockValue = typeof ingredient.Stock === "number" ? ingredient.Stock : 0;
  const safeStock = Number.isFinite(stockValue) ? stockValue : 0;
  const unit = ingredient.unidadMedida?.trim?.() ?? "";
  if (safeStock <= 0) {
    return `${ingredient.ingredienteName} (sin stock)`;
  }

  const formattedQuantity = safeStock.toLocaleString("es-AR", {
    minimumFractionDigits: 0,
    maximumFractionDigits: safeStock % 1 === 0 ? 0 : 2,
  });

  const unitSuffix = unit ? ` ${unit}` : "";
  return `${ingredient.ingredienteName} (${formattedQuantity}${unitSuffix})`;
}
