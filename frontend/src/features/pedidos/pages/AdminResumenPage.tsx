import { handleApiError } from "../../../shared/api/handleApiError";
import EstadoError from "../../../shared/components/EstadoError";
import Skeleton from "../../../shared/components/Skeleton";
import { formatearPrecio } from "../../../shared/utils/formato";
import ResumenCard from "../components/ResumenCard";
import { useResumenPedidos } from "../hooks/usePedidos";

export default function AdminResumenPage() {
  const resumen = useResumenPedidos();

  return (
    <div>
      <h1 className="text-2xl font-bold">Resumen</h1>
      <p className="mt-1 text-sm text-stone-500">Indicadores generales de los pedidos.</p>

      <div className="mt-5">
        {resumen.isError ? (
          <EstadoError mensaje={handleApiError(resumen.error, "No se pudo cargar el resumen.")} onReintentar={() => void resumen.refetch()} />
        ) : resumen.isPending ? (
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3" role="status" aria-label="Cargando resumen">
            {Array.from({ length: 6 }, (_, i) => (
              <Skeleton key={i} className="h-24 w-full" />
            ))}
          </div>
        ) : (
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            <ResumenCard titulo="Pendientes" valor={resumen.data.pendientes} colorValor="text-amber-600" />
            <ResumenCard titulo="En preparación" valor={resumen.data.en_preparacion} colorValor="text-sky-600" />
            <ResumenCard titulo="Entregados" valor={resumen.data.entregados} colorValor="text-emerald-600" />
            <ResumenCard titulo="Cancelados" valor={resumen.data.cancelados} colorValor="text-rose-600" />
            <ResumenCard titulo="Pedidos de hoy" valor={resumen.data.pedidos_hoy} />
            <ResumenCard titulo="Ingresos (entregados)" valor={formatearPrecio(resumen.data.ingresos_entregados)} colorValor="text-brand" />
          </div>
        )}
      </div>
    </div>
  );
}
