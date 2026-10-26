import { useCallback, useEffect, useState } from "react";

/**
 * Ejecuta una consulta a la API y expone su estado (carga, datos y error).
 * `fetcher` debe ser estable (función de módulo o memorizada con useCallback)
 * y recibir un AbortSignal para cancelar la petición al desmontar el componente.
 */
export function useApiResource(fetcher) {
  const [version, setVersion] = useState(0);
  const [request, setRequest] = useState({ fetcher, version });
  const [state, setState] = useState({ status: "loading", data: undefined, error: null });

  // Si cambia la consulta o se pide recargar, se vuelve al estado de carga durante el render.
  if (request.fetcher !== fetcher || request.version !== version) {
    setRequest({ fetcher, version });
    setState((prev) => ({ ...prev, status: "loading", error: null }));
  }

  useEffect(() => {
    const controller = new AbortController();

    fetcher(controller.signal).then(
      (data) => setState({ status: "success", data, error: null }),
      (error) => {
        if (!controller.signal.aborted) {
          setState({ status: "error", data: undefined, error });
        }
      },
    );

    return () => controller.abort();
  }, [fetcher, version]);

  const reload = useCallback(() => setVersion((v) => v + 1), []);

  // Vuelve a pedir los datos sin mostrar el estado de carga (seguimiento de pedidos, por ejemplo).
  const refrescar = useCallback(async () => {
    try {
      const data = await fetcher();
      setState({ status: "success", data, error: null });
      return data;
    } catch {
      return null;
    }
  }, [fetcher]);

  const setData = useCallback((updater) => {
    setState((prev) => ({
      ...prev,
      data: typeof updater === "function" ? updater(prev.data) : updater,
    }));
  }, []);

  return {
    data: state.data,
    error: state.error,
    isLoading: state.status === "loading",
    reload,
    refrescar,
    setData,
  };
}
