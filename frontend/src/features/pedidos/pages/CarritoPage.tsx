import { Link } from "react-router-dom";
import EstadoVacio from "../../../shared/components/EstadoVacio";
import Button from "../../../shared/ui/Button";
import Card from "../../../shared/ui/Card";
import { formatearPrecio } from "../../../shared/utils/formato";
import { useAuthStore } from "../../../store/authStore";
import { useCartStore } from "../../../store/cartStore";

export default function CarritoPage() {
  const items = useCartStore((s) => s.items);
  const cambiarCantidad = useCartStore((s) => s.cambiarCantidad);
  const quitar = useCartStore((s) => s.quitar);
  const vaciar = useCartStore((s) => s.vaciar);
  const total = useCartStore((s) => s.total());
  const usuario = useAuthStore((s) => s.usuario);

  if (items.length === 0) {
    return (
      <Card>
        <EstadoVacio
          titulo="Tu carrito está vacío"
          mensaje="Sumá productos desde el catálogo para armar tu pedido."
          accion={
            <Link to="/" className="rounded-lg bg-brand px-4 py-2.5 text-sm font-semibold text-white hover:bg-brand-dark">
              Ir al catálogo
            </Link>
          }
        />
      </Card>
    );
  }

  return (
    <div>
      <div className="mb-5 flex flex-wrap items-center justify-between gap-3">
        <h1 className="text-2xl font-bold">Carrito</h1>
        <Button variante="fantasma" tamanio="sm" onClick={vaciar}>
          Vaciar carrito
        </Button>
      </div>

      <Card sinPadding>
        <div className="overflow-x-auto">
          <table className="w-full min-w-[560px] text-left">
            <thead className="bg-stone-50 text-[11px] font-semibold uppercase tracking-wider text-stone-500">
              <tr>
                <th scope="col" className="px-4 py-3">Producto</th>
                <th scope="col" className="px-4 py-3 text-right">Precio</th>
                <th scope="col" className="px-4 py-3 text-center">Cantidad</th>
                <th scope="col" className="px-4 py-3 text-right">Subtotal</th>
                <th scope="col" className="px-4 py-3"><span className="sr-only">Quitar</span></th>
              </tr>
            </thead>
            <tbody>
              {items.map((item) => (
                <tr key={item.producto_id} className="border-t border-stone-100">
                  <td className="px-4 py-3 font-medium text-ink">{item.nombre}</td>
                  <td className="px-4 py-3 text-right tabular-nums">{formatearPrecio(item.precio_unitario)}</td>
                  <td className="px-4 py-3">
                    <div className="flex items-center justify-center gap-1">
                      <button
                        type="button"
                        aria-label={`Quitar una unidad de ${item.nombre}`}
                        onClick={() => cambiarCantidad(item.producto_id, item.cantidad - 1)}
                        className="h-8 w-8 rounded-md border border-stone-300 text-lg leading-none hover:bg-stone-50"
                      >
                        −
                      </button>
                      <span className="w-8 text-center tabular-nums" aria-live="polite">
                        {item.cantidad}
                      </span>
                      <button
                        type="button"
                        aria-label={`Sumar una unidad de ${item.nombre}`}
                        disabled={item.cantidad >= item.stock_disponible}
                        onClick={() => cambiarCantidad(item.producto_id, item.cantidad + 1)}
                        className="h-8 w-8 rounded-md border border-stone-300 text-lg leading-none hover:bg-stone-50 disabled:cursor-not-allowed disabled:opacity-40"
                      >
                        +
                      </button>
                    </div>
                  </td>
                  <td className="px-4 py-3 text-right font-semibold tabular-nums">
                    {formatearPrecio(item.precio_unitario * item.cantidad)}
                  </td>
                  <td className="px-4 py-3 text-right">
                    <Button variante="fantasma" tamanio="sm" onClick={() => quitar(item.producto_id)} aria-label={`Quitar ${item.nombre} del carrito`}>
                      Quitar
                    </Button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        <div className="flex flex-wrap items-center justify-between gap-4 border-t border-stone-200 px-4 py-4">
          <p className="text-lg">
            Total: <strong className="text-2xl font-extrabold">{formatearPrecio(total)}</strong>
          </p>
          <div className="flex flex-wrap gap-2">
            <Link to="/" className="rounded-lg bg-stone-100 px-4 py-2.5 text-sm font-semibold text-stone-700 hover:bg-stone-200">
              Seguir comprando
            </Link>
            {usuario ? (
              <Link to="/checkout" className="rounded-lg bg-brand px-4 py-2.5 text-sm font-semibold text-white hover:bg-brand-dark">
                Continuar con el pedido
              </Link>
            ) : (
              <Link
                to="/login"
                state={{ from: "/checkout" }}
                className="rounded-lg bg-brand px-4 py-2.5 text-sm font-semibold text-white hover:bg-brand-dark"
              >
                Iniciar sesión para continuar
              </Link>
            )}
          </div>
        </div>
      </Card>
    </div>
  );
}
