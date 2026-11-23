import { create } from "zustand";
import { persist } from "zustand/middleware";

export interface ItemCarrito {
  producto_id: number;
  nombre: string;
  precio_unitario: number;
  cantidad: number;
  /** Stock del producto al agregarlo: tope de la cantidad en el carrito. */
  stock_disponible: number;
}

interface CartState {
  items: ItemCarrito[];
  /** Suma `cantidad` al ítem (o lo crea) sin superar su stock_disponible. */
  agregar: (item: Omit<ItemCarrito, "cantidad">, cantidad?: number) => void;
  quitar: (productoId: number) => void;
  cambiarCantidad: (productoId: number, cantidad: number) => void;
  vaciar: () => void;
  total: () => number;
}

// Los ítems persistidos por versiones anteriores pueden no tener stock_disponible
const topeDe = (i: ItemCarrito): number => (typeof i.stock_disponible === "number" ? i.stock_disponible : Infinity);

export const useCartStore = create<CartState>()(
  persist(
    (set, get) => ({
      items: [],

      agregar: (item, cantidad = 1) =>
        set((estado) => {
          const existente = estado.items.find((i) => i.producto_id === item.producto_id);
          const nueva = (existente?.cantidad ?? 0) + cantidad;
          const acotada = Math.min(nueva, item.stock_disponible);
          if (acotada < 1) return estado;
          if (existente) {
            return {
              items: estado.items.map((i) =>
                i.producto_id === item.producto_id ? { ...i, precio_unitario: item.precio_unitario, stock_disponible: item.stock_disponible, cantidad: acotada } : i,
              ),
            };
          }
          return { items: [...estado.items, { ...item, cantidad: acotada }] };
        }),

      quitar: (productoId) => set((estado) => ({ items: estado.items.filter((i) => i.producto_id !== productoId) })),

      cambiarCantidad: (productoId, cantidad) =>
        set((estado) => ({
          items:
            cantidad < 1
              ? estado.items.filter((i) => i.producto_id !== productoId)
              : estado.items.map((i) =>
                  i.producto_id === productoId ? { ...i, cantidad: Math.min(cantidad, topeDe(i)) } : i,
                ),
        })),

      vaciar: () => set({ items: [] }),

      total: () => get().items.reduce((suma, i) => suma + i.precio_unitario * i.cantidad, 0),
    }),
    {
      name: "food-store-carrito",
      partialize: (state) => ({ items: state.items }),
    },
  ),
);
