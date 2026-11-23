import { useState } from "react";
import { Link } from "react-router-dom";
import { handleApiError } from "../../../shared/api/handleApiError";
import ConfirmarModal from "../../../shared/components/ConfirmarModal";
import EstadoError from "../../../shared/components/EstadoError";
import EstadoVacio from "../../../shared/components/EstadoVacio";
import Paginacion from "../../../shared/components/Paginacion";
import Skeleton from "../../../shared/components/Skeleton";
import BadgeEstado from "../../../shared/ui/BadgeEstado";
import Button from "../../../shared/ui/Button";
import Card from "../../../shared/ui/Card";
import { formatearFecha, formatearPrecio } from "../../../shared/utils/formato";
import PedidoDetalle from "../components/PedidoDetalle";
import { useCancelarPedido, usePedidos } from "../hooks/usePedidos";
import type { PedidoRead } from "../types/pedido";

const POR_PAGINA = 5;

export default function MisPedidosPage() {
  const [pagina, setPagina] = useState(0);
  const [abiertos, setAbiertos] = useState<number[]>([]);
  const [aCancelar, setACancelar] = useState<PedidoRead | null>(null);

  const pedidos = usePedidos({ skip: pagina * POR_PAGINA, limit: POR_PAGINA, solo_propios: true });
  const cancelar = useCancelarPedido();

  // solo_propios=true: también el admin ve acá únicamente sus pedidos, con el total correcto
  const propios = pedidos.data?.items ?? [];
  const totalPaginas = pedidos.data ? Math.ceil(pedidos.data.total / POR_PAGINA) : 0;

  const alternar = (id: number) =>
    setAbiertos((actuales) => (actuales.includes(id) ? actuales.filter((x) => x !== id) : [...actuales, id]));

  const cerrarCancelacion = () => {
    setACancelar(null);
    cancelar.reset();
  };

  return (
    <div>
      <h1 className="text-2xl font-bold">Mis pedidos</h1>
      <p className="mt-1 text-sm text-stone-500">Seguí el estado de tus pedidos. Podés cancelar los que están pendientes.</p>

      <div className="mt-5 space-y-4">
        {pedidos.isError ? (
          <EstadoError mensaje={handleApiError(pedidos.error, "No se pudieron cargar tus pedidos.")} onReintentar={() => void pedidos.refetch()} />
        ) : pedidos.isPending ? (
          <div className="space-y-4" role="status" aria-label="Cargando pedidos">
            {Array.from({ length: 3 }, (_, i) => (
              <Skeleton key={i} className="h-20 w-full" />
            ))}
          </div>
        ) : propios.length === 0 ? (
          <Card>
            <EstadoVacio
              titulo="Todavía no hiciste pedidos"
              mensaje="Cuando confirmes un pedido, lo vas a ver acá."
              accion={
                <Link to="/" className="rounded-lg bg-brand px-4 py-2.5 text-sm font-semibold text-white hover:bg-brand-dark">
                  Ir al catálogo
                </Link>
              }
            />
          </Card>
        ) : (
          propios.map((pedido) => {
            const abierto = abiertos.includes(pedido.id);
            return (
              <Card key={pedido.id}>
                <div className="flex flex-wrap items-center justify-between gap-3">
                  <div>
                    <p className="font-bold">Pedido #{pedido.id}</p>
                    <p className="text-xs text-stone-500">{formatearFecha(pedido.created_at)}</p>
                  </div>
                  <BadgeEstado estado={pedido.estado} />
                  <p className="text-lg font-extrabold tabular-nums">{formatearPrecio(pedido.total)}</p>
                  <div className="flex gap-2">
                    <Button variante="fantasma" tamanio="sm" aria-expanded={abierto} onClick={() => alternar(pedido.id)}>
                      {abierto ? "Ocultar detalle" : "Ver detalle"}
                    </Button>
                    {pedido.estado === "PENDIENTE" && (
                      <Button variante="peligro" tamanio="sm" onClick={() => setACancelar(pedido)}>
                        Cancelar pedido
                      </Button>
                    )}
                  </div>
                </div>
                {abierto && (
                  <div className="mt-4 border-t border-stone-100 pt-4">
                    <PedidoDetalle pedido={pedido} />
                  </div>
                )}
              </Card>
            );
          })
        )}
      </div>

      <Paginacion pagina={pagina} totalPaginas={totalPaginas} onCambiar={setPagina} />

      <ConfirmarModal
        abierto={aCancelar !== null}
        titulo="Cancelar pedido"
        mensaje={`¿Cancelar el pedido #${aCancelar?.id ?? ""}? Esta acción no se puede deshacer.`}
        textoConfirmar="Cancelar pedido"
        cargando={cancelar.isPending}
        error={cancelar.isError ? handleApiError(cancelar.error, "No se pudo cancelar el pedido.") : null}
        onClose={cerrarCancelacion}
        onConfirmar={() => {
          if (aCancelar) cancelar.mutate(aCancelar.id, { onSuccess: cerrarCancelacion });
        }}
      />
    </div>
  );
}
