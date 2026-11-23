interface SkeletonProps {
  className?: string;
}

/** Bloque gris animado para marcar contenido que todavía está cargando. */
export default function Skeleton({ className = "" }: SkeletonProps) {
  return <div aria-hidden="true" className={`animate-pulse rounded-md bg-stone-200 ${className}`} />;
}

export function Spinner({ mensaje }: { mensaje: string }) {
  return (
    <div role="status" className="flex flex-col items-center gap-3 px-6 py-16 text-sm text-stone-500">
      <span className="h-7 w-7 animate-spin rounded-full border-[3px] border-orange-100 border-t-brand" aria-hidden="true" />
      {mensaje}
    </div>
  );
}
