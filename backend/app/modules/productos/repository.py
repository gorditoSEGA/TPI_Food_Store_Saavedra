"""Consultas de productos (sin reglas de negocio)."""
from sqlalchemy import func
from sqlalchemy.orm import selectinload
from sqlmodel import Session, select

from app.core.base_repository import BaseRepository
from app.modules.productos.models import Producto


class ProductoRepository(BaseRepository[Producto]):
    def __init__(self, session: Session):
        super().__init__(session, Producto)

    def get_for_update(self, producto_id: int) -> Producto | None:
        """Lee el producto bloqueando la fila (en PostgreSQL) para evitar descuentos de stock concurrentes."""
        consulta = select(Producto).where(Producto.id == producto_id).with_for_update()
        return self.session.exec(consulta).first()

    def search(
        self,
        nombre: str | None = None,
        categoria_id: int | None = None,
        disponible: bool | None = None,
        skip: int = 0,
        limit: int = 20,
    ) -> tuple[int, list[Producto]]:
        """Productos activos filtrados; devuelve (total, items de la página)."""
        condiciones = [Producto.activo == True]  # noqa: E712
        if nombre:
            # lower(...) LIKE funciona igual en PostgreSQL y SQLite (búsqueda sin distinguir mayúsculas)
            condiciones.append(func.lower(Producto.nombre).contains(nombre.strip().lower(), autoescape=True))
        if categoria_id is not None:
            condiciones.append(Producto.categoria_id == categoria_id)
        if disponible is not None:
            condiciones.append(Producto.disponible == disponible)

        total = self.session.exec(select(func.count()).select_from(Producto).where(*condiciones)).one()
        consulta = (
            select(Producto)
            .where(*condiciones)
            .options(selectinload(Producto.categoria))  # type: ignore[arg-type]
            .order_by(Producto.id)
            .offset(skip)
            .limit(limit)
        )
        return total, list(self.session.exec(consulta).all())
