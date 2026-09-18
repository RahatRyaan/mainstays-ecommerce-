import { create } from 'zustand';
import apiClient from '../api/client';
import { useToastStore } from './toastStore';

export interface WishlistItem {
  _id: string;
  id?: string;
  title: string;
  price: number;
  originalPrice?: number;
  images: string[];
  category: string;
  rating?: number;
  reviewsCount?: number;
  inventory?: number;
  vendor?: {
    _id?: string;
    name?: string;
    storeName?: string;
  };
}

interface WishlistState {
  items: WishlistItem[];
  isLoading: boolean;
  fetchWishlist: () => Promise<void>;
  toggleWishlist: (product: WishlistItem) => Promise<boolean>;
  removeFromWishlist: (productId: string) => Promise<void>;
  isInWishlist: (productId: string) => boolean;
  clearWishlist: () => Promise<void>;
}

// Helper to get local stored wishlist
const getLocalWishlist = (): WishlistItem[] => {
  try {
    const data = localStorage.getItem('mainstays_wishlist');
    return data ? JSON.parse(data) : [];
  } catch {
    return [];
  }
};

const saveLocalWishlist = (items: WishlistItem[]) => {
  try {
    localStorage.setItem('mainstays_wishlist', JSON.stringify(items));
  } catch {}
};

export const useWishlistStore = create<WishlistState>((set, get) => ({
  items: getLocalWishlist(),
  isLoading: false,

  fetchWishlist: async () => {
    const token = localStorage.getItem('token');
    if (!token) {
      set({ items: getLocalWishlist() });
      return;
    }

    try {
      set({ isLoading: true });
      const res = await apiClient.get('/wishlist');
      if (res.data?.success && Array.isArray(res.data?.data)) {
        set({ items: res.data.data });
        saveLocalWishlist(res.data.data);
      }
    } catch {
      console.warn('Could not fetch server wishlist, using local cache');
    } finally {
      set({ isLoading: false });
    }
  },

  toggleWishlist: async (product: WishlistItem) => {
    const { items } = get();
    const token = localStorage.getItem('token');
    const productId = product._id || product.id || '';
    const isCurrentlySaved = items.some((item) => (item._id || item.id) === productId);

    let updatedItems: WishlistItem[];
    let actionAdded = false;

    if (isCurrentlySaved) {
      updatedItems = items.filter((item) => (item._id || item.id) !== productId);
      actionAdded = false;
      useToastStore.getState().addToast({
        type: 'info',
        title: 'Removed from Wishlist',
        message: `${product.title} was removed from your saved list.`,
      });
    } else {
      updatedItems = [product, ...items];
      actionAdded = true;
      useToastStore.getState().addToast({
        type: 'success',
        title: 'Saved to Wishlist!',
        message: `${product.title} is now in your saved list.`,
      });
    }

    set({ items: updatedItems });
    saveLocalWishlist(updatedItems);

    if (token) {
      try {
        const res = await apiClient.post('/wishlist/toggle', { productId });
        if (res.data?.data) {
          set({ items: res.data.data });
          saveLocalWishlist(res.data.data);
        }
      } catch (err) {
        console.error('Server sync error on wishlist toggle:', err);
      }
    }

    return actionAdded;
  },

  removeFromWishlist: async (productId: string) => {
    const { items } = get();
    const token = localStorage.getItem('token');
    const itemToRemove = items.find((item) => (item._id || item.id) === productId);
    const updated = items.filter((item) => (item._id || item.id) !== productId);
    
    set({ items: updated });
    saveLocalWishlist(updated);
    
    useToastStore.getState().addToast({
      type: 'info',
      title: 'Removed from Wishlist',
      message: `${itemToRemove?.title || 'Item'} was removed from your wishlist.`,
    });

    if (token) {
      try {
        await apiClient.post('/wishlist/toggle', { productId });
      } catch (err) {
        console.error('Server sync error on wishlist remove:', err);
      }
    }
  },

  isInWishlist: (productId: string) => {
    const { items } = get();
    return items.some((item) => (item._id || item.id) === productId);
  },

  clearWishlist: async () => {
    const token = localStorage.getItem('token');
    set({ items: [] });
    saveLocalWishlist([]);
    
    useToastStore.getState().addToast({
      type: 'info',
      title: 'Wishlist Cleared',
      message: 'All saved items have been cleared.',
    });

    if (token) {
      try {
        await apiClient.delete('/wishlist/clear');
      } catch (err) {
        console.error('Server sync error on wishlist clear:', err);
      }
    }
  },
}));
