import { useForm } from "@tanstack/react-form";
import { useState } from "react";
import { handleApiError } from "../../../shared/api/handleApiError";
import Button from "../../../shared/ui/Button";
import { Input, Select, Textarea } from "../../../shared/ui/Input";
import { largo, maximo, mensajeError, numeroNoNegativo, obligatorio, urlOpcional } from "../../../shared/utils/validaciones";
import type { CategoriaRead } from "../../categorias/types/categoria";
import { useActualizarProducto, useCrearProducto } from "../hooks/useProductos";
import type { ProductoRead, ProductoUpdate } from "../types/producto";

interface ProductoFormProps {
  /** Producto a editar; si es null se crea uno nuevo. */
  producto: ProductoRead | null;
  categorias: CategoriaRead[];
  onGuardado: () => void;
  onCancelar: () => void;
}

export default function ProductoForm({ producto, categorias, onGuardado, onCancelar }: ProductoFormProps) {
  const crear = useCrearProducto();
  const actualizar = useActualizarProducto();
  const [error, setError] = useState<string | null>(null);

  const form = useForm({
    defaultValues: {
      nombre: producto?.nombre ?? "",
      descripcion: producto?.descripcion ?? "",
      precio_base: producto ? String(producto.precio_base) : "",
      imagen_url: producto?.imagen_url ?? "",
      stock: producto ? String(producto.stock) : "0",
      disponible: producto?.disponible ?? true,
      categoria_id: producto ? String(producto.categoria_id) : "",
    },
    onSubmit: async ({ value }) => {
      setError(null);
      const nuevo = {
        nombre: value.nombre.trim(),
        descripcion: value.descripcion.trim() || null,
        precio_base: Number(value.precio_base),
        imagen_url: value.imagen_url.trim() || null,
        disponible: value.disponible,
        categoria_id: Number(value.categoria_id),
      };
      try {
        if (producto) {
          // PUT parcial: solo los campos que cambiaron. El stock no se toca acá (PATCH /stock)
          // y categoria_id se omite si no cambió (la categoría actual podría estar dada de baja).
          const datos: ProductoUpdate = {};
          if (nuevo.nombre !== producto.nombre) datos.nombre = nuevo.nombre;
          if (nuevo.descripcion !== producto.descripcion) datos.descripcion = nuevo.descripcion;
          if (nuevo.precio_base !== producto.precio_base) datos.precio_base = nuevo.precio_base;
          if (nuevo.imagen_url !== producto.imagen_url) datos.imagen_url = nuevo.imagen_url;
          if (nuevo.disponible !== producto.disponible) datos.disponible = nuevo.disponible;
          if (nuevo.categoria_id !== producto.categoria_id) datos.categoria_id = nuevo.categoria_id;
          await actualizar.mutateAsync({ id: producto.id, datos });
        } else {
          await crear.mutateAsync({ ...nuevo, stock: Number(value.stock) });
        }
        onGuardado();
      } catch (e) {
        // 404 si la categoría no existe o está dada de baja, 422 validación
        setError(handleApiError(e, "No se pudo guardar el producto."));
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
      <form.Field name="nombre" validators={{ onChange: largo("El nombre", 2, 150) }}>
        {(field) => (
          <Input
            id="producto-nombre"
            label="Nombre"
            autoFocus
            value={field.state.value}
            onBlur={field.handleBlur}
            onChange={(e) => field.handleChange(e.target.value)}
            error={mensajeError(field.state.meta)}
          />
        )}
      </form.Field>

      <form.Field name="descripcion" validators={{ onChange: maximo("La descripción", 500) }}>
        {(field) => (
          <Textarea
            id="producto-descripcion"
            label="Descripción"
            ayuda="Opcional."
            rows={2}
            value={field.state.value}
            onBlur={field.handleBlur}
            onChange={(e) => field.handleChange(e.target.value)}
            error={mensajeError(field.state.meta)}
          />
        )}
      </form.Field>

      <div className="grid gap-4 sm:grid-cols-2">
        <form.Field name="precio_base" validators={{ onChange: numeroNoNegativo("El precio", false) }}>
          {(field) => (
            <Input
              id="producto-precio"
              label="Precio base ($)"
              type="number"
              inputMode="decimal"
              min={0}
              step="0.01"
              value={field.state.value}
              onBlur={field.handleBlur}
              onChange={(e) => field.handleChange(e.target.value)}
              error={mensajeError(field.state.meta)}
            />
          )}
        </form.Field>

        {producto ? (
          <div>
            <span className="block text-sm font-medium text-stone-700">Stock</span>
            <p className="mt-1.5 rounded-lg bg-stone-100 px-3 py-2.5 text-sm text-stone-600">
              {producto.stock} (se modifica con el botón Stock)
            </p>
          </div>
        ) : (
          <form.Field name="stock" validators={{ onChange: numeroNoNegativo("El stock", true) }}>
            {(field) => (
              <Input
                id="producto-stock"
                label="Stock"
                type="number"
                inputMode="numeric"
                min={0}
                step="1"
                value={field.state.value}
                onBlur={field.handleBlur}
                onChange={(e) => field.handleChange(e.target.value)}
                error={mensajeError(field.state.meta)}
              />
            )}
          </form.Field>
        )}
      </div>

      <form.Field name="categoria_id" validators={{ onChange: obligatorio("Elegí una categoría.") }}>
        {(field) => (
          <Select
            id="producto-categoria"
            label="Categoría"
            value={field.state.value}
            onBlur={field.handleBlur}
            onChange={(e) => field.handleChange(e.target.value)}
            error={mensajeError(field.state.meta)}
          >
            <option value="">Seleccioná una categoría…</option>
            {producto && !categorias.some((c) => c.id === producto.categoria_id) && (
              <option value={producto.categoria_id}>{producto.categoria.nombre} (dada de baja)</option>
            )}
            {categorias.map((categoria) => (
              <option key={categoria.id} value={categoria.id}>
                {categoria.nombre}
              </option>
            ))}
          </Select>
        )}
      </form.Field>

      <form.Field name="imagen_url" validators={{ onChange: urlOpcional }}>
        {(field) => (
          <Input
            id="producto-imagen"
            label="URL de la imagen"
            ayuda="Opcional. Debe empezar con http:// o https://"
            type="url"
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
              {producto ? "Guardar cambios" : "Crear producto"}
            </Button>
          )}
        </form.Subscribe>
      </div>
    </form>
  );
}
