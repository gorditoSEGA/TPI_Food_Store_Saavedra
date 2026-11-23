"""Motor de base de datos, creación de tablas y fábrica de sesiones (PostgreSQL o SQLite)."""
from sqlmodel import Session, SQLModel, create_engine

from app.core.config import settings

# SQLite necesita check_same_thread=False porque FastAPI atiende cada request en un hilo distinto
_connect_args = {"check_same_thread": False} if settings.DATABASE_URL.startswith("sqlite") else {}
engine = create_engine(settings.DATABASE_URL, connect_args=_connect_args)


def session_factory() -> Session:
    return Session(engine)


def create_all_tables() -> None:
    # Importar los models registra las tablas en SQLModel.metadata
    from app.modules.categorias import models as _categorias  # noqa: F401
    from app.modules.pedidos import models as _pedidos  # noqa: F401
    from app.modules.productos import models as _productos  # noqa: F401
    from app.modules.usuarios import models as _usuarios  # noqa: F401

    SQLModel.metadata.create_all(engine)
