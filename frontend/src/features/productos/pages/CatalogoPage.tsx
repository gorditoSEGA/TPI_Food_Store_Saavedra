import { useState, type FormEvent } from "react";
import { handleApiError } from "../../../shared/api/handleApiError";
import EstadoError from "../../../shared/components/EstadoError";
import EstadoVacio from "../../../shared/components/EstadoVacio";
import Paginacion from "../../../shared/components/Paginacion";
import Button from "../../../shared/ui/Button";
import { useCategorias } from "../../categorias/hooks/useCategorias";
import ProductoCard, { ProductoCardSkeleton } from "../components/ProductoCard";
import { useProductos } from "../hooks/useProductos";

const POR_PAGINA = 8;

export default function CatalogoPage() {
  const [pagina, setPagina] = useState(0);
  const [textoBusqueda, setTextoBusqueda] = useState("");
  const [busqueda, setBusqueda] = useState("");
  const [categoriaId, setCategoriaId] = useState<number | undefined>(undefined);

  const categorias = useCategorias();
  const productos = useProductos({
    skip: pagina * POR_PAGINA,
    limit: POR_PAGINA,
    search: busqueda || undefined,
    categoria_id: categoriaId,
  });

  const totalPaginas = productos.data ? Math.ceil(productos.data.total / POR_PAGINA) : 0;
  const hayFiltros = busqueda !== "" || categoriaId !== undefined;

  function buscar(event: FormEvent) {
    event.preventDefault();
    setBusqueda(textoBusqueda.trim());
    setPagina(0);
  }

  function limpiarFiltros() {
    setTextoBusqueda("");
    setBusqueda("");
    setCategoriaId(undefined);
    setPagina(0);
  }

  return (
    <div>
      <h1 className="text-2xl font-bold">Catálogo</h1>
      <p className="mt-1 text-sm text-stone-500">Elegí tus productos y armá tu pedido.</p>

      <div className="mt-5 flex flex-col gap-3 sm:flex-row sm:items-end">
        <form onSubmit={buscar} role="search" className="flex flex-1 gap-2">
          <div className="flex-1">
            <label htmlFor="catalogo-busqueda" className="sr-only">
              Buscar productos
            </label>
            <input
              id="catalogo-busqueda"
              type="search"
              value={textoBusqueda}
              onChange={(e) => setTextoBusqueda(e.target.value)}
              placeholder="Buscar por nombre…"
              className="w-full rounded-lg border border-stone-300 bg-white px-3 py-2.5 text-sm outline-none focus:border-brand focus:ring-2 focus:ring-orange-100"
            />
          </div>
          <Button type="submit">Buscar</Button>
        </form>
        <div>
          <label htmlFor="catalogo-categoria" className="sr-only">
            Filtrar por categoría
          </label>
          <select
            id="catalogo-categoria"
            value={categoriaId ?? ""}
            onChange={(e) => {
              setCategoriaId(e.target.value === "" ? undefined : Number(e.target.value));
              setPagina(0);
            }}
            className="w-full rounded-lg border border-stone-300 bg-white px-3 py-2.5 text-sm outline-none focus:border-brand focus:ring-2 focus:ring-orange-100 sm:w-56"
          >
            <option value="">Todas las categorías</option>
            {categorias.data?.map((categoria) => (
              <option key={categoria.id} value={categoria.id}>
                {categoria.nombre}
              </option>
            ))}
          </select>
        </div>
      </div>

      <div className="mt-6" aria-live="polite">
        {productos.isError ? (
          <EstadoError mensaje={handleApiError(productos.error, "No se pudo cargar el catálogo.")} onReintentar={() => void productos.refetch()} />
        ) : productos.isPending ? (
          <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-4" role="status" aria-label="Cargando productos">
            {Array.from({ length: POR_PAGINA }, (_, i) => (
              <ProductoCardSkeleton key={i} />
            ))}
          </div>
        ) : productos.data.items.length === 0 ? (
          <EstadoVacio
            titulo="No hay productos para mostrar"
            mensaje={hayFiltros ? "Probá con otra búsqueda o categoría." : "Todavía no se cargaron productos."}
            accion={hayFiltros ? <Button variante="fantasma" onClick={limpiarFiltros}>Limpiar filtros</Button> : undefined}
          />
        ) : (
          <>
            <div className={`grid gap-5 sm:grid-cols-2 lg:grid-cols-4 ${productos.isPlaceholderData ? "opacity-60" : ""}`}>
              {productos.data.items.map((producto) => (
                <ProductoCard key={producto.id} producto={producto} />
              ))}
            </div>
            <Paginacion pagina={pagina} totalPaginas={totalPaginas} onCambiar={setPagina} />
          </>
        )}
      </div>
    </div>
  );
}
