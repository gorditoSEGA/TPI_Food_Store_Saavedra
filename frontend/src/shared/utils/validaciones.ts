// Validadores para TanStack Form: devuelven un mensaje de error o undefined si el valor es válido.
type Validador = (arg: { value: string }) => string | undefined;

export const obligatorio =
  (mensaje: string): Validador =>
  ({ value }) =>
    value.trim() === "" ? mensaje : undefined;

export const largo =
  (etiqueta: string, min: number, max: number): Validador =>
  ({ value }) => {
    const n = value.trim().length;
    if (n === 0) return `${etiqueta} es obligatorio.`;
    if (n < min) return `${etiqueta} debe tener al menos ${min} caracteres.`;
    if (n > max) return `${etiqueta} no puede superar los ${max} caracteres.`;
    return undefined;
  };

export const maximo =
  (etiqueta: string, max: number): Validador =>
  ({ value }) =>
    value.trim().length > max ? `${etiqueta} no puede superar los ${max} caracteres.` : undefined;

export const emailValido: Validador = ({ value }) => {
  if (value.trim() === "") return "El email es obligatorio.";
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value.trim()) ? undefined : "Ingresá un email válido.";
};

export const passwordMinimo: Validador = ({ value }) => {
  if (value === "") return "La contraseña es obligatoria.";
  return value.length < 8 ? "La contraseña debe tener al menos 8 caracteres." : undefined;
};

export const numeroNoNegativo =
  (etiqueta: string, entero: boolean): Validador =>
  ({ value }) => {
    if (value.trim() === "") return `${etiqueta} es obligatorio.`;
    const n = Number(value);
    if (Number.isNaN(n)) return `${etiqueta} debe ser un número.`;
    if (n < 0) return `${etiqueta} no puede ser negativo.`;
    if (entero && !Number.isInteger(n)) return `${etiqueta} debe ser un número entero.`;
    return undefined;
  };

export const urlOpcional: Validador = ({ value }) => {
  if (value.trim() === "") return undefined;
  try {
    const url = new URL(value.trim());
    return url.protocol === "http:" || url.protocol === "https:" ? undefined : "La URL debe empezar con http o https.";
  } catch {
    return "Ingresá una URL válida.";
  }
};

/** Errores de un campo de TanStack Form, visibles solo después de tocarlo o intentar enviar. */
export function mensajeError(meta: { isTouched: boolean; errors: unknown[] }): string | undefined {
  if (!meta.isTouched) return undefined;
  const textos = meta.errors.filter((e): e is string => typeof e === "string");
  return textos.length > 0 ? textos.join(" · ") : undefined;
}
