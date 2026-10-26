import { useId, useState } from "react";
import "./GraficoBarras.css";

const ALTO = 220;
const MARGEN = { arriba: 16, abajo: 28, izq: 8, der: 8 };

/**
 * Barras verticales de una sola serie (un solo tono: el título nombra la serie).
 * Tooltip al pasar el mouse o al enfocar con teclado, y tabla equivalente para lectores de pantalla.
 */
export default function GraficoBarras({ titulo, datos, formatoValor, etiquetaEje = (d) => d.etiqueta }) {
  const [activa, setActiva] = useState(null);
  const id = useId();
  const max = Math.max(1, ...datos.map((d) => d.valor));
  const ancho = Math.max(320, datos.length * 22);
  const paso = (ancho - MARGEN.izq - MARGEN.der) / datos.length;
  const barra = Math.max(4, Math.min(28, paso - 2));
  const altoUtil = ALTO - MARGEN.arriba - MARGEN.abajo;
  const cadaCuanto = Math.ceil(datos.length / 8);
  const lineas = [0, 0.5, 1];

  return (
    <figure className="grafico">
      <figcaption className="grafico__titulo" id={`${id}-titulo`}>
        {titulo}
      </figcaption>
      <div className="grafico__lienzo">
        <svg viewBox={`0 0 ${ancho} ${ALTO}`} role="group" aria-labelledby={`${id}-titulo`} preserveAspectRatio="none">
          {lineas.map((fraccion) => {
            const y = MARGEN.arriba + altoUtil * (1 - fraccion);
            return (
              <line key={fraccion} x1={MARGEN.izq} x2={ancho - MARGEN.der} y1={y} y2={y} className="grafico__grilla" />
            );
          })}
          {datos.map((d, i) => {
            const alto = d.valor > 0 ? Math.max(2, (d.valor / max) * altoUtil) : 0;
            const x = MARGEN.izq + i * paso + (paso - barra) / 2;
            const y = MARGEN.arriba + altoUtil - alto;
            return (
              <g
                key={d.clave}
                tabIndex={0}
                role="img"
                className={`grafico__barra ${activa === i ? "is-activa" : ""}`.trim()}
                onMouseEnter={() => setActiva(i)}
                onMouseLeave={() => setActiva(null)}
                onFocus={() => setActiva(i)}
                onBlur={() => setActiva(null)}
                aria-label={`${d.etiqueta}: ${formatoValor(d.valor)}`}
              >
                <rect
                  x={MARGEN.izq + i * paso}
                  y={MARGEN.arriba}
                  width={paso}
                  height={altoUtil}
                  className="grafico__zona"
                />
                {alto > 0 && (
                  <path
                    d={`M${x} ${y + alto}V${y + Math.min(4, alto)}a4 4 0 0 1 4-4h${barra - 8}a4 4 0 0 1 4 4V${y + alto}Z`}
                    className="grafico__marca"
                  />
                )}
                {i % cadaCuanto === 0 && (
                  <text x={x + barra / 2} y={ALTO - 8} textAnchor="middle" className="grafico__eje">
                    {etiquetaEje(d)}
                  </text>
                )}
              </g>
            );
          })}
          <line
            x1={MARGEN.izq}
            x2={ancho - MARGEN.der}
            y1={MARGEN.arriba + altoUtil}
            y2={MARGEN.arriba + altoUtil}
            className="grafico__base"
          />
        </svg>
        {activa !== null && (
          <div className="grafico__tooltip" role="status" style={{ left: `${((activa + 0.5) / datos.length) * 100}%` }}>
            <strong>{formatoValor(datos[activa].valor)}</strong>
            <span>{datos[activa].etiqueta}</span>
          </div>
        )}
      </div>
      <details className="grafico__tabla">
        <summary>Ver como tabla</summary>
        <table>
          <thead>
            <tr>
              <th scope="col">Período</th>
              <th scope="col" className="num">
                Valor
              </th>
            </tr>
          </thead>
          <tbody>
            {datos.map((d) => (
              <tr key={d.clave}>
                <th scope="row">{d.etiqueta}</th>
                <td className="num">{formatoValor(d.valor)}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </details>
    </figure>
  );
}
