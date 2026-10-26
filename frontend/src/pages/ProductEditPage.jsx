import { Link, useNavigate, useParams } from "react-router-dom";
import PageHeader from "../components/ui/PageHeader.jsx";
import Button from "../components/ui/Button.jsx";
import { ErrorMessage, Loading } from "../components/ui/Feedback.jsx";
import { ArrowLeftIcon } from "../components/ui/Icons.jsx";
import ProductForm from "../components/forms/ProductForm.jsx";
import { useProducto } from "../hooks/useProductos.js";
import { useToast } from "../hooks/useToast.js";
import { updateProducto } from "../services/productoService.js";
import { productoToFormValues } from "../utils/productoForm.js";
import "./AdminProductsPage.css";

/** Edición de producto: carga con GET /api/productos/:codigo y guarda con PUT. */
export default function ProductEditPage() {
  const { codigo } = useParams();
  const navigate = useNavigate();
  const toast = useToast();
  const { producto, isLoading, error, reload } = useProducto(codigo);

  async function handleUpdate(payload) {
    const actualizado = await updateProducto(codigo, payload);
    toast.success(`Se guardaron los cambios de "${actualizado.nombre}".`, "Producto actualizado");
    navigate("/admin/productos");
  }

  function renderContenido() {
    if (isLoading) return <Loading message="Cargando datos del producto…" />;

    if (error || !producto) {
      return error && !error.isNotFound ? (
        <ErrorMessage title="No pudimos cargar el producto" message={error.message} onRetry={reload} />
      ) : (
        <ErrorMessage
          title="Producto no encontrado"
          message={`No existe un producto con el código #${codigo}. Puede que haya sido eliminado.`}
          action={<Button to="/admin/productos">Volver al listado</Button>}
        />
      );
    }

    return (
      <ProductForm
        key={producto.codigo}
        initialValues={productoToFormValues(producto)}
        submitLabel="Guardar cambios"
        onSubmit={handleUpdate}
        onCancel={() => navigate("/admin/productos")}
      />
    );
  }

  return (
    <div className="section">
      <title>Editar producto | OCN Villa Urquiza</title>
      <div className="container admin-form-page">
        <Link to="/admin/productos" className="back-link">
          <ArrowLeftIcon size={18} />
          Volver a la gestión de productos
        </Link>
        <PageHeader
          eyebrow={`Administración · Código #${codigo}`}
          title="Editar producto"
          description={producto && !isLoading ? producto.nombre : undefined}
        />
        {renderContenido()}
      </div>
    </div>
  );
}
