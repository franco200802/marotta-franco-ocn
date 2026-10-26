import Button from "../ui/Button.jsx";
import { EditIcon, TrashIcon } from "../ui/Icons.jsx";
import ProductImage from "./ProductImage.jsx";
import ProductoArte from "./ProductoArte.jsx";
import StockRapido from "./StockRapido.jsx";
import Badge from "../ui/Badge.jsx";
import { formatPrecio, textoOGuion } from "../../utils/format.js";
import "./ProductTable.css";

/** Tabla de administración. En pantallas chicas cada fila se muestra como una tarjeta. */
export default function ProductTable({ productos, onDelete, onStock, caption }) {
  return (
    <div className="product-table__wrapper">
      <table className="product-table">
        <caption className="visually-hidden">{caption}</caption>
        <thead>
          <tr>
            <th scope="col">Código</th>
            <th scope="col">Producto</th>
            <th scope="col">Categoría</th>
            <th scope="col">Talle</th>
            <th scope="col">Color</th>
            <th scope="col" className="product-table__numeric">
              Precio
            </th>
            <th scope="col">Stock</th>
            <th scope="col">Estado</th>
            <th scope="col">
              <span className="visually-hidden">Acciones</span>
            </th>
          </tr>
        </thead>
        <tbody>
          {productos.map((producto) => (
            <tr key={producto.codigo}>
              <td data-label="Código" className="product-table__code">
                #{producto.codigo}
              </td>
              <th scope="row" className="product-table__product-cell">
                <div className="product-table__product">
                  {producto.imagen ? (
                    <ProductImage src={producto.imagen} alt="" className="product-table__thumb" placeholderLabel="" />
                  ) : (
                    <span className="product-table__thumb product-table__thumb--arte">
                      <ProductoArte nombre={producto.nombre} categoria={producto.categoria} color={producto.color} />
                    </span>
                  )}
                  <span>{producto.nombre}</span>
                </div>
              </th>
              <td data-label="Categoría">{producto.categoria}</td>
              <td data-label="Talle">{textoOGuion(producto.talle)}</td>
              <td data-label="Color">{textoOGuion(producto.color)}</td>
              <td data-label="Precio" className="product-table__numeric">
                {formatPrecio(producto.precio)}
              </td>
              <td data-label="Stock">
                <StockRapido key={producto.stock} producto={producto} onGuardar={onStock} />
              </td>
              <td data-label="Estado">
                {producto.activo === false ? (
                  <Badge tone="neutral">Desactivado</Badge>
                ) : producto.stock > 0 ? (
                  <Badge tone="success">A la venta</Badge>
                ) : (
                  <Badge tone="danger">Sin stock</Badge>
                )}
              </td>
              <td className="product-table__actions">
                <Button
                  variant="ghost"
                  size="sm"
                  to={`/admin/productos/${producto.codigo}/editar`}
                  icon={<EditIcon size={16} />}
                  aria-label={`Editar ${producto.nombre}`}
                >
                  Editar
                </Button>
                <Button
                  variant="danger-ghost"
                  size="sm"
                  icon={<TrashIcon size={16} />}
                  onClick={() => onDelete(producto)}
                  aria-label={`Eliminar ${producto.nombre}`}
                >
                  Eliminar
                </Button>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
