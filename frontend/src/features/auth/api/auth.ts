import axiosInstance from "../../../shared/api/axiosInstance";
import type { LoginCredentials, MensajeRespuesta, UserCreate, UserPublic } from "../types/auth";

/** POST /auth/token: formulario OAuth2 (form-urlencoded). La cookie HttpOnly la fija el backend. */
export async function iniciarSesion({ username, password }: LoginCredentials): Promise<MensajeRespuesta> {
  const cuerpo = new URLSearchParams({ username, password });
  const { data } = await axiosInstance.post<MensajeRespuesta>("/auth/token", cuerpo, {
    headers: { "Content-Type": "application/x-www-form-urlencoded" },
  });
  return data;
}

export async function cerrarSesion(): Promise<MensajeRespuesta> {
  const { data } = await axiosInstance.post<MensajeRespuesta>("/auth/logout");
  return data;
}

export async function obtenerUsuarioActual(): Promise<UserPublic> {
  const { data } = await axiosInstance.get<UserPublic>("/auth/me");
  return data;
}

export async function registrarUsuario(datos: UserCreate): Promise<UserPublic> {
  const { data } = await axiosInstance.post<UserPublic>("/auth/register", datos);
  return data;
}
