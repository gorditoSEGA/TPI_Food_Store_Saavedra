import { useForm } from "@tanstack/react-form";
import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { handleApiError } from "../../../shared/api/handleApiError";
import Button from "../../../shared/ui/Button";
import { Input, Select, Textarea } from "../../../shared/ui/Input";
import { largo, maximo, mensajeError } from "../../../shared/utils/validaciones";
import { useCartStore } from "../../../store/cartStore";
import { useCrearPedido } from "../hooks/usePedidos";
import type { FormaPago } from "../types/pedido";

export default function CheckoutForm() {
  const items = useCartStore((s) => s.items);
  const vaciar = useCartStore((s) => s.vaciar);
  const navigate = useNavigate();
  const crearPedido = useCrearPedido();
  const [error, setError] = useState<string | null>(null);

  const form = useForm({
    defaultValues: { direccion_entrega: "", forma_pago: "EFECTIVO" as FormaPago, notas: "" },
    onSubmit: async ({ value }) => {
      setError(null);
      try {
        await crearPedido.mutateAsync({
          items: items.map((i) => ({ producto_id: i.producto_id, cantidad: i.cantidad })),
          forma_pago: value.forma_pago,
          direccion_entrega: value.direccion_entrega.trim(),
          notas: value.notas.trim() || null,
        });
        vaciar();
        navigate("/mis-pedidos", { replace: true });
      } catch (e) {
        // 404 producto inexistente o inactivo; 400 stock insuficiente, no disponible o repetido
        setError(handleApiError(e, "No se pudo confirmar el pedido."));
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
      <form.Field name="direccion_entrega" validators={{ onChange: largo("La dirección", 5, 200) }}>
        {(field) => (
          <Input
            id="checkout-direccion"
            label="Dirección de entrega"
            autoComplete="street-address"
            ayuda="Entre 5 y 200 caracteres."
            value={field.state.value}
            onBlur={field.handleBlur}
            onChange={(e) => field.handleChange(e.target.value)}
            error={mensajeError(field.state.meta)}
          />
        )}
      </form.Field>

      <form.Field name="forma_pago">
        {(field) => (
          <Select
            id="checkout-pago"
            label="Forma de pago"
            value={field.state.value}
            onBlur={field.handleBlur}
            onChange={(e) => field.handleChange(e.target.value as FormaPago)}
          >
            <option value="EFECTIVO">Efectivo</option>
            <option value="TRANSFERENCIA">Transferencia</option>
          </Select>
        )}
      </form.Field>

      <form.Field name="notas" validators={{ onChange: maximo("Las notas", 500) }}>
        {(field) => (
          <Textarea
            id="checkout-notas"
            label="Notas"
            ayuda="Opcional. Por ejemplo: timbre roto, tocar la puerta."
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

      <form.Subscribe selector={(s) => s.isSubmitting}>
        {(enviando) => (
          <Button type="submit" className="w-full" cargando={enviando} disabled={items.length === 0}>
            {enviando ? "Confirmando…" : "Confirmar pedido"}
          </Button>
        )}
      </form.Subscribe>
    </form>
  );
}
