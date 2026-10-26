import PageHeader from "../../components/ui/PageHeader.jsx";
import { EmptyState, ErrorMessage, Loading } from "../../components/ui/Feedback.jsx";
import { useApiResource } from "../../hooks/useApiResource.js";
import { getClientes } from "../../services/clienteService.js";
import { formatPrecio } from "../../utils/format.js";
import "./AdminPages.css";

const fetchClientes = (signal) => getClientes({ signal });

export default function AdminClientesPage() {
  const { data: clientes, isLoading, error, reload } = useApiResource(fetchClientes);

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
          title="Clientes"
          description="Cuentas registradas y lo que compró cada una (sin contar pedidos cancelados)."
        />
        {renderContenido()}
      </div>
    </div>
  );
}
