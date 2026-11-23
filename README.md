# Food Store — Trabajo Práctico Integrador

**Materia:** Programación 4 · Tecnicatura Universitaria en Programación a Distancia (UTN)
**Alumno:** Alejandro Tomás Saavedra

Aplicación web para un negocio de comidas: los clientes se registran, recorren el catálogo, arman un carrito y confirman pedidos; el administrador gestiona categorías, productos, stock, pedidos y usuarios.

- **Repositorio:** <URL_DEL_REPOSITORIO_GITHUB>
- **Video de demostración:** <URL_DEL_VIDEO>

## Requisitos

| Herramienta | Versión |
|---|---|
| Python | 3.11 a 3.13 (probado con 3.12) |
| PostgreSQL | 15 o superior (opcional en desarrollo: se puede usar SQLite) |
| Node.js | 20.19 o superior |
| pnpm | 9 o superior (`npm install -g pnpm@9`) |

## Estructura

```
TPI_Food_Store_Saavedra/
├── backend/    API REST con FastAPI + SQLModel (arquitectura en capas con Unit of Work)
└── frontend/   React + TypeScript + Vite + Tailwind (arquitectura por features)
```

## Backend

### Instalación y ejecución

Desde la carpeta `backend/`:

```bash
python -m venv .venv
# Windows
.venv\Scripts\activate
# Linux / macOS
source .venv/bin/activate

pip install -r requirements.txt
copy .env.example .env        # Linux / macOS: cp .env.example .env
python -m app.db.seed
uvicorn app.main:app --reload
```

> **Base de datos.** El `.env.example` apunta a PostgreSQL. Para probar sin PostgreSQL, en `.env` comentá esa línea y descomentá `DATABASE_URL=sqlite:///./foodstore.db`: no hace falta instalar nada más.

- API: `http://localhost:8000/api/v1`
- Documentación: `http://localhost:8000/docs` y `http://localhost:8000/redoc`

Con PostgreSQL, crear antes la base vacía (`CREATE DATABASE foodstore_db;`) y ajustar usuario y contraseña en `DATABASE_URL`. Las tablas se crean solas al iniciar la API o al correr el seed.

### Variables de entorno (`backend/.env`)

| Variable | Descripción | Ejemplo |
|---|---|---|
| `DATABASE_URL` | Conexión a la base | `postgresql://user:pass@localhost:5432/foodstore_db` (desarrollo: `sqlite:///./foodstore.db`) |
| `SECRET_KEY` | Firma del JWT, mínimo 32 caracteres | `cambiar-esta-clave-de-al-menos-32-caracteres` |
| `ALGORITHM` | Algoritmo del JWT | `HS256` |
| `ACCESS_TOKEN_EXPIRE_MINUTES` | Expiración de la cookie y del token | `30` |
| `FRONTEND_ORIGIN` | Origen permitido en CORS | `http://localhost:5173` |

### Usuarios del seed

`python -m app.db.seed` es idempotente: se puede correr varias veces sin duplicar datos.

| Usuario | Contraseña | Rol |
|---|---|---|
| `admin` | `Admin1234!` | admin |
| `cliente` | `Cliente1234!` | user |

También carga 5 categorías y 10 productos con stock.

## Frontend

### Instalación y ejecución

Desde la carpeta `frontend/` (con el backend corriendo):

```bash
pnpm install
copy .env.example .env        # Linux / macOS: cp .env.example .env
pnpm build                    # verifica los tipos (TypeScript strict)
pnpm dev
```

Abrir `http://localhost:5173`.

### Variables de entorno (`frontend/.env`)

| Variable | Descripción | Ejemplo |
|---|---|---|
| `VITE_API_URL` | URL base de la API | `http://localhost:8000/api/v1` |

## Tecnologías

**Backend:** FastAPI, SQLModel, PostgreSQL / SQLite, pydantic-settings, python-jose (JWT), passlib + bcrypt.
**Frontend:** React 19, TypeScript (strict), Vite, Tailwind CSS 4, TanStack Query, TanStack Form, TanStack Table, React Router, Zustand (con persist) y Axios.

## Funcionalidades

- **Autenticación:** registro, login con JWT en cookie HttpOnly `access_token`, logout y perfil (`/auth/me`). El frontend nunca lee ni guarda el token.
- **Roles:** `user` (catálogo, carrito, pedidos propios) y `admin` (panel de administración). Rutas protegidas en el frontend con `ProtectedRoute` y en el backend con `require_role`.
- **Catálogo:** paginado en el servidor, búsqueda por nombre, filtro por categoría, skeleton de carga y estado vacío.
- **Carrito:** persistido en el navegador (Zustand + persist).
- **Pedidos:** creación transaccional (todo o nada), descuento de stock, copia de nombre y precio en cada línea, máquina de estados (`PENDIENTE → EN_PREPARACION → ENTREGADO`, con cancelación desde los dos primeros) y restitución de stock al cancelar.
- **Panel de administración:** resumen con indicadores, ABM de categorías y productos (con cambio de stock y disponibilidad), gestión de pedidos y activación / desactivación de usuarios.
