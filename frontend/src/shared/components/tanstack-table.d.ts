import "@tanstack/react-table";

// Metadatos propios de las columnas que usa DataTable
declare module "@tanstack/react-table" {
  interface ColumnMeta<TData extends RowData, TValue> {
    alinearDerecha?: boolean;
  }
}
