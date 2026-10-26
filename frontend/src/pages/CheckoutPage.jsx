import { useEffect, useRef, useState } from "react";
import { useNavigate } from "react-router-dom";
import PageHeader from "../components/ui/PageHeader.jsx";
import Button from "../components/ui/Button.jsx";
import FormField from "../components/ui/FormField.jsx";
import { EmptyState, ErrorMessage, Loading } from "../components/ui/Feedback.jsx";
import { AlertIcon, StoreIcon, TruckIcon } from "../components/ui/Icons.jsx";
import BarraEnvioGratis from "../components/carrito/BarraEnvioGratis.jsx";
import { useCart } from "../hooks/useCart.js";
import { useAuth } from "../hooks/useAuth.js";
import { useToast } from "../hooks/useToast.js";
import { useApiResource } from "../hooks/useApiResource.js";
import { useValidacionCarrito } from "../hooks/useValidacionCarrito.js";
import { cotizarEnvio, getZonasEnvio } from "../services/envioService.js";
import { crearPedido } from "../services/pedidoService.js";
import { validarCarrito } from "../services/carritoService.js";
import { formatPrecio, METODOS_PAGO } from "../utils/format.js";
import { NEGOCIO } from "../utils/negocio.js";
import { enfocarCampo, primerError, validarCheckout } from "../utils/validation.js";
import "./CheckoutPage.css";

const fetchZonas = (signal) => getZonasEnvio({ signal });
const ORDEN_CAMPOS = ["zonaId", "direccion", "metodoPago"];

/** Costo de envío cotizado por la API (RN-04) cada vez que cambia la entrega o el subtotal. */
function useCotizacion({ tipoEntrega, zonaId, subtotal }) {
  const [cotizacion, setCotizacion] = useState(null);
  const pedirCotizacion = tipoEntrega === "domicilio" && zonaId;

  useEffect(() => {
    if (!pedirCotizacion) return undefined;
    const controller = new AbortController();
    cotizarEnvio({ tipoEntrega, zonaId: Number(zonaId), subtotal }, { signal: controller.signal })
      .then(setCotizacion)
      .catch(() => {});
    return () => controller.abort();
  }, [pedirCotizacion, tipoEntrega, zonaId, subtotal]);

  if (tipoEntrega === "retiro_local") return { costo: 0 };
  return pedirCotizacion ? cotizacion : null;
}

