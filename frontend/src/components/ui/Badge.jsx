import "./Badge.css";

/** Etiqueta de estado. El texto siempre acompaña al color. */
export default function Badge({ tone = "neutral", children }) {
  return <span className={`badge badge--${tone}`}>{children}</span>;
}
