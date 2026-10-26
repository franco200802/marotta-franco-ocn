import { Link } from "react-router-dom";
import "./Button.css";

/**
 * Botón con las variantes del diseño:
 *  - primary: acento naranja ("Ver catálogo")
 *  - outline: borde charcoal ("Escribinos por WhatsApp")
 *  - ghost / danger: acciones secundarias y destructivas
 * Renderiza <Link> si recibe `to`, <a> si recibe `href` y <button> en otro caso.
 */
export default function Button({
  variant = "primary",
  size = "md",
  to,
  href,
  icon,
  isLoading = false,
  className = "",
  children,
  type = "button",
  disabled,
  ...props
}) {
  const classes = ["btn", `btn--${variant}`, `btn--${size}`, className].filter(Boolean).join(" ");
  const content = (
    <>
      {isLoading ? <span className="btn__spinner" aria-hidden="true" /> : icon}
      <span>{children}</span>
    </>
  );

  if (to) {
    return (
      <Link to={to} className={classes} {...props}>
        {content}
      </Link>
    );
  }

  if (href) {
    const isExternal = /^https?:\/\//.test(href);
    return (
      <a
        href={href}
        className={classes}
        {...(isExternal ? { target: "_blank", rel: "noopener noreferrer" } : {})}
        {...props}
      >
        {content}
        {isExternal && <span className="visually-hidden"> (se abre en una pestaña nueva)</span>}
      </a>
    );
  }

  return (
    <button
      type={type}
      className={classes}
      disabled={disabled || isLoading}
      aria-busy={isLoading || undefined}
      {...props}
    >
      {content}
    </button>
  );
}
