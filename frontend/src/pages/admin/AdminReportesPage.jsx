import { useCallback, useState } from "react";
import PageHeader from "../../components/ui/PageHeader.jsx";
import Button from "../../components/ui/Button.jsx";
import { ErrorMessage, Loading } from "../../components/ui/Feedback.jsx";
import GraficoBarras from "../../components/admin/GraficoBarras.jsx";
import { useApiResource } from "../../hooks/useApiResource.js";
import { getReporteVentas } from "../../services/reporteService.js";
import { formatDia, formatPrecio } from "../../utils/format.js";
import "./AdminPages.css";

/** Ventas por período (GET /api/reportes/ventas). Los pedidos cancelados no suman. */
export default function AdminReportesPage() {
  const [rango, setRango] = useState({ desde: "", hasta: "" });
  const [borrador, setBorrador] = useState(rango);
  const fetchReporte = useCallback((signal) => getReporteVentas({ ...rango, signal }), [rango]);
  const { data: reporte, isLoading, error, reload } = useApiResource(fetchReporte);

  function aplicar(event) {
    event.preventDefault();
    setRango(borrador);
  }

  function renderContenido() {
    if (isLoading) return <Loading message="Calculando ventas…" />;
    if (error) return <ErrorMessage title="No pudimos armar el reporte" message={error.message} onRetry={reload} />;

    const maxProducto = Math.max(1, ...reporte.porProducto.map((p) => p.monto));
    return (
      <div className="reportes">
        <dl className="kpis">
          <div className="kpi parche parche--blanco">
            <dt>Total vendido</dt>
            <dd>{formatPrecio(reporte.totalVendido)}</dd>
          </div>
          <div className="kpi parche parche--blanco">
            <dt>Pedidos</dt>
            <dd>{reporte.cantidadPedidos}</dd>
          </div>
          <div className="kpi parche parche--blanco">
            <dt>Ticket promedio</dt>
            <dd>{formatPrecio(reporte.ticketPromedio)}</dd>
          </div>
          <div className="kpi parche parche--blanco">
            <dt>Prendas vendidas</dt>
            <dd>{reporte.unidadesVendidas}</dd>
          </div>
        </dl>

        <section className="reportes__panel parche parche--blanco" aria-label="Ventas por día">
          <GraficoBarras
            titulo={`Ventas por día, del ${formatDia(reporte.desde)} al ${formatDia(reporte.hasta)}`}
            datos={reporte.porDia.map((dia) => ({
              clave: dia.fecha,
              etiqueta: `${formatDia(dia.fecha)} (${dia.pedidos} ${dia.pedidos === 1 ? "pedido" : "pedidos"})`,
              eje: formatDia(dia.fecha),
              valor: dia.total,
            }))}
            etiquetaEje={(d) => d.eje}
            formatoValor={formatPrecio}
          />
        </section>

        <div className="reportes__fila">
          <section className="reportes__panel parche parche--blanco" aria-labelledby="top-titulo">
            <h2 id="top-titulo" className="reportes__titulo">
              Productos más vendidos
            </h2>
            {reporte.porProducto.length === 0 ? (
              <p className="text-muted">Sin ventas en el período.</p>
            ) : (
              <ol className="ranking">
                {reporte.porProducto.map((producto) => (
                  <li key={producto.nombre}>
                    <div className="ranking__texto">
                      <span>{producto.nombre}</span>
                      <span className="ranking__valor">
                        {formatPrecio(producto.monto)} · {producto.unidades} u.
                      </span>
                    </div>
                    <span className="ranking__barra" aria-hidden="true">
                      <span style={{ width: `${(producto.monto / maxProducto) * 100}%` }} />
                    </span>
                  </li>
                ))}
              </ol>
            )}
          </section>

          <section className="reportes__panel parche parche--blanco" aria-labelledby="estados-titulo">
            <h2 id="estados-titulo" className="reportes__titulo">
              Pedidos por estado
            </h2>
            <table className="tabla-simple">
              <caption className="visually-hidden">Cantidad de pedidos del período por estado</caption>
              <tbody>
                {reporte.porEstado.map(({ estado, cantidad }) => (
                  <tr key={estado}>
                    <th scope="row">{estado}</th>
                    <td className="num">{cantidad}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </section>
        </div>
      </div>
    );
  }

  return (
    <div className="section">
      <title>Reportes | Administración OCN</title>
      <div className="container">
        <PageHeader
          title="Reportes de ventas"
          description="Por defecto, los últimos 30 días. Los pedidos cancelados no cuentan como venta."
        />
        <form className="rango" onSubmit={aplicar}>
          <div className="rango__campo">
            <label htmlFor="desde">Desde</label>
            <input
              id="desde"
              type="date"
              className="form-control"
              value={borrador.desde}
              onChange={(e) => setBorrador((r) => ({ ...r, desde: e.target.value }))}
            />
          </div>
          <div className="rango__campo">
            <label htmlFor="hasta">Hasta</label>
            <input
              id="hasta"
              type="date"
              className="form-control"
              value={borrador.hasta}
              onChange={(e) => setBorrador((r) => ({ ...r, hasta: e.target.value }))}
            />
          </div>
          <Button type="submit" variant="outline">
            Ver período
          </Button>
        </form>
        {renderContenido()}
      </div>
    </div>
  );
}
