import axiosInstance from "../../../shared/api/axiosInstance";
import type {
  CambioEstado,
  FiltrosPedidos,
  PedidoCreate,
  PedidoRead,
  PedidosPaginados,
  ResumenPedidos,
} from "../types/pedido";

export async function crearPedido(datos: PedidoCreate): Promise<PedidoRead> {
  const { data } = await axiosInstance.post<PedidoRead>("/pedidos", datos);
  return data;
}

export async function listarPedidos(filtros: FiltrosPedidos): Promise<PedidosPaginados> {
  const { data } = await axiosInstance.get<PedidosPaginados>("/pedidos", { params: filtros });
  return data;
}

export async function obtenerResumenPedidos(): Promise<ResumenPedidos> {
  const { data } = await axiosInstance.get<ResumenPedidos>("/pedidos/resumen");
  return data;
}

export async function cambiarEstadoPedido(id: number, cambio: CambioEstado): Promise<PedidoRead> {
  const { data } = await axiosInstance.patch<PedidoRead>(`/pedidos/${id}/estado`, cambio);
  return data;
}

export async function cancelarPedido(id: number): Promise<PedidoRead> {
  const { data } = await axiosInstance.patch<PedidoRead>(`/pedidos/${id}/cancelar`);
  return data;
}
