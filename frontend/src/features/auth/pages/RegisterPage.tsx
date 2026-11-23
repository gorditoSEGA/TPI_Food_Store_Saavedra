import { useForm } from "@tanstack/react-form";
import { useState } from "react";
import { Link, Navigate, useNavigate } from "react-router-dom";
import { handleApiError } from "../../../shared/api/handleApiError";
import Button from "../../../shared/ui/Button";
import Card from "../../../shared/ui/Card";
import Input from "../../../shared/ui/Input";
import { emailValido, largo, mensajeError, passwordMinimo } from "../../../shared/utils/validaciones";
import { useAuthStore } from "../../../store/authStore";
import { useRegistro } from "../hooks/useRegistro";

export default function RegisterPage() {
  const usuario = useAuthStore((s) => s.usuario);
  const navigate = useNavigate();
  const registro = useRegistro();
  const [error, setError] = useState<string | null>(null);

  const form = useForm({
    defaultValues: { username: "", full_name: "", email: "", password: "", confirmacion: "" },
    onSubmit: async ({ value }) => {
      setError(null);
      try {
        const creado = await registro.mutateAsync({
          username: value.username.trim(),
          full_name: value.full_name.trim(),
          email: value.email.trim(),
          password: value.password,
        });
        navigate("/login", { replace: true, state: { registrado: creado.username } });
      } catch (e) {
        // 409 usuario o email duplicado, 422 validación
        setError(handleApiError(e, "No se pudo crear la cuenta."));
      }
    },
  });

  if (usuario) return <Navigate to="/" replace />;

  return (
    <div className="mx-auto max-w-md">
      <Card className="p-6">
        <h1 className="text-2xl font-bold">Crear cuenta</h1>
        <p className="mt-1 text-sm text-stone-500">Registrate para armar tu carrito y confirmar pedidos.</p>

        <form
          noValidate
          className="mt-5 space-y-4"
          onSubmit={(event) => {
            event.preventDefault();
            event.stopPropagation();
            void form.handleSubmit();
          }}
        >
          <form.Field name="username" validators={{ onChange: largo("El usuario", 3, 50) }}>
            {(field) => (
              <Input
                id="reg-username"
                label="Usuario"
                autoComplete="username"
                autoFocus
                value={field.state.value}
                onBlur={field.handleBlur}
                onChange={(e) => field.handleChange(e.target.value)}
                error={mensajeError(field.state.meta)}
              />
            )}
          </form.Field>

          <form.Field name="full_name" validators={{ onChange: largo("El nombre completo", 2, 100) }}>
            {(field) => (
              <Input
                id="reg-full-name"
                label="Nombre completo"
                autoComplete="name"
                value={field.state.value}
                onBlur={field.handleBlur}
                onChange={(e) => field.handleChange(e.target.value)}
                error={mensajeError(field.state.meta)}
              />
            )}
          </form.Field>

          <form.Field name="email" validators={{ onChange: emailValido }}>
            {(field) => (
              <Input
                id="reg-email"
                label="Email"
                type="email"
                autoComplete="email"
                value={field.state.value}
                onBlur={field.handleBlur}
                onChange={(e) => field.handleChange(e.target.value)}
                error={mensajeError(field.state.meta)}
              />
            )}
          </form.Field>

          <form.Field name="password" validators={{ onChange: passwordMinimo }}>
            {(field) => (
              <Input
                id="reg-password"
                label="Contraseña"
                type="password"
                autoComplete="new-password"
                ayuda="Mínimo 8 caracteres."
                value={field.state.value}
                onBlur={field.handleBlur}
                onChange={(e) => field.handleChange(e.target.value)}
                error={mensajeError(field.state.meta)}
              />
            )}
          </form.Field>

          <form.Field
            name="confirmacion"
            validators={{
              onChangeListenTo: ["password"],
              onChange: ({ value, fieldApi }) =>
                value !== fieldApi.form.getFieldValue("password") ? "Las contraseñas no coinciden." : undefined,
            }}
          >
            {(field) => (
              <Input
                id="reg-confirmacion"
                label="Repetir contraseña"
                type="password"
                autoComplete="new-password"
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
              <Button type="submit" className="w-full" cargando={enviando}>
                {enviando ? "Creando cuenta…" : "Registrarme"}
              </Button>
            )}
          </form.Subscribe>
        </form>

        <p className="mt-5 text-center text-sm text-stone-500">
          ¿Ya tenés cuenta?{" "}
          <Link to="/login" className="font-semibold text-brand hover:underline">
            Iniciá sesión
          </Link>
        </p>
      </Card>
    </div>
  );
}
