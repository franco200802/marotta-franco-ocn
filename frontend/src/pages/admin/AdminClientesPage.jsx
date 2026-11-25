import { useRef } from "react";
import PageHeader from "../../components/ui/PageHeader.jsx";
import Badge from "../../components/ui/Badge.jsx";
import Button from "../../components/ui/Button.jsx";
import { EmptyState, ErrorMessage, Loading } from "../../components/ui/Feedback.jsx";
import { useApiResource } from "../../hooks/useApiResource.js";
import { useConfirm } from "../../hooks/useConfirm.js";
import { useToast } from "../../hooks/useToast.js";
import { cambiarEstadoCliente, getClientes } from "../../services/clienteService.js";
import { formatPrecio } from "../../utils/format.js";
import "./AdminPages.css";

const fetchClientes = (signal) => getClientes({ signal });

/** Gestión de usuarios: cuentas registradas, lo que compró cada una y su estado. */
export default function AdminClientesPage() {
  const { data: clientes, isLoading, error, reload, setData } = useApiResource(fetchClientes);
  const confirmar = useConfirm();
  const toast = useToast();
  const headingRef = useRef(null);

  function cambiarEstado(cliente) {
    const activo = !cliente.activo;
    const nombre = `${cliente.nombre} ${cliente.apellido}`;
    confirmar({
      titulo: activo ? `¿Reactivar la cuenta de ${nombre}?` : `¿Desactivar la cuenta de ${nombre}?`,
      mensaje: activo
        ? "Va a poder volver a iniciar sesión y comprar."
        : "No va a poder iniciar sesión ni comprar. Sus pedidos siguen en el sistema y la podés reactivar cuando quieras.",
      confirmar: activo ? "Sí, reactivar" : "Sí, desactivar",
      procesando: activo ? "Reactivando…" : "Desactivando…",
      focoAlTerminar: headingRef.current,
      accion: async () => {
        try {
          const actualizado = await cambiarEstadoCliente(cliente.id, activo);
          setData((actuales) => actuales.map((c) => (c.id === actualizado.id ? actualizado : c)));
          toast.success(
            `La cuenta de ${nombre} quedó ${activo ? "activa" : "desactivada"}.`,
            activo ? "Cuenta reactivada" : "Cuenta desactivada",
          );
        } catch (fallo) {
          toast.error(fallo.message, "No se pudo cambiar el estado");
          if (fallo.isNotFound) reload();
          throw fallo;
        }
      },
    });
  }

  function renderContenido() {
    if (isLoading) return <Loading message="Cargando clientes…" />;
    if (error) return <ErrorMessage title="No pudimos cargar los clientes" message={error.message} onRetry={reload} />;
    if (clientes.length === 0) {
      return <EmptyState title="Todavía no hay clientes" message="Aparecen acá cuando alguien crea su cuenta." />;
    }
    return (
      <div className="tabla-admin__wrapper">
        <table className="tabla-admin">
          <caption className="visually-hidden">Clientes registrados</caption>
          <thead>
            <tr>
              <th scope="col">Cliente</th>
              <th scope="col">Email</th>
              <th scope="col">Dirección</th>
              <th scope="col" className="num">
                Pedidos
              </th>
              <th scope="col" className="num">
                Total comprado
              </th>
              <th scope="col">Estado</th>
              <th scope="col">Acciones</th>
            </tr>
          </thead>
          <tbody>
            {clientes.map((cliente) => (
              <tr key={cliente.id}>
                <th scope="row" data-label="Cliente">
                  {cliente.nombre} {cliente.apellido}
                </th>
                <td data-label="Email">
                  <a href={`mailto:${cliente.email}`}>{cliente.email}</a>
                </td>
                <td data-label="Dirección">{cliente.direccion}</td>
                <td data-label="Pedidos" className="num">
                  {cliente.cantidadPedidos}
                </td>
                <td data-label="Total comprado" className="num">
                  {formatPrecio(cliente.totalComprado)}
                </td>
                <td data-label="Estado">
                  <Badge tone={cliente.activo ? "success" : "danger"}>
                    {cliente.activo ? "Activa" : "Desactivada"}
                  </Badge>
                </td>
                <td data-label="Acciones">
                  <div className="tabla-admin__acciones">
                    <Button
                      size="sm"
                      variant={cliente.activo ? "danger" : "outline"}
                      onClick={() => cambiarEstado(cliente)}
                    >
                      {cliente.activo ? "Desactivar" : "Reactivar"}
                      <span className="visually-hidden">
                        {" "}
                        la cuenta de {cliente.nombre} {cliente.apellido}
                      </span>
                    </Button>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    );
  }

  return (
    <div className="section">
      <title>Clientes | Administración OCN</title>
      <div className="container">
        <PageHeader
          headingRef={headingRef}
          title="Clientes"
          description="Cuentas registradas, lo que compró cada una (sin contar pedidos cancelados) y su estado. Una cuenta desactivada no puede iniciar sesión ni comprar."
        />
        {renderContenido()}
      </div>
    </div>
  );
}
