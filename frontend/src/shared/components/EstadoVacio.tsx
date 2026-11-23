import type { ReactNode } from "react";

interface EstadoVacioProps {
  titulo: string;
  mensaje: string;
  accion?: ReactNode;
}

export default function EstadoVacio({ titulo, mensaje, accion }: EstadoVacioProps) {
  return (
    <div className="flex flex-col items-center px-6 py-14 text-center">
      <span className="mb-3 grid h-12 w-12 place-items-center rounded-full bg-stone-100 text-xl text-stone-400" aria-hidden="true">
        ∅
      </span>
      <p className="font-semibold text-ink">{titulo}</p>
      <p className="mt-1 max-w-sm text-sm text-stone-500">{mensaje}</p>
      {accion && <div className="mt-5">{accion}</div>}
    </div>
  );
}
