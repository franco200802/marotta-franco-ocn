import { useEffect, useState } from "react";
import { Link, NavLink } from "react-router-dom";
import { CloseIcon, MenuIcon } from "../ui/Icons.jsx";
import "./SiteHeader.css";

const navLinkClass = ({ isActive }) => `site-nav__link${isActive ? " site-nav__link--active" : ""}`;

/** Navbar del mockup: logo OCN a la izquierda y enlaces a la derecha sobre fondo charcoal. */
export default function SiteHeader() {
  const [isMenuOpen, setIsMenuOpen] = useState(false);

  useEffect(() => {
    if (!isMenuOpen) return undefined;
    const handleKeyDown = (event) => {
      if (event.key === "Escape") setIsMenuOpen(false);
    };
    document.addEventListener("keydown", handleKeyDown);
    return () => document.removeEventListener("keydown", handleKeyDown);
  }, [isMenuOpen]);

  const closeMenu = () => setIsMenuOpen(false);

  return (
    <header className="site-header">
      <div className="container site-header__inner">
        <Link to="/" className="site-header__logo" onClick={closeMenu}>
          OCN<span className="visually-hidden"> Villa Urquiza — Inicio</span>
        </Link>

        <button
          type="button"
          className="site-header__toggle"
          aria-expanded={isMenuOpen}
          aria-controls="menu-principal"
          onClick={() => setIsMenuOpen((open) => !open)}
        >
          {isMenuOpen ? <CloseIcon size={24} /> : <MenuIcon size={24} />}
          <span className="visually-hidden">{isMenuOpen ? "Cerrar menú" : "Abrir menú"}</span>
        </button>

        <nav aria-label="Principal" className={`site-nav${isMenuOpen ? " site-nav--open" : ""}`}>
          <ul id="menu-principal" className="site-nav__list" onClick={closeMenu}>
            <li>
              <NavLink to="/" end className={navLinkClass}>
                Inicio
              </NavLink>
            </li>
            <li>
              <NavLink to="/productos" className={navLinkClass}>
                Productos
              </NavLink>
            </li>
            <li>
              <Link to="/#sobre-nosotros" className="site-nav__link">
                Sobre Nosotros
              </Link>
            </li>
            <li>
              <a href="#contacto" className="site-nav__link">
                Contacto
              </a>
            </li>
            <li>
              <NavLink to="/admin/productos" className={navLinkClass}>
                Administración
              </NavLink>
            </li>
          </ul>
        </nav>
      </div>
    </header>
  );
}
