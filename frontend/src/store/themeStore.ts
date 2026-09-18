import { create } from 'zustand';

export type ThemeMode = 'light' | 'dark';

interface ThemeState {
  theme: ThemeMode;
  setTheme: (theme: ThemeMode) => void;
  toggleTheme: () => void;
}

const getInitialTheme = (): ThemeMode => {
  if (typeof window === 'undefined') return 'light';
  
  const saved = localStorage.getItem('storefront_theme') as ThemeMode;
  if (saved === 'light' || saved === 'dark') {
    return saved;
  }
  
  // Default to light mode for maximum brightness and crispness, or system preference
  if (window.matchMedia && window.matchMedia('(prefers-color-scheme: dark)').matches) {
    return 'dark';
  }
  return 'light';
};

const applyThemeToDOM = (theme: ThemeMode) => {
  if (typeof document === 'undefined') return;
  const root = document.documentElement;
  if (theme === 'dark') {
    root.classList.add('dark');
  } else {
    root.classList.remove('dark');
  }
};

// Initialize immediately on file load
if (typeof window !== 'undefined') {
  const initialTheme = getInitialTheme();
  applyThemeToDOM(initialTheme);
}

export const useThemeStore = create<ThemeState>((set, get) => ({
  theme: getInitialTheme(),
  setTheme: (theme: ThemeMode) => {
    localStorage.setItem('storefront_theme', theme);
    applyThemeToDOM(theme);
    set({ theme });
  },
  toggleTheme: () => {
    const nextTheme = get().theme === 'dark' ? 'light' : 'dark';
    localStorage.setItem('storefront_theme', nextTheme);
    applyThemeToDOM(nextTheme);
    set({ theme: nextTheme });
  },
}));
