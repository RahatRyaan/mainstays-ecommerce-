import { create } from 'zustand';
import { persist } from 'zustand/middleware';

export interface CartItem {
  productId: string;
  variantId?: string;
  variantSku?: string;
  variantAttributes?: Record<string, string>;
  name: string;
  price: number;
  quantity: number;
  imageUrl?: string;
  vendorId: string;
}

export interface AppliedCoupon {
  code: string;
  discountPercent?: number;
  discountFixed?: number;
}

interface CartState {
  items: CartItem[];
  appliedCoupon: AppliedCoupon | null;
  addToCart: (item: CartItem) => void;
  removeFromCart: (productId: string, variantId?: string) => void;
  updateQuantity: (productId: string, quantity: number, variantId?: string) => void;
  applyCoupon: (coupon: AppliedCoupon | null) => void;
  removeCoupon: () => void;
  clearCart: () => void;
  getCartSubtotal: () => number;
  getDiscountAmount: () => number;
  getCartTotal: () => number;
  getItemCount: () => number;
}

export const useCartStore = create<CartState>()(
  persist(
    (set, get) => ({
      items: [],
      appliedCoupon: null,
      addToCart: (item) => {
        set((state) => {
          const existingItemIndex = state.items.findIndex(
            (i) => i.productId === item.productId && (!item.variantId || i.variantId === item.variantId)
          );
          if (existingItemIndex > -1) {
            const updatedItems = [...state.items];
            const existing = updatedItems[existingItemIndex];
            if (existing) {
              updatedItems[existingItemIndex] = {
                ...existing,
                quantity: existing.quantity + item.quantity,
              };
            }
            return { items: updatedItems };
          }
          return { items: [...state.items, item] };
        });
      },
      removeFromCart: (productId, variantId) => {
        set((state) => ({
          items: state.items.filter(
            (i) => !(i.productId === productId && (!variantId || i.variantId === variantId))
          ),
        }));
      },
      updateQuantity: (productId, quantity, variantId) => {
        if (quantity <= 0) {
          get().removeFromCart(productId, variantId);
          return;
        }
        set((state) => ({
          items: state.items.map((i) =>
            i.productId === productId && (!variantId || i.variantId === variantId)
              ? { ...i, quantity }
              : i
          ),
        }));
      },
      applyCoupon: (coupon) => {
        set({ appliedCoupon: coupon });
      },
      removeCoupon: () => {
        set({ appliedCoupon: null });
      },
      clearCart: () => set({ items: [], appliedCoupon: null }),
      getCartSubtotal: () => {
        return get().items.reduce((total, item) => total + item.price * item.quantity, 0);
      },
      getDiscountAmount: () => {
        const subtotal = get().getCartSubtotal();
        const coupon = get().appliedCoupon;
        if (!coupon) return 0;
        if (coupon.discountPercent) {
          return Math.min(subtotal, (subtotal * coupon.discountPercent) / 100);
        }
        if (coupon.discountFixed) {
          return Math.min(subtotal, coupon.discountFixed);
        }
        return 0;
      },
      getCartTotal: () => {
        const subtotal = get().getCartSubtotal();
        const discount = get().getDiscountAmount();
        return Math.max(0, subtotal - discount);
      },
      getItemCount: () => {
        return get().items.reduce((count, item) => count + item.quantity, 0);
      },
    }),
    {
      name: 'cart-storage',
    }
  )
);
