"""Repositorio genérico: operaciones comunes sobre cualquier modelo de tabla."""
from collections.abc import Sequence
from typing import Any, Generic, TypeVar

from sqlmodel import Session, SQLModel, select

T = TypeVar("T", bound=SQLModel)


class BaseRepository(Generic[T]):
    def __init__(self, session: Session, model: type[T]):
        self.session = session
        self.model = model

    def get_by_id(self, id: int) -> T | None:
        return self.session.get(self.model, id)

    def get_all(self, skip: int = 0, limit: int | None = None) -> Sequence[T]:
        columna_id: Any = self.model.id  # type: ignore[attr-defined]
        consulta = select(self.model).order_by(columna_id).offset(skip)
        if limit is not None:
            consulta = consulta.limit(limit)
        return self.session.exec(consulta).all()

    def add(self, entidad: T) -> T:
        # flush (no commit): asigna el id para poder usarlo; el commit lo hace el Unit of Work
        self.session.add(entidad)
        self.session.flush()
        return entidad

    def delete(self, entidad: T) -> None:
        self.session.delete(entidad)
        self.session.flush()
