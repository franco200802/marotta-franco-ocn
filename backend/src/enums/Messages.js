// Todos los mensajes de la API en un único lugar (ningún texto suelto en el resto del código).
export const Messages = Object.freeze({
  // Generales (Entrega 2)
  PRODUCTO_NOT_FOUND: "El producto no existe.",
  INVALID_DATA: "Los datos enviados son inválidos.",
  DUPLICATED_RESOURCE: "El recurso ya existe.",
  ROUTE_NOT_FOUND: "La ruta solicitada no existe.",
  INTERNAL_ERROR: "Ocurrió un error interno en el servidor.",
  TOO_MANY_REQUESTS: "Hiciste demasiados intentos. Esperá unos minutos y probá de nuevo.",
  ENV_MISSING: "Faltan variables de entorno obligatorias (JWT_SECRET y ADMIN_PASSWORD) para producción.",

  // Productos
  PRODUCTO_DUPLICADO: "Ya existe un producto con ese nombre, talle y color.",
  PRODUCTO_CAMPOS_OBLIGATORIOS: "El nombre y la categoría son obligatorios.",
  PRODUCTO_PRECIO_INVALIDO: "El precio debe ser un número mayor o igual a 0.",
  PRODUCTO_STOCK_INVALIDO: "El stock debe ser un número entero mayor o igual a 0.",
  PRODUCTO_IMAGEN_INVALIDA: "La imagen debe ser una URL que empiece con http:// o https://.",
  PRODUCTO_NO_DISPONIBLE: "Uno de los productos ya no está disponible.",

  // Autenticación y clientes
  CAMPOS_OBLIGATORIOS: "Completá nombre, apellido, email, contraseña y dirección.",
  EMAIL_INVALIDO: "El email no tiene un formato válido.",
  EMAIL_DUPLICADO: "Ya hay una cuenta registrada con ese email.",
  PASSWORD_DEBIL: "La contraseña debe tener al menos 8 caracteres.",
  CREDENCIALES_INVALIDAS: "El email o la contraseña no son correctos.",
  TOKEN_REQUERIDO: "Tenés que iniciar sesión para hacer esto.",
  TOKEN_INVALIDO: "Tu sesión venció o no es válida. Iniciá sesión de nuevo.",
  ACCESO_DENEGADO: "No tenés permiso para hacer esto.",
  CLIENTE_NOT_FOUND: "El cliente no existe.",

  // Carrito y pedidos
  CARRITO_VACIO: "El carrito está vacío.",
  CANTIDAD_INVALIDA: "La cantidad debe ser un número entero mayor que cero.",
  STOCK_INSUFICIENTE: "No hay stock suficiente de uno de los productos.",
  PEDIDO_NOT_FOUND: "El pedido no existe.",
  ESTADO_INVALIDO: "El estado indicado no existe.",
  TRANSICION_INVALIDA: "El pedido no puede pasar a ese estado.",
  CANCELACION_NO_PERMITIDA: "Solo se puede cancelar un pedido en estado Pendiente.",
  METODO_PAGO_INVALIDO: "Elegí un método de pago válido.",

  // Envíos y configuración
  TIPO_ENTREGA_INVALIDO: "Elegí retiro en el local o envío a domicilio.",
  ZONA_NOT_FOUND: "La zona de envío no existe.",
  DIRECCION_REQUERIDA: "Para el envío a domicilio tenés que indicar la dirección.",
  MONTO_MINIMO_INVALIDO: "El monto mínimo para envío gratis debe ser un número mayor o igual a 0.",

  // Reportes
  FECHA_INVALIDA: "Las fechas del reporte no son válidas.",
});
