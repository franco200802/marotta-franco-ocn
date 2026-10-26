import { Link, useNavigate } from "react-router-dom";
import PageHeader from "../components/ui/PageHeader.jsx";
import { ArrowLeftIcon } from "../components/ui/Icons.jsx";
import ProductForm from "../components/forms/ProductForm.jsx";
import { useToast } from "../hooks/useToast.js";
import { createProducto } from "../services/productoService.js";
import "./AdminProductsPage.css";

/** Alta de producto con POST /api/productos. */
export default function ProductCreatePage() {
  const navigate = useNavigate();
  const toast = useToast();

  async function handleCreate(payload) {
    const creado = await createProducto(payload);
    toast.success(`"${creado.nombre}" se registró con el código #${creado.codigo}.`, "Producto creado");
    navigate("/admin/productos");
  }

  return (
    <div className="section">
      <title>Nuevo producto | OCN Villa Urquiza</title>
      <div className="container admin-form-page">
        <Link to="/admin/productos" className="back-link">
          <ArrowLeftIcon size={18} />
          Volver a la gestión de productos
        </Link>
        <PageHeader eyebrow="Administración" title="Nuevo producto" />
        <ProductForm submitLabel="Crear producto" onSubmit={handleCreate} onCancel={() => navigate("/admin/productos")} />
      </div>
    </div>
  );
}
