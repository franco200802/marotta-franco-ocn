import { useEffect, useRef } from "react";
import Button from "./Button.jsx";
import "./ConfirmDialog.css";

/**
 * Diálogo modal de confirmación basado en <dialog>: atrapa el foco, se cierra con Escape
 * y devuelve el foco al control que lo abrió (o a `fallbackFocusRef` si ese control ya no existe).
 */
export default function ConfirmDialog({
  open,
  title,
  children,
  confirmLabel = "Confirmar",
  cancelLabel = "Cancelar",
  processingLabel = "Procesando…",
  onConfirm,
  onCancel,
  isProcessing = false,
  fallbackFocusRef,
}) {
  const dialogRef = useRef(null);
  const cancelButtonRef = useRef(null);
  const openerRef = useRef(null);

  useEffect(() => {
    const dialog = dialogRef.current;
    if (!dialog) return;

    if (open && !dialog.open) {
      openerRef.current = document.activeElement;
      dialog.showModal();
      cancelButtonRef.current?.focus();
    } else if (!open && dialog.open) {
      dialog.close();
      const opener = openerRef.current;
      // Safari no enfoca los botones al hacer clic: en ese caso el "opener" es <body>.
      if (opener && opener !== document.body && opener.isConnected) opener.focus();
      else fallbackFocusRef?.current?.focus();
    }
  }, [open, fallbackFocusRef]);

  function handleCancelEvent(event) {
    // Evento nativo al presionar Escape: el cierre lo controla el componente padre.
    event.preventDefault();
    if (!isProcessing) onCancel();
  }

  function handleBackdropClick(event) {
    if (event.target === dialogRef.current && !isProcessing) onCancel();
  }

  function handleNativeClose() {
    // El navegador puede cerrar el diálogo por su cuenta (p. ej. Escape repetido);
    // se sincroniza el estado del padre para que pueda volver a abrirse.
    if (open) onCancel();
  }

  return (
    <dialog
      ref={dialogRef}
      className="confirm-dialog"
      aria-labelledby="confirm-dialog-title"
      aria-describedby="confirm-dialog-description"
      onCancel={handleCancelEvent}
      onClose={handleNativeClose}
      onClick={handleBackdropClick}
    >
      <div className="confirm-dialog__content">
        <h2 id="confirm-dialog-title" className="confirm-dialog__title">
          {title}
        </h2>
        <div id="confirm-dialog-description" className="confirm-dialog__body">
          {children}
        </div>
        <div className="confirm-dialog__actions">
          <Button ref={cancelButtonRef} variant="ghost" onClick={onCancel} disabled={isProcessing}>
            {cancelLabel}
          </Button>
          <Button variant="danger" onClick={onConfirm} isLoading={isProcessing}>
            {isProcessing ? processingLabel : confirmLabel}
          </Button>
        </div>
      </div>
    </dialog>
  );
}
