"""Reglas de negocio de pedidos (RN-01 a RN-06), mapa de transiciones y excepciones de dominio."""
from datetime import datetime, timezone

from app.core.tiempo import ahora
from app.modules.pedidos.models import DetallePedido, Pedido
from app.modules.pedidos.schemas import (
    PedidoCreate,
    PedidoRead,
    PedidosPaginados,
    ResumenPedidos,
)
from app.modules.pedidos.unit_of_work import PedidoUnitOfWork
from app.modules.usuarios.schemas import UserPublic


# --- Excepciones de dominio (el Router las traduce a HTTP) ---

class PedidoNoEncontrado(Exception):
    def __init__(self, pedido_id: int):
        super().__init__(f"Pedido {pedido_id} no encontrado")


class ProductoNoEncontrado(Exception):
    def __init__(self, producto_id: int):
        super().__init__(f"Producto {producto_id} no encontrado")


class ProductoNoDisponible(Exception):
    def __init__(self, nombre: str):
        super().__init__(f"El producto '{nombre}' no está disponible")


class StockInsuficiente(Exception):
    def __init__(self, nombre: str, stock: int, pedido: int):
        super().__init__(f"Stock insuficiente de '{nombre}': hay {stock} y se pidieron {pedido}")


class ProductoRepetido(Exception):
    def __init__(self) -> None:
        super().__init__("No se puede repetir un producto en el pedido")


class PedidoAjeno(Exception):
    def __init__(self) -> None:
        super().__init__("El pedido pertenece a otro usuario")


class TransicionInvalida(Exception):
    def __init__(self, actual: str, nuevo: str):
        super().__init__(f"Transición de estado inválida: {actual} -> {nuevo}")


class CancelacionNoPermitida(Exception):
    def __init__(self) -> None:
        super().__init__("Solo se puede cancelar un pedido en estado PENDIENTE")


# RN-02: máquina de estados. Un estado terminal no admite cambios.
TRANSICIONES: dict[str, set[str]] = {
    "PENDIENTE": {"EN_PREPARACION", "CANCELADO"},
    "EN_PREPARACION": {"ENTREGADO", "CANCELADO"},
    "ENTREGADO": set(),
    "CANCELADO": set(),
}


