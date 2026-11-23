"""Endpoints de gestión de usuarios: /admin/usuarios (solo admin)."""
from typing import Annotated

from fastapi import APIRouter, Depends

from app.core.deps import AdminUser
from app.modules.usuarios.schemas import UserPublic
from app.modules.usuarios.service import UsuarioService
from app.modules.usuarios.unit_of_work import UsuarioUnitOfWork


def get_usuario_service() -> UsuarioService:
    return UsuarioService(UsuarioUnitOfWork())


ServiceDep = Annotated[UsuarioService, Depends(get_usuario_service)]

router = APIRouter(prefix="/admin/usuarios", tags=["usuarios"])


@router.get("", response_model=list[UserPublic])
def listar_usuarios(_: AdminUser, service: ServiceDep):
    return service.listar()


@router.post("/{usuario_id}/activar", response_model=UserPublic)
def activar_usuario(usuario_id: int, admin: AdminUser, service: ServiceDep):
    return service.cambiar_estado(usuario_id, False, admin.id)


@router.post("/{usuario_id}/desactivar", response_model=UserPublic)
def desactivar_usuario(usuario_id: int, admin: AdminUser, service: ServiceDep):
    return service.cambiar_estado(usuario_id, True, admin.id)
