import type { ReactNode } from "react";
import { Navigate, Outlet, useLocation } from "react-router-dom";
import type { Rol } from "../features/auth/types/auth";
import { Spinner } from "../shared/components/Skeleton";
import { useAuthStore } from "../store/authStore";

interface ProtectedRouteProps {
  allowedRoles?: Rol[];
  children?: ReactNode;
}

/**
 * Sin sesión redirige a /login; con sesión pero sin un rol permitido, a /unauthorized.
 * Se usa como ruta contenedora (renderiza Outlet) o envolviendo un elemento.
 */
export default function ProtectedRoute({ allowedRoles, children }: ProtectedRouteProps) {
  const usuario = useAuthStore((s) => s.usuario);
  const cargando = useAuthStore((s) => s.cargando);
  const location = useLocation();

  if (cargando) return <Spinner mensaje="Verificando la sesión…" />;
  // Se guarda la ruta pedida para volver a ella después del login
  if (!usuario) return <Navigate to="/login" replace state={{ from: location.pathname }} />;
  if (allowedRoles && !allowedRoles.includes(usuario.role)) return <Navigate to="/unauthorized" replace />;

  return children ?? <Outlet />;
}
