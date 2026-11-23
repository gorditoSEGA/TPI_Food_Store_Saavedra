import type { InputHTMLAttributes, ReactNode, SelectHTMLAttributes, TextareaHTMLAttributes } from "react";

const CLASE_CONTROL =
  "w-full rounded-lg border border-stone-300 bg-white px-3 py-2.5 text-sm text-ink outline-none placeholder:text-stone-400 focus:border-brand focus:ring-2 focus:ring-orange-100 aria-[invalid=true]:border-rose-400 aria-[invalid=true]:focus:ring-rose-100 disabled:bg-stone-100";

interface CampoProps {
  id: string;
  label: string;
  error?: string;
  ayuda?: string;
}

function Campo({ id, label, error, ayuda, children }: CampoProps & { children: ReactNode }) {
  return (
    <div>
      <label htmlFor={id} className="block text-sm font-medium text-stone-700">
        {label}
      </label>
      <div className="mt-1.5">{children}</div>
      {error ? (
        <p id={`${id}-error`} role="alert" className="mt-1.5 text-xs font-medium text-rose-600">
          {error}
        </p>
      ) : (
        ayuda && <p className="mt-1.5 text-xs text-stone-400">{ayuda}</p>
      )}
    </div>
  );
}

type InputProps = CampoProps & Omit<InputHTMLAttributes<HTMLInputElement>, "id">;

/** Campo de texto con etiqueta asociada y mensaje de error accesible. */
export function Input({ id, label, error, ayuda, className = "", ...resto }: InputProps) {
  return (
    <Campo id={id} label={label} error={error} ayuda={ayuda}>
      <input
        id={id}
        aria-invalid={error ? true : undefined}
        aria-describedby={error ? `${id}-error` : undefined}
        className={`${CLASE_CONTROL} ${className}`}
        {...resto}
      />
    </Campo>
  );
}

type TextareaProps = CampoProps & Omit<TextareaHTMLAttributes<HTMLTextAreaElement>, "id">;

export function Textarea({ id, label, error, ayuda, className = "", ...resto }: TextareaProps) {
  return (
    <Campo id={id} label={label} error={error} ayuda={ayuda}>
      <textarea
        id={id}
        aria-invalid={error ? true : undefined}
        aria-describedby={error ? `${id}-error` : undefined}
        className={`${CLASE_CONTROL} resize-none ${className}`}
        {...resto}
      />
    </Campo>
  );
}

type SelectProps = CampoProps & Omit<SelectHTMLAttributes<HTMLSelectElement>, "id">;

export function Select({ id, label, error, ayuda, className = "", children, ...resto }: SelectProps) {
  return (
    <Campo id={id} label={label} error={error} ayuda={ayuda}>
      <select
        id={id}
        aria-invalid={error ? true : undefined}
        aria-describedby={error ? `${id}-error` : undefined}
        className={`${CLASE_CONTROL} ${className}`}
        {...resto}
      >
        {children}
      </select>
    </Campo>
  );
}

export default Input;
