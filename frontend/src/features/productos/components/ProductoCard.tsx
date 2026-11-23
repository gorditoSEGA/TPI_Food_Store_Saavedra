import { useCartStore } from "../../../store/cartStore";
import { formatearPrecio } from "../../../shared/utils/formato";
import Button from "../../../shared/ui/Button";
import Card from "../../../shared/ui/Card";
import Skeleton from "../../../shared/components/Skeleton";
import type { ProductoRead } from "../types/producto";
import ImagenProducto from "./ImagenProducto";

export default function ProductoCard({ producto }: { producto: ProductoRead }) {
  const agregar = useCartStore((s) => s.agregar);
  const enCarrito = useCartStore((s) => s.items.find((i) => i.producto_id === producto.id)?.cantidad ?? 0);

  const agotado = !producto.disponible || producto.stock <= 0;
  const alLimite = !agotado && enCarrito >= producto.stock;

  return (
    <Card sinPadding className="flex flex-col overflow-hidden">
      <ImagenProducto url={producto.imagen_url} nombre={producto.nombre} className="h-40 w-full" />
      <div className="flex flex-1 flex-col p-4">
        <p className="text-xs font-semibold uppercase tracking-wide text-brand">{producto.categoria.nombre}</p>
        <h3 className="mt-1 text-base font-bold text-ink">{producto.nombre}</h3>
        {producto.descripcion && <p className="mt-1 line-clamp-2 text-sm text-stone-500">{producto.descripcion}</p>}

        <div className="mt-auto pt-4">
          <div className="flex items-baseline justify-between">
            <span className="text-lg font-extrabold text-ink">{formatearPrecio(producto.precio_base)}</span>
            <span className={`text-xs font-medium ${agotado ? "text-rose-600" : "text-stone-500"}`}>
              {agotado ? "Agotado" : `Stock: ${producto.stock}`}
            </span>
          </div>
          <Button
            className="mt-3 w-full"
            disabled={agotado || alLimite}
            onClick={() =>
              agregar({
                producto_id: producto.id,
                nombre: producto.nombre,
                precio_unitario: producto.precio_base,
                stock_disponible: producto.stock,
              })
            }
          >
            {agotado ? "No disponible" : alLimite ? "Máximo en el carrito" : "Agregar al carrito"}
          </Button>
          {enCarrito > 0 && <p className="mt-1.5 text-center text-xs text-stone-500">{enCarrito} en tu carrito</p>}
        </div>
      </div>
    </Card>
  );
}

export function ProductoCardSkeleton() {
  return (
    <Card sinPadding className="overflow-hidden">
      <Skeleton className="h-40 w-full rounded-none" />
      <div className="space-y-3 p-4">
        <Skeleton className="h-3 w-1/3" />
        <Skeleton className="h-5 w-2/3" />
        <Skeleton className="h-4 w-full" />
        <Skeleton className="h-10 w-full" />
      </div>
    </Card>
  );
}
