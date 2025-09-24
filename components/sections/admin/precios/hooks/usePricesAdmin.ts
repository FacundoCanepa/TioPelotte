"use client";

import { useCallback, useEffect, useRef, useState } from "react";

import type { IngredientSupplierPrice } from "@/types/ingredient-supplier-price";

type PrimitiveFilterValue = string | number | boolean | null | undefined;

export type PriceFilters = {
  ingredientId?: string | number | null;
  supplierId?: string | number | null;
  categoryId?: string | number | null;
  [key: string]: PrimitiveFilterValue;
};

type RelationInput =
  | number
  | string
  | null
  | undefined
  | {
      id?: number | string | null;
      documentId?: string | null;
    };

export type PriceDto = {
  unitPrice: number | string;
  currency?: string | null;
  unit?: string | null;
  minOrderQty?: number | string | null;
  validFrom?: string | null;
  ingrediente: RelationInput;
  supplier: RelationInput;
  categoria_ingrediente?: RelationInput;
  [key: string]: unknown;
};

type PriceListResponse = {
  items?: IngredientSupplierPrice[];
  data?: IngredientSupplierPrice[];
};

type PriceResponse = {
  data?: IngredientSupplierPrice;
};

function buildQuery(filters?: PriceFilters) {
  if (!filters) return "";
  const params = new URLSearchParams();

  Object.entries(filters).forEach(([key, value]) => {
    if (value === undefined || value === null) return;
    if (typeof value === "string") {
      const trimmed = value.trim();
      if (!trimmed) return;
      params.set(key, trimmed);
      return;
    }

    if (typeof value === "number") {
      params.set(key, String(value));
      return;
    }

    if (typeof value === "boolean") {
      params.set(key, value ? "true" : "false");
    }
  });

  const query = params.toString();
  return query ? `?${query}` : "";
}

function extractPrices(payload: unknown): IngredientSupplierPrice[] {
  if (!payload || typeof payload !== "object") return [];
  const { items, data } = payload as PriceListResponse;
  if (Array.isArray(items)) return items;
  if (Array.isArray(data)) return data;
  return [];
}

function extractPrice(payload: unknown): IngredientSupplierPrice | null {
  if (!payload || typeof payload !== "object") return null;
  const { data } = payload as PriceResponse;
  if (data) return data;
  if ("item" in (payload as Record<string, unknown>)) {
    const item = (payload as Record<string, unknown>).item;
    if (item && typeof item === "object") return item as IngredientSupplierPrice;
  }
  return null;
}

function getPriceDocumentId(price: IngredientSupplierPrice | null | undefined) {
  if (!price) return undefined;
  const value = (price as { documentId?: unknown }).documentId;
  if (typeof value === "string") {
    const trimmed = value.trim();
    return trimmed ? trimmed : undefined;
  }
  return undefined;
}

function matchesPriceIdentifier(price: IngredientSupplierPrice, identifier: string) {
  const normalized = identifier.trim();
  if (String(price.id) === normalized) return true;
  const docId = getPriceDocumentId(price);
  return docId ? docId === normalized : false;
}

