import { create } from "zustand";

export interface CartItem {
  id: string;
  productId: string;
  name: string;
  price: number;
  image: string;
  size: string;
  qty: number;
}

interface CartState {
  items: CartItem[];
  isOpen: boolean;
  addItem: (item: Omit<CartItem, "id">) => void;
  removeItem: (id: string) => void;
  updateQty: (id: string, qty: number) => void;
  clearCart: () => void;
  toggleCart: () => void;
  openCart: () => void;
  closeCart: () => void;
  totalItems: () => number;
  totalPrice: () => number;
}

export const useCartStore = create<CartState>((set, get) => ({
  items: [],
  isOpen: false,

  addItem: (item) => {
    const items = get().items;
    const existing = items.find(
      (i) => i.productId === item.productId && i.size === item.size
    );
    if (existing) {
      set({
        items: items.map((i) =>
          i.id === existing.id ? { ...i, qty: i.qty + item.qty } : i
        ),
      });
    } else {
      set({ items: [...items, { ...item, id: `${item.productId}-${item.size}` }] });
    }
  },

  removeItem: (id) => {
    set({ items: get().items.filter((i) => i.id !== id) });
  },

  updateQty: (id, qty) => {
    if (qty <= 0) {
      set({ items: get().items.filter((i) => i.id !== id) });
    } else {
      set({
        items: get().items.map((i) => (i.id === id ? { ...i, qty } : i)),
      });
    }
  },

  clearCart: () => set({ items: [] }),
  toggleCart: () => set({ isOpen: !get().isOpen }),
  openCart: () => set({ isOpen: true }),
  closeCart: () => set({ isOpen: false }),
  totalItems: () => get().items.reduce((sum, i) => sum + i.qty, 0),
  totalPrice: () => get().items.reduce((sum, i) => sum + i.price * i.qty, 0),
}));
