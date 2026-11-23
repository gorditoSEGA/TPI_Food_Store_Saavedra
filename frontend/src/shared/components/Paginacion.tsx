import Button from "../ui/Button";

interface PaginacionProps {
  /** Página actual, base 0 (skip = pagina × limit). */
  pagina: number;
  totalPaginas: number;
  onCambiar: (pagina: number) => void;
}

export default function Paginacion({ pagina, totalPaginas, onCambiar }: PaginacionProps) {
  if (totalPaginas <= 1) return null;
  return (
    <nav aria-label="Paginación" className="flex items-center justify-center gap-3 py-4">
      <Button variante="fantasma" tamanio="sm" disabled={pagina === 0} onClick={() => onCambiar(pagina - 1)}>
        Anterior
      </Button>
      <span className="text-sm tabular-nums text-stone-600" aria-current="page">
        Página {pagina + 1} de {totalPaginas}
      </span>
      <Button variante="fantasma" tamanio="sm" disabled={pagina >= totalPaginas - 1} onClick={() => onCambiar(pagina + 1)}>
        Siguiente
      </Button>
    </nav>
  );
}
