import { create } from 'zustand';
import type { Product, Category, Screen, Template, Promotion } from '@/types';

interface AppStore {
  // Products
  products: Product[];
  setProducts: (products: Product[]) => void;
  updateProduct: (product: Product) => void;
  removeProduct: (id: number) => void;

  // Categories
  categories: Category[];
  setCategories: (categories: Category[]) => void;

  // Screens
  screens: Screen[];
  setScreens: (screens: Screen[]) => void;
  updateScreen: (screen: Screen) => void;

  // Templates
  templates: Template[];
  setTemplates: (templates: Template[]) => void;

  // Promotions
  promotions: Promotion[];
  setPromotions: (promotions: Promotion[]) => void;

  // UI State
  sidebarOpen: boolean;
  setSidebarOpen: (open: boolean) => void;
}

export const useAppStore = create<AppStore>((set) => ({
  products: [],
  setProducts: (products) => set({ products }),
  updateProduct: (product) =>
    set((state) => ({
      products: state.products.map((p) => (p.id === product.id ? product : p)),
    })),
  removeProduct: (id) =>
    set((state) => ({ products: state.products.filter((p) => p.id !== id) })),

  categories: [],
  setCategories: (categories) => set({ categories }),

  screens: [],
  setScreens: (screens) => set({ screens }),
  updateScreen: (screen) =>
    set((state) => ({
      screens: state.screens.map((s) => (s.id === screen.id ? screen : s)),
    })),

  templates: [],
  setTemplates: (templates) => set({ templates }),

  promotions: [],
  setPromotions: (promotions) => set({ promotions }),

  sidebarOpen: true,
  setSidebarOpen: (open) => set({ sidebarOpen: open }),
}));
