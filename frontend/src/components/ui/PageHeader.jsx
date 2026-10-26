import "./PageHeader.css";

/** Encabezado de pantalla: título principal, descripción y acciones. */
export default function PageHeader({ title, description, actions, headingRef }) {
  return (
    <header className="page-header">
      <div className="page-header__text">
        <h1 ref={headingRef} tabIndex={headingRef ? -1 : undefined}>
          {title}
        </h1>
        {description && <p className="page-header__description">{description}</p>}
      </div>
      {actions && <div className="page-header__actions">{actions}</div>}
    </header>
  );
}
