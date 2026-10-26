import { formatPrecio } from "../../utils/format.js";
import "./BarraEnvioGratis.css";

/** RN-04: cuánto falta para el envío gratis, con una costura que se va completando. */
export default function BarraEnvioGratis({ subtotal, minimo }) {
  if (!minimo) return null;
  const progreso = Math.min(100, Math.round((subtotal / minimo) * 100));
  const falta = Math.max(0, minimo - subtotal);

  return (
    <div className="envio-gratis">
      <p className="envio-gratis__texto" role="status">
        {falta > 0 ? (
          <>
            Te faltan <strong>{formatPrecio(falta)}</strong> para el envío gratis.
          </>
        ) : (
          <strong>Tenés envío gratis a domicilio.</strong>
        )}
      </p>
      <div
        className="envio-gratis__barra"
        role="progressbar"
        aria-label="Progreso hacia el envío gratis"
        aria-valuemin={0}
        aria-valuemax={100}
        aria-valuenow={progreso}
      >
        <span className="envio-gratis__relleno" style={{ width: `${progreso}%` }} />
      </div>
    </div>
  );
}
