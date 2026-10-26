import { useRef, useState } from "react";
import Button from "../ui/Button.jsx";
import FormField from "../ui/FormField.jsx";
import { AlertIcon } from "../ui/Icons.jsx";
import ProductImage from "../productos/ProductImage.jsx";
import { CATEGORIAS_SUGERIDAS } from "../../utils/negocio.js";
import { LIMITES, PRODUCTO_VACIO, toProductoPayload, validateProducto } from "../../utils/productoForm.js";
import "./ProductForm.css";

const ORDEN_CAMPOS = Object.keys(PRODUCTO_VACIO).filter((campo) => campo !== "activo");

/**
 * Formulario de alta y edición de productos.
 * `onSubmit` recibe el cuerpo listo para la API y debe devolver una promesa;
 * si la promesa falla, los datos ingresados se conservan para poder reintentar.
 */
export default function ProductForm({ initialValues = PRODUCTO_VACIO, submitLabel, onSubmit, onCancel }) {
  const [values, setValues] = useState(initialValues);
  const [errors, setErrors] = useState({});
  const [touched, setTouched] = useState({});
  const [submitError, setSubmitError] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const formRef = useRef(null);
  const submitErrorRef = useRef(null);

  function updateField(event) {
    const { name, value } = event.target;
    const nextValues = { ...values, [name]: value };
    setValues(nextValues);
    if (touched[name]) {
      setErrors(validateProducto(nextValues));
    }
  }

  function handleBlur(event) {
    const { name } = event.target;
    setTouched((prev) => ({ ...prev, [name]: true }));
    setErrors(validateProducto(values));
  }

  async function handleSubmit(event) {
    event.preventDefault();
    if (isSubmitting) return;

    const validationErrors = validateProducto(values);
    setErrors(validationErrors);
    setTouched(Object.fromEntries(ORDEN_CAMPOS.map((campo) => [campo, true])));

    const primerCampoInvalido = ORDEN_CAMPOS.find((campo) => validationErrors[campo]);
    if (primerCampoInvalido) {
      formRef.current?.elements.namedItem(primerCampoInvalido)?.focus();
      return;
    }

    setSubmitError("");
    setIsSubmitting(true);
    try {
      await onSubmit(toProductoPayload(values));
    } catch (error) {
      setSubmitError(error.message);
      setIsSubmitting(false);
      requestAnimationFrame(() => submitErrorRef.current?.focus());
    }
  }

  const visibleError = (campo) => (touched[campo] ? errors[campo] : undefined);
  const fieldProps = (field) => ({
    ...field,
    value: values[field.name],
    onChange: updateField,
    onBlur: handleBlur,
    disabled: isSubmitting,
  });

  const imagenValida = values.imagen.trim() && !errors.imagen;

  return (
    <form ref={formRef} className="product-form" onSubmit={handleSubmit} noValidate aria-busy={isSubmitting}>
      <p className="product-form__legend text-muted">
        Los campos marcados con <span aria-hidden="true">*</span>
        <span className="visually-hidden">asterisco</span> son obligatorios.
      </p>

      {submitError && (
        <div ref={submitErrorRef} className="product-form__alert" role="alert" tabIndex={-1}>
          <AlertIcon size={20} />
          <p>
            <strong>No se pudo guardar el producto.</strong> {submitError}
          </p>
        </div>
      )}

      <fieldset className="product-form__section">
        <legend>Datos generales</legend>
        <div className="product-form__grid">
          <FormField id="nombre" label="Nombre" required error={visibleError("nombre")} className="span-2">
            {(field) => <input type="text" maxLength={LIMITES.nombre} autoComplete="off" {...fieldProps(field)} />}
          </FormField>

          <FormField
            id="categoria"
            label="Categoría"
            required
            hint="Elegí una sugerencia o escribí una nueva."
            error={visibleError("categoria")}
          >
            {(field) => (
              <>
                <input
                  type="text"
                  list="categorias-sugeridas"
                  maxLength={LIMITES.categoria}
                  autoComplete="off"
                  {...fieldProps(field)}
                />
                <datalist id="categorias-sugeridas">
                  {CATEGORIAS_SUGERIDAS.map((categoria) => (
                    <option key={categoria} value={categoria} />
                  ))}
                </datalist>
              </>
            )}
          </FormField>

          <FormField id="talle" label="Talle" hint="Por ejemplo: S, M, L, 42 o Único." error={visibleError("talle")}>
            {(field) => <input type="text" maxLength={LIMITES.talle} autoComplete="off" {...fieldProps(field)} />}
          </FormField>

          <FormField id="color" label="Color" error={visibleError("color")}>
            {(field) => <input type="text" maxLength={LIMITES.color} autoComplete="off" {...fieldProps(field)} />}
          </FormField>

          <FormField
            id="descripcion"
            label="Descripción"
            hint={`Hasta ${LIMITES.descripcion} caracteres (${values.descripcion.length} usados).`}
            error={visibleError("descripcion")}
            className="span-2"
          >
            {(field) => <textarea rows={4} maxLength={LIMITES.descripcion} {...fieldProps(field)} />}
          </FormField>
        </div>
      </fieldset>

      <fieldset className="product-form__section">
        <legend>Precio y stock</legend>
        <div className="product-form__grid">
          <FormField id="precio" label="Precio (ARS)" required error={visibleError("precio")}>
            {(field) => <input type="number" min="0" step="0.01" inputMode="decimal" {...fieldProps(field)} />}
          </FormField>

          <FormField id="stock" label="Stock" required hint="Unidades disponibles." error={visibleError("stock")}>
            {(field) => <input type="number" min="0" step="1" inputMode="numeric" {...fieldProps(field)} />}
          </FormField>
        </div>
      </fieldset>

      <fieldset className="product-form__section">
        <legend>Imagen</legend>
        <div className="product-form__image-row">
          <FormField
            id="imagen"
            label="URL de la imagen"
            hint="Dirección pública de la foto del producto (http:// o https://)."
            error={visibleError("imagen")}
          >
            {(field) => <input type="url" inputMode="url" autoComplete="off" {...fieldProps(field)} />}
          </FormField>
          <figure className="product-form__preview">
            <ProductImage
              key={imagenValida ? values.imagen : "vacia"}
              src={imagenValida ? values.imagen.trim() : ""}
              alt="Vista previa de la imagen del producto"
              className="product-form__preview-image"
              placeholderLabel="Vista previa"
            />
            <figcaption className="visually-hidden">Vista previa de la imagen</figcaption>
          </figure>
        </div>
      </fieldset>

      <label className="product-form__activo">
        <input
          type="checkbox"
          name="activo"
          checked={values.activo !== false}
          disabled={isSubmitting}
          onChange={(event) => setValues((actuales) => ({ ...actuales, activo: event.target.checked }))}
        />
        <span>
          <strong>Producto activo</strong>
          <span className="text-muted"> Si lo desactivás, deja de verse en el catálogo pero no se borra.</span>
        </span>
      </label>

      <div className="product-form__actions">
        <Button variant="ghost" onClick={onCancel} disabled={isSubmitting}>
          Cancelar
        </Button>
        <Button type="submit" isLoading={isSubmitting}>
          {isSubmitting ? "Guardando…" : submitLabel}
        </Button>
      </div>
    </form>
  );
}
