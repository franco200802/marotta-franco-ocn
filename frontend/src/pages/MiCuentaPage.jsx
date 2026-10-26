import { useNavigate } from "react-router-dom";
import PageHeader from "../components/ui/PageHeader.jsx";
import Button from "../components/ui/Button.jsx";
import CuentaForm from "../components/forms/CuentaForm.jsx";
import { ListIcon, LogoutIcon } from "../components/ui/Icons.jsx";
import { useAuth } from "../hooks/useAuth.js";
import { useToast } from "../hooks/useToast.js";
import { actualizarPerfil } from "../services/clienteService.js";
import { PASSWORD_MIN, validarPerfil } from "../utils/validation.js";
import "./CuentaPages.css";

const CAMPOS = [
  { id: "nombre", label: "Nombre", autoComplete: "given-name" },
  { id: "apellido", label: "Apellido", autoComplete: "family-name" },
  { id: "email", label: "Email", type: "email", autoComplete: "email" },
  { id: "direccion", label: "Dirección", autoComplete: "street-address" },
  {
    id: "password",
    label: "Nueva contraseña",
    type: "password",
    autoComplete: "new-password",
    required: false,
    hint: `Dejala vacía para no cambiarla. Mínimo ${PASSWORD_MIN} caracteres.`,
  },
];

export default function MiCuentaPage() {
  const { usuario, actualizarUsuario, cerrarSesion } = useAuth();
  const toast = useToast();
  const navigate = useNavigate();

  async function guardar(valores) {
    const datos = { ...valores };
    if (!datos.password) delete datos.password;
    const actualizado = await actualizarPerfil(datos);
    actualizarUsuario(actualizado);
    toast.success("Tus datos quedaron actualizados.", "Datos guardados");
  }

  function salir() {
    cerrarSesion();
    toast.info("Cerraste la sesión. ¡Hasta la próxima!");
    navigate("/");
  }

  return (
    <div className="section section--stone">
      <title>Mi cuenta | OCN Villa Urquiza</title>
      <div className="container">
        <PageHeader
          title="Mi cuenta"
          actions={
            <>
              <Button variant="outline" to="/mis-pedidos" icon={<ListIcon size={18} />}>
                Mis pedidos
              </Button>
              <Button variant="ghost" onClick={salir} icon={<LogoutIcon size={18} />}>
                Cerrar sesión
              </Button>
            </>
          }
        />
        <div className="cuenta__caja cuenta__caja--ancha parche parche--blanco">
          <h2>Tus datos</h2>
          <CuentaForm
            campos={CAMPOS}
            valoresIniciales={{
              nombre: usuario.nombre,
              apellido: usuario.apellido,
              email: usuario.email,
              direccion: usuario.direccion,
              password: "",
            }}
            validar={validarPerfil}
            onSubmit={guardar}
            submitLabel="Guardar cambios"
            enviandoLabel="Guardando…"
          />
        </div>
      </div>
    </div>
  );
}
