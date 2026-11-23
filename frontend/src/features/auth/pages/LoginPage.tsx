import { useForm } from "@tanstack/react-form";
import { useState } from "react";
import { Link, Navigate, useLocation, useNavigate } from "react-router-dom";
import { handleApiError } from "../../../shared/api/handleApiError";
import { Spinner } from "../../../shared/components/Skeleton";
import Button from "../../../shared/ui/Button";
import Card from "../../../shared/ui/Card";
import Input from "../../../shared/ui/Input";
import { mensajeError, obligatorio } from "../../../shared/utils/validaciones";
import { useAuthStore } from "../../../store/authStore";

// Estado que llega por navigate(): ruta protegida que se quería abrir o aviso de registro exitoso
interface EstadoNavegacion {
  from?: string;
  registrado?: string;
}

export default function LoginPage() {
  const usuario = useAuthStore((s) => s.usuario);
  const cargando = useAuthStore((s) => s.cargando);
  const login = useAuthStore((s) => s.login);
  const navigate = useNavigate();
  const estado = (useLocation().state ?? {}) as EstadoNavegacion;
  const [error, setError] = useState<string | null>(null);

  const destino = estado.from && estado.from !== "/login" ? estado.from : "/";

  const form = useForm({
    defaultValues: { username: "", password: "" },
    onSubmit: async ({ value }) => {
      setError(null);
      try {
        await login(value.username.trim(), value.password);
        navigate(destino, { replace: true });
      } catch (e) {
        // 401 credenciales incorrectas o 400 cuenta desactivada
        setError(handleApiError(e, "No se pudo iniciar sesión."));
      }
    },
  });

  if (cargando) return <Spinner mensaje="Verificando la sesión…" />;
  if (usuario) return <Navigate to={destino} replace />;

  return (
    <div className="mx-auto max-w-md">
      <Card className="p-6">
        <h1 className="text-2xl font-bold">Iniciar sesión</h1>
        <p className="mt-1 text-sm text-stone-500">Ingresá con tu usuario para hacer pedidos.</p>

        {estado.registrado && (
          <p role="status" className="mt-4 rounded-lg border border-emerald-200 bg-emerald-50 px-3 py-2.5 text-sm text-emerald-700">
            Cuenta creada para <strong>{estado.registrado}</strong>. Ya podés iniciar sesión.
          </p>
        )}

        <form
          noValidate
          className="mt-5 space-y-4"
          onSubmit={(event) => {
            event.preventDefault();
            event.stopPropagation();
            void form.handleSubmit();
          }}
        >
          <form.Field name="username" validators={{ onChange: obligatorio("Ingresá tu usuario.") }}>
            {(field) => (
              <Input
                id="login-username"
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

          <form.Field name="password" validators={{ onChange: obligatorio("Ingresá tu contraseña.") }}>
            {(field) => (
              <Input
                id="login-password"
                label="Contraseña"
                type="password"
                autoComplete="current-password"
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
                {enviando ? "Ingresando…" : "Ingresar"}
              </Button>
            )}
          </form.Subscribe>
        </form>

        <p className="mt-5 text-center text-sm text-stone-500">
          ¿No tenés cuenta?{" "}
          <Link to="/register" className="font-semibold text-brand hover:underline">
            Registrate
          </Link>
        </p>
      </Card>
    </div>
  );
}
