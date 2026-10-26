import "./PhotoPlaceholder.css";

/**
 * Bloque rayado del mockup para las fotos que el local todavía debe reemplazar.
 * Es decorativo: el texto de referencia queda oculto para lectores de pantalla.
 */
export default function PhotoPlaceholder({ label, className = "" }) {
  return (
    <div className={`photo-placeholder ${className}`.trim()} aria-hidden="true">
      {label && <span className="photo-placeholder__label">{label}</span>}
    </div>
  );
}
