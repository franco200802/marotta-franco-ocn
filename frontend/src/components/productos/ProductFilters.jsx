import { SearchIcon } from "../ui/Icons.jsx";
import "./ProductFilters.css";

/**
 * Búsqueda y filtros. El filtrado se hace en el navegador sobre los productos ya obtenidos
 * de la API (la API no ofrece filtros).
 */
export default function ProductFilters({
  idPrefix,
  query,
  onQueryChange,
  searchLabel = "Buscar",
  searchPlaceholder,
  filtros = [],
}) {
  return (
    <form className="product-filters" role="search" onSubmit={(event) => event.preventDefault()}>
      <div className="product-filters__field product-filters__field--search">
        <label htmlFor={`${idPrefix}-buscar`}>{searchLabel}</label>
        <div className="product-filters__search">
          <SearchIcon size={18} className="product-filters__search-icon" />
          <input
            id={`${idPrefix}-buscar`}
            type="search"
            className="form-control"
            value={query}
            placeholder={searchPlaceholder}
            onChange={(event) => onQueryChange(event.target.value)}
          />
        </div>
      </div>

      {filtros.map(({ id, label, value, onChange, opciones, todas }) => (
        <div key={id} className="product-filters__field">
          <label htmlFor={`${idPrefix}-${id}`}>{label}</label>
          <select
            id={`${idPrefix}-${id}`}
            className="form-control"
            value={value}
            onChange={(event) => onChange(event.target.value)}
          >
            {todas && <option value="">{todas}</option>}
            {opciones.map((opcion) => (
              <option key={opcion.value} value={opcion.value}>
                {opcion.label}
              </option>
            ))}
          </select>
        </div>
      ))}
    </form>
  );
}
