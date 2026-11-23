"""Configuración de la aplicación con pydantic-settings, leída del archivo .env."""
from pathlib import Path

from pydantic import Field
from pydantic_settings import BaseSettings, SettingsConfigDict

# El .env vive en la carpeta backend/ (dos niveles por encima de este archivo)
RAIZ_BACKEND = Path(__file__).resolve().parents[2]


class Settings(BaseSettings):
    DATABASE_URL: str
    SECRET_KEY: str = Field(min_length=32)
    ALGORITHM: str = "HS256"
    ACCESS_TOKEN_EXPIRE_MINUTES: int = 30
    FRONTEND_ORIGIN: str = "http://localhost:5173"

    model_config = SettingsConfigDict(env_file=RAIZ_BACKEND / ".env", env_file_encoding="utf-8", extra="ignore")


settings = Settings()  # type: ignore[call-arg]

# Nombre de la cookie HttpOnly que transporta el JWT
COOKIE_NAME = "access_token"
