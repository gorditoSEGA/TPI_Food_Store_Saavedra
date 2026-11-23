import { flexRender, type Table } from "@tanstack/react-table";
import { useEffect, type ReactNode } from "react";

interface DataTableProps<T> {
  table: Table<T>;
  vacio: ReactNode;
  placeholderBusqueda: string;
}

const TAMANIOS_PAGINA = [5, 10, 20];

/**
 * Renderiza una instancia de useReactTable (creada en la página): búsqueda, encabezados
 * ordenables, filas y paginación. No tiene estado propio: todo vive en la tabla.
 */
export default function DataTable<T>({ table, vacio, placeholderBusqueda }: DataTableProps<T>) {
  const totalFilas = table.getCoreRowModel().rows.length;
  const filasFiltradas = table.getFilteredRowModel().rows.length;
  const { pageIndex, pageSize } = table.getState().pagination;
  const busqueda = (table.getState().globalFilter as string | undefined) ?? "";
  const totalPaginas = table.getPageCount();

  // Si se eliminó la última fila de la última página, se vuelve a la página anterior
  useEffect(() => {
    if (pageIndex > 0 && pageIndex >= totalPaginas) table.setPageIndex(Math.max(totalPaginas - 1, 0));
  }, [pageIndex, totalPaginas, table]);

  if (totalFilas === 0) return <>{vacio}</>;

  const desde = filasFiltradas === 0 ? 0 : pageIndex * pageSize + 1;
  const hasta = Math.min((pageIndex + 1) * pageSize, filasFiltradas);

  return (
    <div>
      <div className="border-b border-stone-100 px-5 py-3">
        <label className="relative block max-w-xs">
          <span className="sr-only">Buscar</span>
          <span className="pointer-events-none absolute inset-y-0 left-3 grid place-items-center text-stone-400" aria-hidden="true">
            ⌕
          </span>
          <input
            type="search"
            value={busqueda}
            onChange={(e) => table.setGlobalFilter(e.target.value)}
            placeholder={placeholderBusqueda}
            className="w-full rounded-lg border border-stone-200 bg-stone-50 py-2 pr-3 pl-8 text-sm outline-none focus:border-brand focus:bg-white focus:ring-2 focus:ring-orange-100"
          />
        </label>
      </div>

      <div className="overflow-x-auto">
        <table className="w-full min-w-[620px] border-collapse text-left">
          <thead>
            {table.getHeaderGroups().map((grupo) => (
              <tr key={grupo.id} className="bg-stone-50 text-[11px] font-semibold uppercase tracking-wider text-stone-500">
                {grupo.headers.map((header) => {
                  const ordenable = header.column.getCanSort();
                  const orden = header.column.getIsSorted();
                  return (
                    <th
                      key={header.id}
                      className={`px-5 py-3 ${header.column.columnDef.meta?.alinearDerecha ? "text-right" : ""}`}
                      aria-sort={orden === "asc" ? "ascending" : orden === "desc" ? "descending" : undefined}
                    >
                      {header.isPlaceholder ? null : ordenable ? (
                        <button
                          type="button"
                          onClick={header.column.getToggleSortingHandler()}
                          className="inline-flex items-center gap-1.5 uppercase hover:text-ink"
                          title="Ordenar"
                        >
                          {flexRender(header.column.columnDef.header, header.getContext())}
                          <span className={orden ? "text-brand" : "text-stone-300"} aria-hidden="true">
                            {orden === "asc" ? "▲" : orden === "desc" ? "▼" : "↕"}
                          </span>
                        </button>
                      ) : (
                        flexRender(header.column.columnDef.header, header.getContext())
                      )}
                    </th>
                  );
                })}
              </tr>
            ))}
          </thead>
          <tbody>
            {table.getRowModel().rows.map((fila) => (
              <tr key={fila.id} className="border-t border-stone-100 hover:bg-stone-50/70">
                {fila.getVisibleCells().map((celda) => (
                  <td
                    key={celda.id}
                    className={`px-5 py-3.5 text-sm text-stone-600 ${celda.column.columnDef.meta?.alinearDerecha ? "text-right" : ""}`}
                  >
                    {flexRender(celda.column.columnDef.cell, celda.getContext())}
                  </td>
                ))}
              </tr>
            ))}
          </tbody>
        </table>
        {filasFiltradas === 0 && (
          <p className="px-5 py-10 text-center text-sm text-stone-500">No hay resultados para “{busqueda}”.</p>
        )}
      </div>

      <div className="flex flex-col gap-3 border-t border-stone-100 px-5 py-3 text-sm text-stone-500 sm:flex-row sm:items-center sm:justify-between">
        <span>
          {desde}–{hasta} de {filasFiltradas}
        </span>
        <div className="flex items-center gap-2">
          <label className="flex items-center gap-2">
            Filas
            <select
              value={pageSize}
              onChange={(e) => table.setPageSize(Number(e.target.value))}
              className="rounded-md border border-stone-200 bg-white px-2 py-1.5 text-sm"
            >
              {TAMANIOS_PAGINA.map((tamanio) => (
                <option key={tamanio} value={tamanio}>
                  {tamanio}
                </option>
              ))}
            </select>
          </label>
          <button
            type="button"
            onClick={() => table.previousPage()}
            disabled={!table.getCanPreviousPage()}
            className="rounded-md border border-stone-200 px-3 py-1.5 font-medium text-stone-700 hover:bg-stone-50 disabled:cursor-not-allowed disabled:opacity-40"
          >
            Anterior
          </button>
          <span className="tabular-nums">
            {pageIndex + 1} / {Math.max(totalPaginas, 1)}
          </span>
          <button
            type="button"
            onClick={() => table.nextPage()}
            disabled={!table.getCanNextPage()}
            className="rounded-md border border-stone-200 px-3 py-1.5 font-medium text-stone-700 hover:bg-stone-50 disabled:cursor-not-allowed disabled:opacity-40"
          >
            Siguiente
          </button>
        </div>
      </div>
    </div>
  );
}
