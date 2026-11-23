import { create } from "zustand";
import { persist } from "zustand/middleware";
import { cerrarSesion, iniciarSesion, obtenerUsuarioActual } from "../features/auth/api/auth";
import type { UserPublic } from "../features/auth/types/auth";
import { queryClient } from "../shared/api/queryClient";
import { useCartStore } from "./cartStore";

interface AuthState {
  usuario: UserPublic | null;
  // true hasta que checkSession confirma (o descarta) la sesión al iniciar la aplicación
  cargando: boolean;
  login: (username: string, password: string) => Promise<void>;
  logout: () => Promise<void>;
  checkSession: () => Promise<void>;
  /** Limpia la sesión local sin llamar al backend (la usa el interceptor de Axios). */
  limpiarSesion: () => void;
}

export const useAuthStore = create<AuthState>()(
  persist(
    (set) => ({
      usuario: null,
      cargando: true,

      // POST /auth/token deja la cookie HttpOnly; GET /auth/me trae los datos del usuario.
      // Si falla, el error llega al formulario de login, que muestra el mensaje.
      login: async (username, password) => {
        await iniciarSesion({ username, password });
        const usuario = await obtenerUsuarioActual();
        queryClient.clear();
        set({ usuario, cargando: false });
      },

      logout: async () => {
        try {
          await cerrarSesion();
        } finally {
          // Aunque el backend no responda, la sesión local se limpia igual
          queryClient.clear();
          useCartStore.getState().vaciar();
          set({ usuario: null, cargando: false });
        }
      },

      // Al recargar, el usuario persistido solo se da por válido cuando /auth/me confirma la cookie
      checkSession: async () => {
        try {
          const usuario = await obtenerUsuarioActual();
          set({ usuario, cargando: false });
        } catch {
          set({ usuario: null, cargando: false });
        }
      },

      limpiarSesion: () => {
        queryClient.clear();
        useCartStore.getState().vaciar();
        set({ usuario: null, cargando: false });
      },
    }),
    {
      name: "food-store-auth",
      // Solo se persiste el usuario; nunca el token (viaja en una cookie HttpOnly)
      partialize: (state) => ({ usuario: state.usuario }),
    },
  ),
);
