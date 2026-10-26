import { AlertIcon, CheckIcon, CloseIcon } from "./Icons.jsx";
import "./ToastRegion.css";

const ICONOS = { success: CheckIcon, error: AlertIcon, info: CheckIcon };
const TITULOS = { success: "Listo", error: "Error", info: "Aviso" };

/** Región de notificaciones. Siempre está montada para que los lectores de pantalla la detecten. */
export default function ToastRegion({ toasts, onDismiss }) {
  return (
    <div className="toast-region" aria-live="polite" aria-relevant="additions">
      {toasts.map(({ id, type, title, message }) => {
        const Icon = ICONOS[type] ?? CheckIcon;
        return (
          <div key={id} className={`toast toast--${type}`} role={type === "error" ? "alert" : "status"}>
            <Icon size={22} className="toast__icon" />
            <div className="toast__text">
              <p className="toast__title">{title ?? TITULOS[type]}</p>
              <p className="toast__message">{message}</p>
            </div>
            <button type="button" className="toast__close" onClick={() => onDismiss(id)}>
              <CloseIcon size={18} />
              <span className="visually-hidden">Cerrar notificación</span>
            </button>
          </div>
        );
      })}
    </div>
  );
}