export default function CheckoutPage() {
  const { items, subtotal, vaciar, sincronizar } = useCart();
  const { usuario } = useAuth();
  const toast = useToast();
  const navigate = useNavigate();
  const avisos = useValidacionCarrito();
  const { data: envios, isLoading, error, reload } = useApiResource(fetchZonas);

  const [valores, setValores] = useState({
    tipoEntrega: "retiro_local",
    zonaId: "",
    direccion: usuario?.direccion ?? "",
    metodoPago: "",
  });
  const [errores, setErrores] = useState({});
  const [errorEnvio, setErrorEnvio] = useState("");
  const [enviando, setEnviando] = useState(false);
  const formRef = useRef(null);
  const errorRef = useRef(null);

  const cotizacion = useCotizacion({ ...valores, subtotal });
  const costoEnvio = cotizacion?.costo ?? null;

  const cambiar = (campo, valor) => {
    setValores((actuales) => ({ ...actuales, [campo]: valor }));
    setErrores((actuales) => ({ ...actuales, [campo]: undefined }));
  };

  async function confirmar(event) {
    event.preventDefault();
    if (enviando) return;
    const nuevos = validarCheckout(valores);
    setErrores(nuevos);
    const primero = primerError(ORDEN_CAMPOS, nuevos);
    if (primero) {
      enfocarCampo(formRef.current, primero);
      return;
    }

    setEnviando(true);
    setErrorEnvio("");
    try {
      const pedido = await crearPedido({
        items: items.map(({ productoId, cantidad }) => ({ productoId, cantidad })),
        tipoEntrega: valores.tipoEntrega,
        zonaId: valores.tipoEntrega === "domicilio" ? Number(valores.zonaId) : undefined,
        direccion: valores.tipoEntrega === "domicilio" ? valores.direccion : undefined,
        metodoPago: valores.metodoPago,
      });
      vaciar();
      toast.success(`Tu pedido #${pedido.id} quedó registrado.`, "¡Pedido confirmado!");
      navigate(`/pedidos/${pedido.id}`, { replace: true });
    } catch (fallo) {
      setErrorEnvio(fallo.message);
      setEnviando(false);
      // Si el problema fue de stock o disponibilidad, se actualiza el carrito con lo que hay hoy.
      if (fallo.isConflict) {
        validarCarrito(items.map(({ productoId, cantidad }) => ({ productoId, cantidad })))
          .then((resultado) => sincronizar(resultado.items))
          .catch(() => {});
      }
      requestAnimationFrame(() => errorRef.current?.focus());
    }
  }

  if (items.length === 0) {
    return (
      <div className="section section--stone">
        <title>Finalizar compra | OCN Villa Urquiza</title>
        <div className="container">
          <EmptyState
            title="No hay nada para pagar"
            message="Tu carrito está vacío."
            action={<Button to="/productos">Ver productos</Button>}
          />
        </div>
      </div>
    );
  }

  return (
    <div className="section section--stone">
      <title>Finalizar compra | OCN Villa Urquiza</title>
      <div className="container">
        <PageHeader
          title="Finalizar compra"
          description="Pagás al retirar o al recibir: no te pedimos datos de tarjeta."
        />

        {isLoading ? (
          <Loading message="Cargando opciones de entrega…" />
        ) : error ? (
          <ErrorMessage title="No pudimos cargar las opciones de entrega" message={error.message} onRetry={reload} />
        ) : (
          <form ref={formRef} className="checkout" onSubmit={confirmar} noValidate aria-busy={enviando}>
            <div className="checkout__pasos">
              {(errorEnvio || avisos.length > 0) && (
                <div ref={errorRef} tabIndex={-1} className="checkout__alerta" role="alert">
                  <AlertIcon size={20} />
                  <div>
                    {errorEnvio && (
                      <p>
                        <strong>No pudimos confirmar el pedido.</strong> {errorEnvio}
                      </p>
                    )}
                    {avisos.map((aviso) => (
                      <p key={aviso}>{aviso}</p>
                    ))}
                  </div>
                </div>
              )}

              <fieldset className="checkout__bloque parche parche--blanco">
                <legend>¿Cómo lo recibís?</legend>
                <div className="opciones">
                  <label className="opcion">
                    <input
                      type="radio"
                      name="tipoEntrega"
                      value="retiro_local"
                      checked={valores.tipoEntrega === "retiro_local"}
                      onChange={() => cambiar("tipoEntrega", "retiro_local")}
                    />
                    <span className="opcion__caja">
                      <StoreIcon size={24} />
                      <strong>Retiro en el local</strong>
                      <span>{NEGOCIO.direccion}. Sin costo.</span>
                    </span>
                  </label>
                  <label className="opcion">
                    <input
                      type="radio"
                      name="tipoEntrega"
                      value="domicilio"
                      checked={valores.tipoEntrega === "domicilio"}
                      onChange={() => cambiar("tipoEntrega", "domicilio")}
                    />
                    <span className="opcion__caja">
                      <TruckIcon size={24} />
                      <strong>Envío a domicilio</strong>
                      <span>Costo según tu zona (de ejemplo por ahora).</span>
                    </span>
                  </label>
                </div>

                {valores.tipoEntrega === "domicilio" && (
                  <div className="checkout__domicilio">
                    <FormField id="zonaId" label="Zona" required error={errores.zonaId}>
                      {(field) => (
                        <select {...field} value={valores.zonaId} onChange={(e) => cambiar("zonaId", e.target.value)}>
                          <option value="">Elegí tu zona</option>
                          {envios.zonas.map((zona) => (
                            <option key={zona.id} value={zona.id}>
                              {zona.nombre} ({formatPrecio(zona.costo)})
                            </option>
                          ))}
                        </select>
                      )}
                    </FormField>
                    <FormField
                      id="direccion"
                      label="Dirección de entrega"
                      required
                      hint="Calle, número, piso y departamento."
                      error={errores.direccion}
                    >
                      {(field) => (
                        <input
                          {...field}
                          type="text"
                          autoComplete="street-address"
                          value={valores.direccion}
                          onChange={(e) => cambiar("direccion", e.target.value)}
                        />
                      )}
                    </FormField>
                    <BarraEnvioGratis subtotal={subtotal} minimo={envios.montoMinimoEnvioGratis} />
                  </div>
                )}
              </fieldset>

              <fieldset
                className="checkout__bloque parche parche--blanco"
                aria-describedby={errores.metodoPago ? "metodoPago-error" : undefined}
              >
                <legend>¿Cómo pagás?</legend>
                <p className="checkout__ayuda">Se paga al retirar o al recibir el pedido.</p>
                <div className="opciones opciones--pago">
                  {Object.entries(METODOS_PAGO).map(([valor, etiqueta]) => (
                    <label key={valor} className="opcion opcion--chica">
                      <input
                        type="radio"
                        name="metodoPago"
                        value={valor}
                        checked={valores.metodoPago === valor}
                        onChange={() => cambiar("metodoPago", valor)}
                        aria-invalid={errores.metodoPago ? true : undefined}
                      />
                      <span className="opcion__caja">
                        <strong>{etiqueta}</strong>
                      </span>
                    </label>
                  ))}
                </div>
                {errores.metodoPago && (
                  <p id="metodoPago-error" className="form-field__error">
                    <AlertIcon size={16} />
                    {errores.metodoPago}
                  </p>
                )}
              </fieldset>
            </div>

            <aside className="checkout__resumen parche parche--blanco" aria-label="Resumen del pedido">
              <h2>Tu pedido</h2>
              <ul className="checkout__items">
                {items.map((item) => (
                  <li key={item.productoId}>
                    <span>
                      {item.cantidad} × {item.nombre}
                    </span>
                    <span>{formatPrecio(item.precio * item.cantidad)}</span>
                  </li>
                ))}
              </ul>
              <dl className="checkout__totales">
                <div>
                  <dt>Subtotal</dt>
                  <dd>{formatPrecio(subtotal)}</dd>
                </div>
                <div>
                  <dt>Envío</dt>
                  <dd>
                    {costoEnvio === null
                      ? "Elegí la zona"
                      : costoEnvio === 0
                        ? valores.tipoEntrega === "retiro_local"
                          ? "Sin costo"
                          : "Gratis"
                        : formatPrecio(costoEnvio)}
                  </dd>
                </div>
                <div className="checkout__total">
                  <dt>Total</dt>
                  <dd>{formatPrecio(subtotal + (costoEnvio ?? 0))}</dd>
                </div>
              </dl>
              <p className="checkout__ayuda">
                El total final lo calcula el local con los precios vigentes al confirmar.
              </p>
              <Button type="submit" size="lg" isLoading={enviando}>
                {enviando ? "Confirmando…" : "Confirmar pedido"}
              </Button>
            </aside>
          </form>
        )}
      </div>
    </div>
  );
}
