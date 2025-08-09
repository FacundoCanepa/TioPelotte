import { create } from "zustand";
import { persist } from "zustand/middleware";
import type { ProductType } from "@/types/product";

export type CartItem = {
product: ProductType;
  quantity: number;
};

export type CartStore = {
  cart: CartItem[];
  tipoEntrega: "domicilio" | "local" | null;
  zona: string;
  direccion: string;
  referencias: string;
  tipoPago: "mercado pago" | "efectivo" | "Elegís al momento de pagar";
  total: number;
  nombre: string;
  telefono: string;

  addToCart: (product: CartItem["product"], quantity: number) => void;
  removeFromCart: (productId: number) => void;
  updateQuantity: (productId: number, quantity: number) => void;
  clearCart: () => void;

  setTipoEntrega: (tipo: "domicilio" | "local") => void;
  setZona: (zona: string) => void;
  setDireccion: (direccion: string) => void;
  setReferencias: (referencias: string) => void;
 setTipoPago: (tipo: "mercado pago" | "efectivo" | "Elegís al momento de pagar") => void;
  setTotal: (total: number) => void;
  setNombre: (nombre: string) => void;
  setTelefono: (telefono: string) => void;

  getTotalPrice: () => number; 
  getTotalItems: () => number;
};

export const useCartStore = create<CartStore>()(
  persist(
    (set, get) => ({
      cart: [],
      tipoEntrega: "domicilio",
      zona: "",
      direccion: "",
      referencias: "",
      tipoPago: "mercado pago",
      total: 0,
      nombre: "",
      telefono: "",

      addToCart: (product, quantity) => {
        const existing = get().cart.find((item) => item.product.id === product.id);
        if (existing) {
          const updatedCart = get().cart.map((item) =>
            item.product.id === product.id
              ? { ...item, quantity: item.quantity + quantity }
              : item
          );
          set({ cart: updatedCart });
        } else {
          set({ cart: [...get().cart, { product, quantity }] });
        }
      },

      removeFromCart: (productId) => {
        set({ cart: get().cart.filter((item) => item.product.id !== productId) });
      },

      updateQuantity: (productId, quantity) => {
        const updatedCart = get().cart.map((item) =>
          item.product.id === productId ? { ...item, quantity } : item
        );
        set({ cart: updatedCart });
      },

      clearCart: () =>
        set({
          cart: [],
          tipoEntrega: null,
          zona: "",
          direccion: "",
          referencias: "",
          tipoPago: "mercado pago",
          total: 0,
          nombre: "",
          telefono: "",
        }),

      setTipoEntrega: (tipo) => set({ tipoEntrega: tipo }),
      setZona: (zona) => set({ zona }),
      setDireccion: (direccion) => set({ direccion }),
      setReferencias: (referencias) => set({ referencias }),
      setTipoPago: (tipo) => set({ tipoPago: tipo }),
      setTotal: (total) => set({ total }),
      setNombre: (nombre) => set({ nombre }),
      setTelefono: (telefono) => set({ telefono }),

      getTotalPrice: () =>
        get().cart.reduce((acc, item) => acc + item.quantity * item.product.price, 0),

      getTotalItems: () =>
        get().cart.reduce((acc, item) => acc + item.quantity, 0),
    }),
    {
      name: "cart-storage",
    }
  )
);
