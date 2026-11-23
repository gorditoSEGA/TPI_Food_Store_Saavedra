"""Schemas de usuarios (entrada y salida). Nunca se expone hashed_password."""
from typing import Literal

from pydantic import EmailStr, field_validator
from sqlmodel import Field, SQLModel

from app.core.textos import recortar
from app.core.tiempo import FechaUTC

Role = Literal["user", "admin"]


class UserCreate(SQLModel):
    username: str = Field(min_length=3, max_length=50)
    full_name: str = Field(min_length=1, max_length=100)
    email: EmailStr
    password: str = Field(min_length=8, max_length=72)  # bcrypt solo usa los primeros 72 bytes

    _recortar = field_validator("username", "full_name", mode="before")(recortar)


class UserPublic(SQLModel):
    id: int
    username: str
    full_name: str
    email: str
    role: Role
    disabled: bool
    created_at: FechaUTC
