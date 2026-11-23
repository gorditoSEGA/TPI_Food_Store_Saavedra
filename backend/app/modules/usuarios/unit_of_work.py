"""Unit of Work de usuarios: expone el repositorio de usuarios sobre la sesión abierta."""
from typing import Self

from app.core.unit_of_work import UnitOfWork
from app.modules.usuarios.repository import UsuarioRepository


class UsuarioUnitOfWork(UnitOfWork):
    usuarios: UsuarioRepository

    def __enter__(self) -> Self:
        super().__enter__()
        self.usuarios = UsuarioRepository(self.session)
        return self
