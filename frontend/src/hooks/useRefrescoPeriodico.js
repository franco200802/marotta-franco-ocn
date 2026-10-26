import { useEffect } from "react";

/** Repite una acción cada cierto tiempo mientras la pestaña está a la vista (ej.: ver si cambió un pedido). */
export function useRefrescoPeriodico(alRefrescar, { cadaMs = 20000, activo = true } = {}) {
  useEffect(() => {
    if (!activo) return undefined;
    const intervalo = setInterval(() => {
      if (document.visibilityState === "visible") alRefrescar();
    }, cadaMs);
    return () => clearInterval(intervalo);
  }, [alRefrescar, cadaMs, activo]);
}
