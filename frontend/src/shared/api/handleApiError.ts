import axios from "axios";

interface ErrorValidacion {
  loc?: unknown[];
  msg?: string;
}

function esErrorValidacion(valor: unknown): valor is ErrorValidacion {
  return typeof valor === "object" && valor !== null && "msg" in valor;
}

/**
 * Convierte cualquier error en un mensaje legible. El backend responde {"detail": "texto"}
 * o, en un 422 de validación, {"detail": [{loc, msg, ...}]}.
 */
export function handleApiError(error: unknown, mensajePorDefecto = "Ocurrió un error inesperado."): string {
  if (axios.isAxiosError(error)) {
    if (!error.response) return "No se pudo conectar con el servidor. Verificá tu conexión.";
    const detail: unknown = (error.response.data as { detail?: unknown } | undefined)?.detail;
    if (typeof detail === "string") return detail;
    if (Array.isArray(detail)) {
      const mensajes = detail.filter(esErrorValidacion).map((item) => {
        const campo = Array.isArray(item.loc) ? String(item.loc[item.loc.length - 1]) : "";
        return campo && campo !== "body" ? `${campo}: ${item.msg ?? "valor inválido"}` : (item.msg ?? "valor inválido");
      });
      if (mensajes.length > 0) return mensajes.join(". ");
    }
    return mensajePorDefecto;
  }
  if (error instanceof Error && error.message) return error.message;
  return mensajePorDefecto;
}
