"""Endpoints de pedidos. No hay edición ni borrado de pedidos (RN-05)."""
from typing import Annotated

from fastapi import APIRouter, Depends, HTTPException, Query, status

from app.core.deps import SOLO_ADMIN, CurrentUser
from app.modules.pedidos.schemas import (
    CambioEstado,
    EstadoPedido,
    PedidoCreate,
    PedidoRead,
    PedidosPaginados,
    ResumenPedidos,
)
from app.modules.pedidos.service import (
    CancelacionNoPermitida,
    PedidoAjeno,
    PedidoNoEncontrado,
    PedidoService,
    ProductoNoDisponible,
    ProductoNoEncontrado,
    ProductoRepetido,
    StockInsuficiente,
    TransicionInvalida,
)
from app.modules.pedidos.unit_of_work import PedidoUnitOfWork


def get_pedido_service() -> PedidoService:
    return PedidoService(PedidoUnitOfWork())


ServiceDep = Annotated[PedidoService, Depends(get_pedido_service)]

router = APIRouter(prefix="/pedidos", tags=["pedidos"])

_NO_ENCONTRADO = (PedidoNoEncontrado, ProductoNoEncontrado)  # 404
_REGLA_NEGOCIO = (  # 400
    StockInsuficiente,
    ProductoNoDisponible,
    ProductoRepetido,
    TransicionInvalida,
    CancelacionNoPermitida,
)


def _traducir(error: Exception) -> HTTPException:
    """Traduce una excepción de dominio a su HTTPException."""
    if isinstance(error, _NO_ENCONTRADO):
        codigo = status.HTTP_404_NOT_FOUND
    elif isinstance(error, PedidoAjeno):
        codigo = status.HTTP_403_FORBIDDEN
    else:
        codigo = status.HTTP_400_BAD_REQUEST
    return HTTPException(status_code=codigo, detail=str(error))


_DOMINIO = _NO_ENCONTRADO + _REGLA_NEGOCIO + (PedidoAjeno,)


@router.post("", response_model=PedidoRead, status_code=status.HTTP_201_CREATED)
def crear_pedido(data: PedidoCreate, usuario: CurrentUser, service: ServiceDep):
    try:
        return service.crear(data, usuario)
    except _DOMINIO as error:
        raise _traducir(error)


@router.get("", response_model=PedidosPaginados)
def listar_pedidos(
    usuario: CurrentUser,
    service: ServiceDep,
    skip: Annotated[int, Query(ge=0)] = 0,
    limit: Annotated[int, Query(ge=1, le=100)] = 20,
    estado: EstadoPedido | None = None,
    solo_propios: bool = False,  # true: también el admin lista solo sus propios pedidos
):
    return service.listar(usuario, estado, skip, limit, solo_propios)


# Debe declararse ANTES de /{pedido_id}: si no, "resumen" se interpretaría como un id
@router.get("/resumen", response_model=ResumenPedidos, dependencies=SOLO_ADMIN)
def resumen_pedidos(service: ServiceDep):
    return service.resumen()


@router.get("/{pedido_id}", response_model=PedidoRead)
def obtener_pedido(pedido_id: int, usuario: CurrentUser, service: ServiceDep):
    try:
        return service.obtener(pedido_id, usuario)
    except _DOMINIO as error:
        raise _traducir(error)


@router.patch("/{pedido_id}/estado", response_model=PedidoRead, dependencies=SOLO_ADMIN)
def cambiar_estado(pedido_id: int, data: CambioEstado, service: ServiceDep):
    try:
        return service.cambiar_estado(pedido_id, data.estado)
    except _DOMINIO as error:
        raise _traducir(error)


@router.patch("/{pedido_id}/cancelar", response_model=PedidoRead)
def cancelar_pedido(pedido_id: int, usuario: CurrentUser, service: ServiceDep):
    try:
        return service.cancelar(pedido_id, usuario)
    except _DOMINIO as error:
        raise _traducir(error)
