"""Schemas de categorías."""
from pydantic import field_validator
from sqlmodel import Field, SQLModel

from app.core.textos import recortar


class CategoriaCreate(SQLModel):
    nombre: str = Field(min_length=2, max_length=100)
    descripcion: str | None = Field(default=None, max_length=500)

    _recortar_nombre = field_validator("nombre", mode="before")(recortar)


class CategoriaUpdate(SQLModel):
    nombre: str | None = Field(default=None, min_length=2, max_length=100)
    descripcion: str | None = Field(default=None, max_length=500)

    _recortar_nombre = field_validator("nombre", mode="before")(recortar)


class CategoriaRead(SQLModel):
    id: int
    nombre: str
    descripcion: str | None = None
    activo: bool
