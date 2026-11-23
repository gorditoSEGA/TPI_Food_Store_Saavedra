"""Dependencias de sesión y rol: get_current_user, get_current_active_user y require_role."""
from collections.abc import Callable
from typing import Annotated

from fastapi import Depends, HTTPException, Request, status
from fastapi.security import OAuth2PasswordBearer

from app.core.config import COOKIE_NAME
from app.core.security import decode_access_token
from app.modules.usuarios.schemas import Role, UserPublic
from app.modules.usuarios.unit_of_work import UsuarioUnitOfWork


class OAuth2PasswordBearerConCookie(OAuth2PasswordBearer):
    """Lee el JWT de la cookie HttpOnly; si no está, del encabezado Authorization (útil en /docs)."""

    async def __call__(self, request: Request) -> str | None:
        token = request.cookies.get(COOKIE_NAME)
        if token:
            return token
        return await super().__call__(request)


oauth2_scheme = OAuth2PasswordBearerConCookie(tokenUrl="/api/v1/auth/token", auto_error=False)


def _no_autenticado() -> HTTPException:
    return HTTPException(
        status_code=status.HTTP_401_UNAUTHORIZED,
        detail="No autenticado o sesión vencida",
        headers={"WWW-Authenticate": "Bearer"},
    )


def get_current_user(token: Annotated[str | None, Depends(oauth2_scheme)]) -> UserPublic:
    """Valida firma y expiración del JWT y carga el usuario desde la base. 401 si falla."""
    if not token:
        raise _no_autenticado()
    username = decode_access_token(token)
    if username is None:
        raise _no_autenticado()
    with UsuarioUnitOfWork() as uow:
        usuario = uow.usuarios.get_by_username(username)
        if usuario is None:
            raise _no_autenticado()
        return UserPublic.model_validate(usuario)


def get_current_active_user(usuario: Annotated[UserPublic, Depends(get_current_user)]) -> UserPublic:
    if usuario.disabled:
        raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail="Cuenta de usuario desactivada")
    return usuario


def require_role(roles: list[Role]) -> Callable[[UserPublic], UserPublic]:
    """Fábrica de dependencias: deja pasar solo a los usuarios activos con alguno de los roles."""

    def verificar_rol(usuario: Annotated[UserPublic, Depends(get_current_active_user)]) -> UserPublic:
        if usuario.role not in roles:
            raise HTTPException(status_code=status.HTTP_403_FORBIDDEN, detail="No tenés permisos para realizar esta acción")
        return usuario

    return verificar_rol


CurrentUser = Annotated[UserPublic, Depends(get_current_active_user)]
AdminUser = Annotated[UserPublic, Depends(require_role(["admin"]))]
# Lista lista para usar en dependencies=[...] de los endpoints de escritura
SOLO_ADMIN = [Depends(require_role(["admin"]))]
