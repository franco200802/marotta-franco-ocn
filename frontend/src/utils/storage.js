// El almacenamiento del navegador puede fallar (modo privado, datos bloqueados): nunca debe romper la app.
function leer(almacen, clave, porDefecto) {
  try {
    const valor = window[almacen].getItem(clave);
    return valor === null ? porDefecto : JSON.parse(valor);
  } catch {
    return porDefecto;
  }
}

function guardar(almacen, clave, valor) {
  try {
    window[almacen].setItem(clave, JSON.stringify(valor));
  } catch {
    // Sin almacenamiento disponible la app sigue funcionando, solo que no recuerda el dato.
  }
}

function borrar(almacen, clave) {
  try {
    window[almacen].removeItem(clave);
  } catch {
    // Nada que borrar.
  }
}

export const leerLocal = (clave, porDefecto = null) => leer("localStorage", clave, porDefecto);
export const guardarLocal = (clave, valor) => guardar("localStorage", clave, valor);
export const borrarLocal = (clave) => borrar("localStorage", clave);
export const leerSesion = (clave, porDefecto = null) => leer("sessionStorage", clave, porDefecto);
export const guardarSesion = (clave, valor) => guardar("sessionStorage", clave, valor);