class PedidoService:
    def __init__(self, uow: PedidoUnitOfWork):
        self.uow = uow

    # RN-01: creación transaccional. Si algo falla se lanza una excepción y el UoW hace rollback
    # (no queda ni el pedido ni el descuento de stock).
    def crear(self, data: PedidoCreate, usuario: UserPublic) -> PedidoRead:
        with self.uow as uow:
            ids = [item.producto_id for item in data.items]
            if len(set(ids)) != len(ids):
                raise ProductoRepetido()

            pedido = uow.pedidos.add(
                Pedido(
                    usuario_id=usuario.id,
                    estado="PENDIENTE",
                    forma_pago=data.forma_pago,
                    direccion_entrega=data.direccion_entrega,
                    notas=data.notas,
                    total=0.0,
                )
            )  # flush: obtiene pedido.id antes del commit

            total = 0.0
            for item in data.items:
                producto = uow.productos.get_for_update(item.producto_id)
                if producto is None or not producto.activo:
                    raise ProductoNoEncontrado(item.producto_id)
                if not producto.disponible:
                    raise ProductoNoDisponible(producto.nombre)
                if producto.stock < item.cantidad:
                    raise StockInsuficiente(producto.nombre, producto.stock, item.cantidad)

                producto.stock -= item.cantidad
                uow.session.add(producto)
                subtotal = round(producto.precio_base * item.cantidad, 2)
                uow.pedidos.add_detalle(
                    DetallePedido(
                        pedido_id=pedido.id,  # type: ignore[arg-type]
                        producto_id=producto.id,  # type: ignore[arg-type]
                        cantidad=item.cantidad,
                        nombre_producto=producto.nombre,  # copia: el pedido no cambia si el producto cambia
                        precio_unitario=producto.precio_base,
                        subtotal=subtotal,
                    )
                )
                total += subtotal

            pedido.total = round(total, 2)
            uow.session.add(pedido)
            uow.session.flush()
            uow.pedidos.refrescar(pedido)
            return PedidoRead.model_validate(pedido)

    def listar(
        self, usuario: UserPublic, estado: str | None, skip: int, limit: int, solo_propios: bool = False
    ) -> PedidosPaginados:
        with self.uow as uow:
            if usuario.role == "admin" and not solo_propios:
                total, pedidos = uow.pedidos.list_todos(estado, skip, limit)
            else:
                total, pedidos = uow.pedidos.list_by_usuario(usuario.id, estado, skip, limit)
            return PedidosPaginados(total=total, items=[PedidoRead.model_validate(p) for p in pedidos])

    def obtener(self, pedido_id: int, usuario: UserPublic) -> PedidoRead:
        with self.uow as uow:
            pedido = self._get(uow, pedido_id)
            # RN-04: el cliente solo ve sus propios pedidos; el admin ve todos
            if usuario.role != "admin" and pedido.usuario_id != usuario.id:
                raise PedidoAjeno()
            return PedidoRead.model_validate(pedido)

    def cambiar_estado(self, pedido_id: int, nuevo_estado: str) -> PedidoRead:
        """Uso del admin: avanza o cancela según el mapa de transiciones."""
        with self.uow as uow:
            pedido = self._get(uow, pedido_id)
            self._transicionar(uow, pedido, nuevo_estado)
            return PedidoRead.model_validate(pedido)

    def cancelar(self, pedido_id: int, usuario: UserPublic) -> PedidoRead:
        """Uso del cliente dueño: solo desde PENDIENTE (RN-04)."""
        with self.uow as uow:
            pedido = self._get(uow, pedido_id)
            if pedido.usuario_id != usuario.id:
                raise PedidoAjeno()
            if pedido.estado != "PENDIENTE":
                raise CancelacionNoPermitida()
            self._transicionar(uow, pedido, "CANCELADO")
            return PedidoRead.model_validate(pedido)

    def resumen(self) -> ResumenPedidos:
        with self.uow as uow:
            por_estado = uow.pedidos.count_by_estado()
            inicio_hoy = datetime.now(timezone.utc).replace(hour=0, minute=0, second=0, microsecond=0)
            return ResumenPedidos(
                pendientes=por_estado.get("PENDIENTE", 0),
                en_preparacion=por_estado.get("EN_PREPARACION", 0),
                entregados=por_estado.get("ENTREGADO", 0),
                cancelados=por_estado.get("CANCELADO", 0),
                pedidos_hoy=uow.pedidos.count_desde(inicio_hoy),
                ingresos_entregados=uow.pedidos.sum_total_por_estado("ENTREGADO"),
            )

    # --- internos ---

    @staticmethod
    def _get(uow: PedidoUnitOfWork, pedido_id: int) -> Pedido:
        pedido = uow.pedidos.get_by_id(pedido_id)
        if pedido is None:
            raise PedidoNoEncontrado(pedido_id)
        return pedido

    @staticmethod
    def _transicionar(uow: PedidoUnitOfWork, pedido: Pedido, nuevo_estado: str) -> None:
        # RN-02: se valida la transición ANTES de modificar el pedido
        if nuevo_estado not in TRANSICIONES.get(pedido.estado, set()):
            raise TransicionInvalida(pedido.estado, nuevo_estado)
        if nuevo_estado == "CANCELADO":
            # RN-03: restituye el stock de cada línea en la misma transacción
            for linea in pedido.items:
                producto = uow.productos.get_for_update(linea.producto_id)
                if producto is not None:
                    producto.stock += linea.cantidad
                    uow.session.add(producto)
        pedido.estado = nuevo_estado
        pedido.updated_at = ahora()
        uow.session.add(pedido)
        uow.session.flush()
