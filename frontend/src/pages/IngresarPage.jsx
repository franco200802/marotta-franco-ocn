import { Link, useLocation, useNavigate } from "react-router-dom";
import CuentaForm from "../components/forms/CuentaForm.jsx";
import { useAuth } from "../hooks/useAuth.js";
import { useToast } from "../hooks/useToast.js";
import { validarIngreso } from "../utils/validation.js";
import "./CuentaPages.css";

const CAMPOS = [
  { id: "email", label: "Email", type: "email", autoComplete: "email" },
  { id: "password", label: "Contraseña", type: "password", autoComplete: "current-password" },
];

export default function IngresarPage() {
  const { iniciarSesion } = useAuth();
  const toast = useToast();
  const navigate = useNavigate();
  const location = useLocation();
  const volver = location.state?.volver;

  async function ingresar(valores) {
    const usuario = await iniciarSesion({ email: valores.email.trim(), password: valores.password });
    toast.success(`Hola, ${usuario.nombre}.`, "Sesión iniciada");
    navigate(volver ?? (usuario.rol === "admin" ? "/admin" : "/"), { replace: true });
  }

  return (
    <div className="section section--stone">
      <title>Ingresar | OCN Villa Urquiza</title>
      <div className="container cuenta">
        <div className="cuenta__caja parche parche--blanco">
          <h1>Ingresar</h1>
          <p className="cuenta__bajada">Para comprar, seguir tus pedidos y ver tu historial.</p>
          <CuentaForm
            campos={CAMPOS}
            valoresIniciales={{ email: "", password: "" }}
            validar={validarIngreso}
            onSubmit={ingresar}
            submitLabel="Ingresar"
            enviandoLabel="Ingresando…"
          />
          <p className="cuenta__alternativa">
            ¿Primera vez?{" "}
            <Link to="/registrarse" state={location.state}>
              Creá tu cuenta
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
}
