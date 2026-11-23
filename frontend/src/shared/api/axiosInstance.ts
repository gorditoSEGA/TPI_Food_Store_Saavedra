import axios, { AxiosError } from "axios";
import { useAuthStore } from "../../store/authStore";

export const API_URL = import.meta.env.VITE_API_URL ?? "http://localhost:8000/api/v1";

// Rutas cuyo 401 es parte del flujo normal: credenciales incorrectas o "todavía no hay sesión"
const RUTAS_SIN_LIMPIEZA = ["/auth/token", "/auth/me"];

interface CuerpoError {
  detail?: unknown;
}

/**
 * Instancia única de Axios. withCredentials hace que el navegador adjunte la cookie HttpOnly
 * con el JWT: el frontend nunca lee ni guarda el token.
 */
const axiosInstance = axios.create({
  baseURL: API_URL,
  withCredentials: true,
});

// 401 fuera de /auth/token y /auth/me (sesión vencida), o 400 "Cuenta de usuario desactivada":
// se limpia el authStore y ProtectedRoute redirige a /login al quedar sin usuario.
axiosInstance.interceptors.response.use(
  (response) => response,
  (error: AxiosError<CuerpoError>) => {
    const url = error.config?.url ?? "";
    const status = error.response?.status;
    const detail = error.response?.data?.detail;
    const sesionVencida = status === 401 && !RUTAS_SIN_LIMPIEZA.some((ruta) => url.endsWith(ruta));
    const cuentaDesactivada = status === 400 && detail === "Cuenta de usuario desactivada";
    if (sesionVencida || cuentaDesactivada) {
      useAuthStore.getState().limpiarSesion();
    }
    return Promise.reject(error);
  },
);

export default axiosInstance;
