import { Link } from "react-router-dom";
import EstadoVacio from "../../../shared/components/EstadoVacio";
import Card from "../../../shared/ui/Card";
import { formatearPrecio } from "../../../shared/utils/formato";
import { useCartStore } from "../../../store/cartStore";
import CheckoutForm from "../components/CheckoutForm";

export default function CheckoutPage() {
  const items = useCartStore((s) => s.items);
  const total = useCartStore((s) => s.total());

  if (items.length === 0) {
    return (
      <Card>
        <EstadoVacio
          titulo="No hay nada para confirmar"
          mensaje="Tu carrito está vacío. Agregá productos desde el catálogo."
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
      <h1 className="text-2xl font-bold">Confirmar pedido</h1>
      <div className="mt-5 grid gap-6 lg:grid-cols-5">
        <Card className="lg:col-span-3">
          <h2 className="mb-4 text-lg font-bold">Datos de entrega</h2>
          <CheckoutForm />
        </Card>

        <Card className="h-fit lg:col-span-2">
          <h2 className="mb-3 text-lg font-bold">Resumen</h2>
          <ul className="divide-y divide-stone-100 text-sm">
            {items.map((item) => (
              <li key={item.producto_id} className="flex justify-between gap-3 py-2">
                <span>
                  {item.cantidad} × {item.nombre}
                </span>
                <span className="tabular-nums">{formatearPrecio(item.precio_unitario * item.cantidad)}</span>
              </li>
            ))}
          </ul>
          <p className="mt-3 flex justify-between border-t border-stone-200 pt-3 text-lg font-extrabold">
            <span>Total</span>
            <span className="tabular-nums">{formatearPrecio(total)}</span>
          </p>
          <Link to="/carrito" className="mt-3 inline-block text-sm font-semibold text-brand hover:underline">
            Modificar carrito
          </Link>
        </Card>
      </div>
    </div>
  );
}
