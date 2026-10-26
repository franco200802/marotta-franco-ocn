import { AlertIcon } from "./Icons.jsx";
import "./FormField.css";

/**
 * Etiqueta, ayuda y mensaje de error asociados a un control de formulario.
 * `children` es una función que recibe las props de accesibilidad para el control:
 *   <FormField id="nombre" label="Nombre">{(field) => <input {...field} />}</FormField>
 */
export default function FormField({ id, label, hint, error, required = false, className = "", children }) {
  const hintId = hint ? `${id}-ayuda` : undefined;
  const errorId = error ? `${id}-error` : undefined;
  const describedBy = [hintId, errorId].filter(Boolean).join(" ") || undefined;

  return (
    <div className={`form-field ${error ? "form-field--invalid" : ""} ${className}`.trim()}>
      <label htmlFor={id} className="form-field__label">
        {label}
        {required ? (
          <span className="form-field__required" aria-hidden="true">
            {" "}
            *
          </span>
        ) : (
          <span className="form-field__optional"> (opcional)</span>
        )}
      </label>
      {children({
        id,
        name: id,
        required,
        "aria-invalid": error ? true : undefined,
        "aria-describedby": describedBy,
        className: "form-control",
      })}
      {hint && (
        <p id={hintId} className="form-field__hint">
          {hint}
        </p>
      )}
      {error && (
        <p id={errorId} className="form-field__error">
          <AlertIcon size={16} />
          {error}
        </p>
      )}
    </div>
  );
}
