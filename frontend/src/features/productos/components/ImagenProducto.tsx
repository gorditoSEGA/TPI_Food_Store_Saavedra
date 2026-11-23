import { useState } from "react";

interface ImagenProductoProps {
  url: string | null;
  nombre: string;
  className?: string;
}

/** Imagen del producto con carga diferida y un marcador si no hay URL o falla la carga. */
export default function ImagenProducto({ url, nombre, className = "" }: ImagenProductoProps) {
  const [fallo, setFallo] = useState(false);

  if (!url || fallo) {
    return (
      <div
        role="img"
        aria-label={`Sin imagen para ${nombre}`}
        className={`grid place-items-center bg-orange-50 text-3xl font-bold text-orange-300 ${className}`}
      >
        {nombre.slice(0, 1).toUpperCase()}
      </div>
    );
  }

  return <img src={url} alt={nombre} loading="lazy" onError={() => setFallo(true)} className={`object-cover ${className}`} />;
}
