import {
  createColumnHelper,
  getCoreRowModel,
  getFilteredRowModel,
  getPaginationRowModel,
  getSortedRowModel,
  useReactTable,
} from "@tanstack/react-table";
import { useMemo } from "react";
import DataTable from "../../../shared/components/DataTable";
import EstadoVacio from "../../../shared/components/EstadoVacio";
import BadgeEstado, { textoEstado } from "../../../shared/ui/BadgeEstado";
import Button from "../../../shared/ui/Button";
import { formatearFecha, formatearPrecio } from "../../../shared/utils/formato";
import { TRANSICIONES, type EstadoPedido, type PedidoRead } from "../types/pedido";

interface PedidosTablaProps {
  pedidos: PedidoRead[];
  /** Id del pedido con una mutación en curso (deshabilita sus botones). */
  pedidoOcupado?: number;
  mensajeVacio: string;
  onVer: (pedido: PedidoRead) => void;
  onAvanzar: (pedido: PedidoRead, estado: EstadoPedido) => void;
  onCancelar: (pedido: PedidoRead) => void;
}

const columna = createColumnHelper<PedidoRead>();

/** Tabla de pedidos del panel: botones según la máquina de estados (RN-02). */
export default function PedidosTabla({ pedidos, pedidoOcupado, mensajeVacio, onVer, onAvanzar, onCancelar }: PedidosTablaProps) {
  const columnas = useMemo(
    () => [
      columna.accessor("id", { header: "N°", cell: (info) => `#${info.getValue()}` }),
      columna.accessor("created_at", { header: "Fecha", cell: (info) => formatearFecha(info.getValue()) }),
      columna.accessor("usuario_id", { header: "Usuario", cell: (info) => `Usuario #${info.getValue()}` }),
      columna.accessor("forma_pago", { header: "Pago" }),
      columna.accessor("total", {
        header: "Total",
        cell: (info) => formatearPrecio(info.getValue()),
        meta: { alinearDerecha: true },
      }),
      columna.accessor("estado", { header: "Estado", cell: (info) => <BadgeEstado estado={info.getValue()} /> }),
      columna.display({
        id: "acciones",
        header: "Acciones",
        meta: { alinearDerecha: true },
        cell: (info) => {
          const pedido = info.row.original;
          const ocupado = pedidoOcupado === pedido.id;
          const avances = TRANSICIONES[pedido.estado].filter((e) => e !== "CANCELADO");
          const puedeCancelar = TRANSICIONES[pedido.estado].includes("CANCELADO");
          return (
            <div className="flex flex-wrap justify-end gap-1.5">
              <Button variante="fantasma" tamanio="sm" onClick={() => onVer(pedido)}>
                Detalle
              </Button>
              {avances.map((destino) => (
                <Button key={destino} tamanio="sm" disabled={ocupado} onClick={() => onAvanzar(pedido, destino)}>
                  {destino === "ENTREGADO" ? "Marcar entregado" : `Pasar a ${textoEstado(destino).toLowerCase()}`}
                </Button>
              ))}
              {puedeCancelar && (
                <Button variante="peligro" tamanio="sm" disabled={ocupado} onClick={() => onCancelar(pedido)}>
                  Cancelar
                </Button>
              )}
            </div>
          );
        },
      }),
    ],
    [pedidoOcupado, onVer, onAvanzar, onCancelar],
  );

  const table = useReactTable({
    data: pedidos,
    columns: columnas,
    getCoreRowModel: getCoreRowModel(),
    getFilteredRowModel: getFilteredRowModel(),
    getSortedRowModel: getSortedRowModel(),
    getPaginationRowModel: getPaginationRowModel(),
    autoResetPageIndex: false,
    initialState: { pagination: { pageSize: 10 } },
  });

  return <DataTable table={table} placeholderBusqueda="Buscar pedido…" vacio={<EstadoVacio titulo="Sin pedidos" mensaje={mensajeVacio} />} />;
}
