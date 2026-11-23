import {
  createColumnHelper,
  getCoreRowModel,
  getFilteredRowModel,
  getPaginationRowModel,
  getSortedRowModel,
  useReactTable,
} from "@tanstack/react-table";
import { useMemo } from "react";
import { handleApiError } from "../../../shared/api/handleApiError";
import DataTable from "../../../shared/components/DataTable";
import EstadoError from "../../../shared/components/EstadoError";
import EstadoVacio from "../../../shared/components/EstadoVacio";
import Skeleton from "../../../shared/components/Skeleton";
import Button from "../../../shared/ui/Button";
import Card from "../../../shared/ui/Card";
import { useAuthStore } from "../../../store/authStore";
import { useActivarUsuario, useDesactivarUsuario, useUsuarios } from "../hooks/useUsuarios";
import type { UserPublic } from "../types/usuario";

const columna = createColumnHelper<UserPublic>();

export default function AdminUsuariosPage() {
  const sesion = useAuthStore((s) => s.usuario);
  const usuarios = useUsuarios();
  const activar = useActivarUsuario();
  const desactivar = useDesactivarUsuario();

  const pendiente = activar.isPending ? activar.variables : desactivar.isPending ? desactivar.variables : undefined;
  const error = activar.isError ? activar.error : desactivar.isError ? desactivar.error : null;

  const columnas = useMemo(
    () => [
      columna.accessor("username", { header: "Usuario", cell: (info) => <span className="font-medium text-ink">{info.getValue()}</span> }),
      columna.accessor("full_name", { header: "Nombre" }),
      columna.accessor("email", { header: "Email" }),
      columna.accessor("role", {
        header: "Rol",
        cell: (info) => (
          <span
            className={`rounded-full px-2.5 py-0.5 text-xs font-semibold ${
              info.getValue() === "admin" ? "bg-violet-100 text-violet-800" : "bg-stone-100 text-stone-700"
            }`}
          >
            {info.getValue() === "admin" ? "Admin" : "Cliente"}
          </span>
        ),
      }),
      columna.accessor("disabled", {
        header: "Estado",
        cell: (info) => (
          <span
            className={`rounded-full px-2.5 py-0.5 text-xs font-semibold ${
              info.getValue() ? "bg-rose-100 text-rose-800" : "bg-emerald-100 text-emerald-800"
            }`}
          >
            {info.getValue() ? "Desactivado" : "Activo"}
          </span>
        ),
      }),
      columna.display({
        id: "acciones",
        header: "Acciones",
        meta: { alinearDerecha: true },
        cell: (info) => {
          const fila = info.row.original;
          const ocupado = pendiente === fila.id;
          return (
            <div className="flex justify-end gap-1.5">
              {fila.disabled ? (
                <Button tamanio="sm" disabled={ocupado} onClick={() => activar.mutate(fila.id)}>
                  Activar
                </Button>
              ) : (
                // El admin no puede desactivarse a sí mismo: el botón no se muestra en su fila
                fila.id !== sesion?.id && (
                  <Button variante="peligro" tamanio="sm" disabled={ocupado} onClick={() => desactivar.mutate(fila.id)}>
                    Desactivar
                  </Button>
                )
              )}
            </div>
          );
        },
      }),
    ],
    // activar y desactivar exponen mutate estable
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [pendiente, sesion?.id],
  );

  const datos = useMemo(() => usuarios.data ?? [], [usuarios.data]);

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
      <h1 className="text-2xl font-bold">Usuarios</h1>
      <p className="mt-1 text-sm text-stone-500">Activá o desactivá cuentas de usuario.</p>

      {error && (
        <div className="mt-4">
          <EstadoError mensaje={handleApiError(error, "No se pudo actualizar el usuario.")} />
        </div>
      )}

      <Card sinPadding className="mt-5">
        {usuarios.isError ? (
          <div className="p-4">
            <EstadoError mensaje={handleApiError(usuarios.error, "No se pudieron cargar los usuarios.")} onReintentar={() => void usuarios.refetch()} />
          </div>
        ) : usuarios.isPending ? (
          <div className="space-y-3 p-5" role="status" aria-label="Cargando usuarios">
            {Array.from({ length: 5 }, (_, i) => (
              <Skeleton key={i} className="h-10 w-full" />
            ))}
          </div>
        ) : (
          <DataTable table={table} placeholderBusqueda="Buscar usuario…" vacio={<EstadoVacio titulo="Sin usuarios" mensaje="No hay usuarios registrados." />} />
        )}
      </Card>
    </div>
  );
}
