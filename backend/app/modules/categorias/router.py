"""Endpoints de categorías. Lecturas públicas; escrituras solo admin."""
from typing import Annotated

from fastapi import APIRouter, Depends, HTTPException, Response, status

from app.core.deps import SOLO_ADMIN
from app.modules.categorias.schemas import CategoriaCreate, CategoriaRead, CategoriaUpdate
from app.modules.categorias.service import CategoriaNoEncontrada, CategoriaService, NombreDuplicado
from app.modules.categorias.unit_of_work import CategoriaUnitOfWork


def get_categoria_service() -> CategoriaService:
    return CategoriaService(CategoriaUnitOfWork())


ServiceDep = Annotated[CategoriaService, Depends(get_categoria_service)]

router = APIRouter(prefix="/categorias", tags=["categorias"])


@router.get("", response_model=list[CategoriaRead])
def listar_categorias(service: ServiceDep):
    return service.listar()


@router.get("/{categoria_id}", response_model=CategoriaRead)
def obtener_categoria(categoria_id: int, service: ServiceDep):
    try:
        return service.obtener(categoria_id)
    except CategoriaNoEncontrada as error:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail=str(error))


@router.post("", response_model=CategoriaRead, status_code=status.HTTP_201_CREATED, dependencies=SOLO_ADMIN)
def crear_categoria(data: CategoriaCreate, service: ServiceDep):
    try:
        return service.crear(data)
    except NombreDuplicado as error:
        raise HTTPException(status_code=status.HTTP_409_CONFLICT, detail=str(error))


@router.put("/{categoria_id}", response_model=CategoriaRead, dependencies=SOLO_ADMIN)
def actualizar_categoria(categoria_id: int, data: CategoriaUpdate, service: ServiceDep):
    try:
        return service.actualizar(categoria_id, data)
    except CategoriaNoEncontrada as error:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail=str(error))
    except NombreDuplicado as error:
        raise HTTPException(status_code=status.HTTP_409_CONFLICT, detail=str(error))


@router.delete("/{categoria_id}", status_code=status.HTTP_204_NO_CONTENT, dependencies=SOLO_ADMIN)
def eliminar_categoria(categoria_id: int, service: ServiceDep):
    try:
        service.eliminar(categoria_id)
    except CategoriaNoEncontrada as error:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail=str(error))
    return Response(status_code=status.HTTP_204_NO_CONTENT)
