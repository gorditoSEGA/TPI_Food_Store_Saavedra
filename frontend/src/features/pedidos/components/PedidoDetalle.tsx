import { formatearFecha, formatearPrecio } from "../../../shared/utils/formato";
import type { FormaPago, PedidoRead } from "../types/pedido";

const TEXTO_PAGO: Record<FormaPago, string> = { EFECTIVO: "Efectivo", TRANSFERENCIA: "Transferencia" };

/** Datos del pedido y tabla de sus líneas (copia del nombre y del precio al momento de la compra). */
export default function PedidoDetalle({ pedido }: { pedido: PedidoRead }) {
  return (
    <div className="space-y-4 text-sm">
      <dl className="grid gap-x-6 gap-y-2 sm:grid-cols-2">
        <div>
          <dt className="text-xs font-semibold uppercase tracking-wide text-stone-400">Fecha</dt>
          <dd>{formatearFecha(pedido.created_at)}</dd>
        </div>
        <div>
          <dt className="text-xs font-semibold uppercase tracking-wide text-stone-400">Forma de pago</dt>
          <dd>{TEXTO_PAGO[pedido.forma_pago]}</dd>
        </div>
        <div className="sm:col-span-2">
          <dt className="text-xs font-semibold uppercase tracking-wide text-stone-400">Dirección de entrega</dt>
          <dd>{pedido.direccion_entrega}</dd>
        </div>
        {pedido.notas && (
          <div className="sm:col-span-2">
            <dt className="text-xs font-semibold uppercase tracking-wide text-stone-400">Notas</dt>
            <dd>{pedido.notas}</dd>
          </div>
        )}
      </dl>

      <div className="overflow-x-auto rounded-lg border border-stone-200">
        <table className="w-full min-w-[420px] text-left">
          <thead className="bg-stone-50 text-[11px] font-semibold uppercase tracking-wider text-stone-500">
            <tr>
              <th scope="col" className="px-3 py-2">Producto</th>
              <th scope="col" className="px-3 py-2 text-right">Cant.</th>
              <th scope="col" className="px-3 py-2 text-right">Precio</th>
              <th scope="col" className="px-3 py-2 text-right">Subtotal</th>
            </tr>
          </thead>
          <tbody>
            {pedido.items.map((linea) => (
              <tr key={linea.producto_id} className="border-t border-stone-100">
                <td className="px-3 py-2 font-medium text-ink">{linea.nombre_producto}</td>
                <td className="px-3 py-2 text-right tabular-nums">{linea.cantidad}</td>
                <td className="px-3 py-2 text-right tabular-nums">{formatearPrecio(linea.precio_unitario)}</td>
                <td className="px-3 py-2 text-right tabular-nums">{formatearPrecio(linea.subtotal)}</td>
              </tr>
            ))}
          </tbody>
          <tfoot>
            <tr className="border-t border-stone-200 bg-stone-50 font-bold">
              <td colSpan={3} className="px-3 py-2 text-right">Total</td>
              <td className="px-3 py-2 text-right tabular-nums">{formatearPrecio(pedido.total)}</td>
            </tr>
          </tfoot>
        </table>
      </div>
    </div>
  );
}
