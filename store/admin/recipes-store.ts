"use client";

import { create } from 'zustand';
import { Recipe, RecipeCreateInput, RecipeUpdateInput } from '@/types/recipe';
import { createRecipe, deleteRecipe, listRecipes, updateRecipe, RecipeListResponse } from '@/lib/admin/recipes-api';

type PublishedFilter = 'all' | 'true' | 'false';

type Filters = {
  q: string;
  published: PublishedFilter;
  productDocumentId?: string | null;
  page: number;
  pageSize: number;
};

type State = {
  filters: Filters;
  items: Recipe[];
  meta?: RecipeListResponse['meta'];
  loading: boolean;
  selectedRecipe?: Recipe | null;
  // quick counters surfaced in header
  totalCount: number;
  publishedCount: number;
};

type Actions = {
  fetchRecipes: (p?: Partial<Filters>) => Promise<void>;
  setFilters: (p: Partial<Filters>) => void;
  setSelectedRecipe: (r: Recipe | null | undefined) => void;
  createRecipe: (data: RecipeCreateInput) => Promise<Recipe>;
  updateRecipe: (documentId: string, data: RecipeUpdateInput) => Promise<Recipe>;
  deleteRecipe: (documentId: string) => Promise<void>;
};

export const useRecipesStore = create<State & Actions>((set, get) => ({
  filters: { q: '', published: 'all', page: 1, pageSize: 10, productDocumentId: null },
  items: [],
  meta: undefined,
  loading: false,
  selectedRecipe: null,
  totalCount: 0,
  publishedCount: 0,

  async fetchRecipes(p) {
    const current = get().filters;
    const merged: Filters = { ...current, ...(p || {}) } as Filters;
    // Reset to page 1 when changing non-pagination filters
    const resetPage = p && (('q' in p) || ('published' in p) || ('productDocumentId' in p));
    if (resetPage) merged.page = 1;
    console.log('[recipes-store] fetchRecipes filters', merged);
    set({ loading: true, filters: merged });
    try {
      const res = await listRecipes({
        q: merged.q,
        page: merged.page,
        pageSize: merged.pageSize,
        published: merged.published,
        productDocumentId: merged.productDocumentId || undefined,
      });
      console.log('[recipes-store] fetchRecipes result', {
        count: Array.isArray(res?.items) ? res.items.length : 0,
        meta: res?.meta,
        totalCount: res?.totalCount,
        publishedCount: res?.publishedCount,
      });

      const safeItems = Array.isArray(res?.items) ? res.items : [];
      const safeMeta = res?.meta ?? {
        pagination: {
          page: 1,
          pageSize: safeItems.length,
          total: safeItems.length,
          pageCount: 1,
        },
      };

      set({ items: safeItems, meta: safeMeta, loading: false });
      set({
        totalCount: res?.totalCount ?? safeMeta.pagination.total ?? safeItems.length,
        publishedCount: res?.publishedCount ?? 0,
      });
    } catch (e) {
      console.error('[recipes-store] Error fetching recipes', e);
      set({ items: [], meta: undefined, loading: false, totalCount: 0, publishedCount: 0 });
      throw e;
    }
  },

  setFilters(p) {
    const current = get().filters;
    const merged: Filters = { ...current, ...(p || {}) } as Filters;
    set({ filters: merged });
  },

  setSelectedRecipe(r) {
    set({ selectedRecipe: r ?? null });
  },

  async createRecipe(data) {
    const created = await createRecipe(data);
    // optimistic: put at top, then refetch quietly
    set({ items: [created, ...get().items] });
    void get().fetchRecipes();
    return created;
  },

  async updateRecipe(documentId, data) {
    const updated = await updateRecipe(documentId, data);
    const items = get().items.map((r) => (r.documentId === documentId ? updated : r));
    set({ items });
    void get().fetchRecipes();
    return updated;
  },

  async deleteRecipe(documentId) {
    await deleteRecipe(documentId);
    const items = get().items.filter((r) => r.documentId !== documentId);
    set({ items });
    void get().fetchRecipes();
  },
}));
