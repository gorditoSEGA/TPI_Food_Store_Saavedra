"""Schemas del módulo auth."""
from sqlmodel import SQLModel


class Mensaje(SQLModel):
    message: str
