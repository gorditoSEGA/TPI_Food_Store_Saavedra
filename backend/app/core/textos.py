"""Limpieza de textos de entrada: se recortan los espacios ANTES de validar el largo."""
from typing import Any


def recortar(valor: Any) -> Any:
    """Para usar en field_validator(..., mode="before"): recorta strings y deja pasar el resto."""
    return valor.strip() if isinstance(valor, str) else valor
