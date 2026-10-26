const EMAIL_REGEX = /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/;
export const PASSWORD_MIN = 8;

const requerido = (valor) => typeof valor === "string" && valor.trim().length > 0;

function validarDatosPersonales(valores) {
  const errores = {};
  if (!requerido(valores.nombre)) errores.nombre = "Ingresá tu nombre.";
  if (!requerido(valores.apellido)) errores.apellido = "Ingresá tu apellido.";
  if (!requerido(valores.email)) errores.email = "Ingresá tu email.";
  else if (!EMAIL_REGEX.test(valores.email.trim())) errores.email = "Revisá el email: por ejemplo, usuario@email.com.";
  if (!requerido(valores.direccion)) errores.direccion = "Ingresá tu dirección: la usamos para los envíos.";
  return errores;
}

const passwordCorta = (password) => password.length < PASSWORD_MIN;
const MENSAJE_PASSWORD_CORTA = `La contraseña tiene que tener al menos ${PASSWORD_MIN} caracteres.`;

/** Validación 1 y 2 del Análisis de Requerimientos (registro). */
export function validarRegistro(valores) {
  const errores = validarDatosPersonales(valores);
  if (!requerido(valores.password)) errores.password = "Elegí una contraseña.";
  else if (passwordCorta(valores.password)) errores.password = MENSAJE_PASSWORD_CORTA;
  return errores;
}

/** Edición de datos: la contraseña es opcional (vacía = no se cambia). */
export function validarPerfil(valores) {
  const errores = validarDatosPersonales(valores);
  if (valores.password && passwordCorta(valores.password)) errores.password = MENSAJE_PASSWORD_CORTA;
  return errores;
}

export function validarIngreso(valores) {
  const errores = {};
  if (!requerido(valores.email)) errores.email = "Ingresá tu email.";
  else if (!EMAIL_REGEX.test(valores.email.trim())) errores.email = "Revisá el email: por ejemplo, usuario@email.com.";
  if (!requerido(valores.password)) errores.password = "Ingresá tu contraseña.";
  return errores;
}

export function validarCheckout(valores) {
  const errores = {};
  if (valores.tipoEntrega === "domicilio") {
    if (!valores.zonaId) errores.zonaId = "Elegí la zona de envío.";
    if (!requerido(valores.direccion)) errores.direccion = "Ingresá la dirección de entrega.";
  }
  if (!valores.metodoPago) errores.metodoPago = "Elegí cómo vas a pagar.";
  return errores;
}

/** Primer campo con error, en el orden del formulario. */
export const primerError = (orden, errores) => orden.find((campo) => errores[campo]);

/** Enfoca un campo del formulario por nombre (si es un grupo de radios, el primero). */
export function enfocarCampo(form, nombre) {
  const campo = form?.elements.namedItem(nombre);
  if (!campo) return;
  if (typeof campo.focus === "function") campo.focus();
  else campo[0]?.focus();
}
