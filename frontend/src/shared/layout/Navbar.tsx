import { useState } from "react";
import { Link, NavLink, useNavigate } from "react-router-dom";
import { useAuthStore } from "../../store/authStore";
import { useCartStore } from "../../store/cartStore";
import Button from "../ui/Button";

const claseLink = ({ isActive }: { isActive: boolean }) =>
  `rounded-lg px-3 py-2 text-sm font-medium transition-colors ${
    isActive ? "bg-orange-100 text-brand-dark" : "text-stone-600 hover:bg-stone-100 hover:text-ink"
  }`;

export default function Navbar() {
  const usuario = useAuthStore((s) => s.usuario);
  const logout = useAuthStore((s) => s.logout);
  const cantidad = useCartStore((s) => s.items.reduce((suma, item) => suma + item.cantidad, 0));
  const navigate = useNavigate();
  const [saliendo, setSaliendo] = useState(false);

  async function cerrarSesion() {
    setSaliendo(true);
    try {
      await logout();
    } finally {
      setSaliendo(false);
      navigate("/login", { replace: true });
    }
  }

  return (
    <header className="sticky top-0 z-40 border-b border-stone-200 bg-white/95 backdrop-blur">
      <div className="mx-auto flex max-w-6xl flex-wrap items-center gap-x-4 gap-y-2 px-4 py-3">
        <Link to="/" className="text-lg font-extrabold tracking-tight text-brand">
          Food Store
        </Link>

        <nav aria-label="Principal" className="flex flex-1 flex-wrap items-center gap-1">
          <NavLink to="/" end className={claseLink}>
            Catálogo
          </NavLink>
          <NavLink to="/carrito" className={claseLink}>
            Carrito
            <span
              className="ml-1.5 inline-flex min-w-5 items-center justify-center rounded-full bg-brand px-1.5 text-xs font-bold text-white"
              aria-label={`${cantidad} productos en el carrito`}
            >
              {cantidad}
            </span>
          </NavLink>
          {usuario && (
            <NavLink to="/mis-pedidos" className={claseLink}>
              Mis pedidos
            </NavLink>
          )}
          {usuario?.role === "admin" && (
            <NavLink to="/admin/resumen" className={claseLink}>
              Panel admin
            </NavLink>
          )}
        </nav>

        <div className="flex items-center gap-3">
          {usuario ? (
            <>
              <div className="text-right text-sm leading-tight">
                <p className="font-semibold text-ink">{usuario.full_name}</p>
                <p className="text-xs text-stone-500">{usuario.role === "admin" ? "Administrador" : "Cliente"}</p>
              </div>
              <Button variante="fantasma" tamanio="sm" cargando={saliendo} onClick={() => void cerrarSesion()}>
                Cerrar sesión
              </Button>
            </>
          ) : (
            <>
              <Link to="/login" className="text-sm font-semibold text-stone-700 hover:text-brand">
                Ingresar
              </Link>
              <Link to="/register" className="rounded-lg bg-brand px-3 py-1.5 text-sm font-semibold text-white hover:bg-brand-dark">
                Registrarse
              </Link>
            </>
          )}
        </div>
      </div>
    </header>
  );
}
