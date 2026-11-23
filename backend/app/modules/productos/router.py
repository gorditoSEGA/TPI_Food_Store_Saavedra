"""Endpoints de productos. Lecturas públicas; escrituras solo admin."""
from typing import Annotated

from fastapi import APIRouter, Depends, HTTPException, Query, Response, status

from app.core.deps import SOLO_ADMIN
from app.modules.productos.schemas import (
    ProductoCreate,
    ProductoRead,
    ProductosPaginados,
    ProductoStockUpdate,
    ProductoUpdate,
)
from app.modules.productos.service import CategoriaNoEncontrada, ProductoNoEncontrado, ProductoService
from app.modules.productos.unit_of_work import ProductoUnitOfWork


def get_producto_service() -> ProductoService:
    return ProductoService(ProductoUnitOfWork())


ServiceDep = Annotated[ProductoService, Depends(get_producto_service)]

router = APIRouter(prefix="/productos", tags=["productos"])


def _no_encontrado(error: Exception) -> HTTPException:
    return HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail=str(error))


@router.get("", response_model=ProductosPaginados)
def listar_productos(
    service: ServiceDep,
    skip: Annotated[int, Query(ge=0)] = 0,
    limit: Annotated[int, Query(ge=1, le=100)] = 20,
    search: str | None = None,
    categoria_id: int | None = None,
    disponible: bool | None = None,
):
    return service.listar(skip, limit, search, categoria_id, disponible)


@router.get("/{producto_id}", response_model=ProductoRead)
def obtener_producto(producto_id: int, service: ServiceDep):
    try:
        return service.obtener(producto_id)
    except ProductoNoEncontrado as error:
        raise _no_encontrado(error)


@router.post("", response_model=ProductoRead, status_code=status.HTTP_201_CREATED, dependencies=SOLO_ADMIN)
def crear_producto(data: ProductoCreate, service: ServiceDep):
    try:
        return service.crear(data)
    except CategoriaNoEncontrada as error:
        raise _no_encontrado(error)


@router.put("/{producto_id}", response_model=ProductoRead, dependencies=SOLO_ADMIN)
def actualizar_producto(producto_id: int, data: ProductoUpdate, service: ServiceDep):
    try:
        return service.actualizar(producto_id, data)
    except (ProductoNoEncontrado, CategoriaNoEncontrada) as error:
        raise _no_encontrado(error)


@router.patch("/{producto_id}/stock", response_model=ProductoRead, dependencies=SOLO_ADMIN)
def actualizar_stock(producto_id: int, data: ProductoStockUpdate, service: ServiceDep):
    try:
        return service.actualizar_stock(producto_id, data)
    except ProductoNoEncontrado as error:
        raise _no_encontrado(error)


@router.delete("/{producto_id}", status_code=status.HTTP_204_NO_CONTENT, dependencies=SOLO_ADMIN)
def eliminar_producto(producto_id: int, service: ServiceDep):
    try:
        service.eliminar(producto_id)
    except ProductoNoEncontrado as error:
        raise _no_encontrado(error)
    return Response(status_code=status.HTTP_204_NO_CONTENT)
