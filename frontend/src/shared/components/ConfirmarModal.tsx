import Button from "../ui/Button";
import Modal from "../ui/Modal";

interface ConfirmarModalProps {
  abierto: boolean;
  titulo: string;
  mensaje: string;
  textoConfirmar: string;
  cargando?: boolean;
  error?: string | null;
  onConfirmar: () => void;
  onClose: () => void;
}

/** Diálogo de confirmación para acciones destructivas (baja, cancelación, desactivación). */
export default function ConfirmarModal({
  abierto,
  titulo,
  mensaje,
  textoConfirmar,
  cargando = false,
  error,
  onConfirmar,
  onClose,
}: ConfirmarModalProps) {
  return (
    <Modal abierto={abierto} titulo={titulo} onClose={onClose}>
      <p className="text-sm text-stone-600">{mensaje}</p>
      {error && (
        <p role="alert" className="mt-4 rounded-lg border border-rose-200 bg-rose-50 px-3 py-2.5 text-sm text-rose-700">
          {error}
        </p>
      )}
      <div className="mt-6 flex justify-end gap-2">
        <Button variante="secundario" onClick={onClose}>
          Volver
        </Button>
        <Button variante="peligro" cargando={cargando} onClick={onConfirmar}>
          {textoConfirmar}
        </Button>
      </div>
    </Modal>
  );
}
