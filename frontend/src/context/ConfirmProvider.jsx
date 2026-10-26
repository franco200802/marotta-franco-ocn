import { useCallback, useRef, useState } from "react";
import { ConfirmContext } from "./confirmContext.js";
import ConfirmDialog from "../components/ui/ConfirmDialog.jsx";

/**
 * Un único diálogo de confirmación para toda la app.
 * confirmar({ titulo, mensaje, confirmar, procesando, accion }) devuelve una promesa:
 * si se pasa `accion`, el diálogo queda abierto mientras corre y se cierra solo si sale bien.
 */
export default function ConfirmProvider({ children }) {
  const [opciones, setOpciones] = useState(null);
  const [procesando, setProcesando] = useState(false);
  const resolver = useRef(null);
  const fallbackFocusRef = useRef(null);

  const confirmar = useCallback((datos) => {
    fallbackFocusRef.current = datos.focoAlTerminar ?? document.getElementById("contenido");
    return new Promise((resolve) => {
      resolver.current = resolve;
      setOpciones(datos);
    });
  }, []);

  const cerrar = useCallback((resultado) => {
    resolver.current?.(resultado);
    resolver.current = null;
    setOpciones(null);
  }, []);

  async function aceptar() {
    if (!opciones?.accion) return cerrar(true);
    setProcesando(true);
    try {
      await opciones.accion();
      cerrar(true);
    } catch {
      // La acción ya avisó del error; el diálogo queda abierto para reintentar o cancelar.
    } finally {
      setProcesando(false);
    }
  }

  return (
    <ConfirmContext.Provider value={confirmar}>
      {children}
      <ConfirmDialog
        open={opciones !== null}
        title={opciones?.titulo ?? ""}
        confirmLabel={opciones?.confirmar ?? "Confirmar"}
        processingLabel={opciones?.procesando ?? "Procesando…"}
        cancelLabel={opciones?.cancelar ?? "Cancelar"}
        onConfirm={aceptar}
        onCancel={() => cerrar(false)}
        isProcessing={procesando}
        fallbackFocusRef={fallbackFocusRef}
      >
        {opciones?.mensaje}
      </ConfirmDialog>
    </ConfirmContext.Provider>
  );
}
