"""Endpoints de autenticación: registro, login con cookie HttpOnly, logout y perfil."""
from typing import Annotated

from fastapi import APIRouter, Depends, Response, status
from fastapi.security import OAuth2PasswordRequestForm

from app.core.config import COOKIE_NAME, settings
from app.core.deps import CurrentUser
from app.core.security import create_access_token
from app.modules.auth.schemas import Mensaje
from app.modules.auth.service import AuthService
from app.modules.usuarios.schemas import UserCreate, UserPublic
from app.modules.usuarios.unit_of_work import UsuarioUnitOfWork


def get_auth_service() -> AuthService:
    return AuthService(UsuarioUnitOfWork())


ServiceDep = Annotated[AuthService, Depends(get_auth_service)]

router = APIRouter(prefix="/auth", tags=["auth"])


@router.post("/register", response_model=UserPublic, status_code=status.HTTP_201_CREATED)
def register(data: UserCreate, service: ServiceDep):
    return service.registrar(data)


@router.post("/token", response_model=Mensaje)
def login(form: Annotated[OAuth2PasswordRequestForm, Depends()], response: Response, service: ServiceDep):
    usuario = service.autenticar(form.username, form.password)
    # El JWT viaja solo en la cookie HttpOnly: JavaScript no puede leerla y no va en el cuerpo
    response.set_cookie(
        key=COOKIE_NAME,
        value=create_access_token(usuario.username, usuario.role),
        httponly=True,
        secure=False,  # True en producción (HTTPS)
        samesite="lax",
        max_age=settings.ACCESS_TOKEN_EXPIRE_MINUTES * 60,
        path="/",
    )
    return Mensaje(message="Login exitoso")


@router.post("/logout", response_model=Mensaje)
def logout(response: Response):
    response.delete_cookie(key=COOKIE_NAME, httponly=True, secure=False, samesite="lax", path="/")
    return Mensaje(message="Sesión cerrada")


@router.get("/me", response_model=UserPublic)
def me(usuario: CurrentUser):
    return usuario
