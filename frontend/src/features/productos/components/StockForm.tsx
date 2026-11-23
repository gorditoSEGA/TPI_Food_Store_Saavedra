import { useForm } from "@tanstack/react-form";
import { useState } from "react";
import { handleApiError } from "../../../shared/api/handleApiError";
import Button from "../../../shared/ui/Button";
import { Input } from "../../../shared/ui/Input";
import { mensajeError, numeroNoNegativo } from "../../../shared/utils/validaciones";
import { useCambiarStockProducto } from "../hooks/useProductos";
import type { ProductoRead } from "../types/producto";

interface StockFormProps {
  producto: ProductoRead;
  onGuardado: () => void;
  onCancelar: () => void;
}

/** Cambio de stock y disponibilidad vía PATCH /productos/{id}/stock. */
export default function StockForm({ producto, onGuardado, onCancelar }: StockFormProps) {
  const cambiarStock = useCambiarStockProducto();
  const [error, setError] = useState<string | null>(null);

  const form = useForm({
    defaultValues: { stock: String(producto.stock), disponible: producto.disponible },
    onSubmit: async ({ value }) => {
      setError(null);
      try {
        await cambiarStock.mutateAsync({
          id: producto.id,
          datos: { stock: Number(value.stock), disponible: value.disponible },
        });
        onGuardado();
      } catch (e) {
        setError(handleApiError(e, "No se pudo actualizar el stock."));
      }
    },
  });

  return (
    <form
      noValidate
      className="space-y-4"
      onSubmit={(event) => {
        event.preventDefault();
        event.stopPropagation();
        void form.handleSubmit();
      }}
    >
      <form.Field name="stock" validators={{ onChange: numeroNoNegativo("El stock", true) }}>
        {(field) => (
          <Input
            id="stock-valor"
            label="Stock"
            type="number"
            inputMode="numeric"
            min={0}
            step="1"
            autoFocus
            value={field.state.value}
            onBlur={field.handleBlur}
            onChange={(e) => field.handleChange(e.target.value)}
            error={mensajeError(field.state.meta)}
          />
        )}
      </form.Field>

      <form.Field name="disponible">
        {(field) => (
          <label className="flex cursor-pointer items-center gap-3 text-sm text-stone-700">
            <input
              type="checkbox"
              checked={field.state.value}
              onChange={(e) => field.handleChange(e.target.checked)}
              className="h-4 w-4 accent-brand"
            />
            Disponible para la venta
          </label>
        )}
      </form.Field>

      {error && (
        <p role="alert" className="rounded-lg border border-rose-200 bg-rose-50 px-3 py-2.5 text-sm text-rose-700">
          {error}
        </p>
      )}

      <div className="flex justify-end gap-2 pt-2">
        <Button variante="secundario" onClick={onCancelar}>
          Cancelar
        </Button>
        <form.Subscribe selector={(s) => s.isSubmitting}>
          {(enviando) => (
            <Button type="submit" cargando={enviando}>
              Guardar
            </Button>
          )}
        </form.Subscribe>
      </div>
    </form>
  );
}
