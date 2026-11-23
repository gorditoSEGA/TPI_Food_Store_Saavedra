"""Carga inicial idempotente: admin, un cliente de prueba, categorías y productos.

Ejecución: python -m app.db.seed
"""
from sqlmodel import Session, select

from app.core.database import create_all_tables, engine
from app.core.security import hash_password
from app.modules.categorias.models import Categoria
from app.modules.productos.models import Producto
from app.modules.usuarios.models import Usuario

USUARIOS = [
    {"username": "admin", "full_name": "Administrador", "email": "admin@foodstore.com", "password": "Admin1234!", "role": "admin"},
    {"username": "cliente", "full_name": "Cliente de Prueba", "email": "cliente@foodstore.com", "password": "Cliente1234!", "role": "user"},
]

CATEGORIAS = [
    ("Hamburguesas", "Hamburguesas artesanales"),
    ("Pizzas", "Pizzas a la piedra"),
    ("Bebidas", "Gaseosas, jugos y cervezas"),
    ("Postres", "Dulces para cerrar la comida"),
    ("Ensaladas", "Opciones frescas y livianas"),
]

U = "https://images.unsplash.com/"
# (nombre, descripcion, precio, imagen_url, stock, categoria)
PRODUCTOS = [
    ("Hamburguesa Clásica", "Carne, lechuga, tomate y queso", 4500.0, U + "photo-1568901346375-23c9450c58cd?w=600", 30, "Hamburguesas"),
    ("Hamburguesa Doble Cheddar", "Doble carne con cheddar y panceta", 6200.0, U + "photo-1550547660-d9450f859349?w=600", 25, "Hamburguesas"),
    ("Pizza Muzzarella", "Salsa de tomate y muzzarella", 5800.0, U + "photo-1513104890138-7c749659a591?w=600", 20, "Pizzas"),
    ("Pizza Pepperoni", "Muzzarella y pepperoni", 6900.0, U + "photo-1565299624946-b28f40a0ae38?w=600", 15, "Pizzas"),
    ("Gaseosa Cola 500 ml", "Bebida cola bien fría", 1500.0, U + "photo-1622483767028-3f66f32aef97?w=600", 100, "Bebidas"),
    ("Limonada Casera", "Limonada con menta y jengibre", 2200.0, U + "photo-1621263764928-df1444c5e859?w=600", 40, "Bebidas"),
    ("Cerveza Artesanal", "Rubia 473 ml", 3200.0, U + "photo-1608270586620-248524c67de9?w=600", 60, "Bebidas"),
    ("Brownie con Helado", "Brownie tibio con bocha de crema", 3800.0, U + "photo-1564355808539-22fda35bed7e?w=600", 18, "Postres"),
    ("Cheesecake de Frutos Rojos", "Porción individual", 4100.0, U + "photo-1533134242443-d4fd215305ad?w=600", 12, "Postres"),
    ("Ensalada Caesar", "Pollo, lechuga, crutones y parmesano", 4900.0, U + "photo-1546793665-c74683f339c1?w=600", 22, "Ensaladas"),
]


def sembrar() -> None:
    create_all_tables()
    with Session(engine) as session:
        for datos in USUARIOS:
            if session.exec(select(Usuario).where(Usuario.username == datos["username"])).first() is None:
                session.add(
                    Usuario(
                        username=datos["username"],
                        full_name=datos["full_name"],
                        email=datos["email"],
                        hashed_password=hash_password(datos["password"]),
                        role=datos["role"],
                    )
                )

        for nombre, descripcion in CATEGORIAS:
            if session.exec(select(Categoria).where(Categoria.nombre == nombre)).first() is None:
                session.add(Categoria(nombre=nombre, descripcion=descripcion))
        session.flush()

        for nombre, descripcion, precio, imagen, stock, categoria_nombre in PRODUCTOS:
            if session.exec(select(Producto).where(Producto.nombre == nombre)).first() is None:
                categoria = session.exec(select(Categoria).where(Categoria.nombre == categoria_nombre)).one()
                session.add(
                    Producto(
                        nombre=nombre,
                        descripcion=descripcion,
                        precio_base=precio,
                        imagen_url=imagen,
                        stock=stock,
                        categoria_id=categoria.id,  # type: ignore[arg-type]
                    )
                )
        session.commit()
    print("Seed completado (idempotente).")


if __name__ == "__main__":
    sembrar()
