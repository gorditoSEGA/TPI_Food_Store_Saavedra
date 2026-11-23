import type { EstadoPedido } from "../../features/pedidos/types/pedido";

const ESTILOS: Record<EstadoPedido, { clase: string; texto: string }> = {
  PENDIENTE: { clase: "bg-amber-100 text-amber-800 ring-amber-200", texto: "Pendiente" },
  EN_PREPARACION: { clase: "bg-sky-100 text-sky-800 ring-sky-200", texto: "En preparación" },
  ENTREGADO: { clase: "bg-emerald-100 text-emerald-800 ring-emerald-200", texto: "Entregado" },
  CANCELADO: { clase: "bg-rose-100 text-rose-800 ring-rose-200", texto: "Cancelado" },
};

export function textoEstado(estado: EstadoPedido): string {
  return ESTILOS[estado].texto;
}

/** Etiqueta de color para los cuatro estados del pedido. */
export default function BadgeEstado({ estado }: { estado: EstadoPedido }) {
  const { clase, texto } = ESTILOS[estado];
  return (
    <span className={`inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-semibold ring-1 ring-inset ${clase}`}>
      {texto}
    </span>
  );
}
