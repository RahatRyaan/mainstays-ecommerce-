import { create } from 'zustand';
import apiClient from '../api/client';
import type { ProductItem } from '../components/ProductCard';

interface CacheEntry {
  products: ProductItem[];
  total: number;
  timestamp: number;
}

interface ProductStoreState {
  cache: Record<string, CacheEntry>;
  catalogLoaded: boolean;
  
  // Fetch with instant cache return + background revalidation (SWR)
  fetchProductsWithCache: (params: Record<string, string | number>) => Promise<{ products: ProductItem[]; total: number; fromCache: boolean }>;
  
  // Warm up catalog in background
  prefetchCatalog: () => Promise<void>;
  
  // Invalidate cache if needed
  clearProductCache: () => void;
}

const CACHE_TTL_MS = 5 * 60 * 1000; // 5 minutes fresh
const STALE_REVALIDATE_MS = 15 * 1000; // 15 seconds before background revalidation

export const useProductStore = create<ProductStoreState>((set, get) => ({
  cache: {},
  catalogLoaded: false,

  fetchProductsWithCache: async (params: Record<string, string | number>) => {
    // Generate normalized cache key
    const sortedKeys = Object.keys(params).sort();
    const keyParts = sortedKeys
      .filter((k) => params[k] !== undefined && params[k] !== '')
      .map((k) => `${k}=${params[k]}`);
    const cacheKey = keyParts.length > 0 ? keyParts.join('&') : 'all_default';

    const existing = get().cache[cacheKey];
    const now = Date.now();

    // 1. If we have fresh data in cache, return immediately
    if (existing && (now - existing.timestamp) < CACHE_TTL_MS) {
      // If it's older than STALE_REVALIDATE_MS, silently fetch in background
      if ((now - existing.timestamp) > STALE_REVALIDATE_MS) {
        apiClient.get('/products', { params })
          .then((res) => {
            const list = res.data?.products || res.data?.data?.products || (Array.isArray(res.data?.data) ? res.data.data : []) || [];
            const total = res.data?.total || res.data?.data?.total || list.length;
            set((state) => ({
              cache: {
                ...state.cache,
                [cacheKey]: { products: list, total, timestamp: Date.now() },
              },
            }));
          })
          .catch(() => {});
      }

      return { products: existing.products, total: existing.total, fromCache: true };
    }

    // 2. Otherwise fetch from network
    try {
      const response = await apiClient.get('/products', { params });
      const list = response.data?.products || response.data?.data?.products || (Array.isArray(response.data?.data) ? response.data.data : []) || [];
      const total = response.data?.total || response.data?.data?.total || list.length;

      set((state) => ({
        cache: {
          ...state.cache,
          [cacheKey]: { products: list, total, timestamp: Date.now() },
        },
        catalogLoaded: true,
      }));

      return { products: list, total, fromCache: false };
    } catch (error) {
      if (existing) {
        return { products: existing.products, total: existing.total, fromCache: true };
      }
      throw error;
    }
  },

  prefetchCatalog: async () => {
    if (get().catalogLoaded) return;
    try {
      const response = await apiClient.get('/products', { params: { limit: 40 } });
      const list = response.data?.products || response.data?.data?.products || (Array.isArray(response.data?.data) ? response.data.data : []) || [];
      const total = response.data?.total || response.data?.data?.total || list.length;

      set((state) => ({
        cache: {
          ...state.cache,
          'all_default': { products: list, total, timestamp: Date.now() },
          'limit=40': { products: list, total, timestamp: Date.now() },
        },
        catalogLoaded: true,
      }));
    } catch {
      // Silent fail on prefetch
    }
  },

  clearProductCache: () => set({ cache: {}, catalogLoaded: false }),
}));
