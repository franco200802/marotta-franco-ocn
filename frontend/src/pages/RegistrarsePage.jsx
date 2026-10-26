import { Link, useLocation, useNavigate } from "react-router-dom";
import CuentaForm from "../components/forms/CuentaForm.jsx";
import { useAuth } from "../hooks/useAuth.js";
import { useToast } from "../hooks/useToast.js";
import { PASSWORD_MIN, validarRegistro } from "../utils/validation.js";
import "./CuentaPages.css";

const CAMPOS = [
  { id: "nombre", label: "Nombre", autoComplete: "given-name" },
  { id: "apellido", label: "Apellido", autoComplete: "family-name" },
  { id: "email", label: "Email", type: "email", autoComplete: "email" },
  {
    id: "password",
    label: "Contraseña",
    type: "password",
    autoComplete: "new-password",
    hint: `Al menos ${PASSWORD_MIN} caracteres.`,
  },
  { id: "direccion", label: "Dirección", autoComplete: "street-address", hint: "La usamos para los envíos." },
];

export default function RegistrarsePage() {
  const { registrarse } = useAuth();
  const toast = useToast();
  const navigate = useNavigate();
  const location = useLocation();

  async function registrar(valores) {
    const usuario = await registrarse({ ...valores, email: valores.email.trim() });
    toast.success(`Bienvenido/a, ${usuario.nombre}. Ya podés comprar.`, "Cuenta creada");
    navigate(location.state?.volver ?? "/productos", { replace: true });
  }

  return (
    <div className="section section--stone">
      <title>Crear cuenta | OCN Villa Urquiza</title>
      <div className="container cuenta">
        <div className="cuenta__caja parche parche--blanco">
          <h1>Crear cuenta</h1>
          <p className="cuenta__bajada">Te pedimos lo justo para poder mandarte el pedido.</p>
          <CuentaForm
            campos={CAMPOS}
            valoresIniciales={{ nombre: "", apellido: "", email: "", password: "", direccion: "" }}
            validar={validarRegistro}
            onSubmit={registrar}
            submitLabel="Crear cuenta"
            enviandoLabel="Creando cuenta…"
          />
          <p className="cuenta__alternativa">
            ¿Ya tenés cuenta?{" "}
            <Link to="/ingresar" state={location.state}>
              Ingresá
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
}
