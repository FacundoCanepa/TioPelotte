"use client";

import { create } from 'zustand';
import { toast } from 'sonner';
import {
  createFabricacion,
  deleteFabricacion,
  getFabricacion,
  listFabricaciones,
  recalculateFabricacion,
  updateFabricacion,
} from '@/lib/admin/fabricacion-api';
import {
  FabricacionDoc,
  FabricacionFiltersState,
  FabricacionListMeta,
  FabricacionPayload,
} from '@/types/fabricacion';

type FormMode = 'create' | 'edit';

type State = {
  filters: FabricacionFiltersState;
  meta: FabricacionListMeta;
  items: FabricacionDoc[];
  loading: boolean;
  error: string | null;
  showForm: boolean;
  formMode: FormMode;
  current: FabricacionDoc | null;
  formLoading: boolean;
  saving: boolean;
  deletingId: number | null;
  recalculatingId: number | null;
};

type Actions = {
  fetchList: (override?: Partial<FabricacionFiltersState>) => Promise<void>;
  setFilters: (update: Partial<FabricacionFiltersState>) => void;
  openCreate: () => void;
  openEdit: (id: number) => Promise<void>;
  closeForm: () => void;
  saveFabricacion: (payload: FabricacionPayload) => Promise<FabricacionDoc>;
  removeFabricacion: (id: number) => Promise<void>;
  triggerRecalculate: (id: number) => Promise<FabricacionDoc>;
};

const defaultMeta: FabricacionListMeta = { page: 1, pageSize: 10, total: 0, pageCount: 1 };

export const useFabricacionAdminStore = create<State & Actions>((set, get) => ({
  filters: { search: '', status: 'all', productId: null, page: 1, pageSize: 10 },
  meta: defaultMeta,
  items: [],
  loading: false,
  error: null,
  showForm: false,
  formMode: 'create',
  current: null,
  formLoading: false,
  saving: false,
  deletingId: null,
  recalculatingId: null,

  async fetchList(override) {
    const currentFilters = get().filters;
    const nextFilters = { ...currentFilters, ...(override || {}) } as FabricacionFiltersState;
    if (override && ('search' in override || 'status' in override || 'productId' in override)) {
      nextFilters.page = 1;
    }
    set({ loading: true, filters: nextFilters, error: null });
    try {
      console.log('[fabricacion-store] fetchList', nextFilters);
      const res = await listFabricaciones(nextFilters);
      const items = Array.isArray(res.items) ? res.items : [];
      const meta = res.meta ?? defaultMeta;
      set({ items, meta, loading: false });
    } catch (error) {
      console.error('[fabricacion-store] fetchList error', error);
      set({ items: [], meta: defaultMeta, loading: false, error: 'Error cargando fabricaciones' });
      throw error;
    }
  },

  setFilters(update) {
    const next = { ...get().filters, ...(update || {}) } as FabricacionFiltersState;
    set({ filters: next });
  },

  openCreate() {
    set({ showForm: true, formMode: 'create', current: null, formLoading: false });
  },

  async openEdit(id) {
    set({ showForm: true, formMode: 'edit', formLoading: true, current: null });
    try {
      console.log('[fabricacion-store] openEdit', id);
      const res = await getFabricacion(id);
      set({ current: res.item, formLoading: false });
    } catch (error) {
      console.error('[fabricacion-store] openEdit error', error);
      set({ formLoading: false });
      toast.error('No se pudo cargar la fabricación');
      throw error;
    }
  },

  closeForm() {
    set({ showForm: false, formMode: 'create', current: null });
  },

  async saveFabricacion(payload) {
    const mode = get().formMode;
    const current = get().current;
    set({ saving: true });
    try {
      let item: FabricacionDoc;
      if (mode === 'edit' && current) {
        item = await updateFabricacion(current.id, payload);
        toast.success('Fabricación actualizada');
      } else {
        item = await createFabricacion(payload);
        toast.success('Fabricación creada');
      }
      const items = get().items;
      const updatedItems = mode === 'edit' && current
        ? items.map((it) => (it.id === current.id ? item : it))
        : [item, ...items];
      set({ items: updatedItems, current: item, saving: false, formMode: 'edit' });
      void get().fetchList();
      return item;
    } catch (error) {
      console.error('[fabricacion-store] saveFabricacion error', error);
      set({ saving: false });
      throw error;
    }
  },

  async removeFabricacion(id) {
    set({ deletingId: id });
    try {
      await deleteFabricacion(id);
      toast.success('Fabricación eliminada');
      const items = get().items.filter((item) => item.id !== id);
      set({ items, deletingId: null });
      void get().fetchList();
    } catch (error) {
      console.error('[fabricacion-store] removeFabricacion error', error);
      set({ deletingId: null });
      throw error;
    }
  },

  async triggerRecalculate(id) {
    set({ recalculatingId: id });
    try {
      const item = await recalculateFabricacion(id);
      toast.success('Costos recalculados');
      const items = get().items.map((fabricacion) => (fabricacion.id === id ? item : fabricacion));
      const isEditing = get().current?.id === id;
      set({ items, recalculatingId: null, current: isEditing ? item : get().current });
      return item;
    } catch (error) {
      console.error('[fabricacion-store] triggerRecalculate error', error);
      set({ recalculatingId: null });
      throw error;
    }
  },
}));
