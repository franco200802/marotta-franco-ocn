import { Navigate, useLocation } from "react-router-dom";
import { Loading } from "../ui/Feedback.jsx";
import { ErrorMessage } from "../ui/Feedback.jsx";
import Button from "../ui/Button.jsx";
import { useAuth } from "../../hooks/useAuth.js";

/** Protege una pantalla: exige sesión y, si se indica, un rol. */
export default function RequireAuth({ rol, children }) {
  const { usuario, cargando } = useAuth();
  const location = useLocation();

  if (cargando) {
    return (
      <div className="container section">
        <Loading message="Revisando tu sesión…" />
      </div>
    );
  }

  if (!usuario) {
    return <Navigate to="/ingresar" replace state={{ volver: location.pathname + location.search }} />;
  }

  if (rol && usuario.rol !== rol) {
    return (
      <div className="container section">
        <ErrorMessage
          title="Esta sección no es para tu cuenta"
          message={
            rol === "admin"
              ? "Solo el administrador del local puede entrar acá."
              : "Iniciá sesión con una cuenta de cliente para comprar y ver pedidos."
          }
          action={<Button to="/">Volver al inicio</Button>}
        />
      </div>
    );
  }

  return children;
}
