import { useForm } from "@tanstack/react-form";
import { useState } from "react";
import { handleApiError } from "../../../shared/api/handleApiError";
import Button from "../../../shared/ui/Button";
import { Input, Textarea } from "../../../shared/ui/Input";
import { largo, maximo, mensajeError } from "../../../shared/utils/validaciones";
import { useActualizarCategoria, useCrearCategoria } from "../hooks/useCategorias";
import type { CategoriaRead } from "../types/categoria";

interface CategoriaFormProps {
  /** Categoría a editar; si es null se crea una nueva. */
  categoria: CategoriaRead | null;
  onGuardado: () => void;
  onCancelar: () => void;
}

export default function CategoriaForm({ categoria, onGuardado, onCancelar }: CategoriaFormProps) {
  const crear = useCrearCategoria();
  const actualizar = useActualizarCategoria();
  const [error, setError] = useState<string | null>(null);

  const form = useForm({
    defaultValues: { nombre: categoria?.nombre ?? "", descripcion: categoria?.descripcion ?? "" },
    onSubmit: async ({ value }) => {
      setError(null);
      const datos = { nombre: value.nombre.trim(), descripcion: value.descripcion.trim() || null };
      try {
        if (categoria) await actualizar.mutateAsync({ id: categoria.id, datos });
        else await crear.mutateAsync(datos);
        onGuardado();
      } catch (e) {
        // 409 nombre duplicado, 404 categoría inexistente
        setError(handleApiError(e, "No se pudo guardar la categoría."));
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
      <form.Field name="nombre" validators={{ onChange: largo("El nombre", 2, 100) }}>
        {(field) => (
          <Input
            id="categoria-nombre"
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
            id="categoria-descripcion"
            label="Descripción"
            ayuda="Opcional."
            rows={3}
            value={field.state.value}
            onBlur={field.handleBlur}
            onChange={(e) => field.handleChange(e.target.value)}
            error={mensajeError(field.state.meta)}
          />
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
              {categoria ? "Guardar cambios" : "Crear categoría"}
            </Button>
          )}
        </form.Subscribe>
      </div>
    </form>
  );
}
