import { keepPreviousData, useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import {
  cambiarEstadoPedido,
  cancelarPedido,
  crearPedido,
  listarPedidos,
  obtenerResumenPedidos,
} from "../api/pedidos";
import type { EstadoPedido, FiltrosPedidos, PedidoCreate } from "../types/pedido";

export function usePedidos(filtros: FiltrosPedidos, habilitado = true) {
  return useQuery({
    queryKey: ["pedidos", filtros],
    queryFn: () => listarPedidos(filtros),
    enabled: habilitado,
    placeholderData: keepPreviousData,
  });
}

export function useResumenPedidos() {
  return useQuery({ queryKey: ["pedidos", "resumen"], queryFn: obtenerResumenPedidos });
}

/** Crear o cancelar un pedido cambia el stock de los productos: se refrescan también. */
function useInvalidarPedidos() {
  const queryClient = useQueryClient();
  return () =>
    Promise.all([
      queryClient.invalidateQueries({ queryKey: ["pedidos"] }),
      queryClient.invalidateQueries({ queryKey: ["productos"] }),
    ]);
}

export function useCrearPedido() {
  const invalidar = useInvalidarPedidos();
  return useMutation({
    mutationFn: (datos: PedidoCreate) => crearPedido(datos),
    onSuccess: invalidar,
  });
}

export function useCambiarEstadoPedido() {
  const invalidar = useInvalidarPedidos();
  return useMutation({
    mutationFn: ({ id, estado }: { id: number; estado: EstadoPedido }) => cambiarEstadoPedido(id, { estado }),
    onSuccess: invalidar,
  });
}

export function useCancelarPedido() {
  const invalidar = useInvalidarPedidos();
  return useMutation({
    mutationFn: (id: number) => cancelarPedido(id),
    onSuccess: invalidar,
  });
}
