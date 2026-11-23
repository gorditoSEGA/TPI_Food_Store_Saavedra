import { Link } from "react-router-dom";
import Card from "../../../shared/ui/Card";

export default function UnauthorizedPage() {
  return (
    <Card className="mx-auto max-w-md p-8 text-center">
      <p className="text-4xl font-extrabold text-brand" aria-hidden="true">
        403
      </p>
      <h1 className="mt-2 text-xl font-bold">Sin permiso</h1>
      <p className="mt-2 text-sm text-stone-500">No tenés permisos para acceder a esta pantalla.</p>
      <Link to="/" className="mt-6 inline-block rounded-lg bg-brand px-4 py-2.5 text-sm font-semibold text-white hover:bg-brand-dark">
        Volver al inicio
      </Link>
    </Card>
  );
}
