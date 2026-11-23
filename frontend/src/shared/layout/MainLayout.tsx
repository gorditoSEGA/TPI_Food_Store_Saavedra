import { NavLink, Outlet, useLocation } from "react-router-dom";
import Navbar from "./Navbar";

const SECCIONES_ADMIN = [
  { to: "/admin/resumen", texto: "Resumen" },
  { to: "/admin/categorias", texto: "Categorías" },
  { to: "/admin/productos", texto: "Productos" },
  { to: "/admin/pedidos", texto: "Pedidos" },
  { to: "/admin/usuarios", texto: "Usuarios" },
];

/** Navbar + contenido de la ruta. Dentro de /admin agrega la barra de secciones del panel. */
export default function MainLayout() {
  const enAdmin = useLocation().pathname.startsWith("/admin");

  return (
    <div className="flex min-h-screen flex-col">
      <Navbar />
      {enAdmin && (
        <nav aria-label="Panel de administración" className="border-b border-stone-200 bg-stone-100">
          <ul className="mx-auto flex max-w-6xl gap-1 overflow-x-auto px-4 py-2">
            {SECCIONES_ADMIN.map((seccion) => (
              <li key={seccion.to}>
                <NavLink
                  to={seccion.to}
                  className={({ isActive }) =>
                    `block whitespace-nowrap rounded-md px-3 py-1.5 text-sm font-medium ${
                      isActive ? "bg-white text-brand-dark shadow-sm" : "text-stone-600 hover:text-ink"
                    }`
                  }
                >
                  {seccion.texto}
                </NavLink>
              </li>
            ))}
          </ul>
        </nav>
      )}
      <main className="mx-auto w-full max-w-6xl flex-1 px-4 py-6">
        <Outlet />
      </main>
    </div>
  );
}
