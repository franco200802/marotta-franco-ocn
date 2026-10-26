import { MinusIcon, PlusIcon } from "./Icons.jsx";
import "./QuantityStepper.css";

/** Cantidad entera entre `min` y `max` (Validación 3: mayor que cero y sin superar el stock). */
export default function QuantityStepper({ value, min = 1, max, onChange, label = "Cantidad", disabled = false, id }) {
  const limitar = (n) => Math.max(min, Math.min(max ?? Infinity, n));

  return (
    <div className="stepper" role="group" aria-label={label}>
      <button
        type="button"
        className="stepper__btn"
        onClick={() => onChange(limitar(value - 1))}
        disabled={disabled || value <= min}
      >
        <MinusIcon size={16} />
        <span className="visually-hidden">Restar uno</span>
      </button>
      <input
        id={id}
        className="stepper__input"
        type="number"
        inputMode="numeric"
        min={min}
        max={max}
        value={value}
        disabled={disabled}
        aria-label={label}
        onChange={(event) => {
          const n = Number.parseInt(event.target.value, 10);
          if (Number.isFinite(n)) onChange(limitar(n));
        }}
      />
      <button
        type="button"
        className="stepper__btn"
        onClick={() => onChange(limitar(value + 1))}
        disabled={disabled || (max !== undefined && value >= max)}
      >
        <PlusIcon size={16} />
        <span className="visually-hidden">Sumar uno</span>
      </button>
    </div>
  );
}
