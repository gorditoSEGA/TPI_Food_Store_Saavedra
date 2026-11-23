import axiosInstance from "../../../shared/api/axiosInstance";
import type {
  FiltrosProductos,
  ProductoCreate,
  ProductoRead,
  ProductosPaginados,
  ProductoStockUpdate,
  ProductoUpdate,
} from "../types/producto";

export async function listarProductos(filtros: FiltrosProductos): Promise<ProductosPaginados> {
  const { data } = await axiosInstance.get<ProductosPaginados>("/productos", { params: filtros });
  return data;
}

export async function crearProducto(datos: ProductoCreate): Promise<ProductoRead> {
  const { data } = await axiosInstance.post<ProductoRead>("/productos", datos);
  return data;
}

export async function actualizarProducto(id: number, datos: ProductoUpdate): Promise<ProductoRead> {
  const { data } = await axiosInstance.put<ProductoRead>(`/productos/${id}`, datos);
  return data;
}

export async function cambiarStockProducto(id: number, datos: ProductoStockUpdate): Promise<ProductoRead> {
  const { data } = await axiosInstance.patch<ProductoRead>(`/productos/${id}/stock`, datos);
  return data;
}

export async function eliminarProducto(id: number): Promise<void> {
  await axiosInstance.delete(`/productos/${id}`);
}
