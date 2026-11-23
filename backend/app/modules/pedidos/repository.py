"""Consultas de pedidos (sin reglas de negocio)."""
from datetime import datetime

from sqlalchemy import func
from sqlalchemy.orm import selectinload
from sqlmodel import Session, select

from app.core.base_repository import BaseRepository
from app.modules.pedidos.models import DetallePedido, Pedido


class PedidoRepository(BaseRepository[Pedido]):
    def __init__(self, session: Session):
        super().__init__(session, Pedido)

    def add_detalle(self, detalle: DetallePedido) -> DetallePedido:
        self.session.add(detalle)
        self.session.flush()
        return detalle

    def refrescar(self, pedido: Pedido) -> None:
        """Recarga el pedido (y sus líneas) desde la base dentro de la transacción."""
        self.session.refresh(pedido)

    def _paginar(
        self, usuario_id: int | None, estado: str | None, skip: int, limit: int
    ) -> tuple[int, list[Pedido]]:
        condiciones = []
        if usuario_id is not None:
            condiciones.append(Pedido.usuario_id == usuario_id)
        if estado is not None:
            condiciones.append(Pedido.estado == estado)
        total = self.session.exec(select(func.count()).select_from(Pedido).where(*condiciones)).one()
        consulta = (
            select(Pedido)
            .where(*condiciones)
            .options(selectinload(Pedido.items))  # type: ignore[arg-type]
            .order_by(Pedido.id.desc())  # type: ignore[union-attr]
            .offset(skip)
            .limit(limit)
        )
        return total, list(self.session.exec(consulta).all())

    def list_by_usuario(
        self, usuario_id: int, estado: str | None = None, skip: int = 0, limit: int = 20
    ) -> tuple[int, list[Pedido]]:
        return self._paginar(usuario_id, estado, skip, limit)

    def list_todos(self, estado: str | None = None, skip: int = 0, limit: int = 20) -> tuple[int, list[Pedido]]:
        return self._paginar(None, estado, skip, limit)

    def count_by_estado(self) -> dict[str, int]:
        filas = self.session.exec(select(Pedido.estado, func.count()).group_by(Pedido.estado)).all()
        return {estado: cantidad for estado, cantidad in filas}

    def count_desde(self, desde: datetime) -> int:
        return self.session.exec(select(func.count()).select_from(Pedido).where(Pedido.created_at >= desde)).one()

    def sum_total_por_estado(self, estado: str) -> float:
        suma = self.session.exec(select(func.sum(Pedido.total)).where(Pedido.estado == estado)).one()
        return float(suma or 0.0)
