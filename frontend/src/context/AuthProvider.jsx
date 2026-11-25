import { useCallback, useEffect, useMemo, useState } from "react";
import { AuthContext } from "./authContext.js";
import { sesion } from "../services/apiClient.js";
import {
  iniciarSesion as iniciarSesionApi,
  obtenerPerfil,
  registrarse as registrarseApi,
} from "../services/authService.js";
import { useToast } from "../hooks/useToast.js";

export default function AuthProvider({ children }) {
  const toast = useToast();
  const [usuario, setUsuario] = useState(null);
  const [cargando, setCargando] = useState(() => Boolean(sesion.obtenerToken()));

  // Si el servidor rechaza el token (venció o es inválido), se cierra la sesión y se avisa.
  useEffect(() => {
    sesion.alExpirar(() => {
      sesion.borrarToken();
      setUsuario(null);
      toast.showToast({ type: "info", title: "Sesión vencida", message: "Iniciá sesión de nuevo para seguir." });
    });
  }, [toast]);

  // Al abrir el sitio con una sesión guardada, se recupera el usuario.
  useEffect(() => {
    if (!sesion.obtenerToken()) return undefined;
    const controller = new AbortController();
    obtenerPerfil({ signal: controller.signal })
      .then(setUsuario)
      .catch((error) => {
        // El administrador desactivó la cuenta: se cierra la sesión y se explica por qué.
        if (error.status === 403) {
          sesion.borrarToken();
          toast.showToast({ type: "error", title: "Cuenta desactivada", message: error.message });
        }
      })
      .finally(() => {
        if (!controller.signal.aborted) setCargando(false);
      });
    return () => controller.abort();
  }, [toast]);

  const abrirSesion = useCallback(({ token, usuario: datos }) => {
    sesion.guardarToken(token);
    setUsuario(datos);
    return datos;
  }, []);

  const iniciarSesion = useCallback(async (datos) => abrirSesion(await iniciarSesionApi(datos)), [abrirSesion]);
  const registrarse = useCallback(async (datos) => abrirSesion(await registrarseApi(datos)), [abrirSesion]);

  const cerrarSesion = useCallback(() => {
    sesion.borrarToken();
    setUsuario(null);
  }, []);

  const value = useMemo(
    () => ({
      usuario,
      cargando,
      estaLogueado: Boolean(usuario),
      esAdmin: usuario?.rol === "admin",
      esCliente: usuario?.rol === "cliente",
      iniciarSesion,
      registrarse,
      cerrarSesion,
      actualizarUsuario: setUsuario,
    }),
    [usuario, cargando, iniciarSesion, registrarse, cerrarSesion],
  );

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}
