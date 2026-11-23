import axiosInstance from "../../../shared/api/axiosInstance";
import type { CategoriaCreate, CategoriaRead, CategoriaUpdate } from "../types/categoria";

export async function listarCategorias(): Promise<CategoriaRead[]> {
  const { data } = await axiosInstance.get<CategoriaRead[]>("/categorias");
  return data;
}

export async function crearCategoria(datos: CategoriaCreate): Promise<CategoriaRead> {
  const { data } = await axiosInstance.post<CategoriaRead>("/categorias", datos);
  return data;
}

export async function actualizarCategoria(id: number, datos: CategoriaUpdate): Promise<CategoriaRead> {
  const { data } = await axiosInstance.put<CategoriaRead>(`/categorias/${id}`, datos);
  return data;
}

export async function eliminarCategoria(id: number): Promise<void> {
  await axiosInstance.delete(`/categorias/${id}`);
}
