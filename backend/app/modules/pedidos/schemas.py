"""Schemas de pedidos (entrada y salida)."""
from typing import Literal

from pydantic import field_validator
from sqlmodel import Field, SQLModel

from app.core.textos import recortar

from app.core.tiempo import FechaUTC

EstadoPedido = Literal["PENDIENTE", "EN_PREPARACION", "ENTREGADO", "CANCELADO"]
FormaPago = Literal["EFECTIVO", "TRANSFERENCIA"]


class ItemPedidoCreate(SQLModel):
    producto_id: int
    cantidad: int = Field(ge=1)


class PedidoCreate(SQLModel):
    items: list[ItemPedidoCreate] = Field(min_length=1)
    forma_pago: FormaPago  # RN-06
    direccion_entrega: str = Field(min_length=5, max_length=200)  # RN-06
    notas: str | None = Field(default=None, max_length=500)

    _recortar = field_validator("direccion_entrega", mode="before")(recortar)


class CambioEstado(SQLModel):
    estado: EstadoPedido


class DetallePedidoRead(SQLModel):
    producto_id: int
    nombre_producto: str
    precio_unitario: float
    cantidad: int
    subtotal: float


class PedidoRead(SQLModel):
    id: int
    usuario_id: int
    estado: EstadoPedido
    forma_pago: FormaPago
    direccion_entrega: str
    notas: str | None = None
    total: float
    created_at: FechaUTC
    updated_at: FechaUTC
    items: list[DetallePedidoRead]


class PedidosPaginados(SQLModel):
    total: int
    items: list[PedidoRead]


class ResumenPedidos(SQLModel):
    pendientes: int
    en_preparacion: int
    entregados: int
    cancelados: int
    pedidos_hoy: int
    ingresos_entregados: float
