import { useRef, useState } from "react";
import Button from "../ui/Button.jsx";
import FormField from "../ui/FormField.jsx";
import { AlertIcon } from "../ui/Icons.jsx";
import { enfocarCampo, primerError } from "../../utils/validation.js";
import "./CuentaForm.css";

/**
 * Formulario genérico de cuenta (ingreso, registro y datos personales).
 * `campos`: [{ id, label, type, autoComplete, hint, required }]. Los datos se conservan si el envío falla.
 */
export default function CuentaForm({ campos, valoresIniciales, validar, onSubmit, submitLabel, enviandoLabel }) {
  const [valores, setValores] = useState(valoresIniciales);
  const [errores, setErrores] = useState({});
  const [errorServidor, setErrorServidor] = useState("");
  const [enviando, setEnviando] = useState(false);
  const formRef = useRef(null);
  const alertaRef = useRef(null);
  const orden = campos.map((campo) => campo.id);

  const cambiar = (event) => {
    const { name, value } = event.target;
    setValores((actuales) => ({ ...actuales, [name]: value }));
    setErrores((actuales) => ({ ...actuales, [name]: undefined }));
  };

  async function enviar(event) {
    event.preventDefault();
    if (enviando) return;
    const nuevos = validar(valores);
    setErrores(nuevos);
    const primero = primerError(orden, nuevos);
    if (primero) {
      enfocarCampo(formRef.current, primero);
      return;
    }
    setEnviando(true);
    setErrorServidor("");
    try {
      await onSubmit(valores);
    } catch (error) {
      setErrorServidor(error.message);
      requestAnimationFrame(() => alertaRef.current?.focus());
    } finally {
      setEnviando(false);
    }
  }

  return (
    <form ref={formRef} className="cuenta-form" onSubmit={enviar} noValidate aria-busy={enviando}>
      {errorServidor && (
        <div ref={alertaRef} tabIndex={-1} className="cuenta-form__alerta" role="alert">
          <AlertIcon size={20} />
          <p>{errorServidor}</p>
        </div>
      )}
      {campos.map(({ id, label, type = "text", autoComplete, hint, required = true }) => (
        <FormField key={id} id={id} label={label} hint={hint} required={required} error={errores[id]}>
          {(field) => (
            <input
              {...field}
              type={type}
              autoComplete={autoComplete}
              value={valores[id] ?? ""}
              onChange={cambiar}
              disabled={enviando}
            />
          )}
        </FormField>
      ))}
      <Button type="submit" size="lg" isLoading={enviando}>
        {enviando ? enviandoLabel : submitLabel}
      </Button>
    </form>
  );
}
