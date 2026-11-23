import { keepPreviousData, useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import {
  actualizarProducto,
  cambiarStockProducto,
  crearProducto,
  eliminarProducto,
  listarProductos,
} from "../api/productos";
import type { FiltrosProductos, ProductoCreate, ProductoStockUpdate, ProductoUpdate } from "../types/producto";

export function useProductos(filtros: FiltrosProductos) {
  return useQuery({
    queryKey: ["productos", filtros],
    queryFn: () => listarProductos(filtros),
    // Mantiene la página anterior visible mientras llega la siguiente
    placeholderData: keepPreviousData,
  });
}

export function useCrearProducto() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (datos: ProductoCreate) => crearProducto(datos),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ["productos"] }),
  });
}

export function useActualizarProducto() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ id, datos }: { id: number; datos: ProductoUpdate }) => actualizarProducto(id, datos),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ["productos"] }),
  });
}

export function useCambiarStockProducto() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ id, datos }: { id: number; datos: ProductoStockUpdate }) => cambiarStockProducto(id, datos),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ["productos"] }),
  });
}

export function useEliminarProducto() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (id: number) => eliminarProducto(id),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ["productos"] }),
  });
}
