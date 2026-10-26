import { useState } from "react";
import { CheckIcon } from "../ui/Icons.jsx";
import "./StockRapido.css";

/** Edición rápida del stock desde la tabla (Enter o el botón guardan). */
export default function StockRapido({ producto, onGuardar }) {
  const [valor, setValor] = useState(String(producto.stock));
  const [guardando, setGuardando] = useState(false);
  const numero = Number(valor);
  const valido = valor.trim() !== "" && Number.isInteger(numero) && numero >= 0;
  const cambio = valido && numero !== producto.stock;

  async function guardar(event) {
    event.preventDefault();
    if (!cambio || guardando) return;
    setGuardando(true);
    try {
      await onGuardar(producto, numero);
    } catch {
      setValor(String(producto.stock));
    } finally {
      setGuardando(false);
    }
  }

  const id = `stock-${producto.codigo}`;
  return (
    <form className="stock-rapido" onSubmit={guardar}>
      <label htmlFor={id} className="visually-hidden">
        Stock de {producto.nombre} {producto.talle} {producto.color}
      </label>
      <input
        id={id}
        type="number"
        min="0"
        step="1"
        inputMode="numeric"
        className="stock-rapido__input"
        value={valor}
        aria-invalid={!valido || undefined}
        disabled={guardando}
        onChange={(event) => setValor(event.target.value)}
      />
      {cambio && (
        <button type="submit" className="stock-rapido__guardar" disabled={guardando}>
          <CheckIcon size={16} />
          <span className="visually-hidden">Guardar stock</span>
        </button>
      )}
    </form>
  );
}