export function usePricesAdmin(initialFilters?: PriceFilters) {
  const [prices, setPrices] = useState<IngredientSupplierPrice[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const lastFiltersRef = useRef<PriceFilters | undefined>(
    initialFilters ? { ...initialFilters } : undefined
  );

  const fetchPrices = useCallback(
    async (filters?: PriceFilters) => {
      const nextFilters = filters ?? lastFiltersRef.current ?? {};
      lastFiltersRef.current = { ...nextFilters };

      setLoading(true);
      setError(null);

      try {
        const query = buildQuery(nextFilters);
        const res = await fetch(`/api/admin/prices${query}`, { cache: "no-store" });
        const payload = await res.json().catch(() => ({}));

        if (!res.ok) {
          const message =
            (payload && typeof payload === "object" && "error" in payload &&
              typeof (payload as { error?: string }).error === "string"
              ? (payload as { error: string }).error
              : undefined) || "Error al cargar precios";
          throw new Error(message);
        }

        const items = extractPrices(payload);
        setPrices(items);
        return items;
      } catch (err) {
        console.error("❌ Error cargando precios", err);
        const message = err instanceof Error ? err.message : "Error desconocido";
        setError(message);
        throw err;
      } finally {
        setLoading(false);
      }
    },
    []
  );

  const createPrice = useCallback(
    async (dto: PriceDto) => {
      setError(null);
      const res = await fetch(`/api/admin/prices`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        cache: "no-store",
        body: JSON.stringify(dto),
      });
      const payload = await res.json().catch(() => ({}));

      if (!res.ok) {
        const message =
          (payload && typeof payload === "object" && "error" in payload &&
            typeof (payload as { error?: string }).error === "string"
            ? (payload as { error: string }).error
            : undefined) || "Error al crear precio";
        setError(message);
        throw new Error(message);
      }

      const created = extractPrice(payload);
      if (created) {
        const createdIdentifier = getPriceDocumentId(created) ?? String(created.id);
        setPrices((prev) => {
          const exists = prev.some((price) => matchesPriceIdentifier(price, createdIdentifier));
          if (exists) {
            return prev.map((price) =>
              matchesPriceIdentifier(price, createdIdentifier) ? created : price
            );
          }
          return [created, ...prev];
        });
      } else {
        await fetchPrices(lastFiltersRef.current);
      }

      return created;
    },
    [fetchPrices]
  );

  const updatePrice = useCallback(
    async (idOrDocumentId: string | number, dto: PriceDto) => {
      setError(null);
      const identifier = String(idOrDocumentId).trim();
      const res = await fetch(`/api/admin/prices/${identifier}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        cache: "no-store",
        body: JSON.stringify(dto),
      });
      const payload = await res.json().catch(() => ({}));

      if (!res.ok) {
        const message =
          (payload && typeof payload === "object" && "error" in payload &&
            typeof (payload as { error?: string }).error === "string"
            ? (payload as { error: string }).error
            : undefined) || "Error al actualizar precio";
        setError(message);
        throw new Error(message);
      }

      const updated = extractPrice(payload);
      if (updated) {
        const updatedIdentifier = getPriceDocumentId(updated) ?? String(updated.id);
        setPrices((prev) =>
          prev.map((price) => (matchesPriceIdentifier(price, updatedIdentifier) ? updated : price))
        );
      } else {
        await fetchPrices(lastFiltersRef.current);
      }

      return updated;
    },
    [fetchPrices]
  );

  const deletePrice = useCallback(
    async (idOrDocumentId: string | number) => {
      setError(null);
      const identifier = String(idOrDocumentId).trim();
      const res = await fetch(`/api/admin/prices/${identifier}`, {
        method: "DELETE",
        cache: "no-store",
      });

      let payload: unknown = null;
      try {
        payload = await res.json();
      } catch {
        payload = null;
      }

      if (!res.ok && res.status !== 204) {
        const message =
          (payload && typeof payload === "object" && "error" in payload &&
            typeof (payload as { error?: string }).error === "string"
            ? (payload as { error: string }).error
            : undefined) || "Error al eliminar precio";
        setError(message);
        throw new Error(message);
      }

      const deleted = extractPrice(payload);
      const deletedIdentifier = deleted
        ? getPriceDocumentId(deleted) ?? String(deleted.id)
        : identifier;
      setPrices((prev) => prev.filter((price) => !matchesPriceIdentifier(price, deletedIdentifier)));

      if (!deleted) {
        await fetchPrices(lastFiltersRef.current);
      }

      return deleted;
    },
    [fetchPrices]
  );

  useEffect(() => {
    fetchPrices(initialFilters).catch(() => {
      /* error handled in fetchPrices */
    });
  }, [fetchPrices, initialFilters]);

  return {
    prices,
    loading,
    error,
    fetchPrices,
    createPrice,
    updatePrice,
    deletePrice,
  };
}