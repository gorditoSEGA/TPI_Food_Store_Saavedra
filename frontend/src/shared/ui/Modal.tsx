import { useEffect, type ReactNode } from "react";

interface ModalProps {
  abierto: boolean;
  titulo: string;
  descripcion?: string;
  onClose: () => void;
  children: ReactNode;
}

/** Modal reutilizable. El estado abierto/cerrado vive en la página; Escape y clic fuera lo cierran. */
export default function Modal({ abierto, titulo, descripcion, onClose, children }: ModalProps) {
  useEffect(() => {
    if (!abierto) return;
    function onKeyDown(event: KeyboardEvent) {
      if (event.key === "Escape") onClose();
    }
    window.addEventListener("keydown", onKeyDown);
    return () => window.removeEventListener("keydown", onKeyDown);
  }, [abierto, onClose]);

  if (!abierto) return null;

  return (
    <div
      className="fixed inset-0 z-50 grid place-items-start overflow-y-auto bg-stone-900/40 p-4 backdrop-blur-[2px] sm:place-items-center"
      role="presentation"
      onMouseDown={(event) => {
        if (event.target === event.currentTarget) onClose();
      }}
    >
      <section
        role="dialog"
        aria-modal="true"
        aria-labelledby="modal-titulo"
        className="my-4 w-full max-w-lg rounded-xl bg-white p-6 shadow-2xl"
      >
        <div className="mb-5 flex items-start justify-between gap-4">
          <div>
            <h2 id="modal-titulo" className="text-xl font-bold text-ink">
              {titulo}
            </h2>
            {descripcion && <p className="mt-1 text-sm text-stone-500">{descripcion}</p>}
          </div>
          <button
            type="button"
            onClick={onClose}
            aria-label="Cerrar"
            className="rounded-lg px-2 py-1 text-xl leading-none text-stone-400 hover:bg-stone-100 hover:text-stone-600"
          >
            ×
          </button>
        </div>
        {children}
      </section>
    </div>
  );
}
