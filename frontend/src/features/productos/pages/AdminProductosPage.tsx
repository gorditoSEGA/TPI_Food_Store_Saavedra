import {
  createColumnHelper,
  getCoreRowModel,
  getFilteredRowModel,
  getPaginationRowModel,
  getSortedRowModel,
  useReactTable,
} from "@tanstack/react-table";
import { useMemo, useState } from "react";
import { handleApiError } from "../../../shared/api/handleApiError";
import ConfirmarModal from "../../../shared/components/ConfirmarModal";
import DataTable from "../../../shared/components/DataTable";
import EstadoError from "../../../shared/components/EstadoError";
import EstadoVacio from "../../../shared/components/EstadoVacio";
import Skeleton from "../../../shared/components/Skeleton";
import Button from "../../../shared/ui/Button";
import Card from "../../../shared/ui/Card";
import Modal from "../../../shared/ui/Modal";
import { formatearPrecio } from "../../../shared/utils/formato";
import { useCategorias } from "../../categorias/hooks/useCategorias";
import ImagenProducto from "../components/ImagenProducto";
import ProductoForm from "../components/ProductoForm";
import StockForm from "../components/StockForm";
import { useEliminarProducto, useProductos } from "../hooks/useProductos";
import type { ProductoRead } from "../types/producto";

type ModalActivo =
  | { tipo: "formulario"; producto: ProductoRead | null }
  | { tipo: "stock"; producto: ProductoRead }
  | { tipo: "eliminar"; producto: ProductoRead }
  | null;

const columna = createColumnHelper<ProductoRead>();

export default function AdminProductosPage() {
  // El panel pide todo (limit=100, máximo del backend) y pagina del lado del cliente
  const productos = useProductos({ skip: 0, limit: 100 });
  const categorias = useCategorias();
  const eliminar = useEliminarProducto();
  const [modal, setModal] = useState<ModalActivo>(null);

  const cerrar = () => {
    setModal(null);
    eliminar.reset();
  };

  const columnas = useMemo(
    () => [
      columna.display({
        id: "imagen",
        header: "Imagen",
        cell: (info) => (
          <ImagenProducto url={info.row.original.imagen_url} nombre={info.row.original.nombre} className="h-10 w-10 rounded-md" />
        ),
      }),
      columna.accessor("nombre", { header: "Nombre", cell: (info) => <span className="font-medium text-ink">{info.getValue()}</span> }),
      columna.accessor((fila) => fila.categoria.nombre, { id: "categoria", header: "Categoría" }),
      columna.accessor("precio_base", {
        header: "Precio",
        cell: (info) => formatearPrecio(info.getValue()),
        meta: { alinearDerecha: true },
      }),
      columna.accessor("stock", { header: "Stock", meta: { alinearDerecha: true } }),
      columna.accessor("disponible", {
        header: "Disponible",
        cell: (info) => (
          <span
            className={`rounded-full px-2.5 py-0.5 text-xs font-semibold ${
              info.getValue() ? "bg-emerald-100 text-emerald-800" : "bg-stone-200 text-stone-600"
            }`}
          >
            {info.getValue() ? "Sí" : "No"}
          </span>
        ),
      }),
      columna.display({
        id: "acciones",
        header: "Acciones",
        meta: { alinearDerecha: true },
        cell: (info) => {
          const producto = info.row.original;
          return (
            <div className="flex justify-end gap-1.5">
              <Button variante="fantasma" tamanio="sm" onClick={() => setModal({ tipo: "stock", producto })}>
                Stock
              </Button>
              <Button variante="fantasma" tamanio="sm" onClick={() => setModal({ tipo: "formulario", producto })}>
                Editar
              </Button>
              <Button variante="peligro" tamanio="sm" onClick={() => setModal({ tipo: "eliminar", producto })}>
                Eliminar
              </Button>
            </div>
          );
        },
      }),
    ],
    [],
  );

  const datos = useMemo(() => productos.data?.items ?? [], [productos.data]);

  const table = useReactTable({
    data: datos,
    columns: columnas,
    getCoreRowModel: getCoreRowModel(),
    getFilteredRowModel: getFilteredRowModel(),
    getSortedRowModel: getSortedRowModel(),
    getPaginationRowModel: getPaginationRowModel(),
    autoResetPageIndex: false,
    initialState: { pagination: { pageSize: 10 } },
  });

  return (
    <div>
      <div className="mb-5 flex flex-wrap items-center justify-between gap-3">
        <div>
          <h1 className="text-2xl font-bold">Productos</h1>
          <p className="mt-1 text-sm text-stone-500">Alta, edición, stock y baja de productos.</p>
        </div>
        <Button onClick={() => setModal({ tipo: "formulario", producto: null })} disabled={!categorias.data?.length}>
          Nuevo producto
        </Button>
      </div>

      {categorias.isSuccess && categorias.data.length === 0 && (
        <p className="mb-4 rounded-lg border border-amber-200 bg-amber-50 px-3 py-2.5 text-sm text-amber-800">
          Primero creá al menos una categoría para poder cargar productos.
        </p>
      )}

      <Card sinPadding>
        {productos.isError ? (
          <div className="p-4">
            <EstadoError mensaje={handleApiError(productos.error, "No se pudieron cargar los productos.")} onReintentar={() => void productos.refetch()} />
          </div>
        ) : productos.isPending ? (
          <div className="space-y-3 p-5" role="status" aria-label="Cargando productos">
            {Array.from({ length: 5 }, (_, i) => (
              <Skeleton key={i} className="h-10 w-full" />
            ))}
          </div>
        ) : (
          <DataTable
            table={table}
            placeholderBusqueda="Buscar producto…"
            vacio={<EstadoVacio titulo="Sin productos" mensaje="Todavía no hay productos cargados." />}
          />
        )}
      </Card>

      <Modal
        abierto={modal?.tipo === "formulario"}
        titulo={modal?.tipo === "formulario" && modal.producto ? "Editar producto" : "Nuevo producto"}
        onClose={cerrar}
      >
        {modal?.tipo === "formulario" && (
          <ProductoForm producto={modal.producto} categorias={categorias.data ?? []} onGuardado={cerrar} onCancelar={cerrar} />
        )}
      </Modal>

      <Modal
        abierto={modal?.tipo === "stock"}
        titulo="Stock y disponibilidad"
        descripcion={modal?.tipo === "stock" ? modal.producto.nombre : undefined}
        onClose={cerrar}
      >
        {modal?.tipo === "stock" && <StockForm producto={modal.producto} onGuardado={cerrar} onCancelar={cerrar} />}
      </Modal>

      <ConfirmarModal
        abierto={modal?.tipo === "eliminar"}
        titulo="Dar de baja el producto"
        mensaje={`¿Dar de baja “${modal?.tipo === "eliminar" ? modal.producto.nombre : ""}”? Dejará de mostrarse en el catálogo.`}
        textoConfirmar="Dar de baja"
        cargando={eliminar.isPending}
        error={eliminar.isError ? handleApiError(eliminar.error) : null}
        onClose={cerrar}
        onConfirmar={() => {
          if (modal?.tipo === "eliminar") eliminar.mutate(modal.producto.id, { onSuccess: cerrar });
        }}
      />
    </div>
  );
}
