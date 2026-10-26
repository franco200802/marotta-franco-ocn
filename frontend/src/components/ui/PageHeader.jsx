import "./PageHeader.css";

/** Encabezado de pantalla: antetítulo, título principal, descripción y acciones. */
export default function PageHeader({ eyebrow, title, description, actions, headingRef }) {
  return (
    <header className="page-header">
      <div className="page-header__text">
        {eyebrow && <p className="page-header__eyebrow">{eyebrow}</p>}
        <h1 ref={headingRef} tabIndex={headingRef ? -1 : undefined}>
          {title}
        </h1>
        {description && <p className="page-header__description">{description}</p>}
      </div>
      {actions && <div className="page-header__actions">{actions}</div>}
    </header>
  );
}
