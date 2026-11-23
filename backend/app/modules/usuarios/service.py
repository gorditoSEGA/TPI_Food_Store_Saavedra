"""Reglas de negocio de gestión de usuarios (solo admin)."""
from fastapi import HTTPException, status

from app.modules.usuarios.schemas import UserPublic
from app.modules.usuarios.unit_of_work import UsuarioUnitOfWork


class UsuarioService:
    def __init__(self, uow: UsuarioUnitOfWork):
        self.uow = uow

    def listar(self) -> list[UserPublic]:
        with self.uow as uow:
            return [UserPublic.model_validate(u) for u in uow.usuarios.list_ordenados()]

    def cambiar_estado(self, usuario_id: int, disabled: bool, admin_id: int) -> UserPublic:
        """Activa o desactiva (baja lógica). Es idempotente: responde igual si el estado no cambia."""
        with self.uow as uow:
            usuario = uow.usuarios.get_by_id(usuario_id)
            if usuario is None:
                raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Usuario no encontrado")
            # El admin no puede desactivarse a sí mismo (el sistema quedaría sin administrador)
            if disabled and usuario.id == admin_id:
                raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail="No podés desactivar tu propia cuenta")
            usuario.disabled = disabled
            uow.session.add(usuario)
            uow.session.flush()
            return UserPublic.model_validate(usuario)
