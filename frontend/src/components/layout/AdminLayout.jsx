import { NavLink, Outlet } from "react-router-dom";
import RequireAuth from "./RequireAuth.jsx";
import Button from "../ui/Button.jsx";
import { ChartIcon, ListIcon, LogoutIcon, TruckIcon, UsersIcon, BagIcon } from "../ui/Icons.jsx";
import { useAuth } from "../../hooks/useAuth.js";
import "./AdminLayout.css";

const SECCIONES = [
  { to: "/admin/productos", label: "Productos", Icon: BagIcon },
  { to: "/admin/pedidos", label: "Pedidos", Icon: ListIcon },
  { to: "/admin/clientes", label: "Clientes", Icon: UsersIcon },
  { to: "/admin/reportes", label: "Reportes", Icon: ChartIcon },
  { to: "/admin/envios", label: "Envíos", Icon: TruckIcon },
];

/** Panel del administrador: protegido por rol, con navegación por secciones. */
export default function AdminLayout() {
  const { cerrarSesion } = useAuth();

  return (
    <RequireAuth rol="admin">
      <div className="admin">
        <div className="container admin__barra">
          <nav aria-label="Administración">
            <ul className="admin__nav">
              {SECCIONES.map(({ to, label, Icon }) => (
                <li key={to}>
                  <NavLink to={to} className={({ isActive }) => `admin__link${isActive ? " is-active" : ""}`}>
                    <Icon size={18} />
                    {label}
                  </NavLink>
                </li>
              ))}
            </ul>
          </nav>
          <Button variant="ghost" size="sm" icon={<LogoutIcon size={16} />} onClick={cerrarSesion}>
            Cerrar sesión
          </Button>
        </div>
        <Outlet />
      </div>
    </RequireAuth>
  );
}
