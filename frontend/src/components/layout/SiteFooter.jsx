import { NEGOCIO, whatsappUrl } from "../../utils/negocio.js";
import "./SiteFooter.css";

/** Footer del mockup: datos del local, horarios y canales de contacto. */
export default function SiteFooter() {
  return (
    <footer id="contacto" className="site-footer">
      <div className="container site-footer__inner">
        <div className="site-footer__brand">
          <h2 className="site-footer__title">{NEGOCIO.nombre}</h2>
          <address className="site-footer__address">{NEGOCIO.direccion}</address>
        </div>

        <ul className="site-footer__contact">
          <li>{NEGOCIO.horario}</li>
          <li>
            <a href={whatsappUrl()} target="_blank" rel="noopener noreferrer">
              {NEGOCIO.whatsapp} · WhatsApp
              <span className="visually-hidden"> (se abre en una pestaña nueva)</span>
            </a>
          </li>
          <li>
            <a href={NEGOCIO.instagramUrl} target="_blank" rel="noopener noreferrer">
              {NEGOCIO.instagram}
              <span className="visually-hidden"> en Instagram (se abre en una pestaña nueva)</span>
            </a>
          </li>
        </ul>
      </div>
    </footer>
  );
}
