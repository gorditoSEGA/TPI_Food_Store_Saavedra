import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { actualizarCategoria, crearCategoria, eliminarCategoria, listarCategorias } from "../api/categorias";
import type { CategoriaCreate, CategoriaUpdate } from "../types/categoria";

export function useCategorias() {
  return useQuery({ queryKey: ["categorias"], queryFn: listarCategorias });
}

export function useCrearCategoria() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (datos: CategoriaCreate) => crearCategoria(datos),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ["categorias"] }),
  });
}

export function useActualizarCategoria() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ id, datos }: { id: number; datos: CategoriaUpdate }) => actualizarCategoria(id, datos),
    onSuccess: async () => {
      // Los productos embeben su categoría: también se refrescan
      await Promise.all([
        queryClient.invalidateQueries({ queryKey: ["categorias"] }),
        queryClient.invalidateQueries({ queryKey: ["productos"] }),
      ]);
    },
  });
}

export function useEliminarCategoria() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (id: number) => eliminarCategoria(id),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ["categorias"] }),
  });
}
