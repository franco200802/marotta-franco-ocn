import { buscarVariante, tinteDeColor } from "../../utils/prendas.js";
import "./SelectorVariante.css";

/** Elección de color y talle con grupos de radios (navegables con flechas del teclado). */
export default function SelectorVariante({ prenda, idPrefix, color, talle, onColor, onTalle, compacto = false }) {
  return (
    <div className={`selector ${compacto ? "selector--compacto" : ""}`.trim()}>
      {prenda.colores.length > 0 && (
        <fieldset className="selector__grupo">
          <legend className="selector__leyenda">
            Color: <strong>{color || "—"}</strong>
          </legend>
          <div className="selector__opciones">
            {prenda.colores.map((nombre) => (
              <label key={nombre} className="muestra" title={nombre}>
                <input
                  type="radio"
                  name={`${idPrefix}-color`}
                  value={nombre}
                  checked={color === nombre}
                  onChange={() => onColor(nombre)}
                />
                <span className="muestra__chip" style={{ background: tinteDeColor(nombre) }} aria-hidden="true" />
                <span className="visually-hidden">{nombre}</span>
              </label>
            ))}
          </div>
        </fieldset>
      )}

      {prenda.talles.length > 0 && (
        <fieldset className="selector__grupo">
          <legend className="selector__leyenda">
            Talle: <strong>{talle || "—"}</strong>
          </legend>
          <div className="selector__opciones">
            {prenda.talles.map((nombre) => {
              const variante = buscarVariante(prenda, { color, talle: nombre });
              const sinStock = !variante || variante.stock <= 0;
              return (
                <label key={nombre} className={`talle ${sinStock ? "talle--agotado" : ""}`.trim()}>
                  <input
                    type="radio"
                    name={`${idPrefix}-talle`}
                    value={nombre}
                    checked={talle === nombre}
                    disabled={sinStock}
                    onChange={() => onTalle(nombre)}
                  />
                  <span className="talle__chip">
                    {nombre}
                    {sinStock && <span className="visually-hidden"> (sin stock)</span>}
                  </span>
                </label>
              );
            })}
          </div>
        </fieldset>
      )}
    </div>
  );
}
