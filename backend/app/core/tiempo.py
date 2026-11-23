"""Utilidades de fecha: todas las fechas del sistema son datetime en UTC."""
from datetime import datetime, timezone
from typing import Annotated

from pydantic import AfterValidator


def ahora() -> datetime:
    return datetime.now(timezone.utc)


def como_utc(valor: datetime) -> datetime:
    # SQLite devuelve fechas sin zona horaria; se guardaron en UTC, así que se les marca la zona
    if valor.tzinfo is None:
        return valor.replace(tzinfo=timezone.utc)
    return valor.astimezone(timezone.utc)


# Tipo para los schemas de lectura: garantiza una fecha con zona UTC en el JSON
FechaUTC = Annotated[datetime, AfterValidator(como_utc)]
