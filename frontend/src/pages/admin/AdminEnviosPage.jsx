import { useState } from "react";
import PageHeader from "../../components/ui/PageHeader.jsx";
import Button from "../../components/ui/Button.jsx";
import FormField from "../../components/ui/FormField.jsx";
import { ErrorMessage, Loading } from "../../components/ui/Feedback.jsx";
import { useApiResource } from "../../hooks/useApiResource.js";
import { useToast } from "../../hooks/useToast.js";
import { actualizarConfiguracionEnvio, getZonasEnvio } from "../../services/envioService.js";
import { formatPrecio } from "../../utils/format.js";
import "./AdminPages.css";

const fetchZonas = (signal) => getZonasEnvio({ signal });

function FormMinimo({ actual, onGuardado }) {
  const toast = useToast();
  const [valor, setValor] = useState(String(actual));
  const [errorCampo, setErrorCampo] = useState("");
  const [guardando, setGuardando] = useState(false);

  async function guardar(event) {
    event.preventDefault();
    const numero = Number(valor);
    if (valor.trim() === "" || !Number.isFinite(numero) || numero < 0) {
      setErrorCampo("Ingresá un monto mayor o igual a 0.");
      return;
    }
    setGuardando(true);
    try {
      const configuracion = await actualizarConfiguracionEnvio({ montoMinimoEnvioGratis: numero });
      onGuardado(configuracion.montoMinimoEnvioGratis);
      toast.success(`Envío gratis desde ${formatPrecio(configuracion.montoMinimoEnvioGratis)}.`, "Monto actualizado");
    } catch (fallo) {
      toast.error(fallo.message, "No se pudo guardar");
    } finally {
      setGuardando(false);
    }
  }

  return (
    <form className="form-minimo" onSubmit={guardar} noValidate>
      <FormField
        id="montoMinimo"
        label="Monto mínimo para envío gratis (ARS)"
        required
        hint="RN-04: el envío es gratis cuando la compra alcanza este monto."
        error={errorCampo}
      >
        {(field) => (
          <input
            {...field}
            type="number"
            min="0"
            step="100"
            inputMode="numeric"
            value={valor}
            onChange={(e) => {
              setValor(e.target.value);
              setErrorCampo("");
            }}
          />
        )}
      </FormField>
      <Button type="submit" isLoading={guardando}>
        {guardando ? "Guardando…" : "Guardar monto"}
      </Button>
    </form>
  );
}

export default function AdminEnviosPage() {
  const { data, isLoading, error, reload, setData } = useApiResource(fetchZonas);

  function renderContenido() {
    if (isLoading) return <Loading message="Cargando envíos…" />;
    if (error) return <ErrorMessage title="No pudimos cargar los envíos" message={error.message} onRetry={reload} />;
    return (
      <div className="reportes__fila">
        <section className="reportes__panel parche parche--blanco" aria-labelledby="gratis-titulo">
          <h2 id="gratis-titulo" className="reportes__titulo">
            Envío gratis
          </h2>
          <FormMinimo
            key={data.montoMinimoEnvioGratis}
            actual={data.montoMinimoEnvioGratis}
            onGuardado={(monto) => setData((actual) => ({ ...actual, montoMinimoEnvioGratis: monto }))}
          />
        </section>
        <section className="reportes__panel parche parche--blanco" aria-labelledby="zonas-titulo">
          <h2 id="zonas-titulo" className="reportes__titulo">
            Zonas de envío
          </h2>
          <p className="text-muted">Zonas y costos de ejemplo, hasta que el local defina los reales.</p>
          <table className="tabla-simple">
            <caption className="visually-hidden">Zonas de envío y su costo</caption>
            <thead>
              <tr>
                <th scope="col">Zona</th>
                <th scope="col" className="num">
                  Costo
                </th>
              </tr>
            </thead>
            <tbody>
              {data.zonas.map((zona) => (
                <tr key={zona.id}>
                  <th scope="row">
                    {zona.nombre}
                    <span className="tabla-admin__sub">{zona.descripcion}</span>
                  </th>
                  <td className="num">{formatPrecio(zona.costo)}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </section>
      </div>
    );
  }

  return (
    <div className="section">
      <title>Envíos | Administración OCN</title>
      <div className="container">
        <PageHeader title="Envíos" description="Costos por zona y monto mínimo para envío gratis." />
        {renderContenido()}
      </div>
    </div>
  );
}
