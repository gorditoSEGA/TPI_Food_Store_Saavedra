export type Rol = "user" | "admin";

/** UserPublic del backend (nunca incluye hashed_password). */
export interface UserPublic {
  id: number;
  username: string;
  full_name: string;
  email: string;
  role: Rol;
  disabled: boolean;
  created_at: string;
}

export interface UserCreate {
  username: string;
  full_name: string;
  email: string;
  password: string;
}

export interface LoginCredentials {
  username: string;
  password: string;
}

export interface MensajeRespuesta {
  message: string;
}
