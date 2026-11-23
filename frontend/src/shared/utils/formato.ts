const formatoPrecio = new Intl.NumberFormat("es-AR", { style: "currency", currency: "ARS" });
const formatoFecha = new Intl.DateTimeFormat("es-AR", { dateStyle: "short", timeStyle: "short" });

export function formatearPrecio(valor: number): string {
  return formatoPrecio.format(valor);
}

export function formatearFecha(iso: string): string {
  // El backend puede devolver fechas sin zona horaria: se interpretan como UTC
  const tieneZona = /[zZ]|[+-]\d{2}:?\d{2}$/.test(iso);
  return formatoFecha.format(new Date(tieneZona ? iso : `${iso}Z`));
}
