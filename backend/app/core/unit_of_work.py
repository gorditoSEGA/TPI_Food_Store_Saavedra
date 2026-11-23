"""Unit of Work base: una sesión = una transacción por caso de uso."""
from collections.abc import Callable
from types import TracebackType
from typing import Self

from sqlmodel import Session

from app.core.database import session_factory as _session_factory_por_defecto


class UnitOfWork:
    """Abre la sesión en __enter__; en __exit__ hace commit (sin error) o rollback (con error) y cierra.

    Las subclases sobrescriben __enter__ para crear los repositorios sobre la misma sesión.
    """

    def __init__(self, session_factory: Callable[[], Session] = _session_factory_por_defecto):
        self._session_factory = session_factory

    def __enter__(self) -> Self:
        self.session = self._session_factory()
        return self

    def __exit__(
        self,
        exc_type: type[BaseException] | None,
        exc: BaseException | None,
        tb: TracebackType | None,
    ) -> None:
        try:
            if exc_type is None:
                self.session.commit()
            else:
                self.session.rollback()
        finally:
            self.session.close()
