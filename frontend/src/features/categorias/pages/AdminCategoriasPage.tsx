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
import CategoriaForm from "../components/CategoriaForm";
import { useCategorias, useEliminarCategoria } from "../hooks/useCategorias";
import type { CategoriaRead } from "../types/categoria";

type ModalActivo =
  | { tipo: "formulario"; categoria: CategoriaRead | null }
  | { tipo: "eliminar"; categoria: CategoriaRead }
  | null;

const columna = createColumnHelper<CategoriaRead>();

export default function AdminCategoriasPage() {
  const categorias = useCategorias();
  const eliminar = useEliminarCategoria();
  const [modal, setModal] = useState<ModalActivo>(null);

  const cerrar = () => {
    setModal(null);
    eliminar.reset();
  };

  const columnas = useMemo(
    () => [
      columna.accessor("id", { header: "ID" }),
      columna.accessor("nombre", { header: "Nombre", cell: (info) => <span className="font-medium text-ink">{info.getValue()}</span> }),
      columna.accessor("descripcion", { header: "Descripción", cell: (info) => info.getValue() ?? "—", enableSorting: false }),
      columna.display({
        id: "acciones",
        header: "Acciones",
        meta: { alinearDerecha: true },
        cell: (info) => {
          const categoria = info.row.original;
          return (
            <div className="flex justify-end gap-1.5">
              <Button variante="fantasma" tamanio="sm" onClick={() => setModal({ tipo: "formulario", categoria })}>
                Editar
              </Button>
              <Button variante="peligro" tamanio="sm" onClick={() => setModal({ tipo: "eliminar", categoria })}>
                Eliminar
              </Button>
            </div>
          );
        },
      }),
    ],
    [],
  );

  const datos = useMemo(() => categorias.data ?? [], [categorias.data]);

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
          <h1 className="text-2xl font-bold">Categorías</h1>
          <p className="mt-1 text-sm text-stone-500">Administrá las categorías del catálogo.</p>
        </div>
        <Button onClick={() => setModal({ tipo: "formulario", categoria: null })}>Nueva categoría</Button>
      </div>

      <Card sinPadding>
        {categorias.isError ? (
          <div className="p-4">
            <EstadoError mensaje={handleApiError(categorias.error, "No se pudieron cargar las categorías.")} onReintentar={() => void categorias.refetch()} />
          </div>
        ) : categorias.isPending ? (
          <div className="space-y-3 p-5" role="status" aria-label="Cargando categorías">
            {Array.from({ length: 4 }, (_, i) => (
              <Skeleton key={i} className="h-10 w-full" />
            ))}
          </div>
        ) : (
          <DataTable
            table={table}
            placeholderBusqueda="Buscar categoría…"
            vacio={<EstadoVacio titulo="Sin categorías" mensaje="Creá la primera categoría para organizar tus productos." />}
          />
        )}
      </Card>

      <Modal
        abierto={modal?.tipo === "formulario"}
        titulo={modal?.tipo === "formulario" && modal.categoria ? "Editar categoría" : "Nueva categoría"}
        onClose={cerrar}
      >
        {modal?.tipo === "formulario" && <CategoriaForm categoria={modal.categoria} onGuardado={cerrar} onCancelar={cerrar} />}
      </Modal>

      <ConfirmarModal
        abierto={modal?.tipo === "eliminar"}
        titulo="Dar de baja la categoría"
        mensaje={`¿Dar de baja “${modal?.tipo === "eliminar" ? modal.categoria.nombre : ""}”? Su nombre seguirá reservado y sus productos no se ocultan automáticamente.`}
        textoConfirmar="Dar de baja"
        cargando={eliminar.isPending}
        error={eliminar.isError ? handleApiError(eliminar.error) : null}
        onClose={cerrar}
        onConfirmar={() => {
          if (modal?.tipo === "eliminar") eliminar.mutate(modal.categoria.id, { onSuccess: cerrar });
        }}
      />
    </div>
  );
}
