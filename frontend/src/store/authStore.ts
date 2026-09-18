import { create } from 'zustand';
import { persist } from 'zustand/middleware';

export interface User {
  id: string;
  name: string;
  email: string;
  role: 'customer' | 'vendor' | 'admin';
  phone?: string;
  address?: string;
  deliveryAddress?: string;
  city?: string;
  state?: string;
  zipCode?: string;
  country?: string;
  storeName?: string;
  businessType?: string;
  taxId?: string;
  businessPhone?: string;
  bankAccount?: string;
  payoutEmail?: string;
  bio?: string;
}

interface AuthState {
  token: string | null;
  user: User | null;
  setAuth: (token: string, user: User) => void;
  logout: () => void;
}

export const useAuthStore = create<AuthState>()(
  persist(
    (set) => ({
      token: null as string | null,
      user: null as User | null,
      setAuth: (token: string, user: User) => {
        localStorage.setItem('token', token);
        set({ token, user });
      },
      logout: () => {
        localStorage.removeItem('token');
        set({ token: null, user: null });
      },
    }),
    {
      name: 'auth-storage', // key in local storage
    }
  )
);
