import { useCallback, useState } from "react";
import { handleApiError } from "../../../shared/api/handleApiError";
import ConfirmarModal from "../../../shared/components/ConfirmarModal";
import EstadoError from "../../../shared/components/EstadoError";
import Skeleton from "../../../shared/components/Skeleton";
import { textoEstado } from "../../../shared/ui/BadgeEstado";
import Card from "../../../shared/ui/Card";
import Modal from "../../../shared/ui/Modal";
import PedidoDetalle from "../components/PedidoDetalle";
import PedidosTabla from "../components/PedidosTabla";
import { useCambiarEstadoPedido, usePedidos } from "../hooks/usePedidos";
import { ESTADOS_PEDIDO, type EstadoPedido, type PedidoRead } from "../types/pedido";

export default function AdminPedidosPage() {
  const [estado, setEstado] = useState<EstadoPedido | "">("");
  const [detalle, setDetalle] = useState<PedidoRead | null>(null);
  const [aCancelar, setACancelar] = useState<PedidoRead | null>(null);

  // El panel pide hasta 100 pedidos y pagina del lado del cliente; el filtro por estado lo aplica el servidor
  const pedidos = usePedidos({ skip: 0, limit: 100, estado: estado || undefined });
  const cambiarEstado = useCambiarEstadoPedido();

  const onVer = useCallback((pedido: PedidoRead) => setDetalle(pedido), []);
  const onCancelar = useCallback((pedido: PedidoRead) => setACancelar(pedido), []);
  const onAvanzar = useCallback(
    (pedido: PedidoRead, destino: EstadoPedido) => {
      cambiarEstado.mutate({ id: pedido.id, estado: destino });
    },
    // mutate es estable entre renders
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [],
  );

  const cerrarCancelacion = () => {
    setACancelar(null);
    cambiarEstado.reset();
  };

  const ocupado = cambiarEstado.isPending ? cambiarEstado.variables.id : undefined;
  // Error de un avance directo (el de la cancelación se muestra dentro del modal)
  const errorAvance = cambiarEstado.isError && !aCancelar ? handleApiError(cambiarEstado.error) : null;

  return (
    <div>
      <div className="mb-5 flex flex-wrap items-end justify-between gap-3">
        <div>
          <h1 className="text-2xl font-bold">Pedidos</h1>
          <p className="mt-1 text-sm text-stone-500">Avanzá o cancelá pedidos según su estado.</p>
        </div>
        <div>
          <label htmlFor="filtro-estado" className="block text-sm font-medium text-stone-700">
            Filtrar por estado
          </label>
          <select
            id="filtro-estado"
            value={estado}
            onChange={(e) => setEstado(e.target.value as EstadoPedido | "")}
            className="mt-1.5 rounded-lg border border-stone-300 bg-white px-3 py-2.5 text-sm outline-none focus:border-brand focus:ring-2 focus:ring-orange-100"
          >
            <option value="">Todos</option>
            {ESTADOS_PEDIDO.map((e) => (
              <option key={e} value={e}>
                {textoEstado(e)}
              </option>
            ))}
          </select>
        </div>
      </div>

      {errorAvance && (
        <div className="mb-4">
          <EstadoError mensaje={errorAvance} />
        </div>
      )}

      <Card sinPadding>
        {pedidos.isError ? (
          <div className="p-4">
            <EstadoError mensaje={handleApiError(pedidos.error, "No se pudieron cargar los pedidos.")} onReintentar={() => void pedidos.refetch()} />
          </div>
        ) : pedidos.isPending ? (
          <div className="space-y-3 p-5" role="status" aria-label="Cargando pedidos">
            {Array.from({ length: 5 }, (_, i) => (
              <Skeleton key={i} className="h-10 w-full" />
            ))}
          </div>
        ) : (
          <PedidosTabla
            pedidos={pedidos.data.items}
            pedidoOcupado={ocupado}
            mensajeVacio={estado ? "No hay pedidos en ese estado." : "Todavía no hay pedidos."}
            onVer={onVer}
            onAvanzar={onAvanzar}
            onCancelar={onCancelar}
          />
        )}
      </Card>

      <Modal abierto={detalle !== null} titulo={detalle ? `Pedido #${detalle.id}` : ""} onClose={() => setDetalle(null)}>
        {detalle && <PedidoDetalle pedido={detalle} />}
      </Modal>

      <ConfirmarModal
        abierto={aCancelar !== null}
        titulo="Cancelar pedido"
        mensaje={`¿Cancelar el pedido #${aCancelar?.id ?? ""}? Se restituye el stock de sus productos.`}
        textoConfirmar="Cancelar pedido"
        cargando={cambiarEstado.isPending}
        error={cambiarEstado.isError && aCancelar ? handleApiError(cambiarEstado.error) : null}
        onClose={cerrarCancelacion}
        onConfirmar={() => {
          if (aCancelar) cambiarEstado.mutate({ id: aCancelar.id, estado: "CANCELADO" }, { onSuccess: cerrarCancelacion });
        }}
      />
    </div>
  );
}
