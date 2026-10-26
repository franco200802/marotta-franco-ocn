import Button from "./Button.jsx";
import { AlertIcon, BoxIcon, RefreshIcon } from "./Icons.jsx";
import "./Feedback.css";

/** Indicador de carga anunciado a lectores de pantalla. */
export function Loading({ message = "Cargando…" }) {
  return (
    <div className="feedback feedback--loading" role="status">
      <span className="feedback__spinner" aria-hidden="true" />
      <p>{message}</p>
    </div>
  );
}

/** Estado vacío: no es un error, simplemente no hay registros para mostrar. */
export function EmptyState({ title, message, action }) {
  return (
    <div className="feedback feedback--empty">
      <BoxIcon size={40} className="feedback__icon" />
      <h2 className="feedback__title">{title}</h2>
      {message && <p className="text-muted">{message}</p>}
      {action && <div className="feedback__actions">{action}</div>}
    </div>
  );
}

/** Mensaje de error con opción de reintentar la operación. */
export function ErrorMessage({ title = "Algo salió mal", message, onRetry, action }) {
  return (
    <div className="feedback feedback--error" role="alert">
      <AlertIcon size={40} className="feedback__icon" />
      <h2 className="feedback__title">{title}</h2>
      {message && <p>{message}</p>}
      {(onRetry || action) && (
        <div className="feedback__actions">
          {onRetry && (
            <Button variant="outline" icon={<RefreshIcon size={18} />} onClick={onRetry}>
              Reintentar
            </Button>
          )}
          {action}
        </div>
      )}
    </div>
  );
}
