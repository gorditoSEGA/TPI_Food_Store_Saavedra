import type { ButtonHTMLAttributes } from "react";

type Variante = "primario" | "secundario" | "peligro" | "fantasma";
type Tamanio = "md" | "sm";

interface ButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  variante?: Variante;
  tamanio?: Tamanio;
  cargando?: boolean;
}

const VARIANTES: Record<Variante, string> = {
  primario: "bg-brand text-white shadow-sm hover:bg-brand-dark",
  secundario: "bg-stone-100 text-stone-700 hover:bg-stone-200",
  peligro: "bg-rose-600 text-white shadow-sm hover:bg-rose-700",
  fantasma: "border border-stone-300 bg-white text-stone-700 hover:bg-stone-50",
};

const TAMANIOS: Record<Tamanio, string> = {
  md: "px-4 py-2.5 text-sm",
  sm: "px-3 py-1.5 text-xs",
};

export default function Button({
  variante = "primario",
  tamanio = "md",
  cargando = false,
  disabled,
  className = "",
  type = "button",
  children,
  ...resto
}: ButtonProps) {
  return (
    <button
      type={type}
      disabled={disabled || cargando}
      aria-busy={cargando || undefined}
      className={`inline-flex items-center justify-center gap-2 rounded-lg font-semibold transition-colors focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-brand disabled:cursor-not-allowed disabled:opacity-50 ${VARIANTES[variante]} ${TAMANIOS[tamanio]} ${className}`}
      {...resto}
    >
      {cargando && (
        <span className="h-3.5 w-3.5 animate-spin rounded-full border-2 border-current border-t-transparent" aria-hidden="true" />
      )}
      {children}
    </button>
  );
}
