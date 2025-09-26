
import { create } from 'zustand';
import { immer } from 'zustand/middleware/immer';
import { calcularCostoFabricacion, FabricacionParams, FabricacionResultado, IngredientPricing } from '@/lib/fabricacion/costing';

export type FabricacionState = {
  fabricaciones: FabricacionResultado[];
  pricingCatalog: Record<string, IngredientPricing>;
  loading: boolean;
  error: string | null;
};

export type FabricacionActions = {
  fetchFabricaciones: (params: FabricacionParams[]) => Promise<void>;
  setPricingCatalog: (catalog: Record<string, IngredientPricing>) => void;
  recomputeFabricacion: (fabricacionId: string, newParams: Partial<FabricacionParams>) => void;
};

const initialState: FabricacionState = {
  fabricaciones: [],
  pricingCatalog: {},
  loading: false,
  error: null,
};

export const useFabricacionStore = create<FabricacionState & FabricacionActions>()(
  immer((set, get) => ({
    ...initialState,

    fetchFabricaciones: async (params) => {
      set({ loading: true, error: null });
      try {
        const pricingCatalog = get().pricingCatalog;
        const resultados = params.map(p => calcularCostoFabricacion(p, pricingCatalog));
        set({ fabricaciones: resultados, loading: false });
      } catch (e) {
        const error = e instanceof Error ? e.message : 'Error al calcular los costos de fabricación.';
        set({ loading: false, error });
      }
    },

    setPricingCatalog: (catalog) => {
      set({ pricingCatalog: catalog });
    },

    recomputeFabricacion: (fabricacionId, newParams) => {
      set(state => {
        const fabIndex = state.fabricaciones.findIndex(f => f.fabricacionId === fabricacionId);
        if (fabIndex === -1) return;

        const originalParams: FabricacionParams = {
          fabricacionId: state.fabricaciones[fabIndex].fabricacionId,
          nombre: state.fabricaciones[fabIndex].nombre,
          lineas: state.fabricaciones[fabIndex].lineas.map(l => ({
            lineaId: l.lineaId,
            ingredientId: l.ingredientId,
            ingredientName: l.ingredientName,
            quantity: l.quantityOriginal,
            unit: l.quantityOriginalUnit,
            mermaPct: l.mermaPct,
          })),
          // Default values for other params, you might need to fetch/store them properly
          batchSize: 1,
          mermaPctGlobal: 0,
          costoManoObra: 0,
          costoEmpaque: 0,
          overheadPct: 0,
          margenObjetivoPct: 0,
          precioVentaActual: state.fabricaciones[fabIndex].precioVentaActual,
        };

        const updatedParams = { ...originalParams, ...newParams };
        const newResult = calcularCostoFabricacion(updatedParams, state.pricingCatalog);
        state.fabricaciones[fabIndex] = newResult;
      });
    },
  }))
);
