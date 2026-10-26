import { useCallback, useEffect, useRef } from "react";
import { useToast } from "./useToast.js";

/**
 * Compara los pedidos con la vez anterior y avisa si alguno cambió de estado.
 * Devuelve `registrar(id, estado)` para los cambios que hace la propia persona (esos ya tienen su aviso).
 */
export function useAvisoDeEstado(pedidos) {
  const toast = useToast();
  const anteriores = useRef(null);

  useEffect(() => {
    if (!pedidos) return;
    const actuales = new Map(pedidos.map((pedido) => [pedido.id, pedido.estado]));
    if (anteriores.current) {
      actuales.forEach((estado, id) => {
        const antes = anteriores.current.get(id);
        if (antes && antes !== estado) {
          toast.info(`El pedido #${id} pasó a "${estado}".`, "Tu pedido avanzó");
        }
      });
    }
    anteriores.current = actuales;
  }, [pedidos, toast]);

  return useCallback((id, estado) => anteriores.current?.set(id, estado), []);
}
