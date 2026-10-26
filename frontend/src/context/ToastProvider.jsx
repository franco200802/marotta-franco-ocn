import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { ToastContext } from "./toastContext.js";
import ToastRegion from "../components/ui/ToastRegion.jsx";

const DURACION_MS = { success: 5000, info: 5000, error: 8000 };

export default function ToastProvider({ children }) {
  const [toasts, setToasts] = useState([]);
  const timers = useRef(new Map());
  const nextId = useRef(1);

  const dismissToast = useCallback((id) => {
    clearTimeout(timers.current.get(id));
    timers.current.delete(id);
    setToasts((current) => current.filter((toast) => toast.id !== id));
  }, []);

  const showToast = useCallback(
    ({ type = "info", title, message }) => {
      const id = nextId.current++;
      setToasts((current) => [...current, { id, type, title, message }]);
      timers.current.set(id, setTimeout(() => dismissToast(id), DURACION_MS[type] ?? 5000));
      return id;
    },
    [dismissToast],
  );

  useEffect(() => {
    const activeTimers = timers.current;
    return () => activeTimers.forEach(clearTimeout);
  }, []);

  const value = useMemo(
    () => ({
      showToast,
      dismissToast,
      success: (message, title) => showToast({ type: "success", message, title }),
      error: (message, title) => showToast({ type: "error", message, title }),
    }),
    [showToast, dismissToast],
  );

  return (
    <ToastContext.Provider value={value}>
      {children}
      <ToastRegion toasts={toasts} onDismiss={dismissToast} />
    </ToastContext.Provider>
  );
}
