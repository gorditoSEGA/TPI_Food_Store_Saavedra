"""Unit of Work de pedidos: repositorios de pedidos y de productos sobre la misma sesión.

Así el descuento de stock y la creación del pedido ocurren en una única transacción.
"""
from typing import Self

from app.core.unit_of_work import UnitOfWork
from app.modules.pedidos.repository import PedidoRepository
from app.modules.productos.repository import ProductoRepository


class PedidoUnitOfWork(UnitOfWork):
    pedidos: PedidoRepository
    productos: ProductoRepository

    def __enter__(self) -> Self:
        super().__enter__()
        self.pedidos = PedidoRepository(self.session)
        self.productos = ProductoRepository(self.session)
        return self
