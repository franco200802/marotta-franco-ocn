/*
 * Las letras OCN infladas, dibujadas en 2D. Es el respaldo del objeto 3D cuando no hay WebGL,
 * cuando se prefiere menos movimiento o mientras carga.
 */
export default function LetrasOcn({ tinte = "#FF5A1F", className = "", titulo }) {
  return (
    <svg
      className={className}
      viewBox="-24 -8 584 276"
      role={titulo ? "img" : undefined}
      aria-label={titulo}
      aria-hidden={titulo ? undefined : true}
      focusable="false"
    >
      <g fill="none" strokeLinecap="round" strokeLinejoin="round">
        <g stroke="#F3EFE7" strokeWidth="96">
          <circle cx="110" cy="130" r="72" />
          <path d="M318 74a72 72 0 1 0 0 112" />
          <path d="M392 196V64l92 132V64" />
        </g>
        <g stroke={tinte} strokeWidth="70" style={{ transition: "stroke 400ms ease" }}>
          <circle cx="110" cy="130" r="72" />
          <path d="M318 74a72 72 0 1 0 0 112" />
          <path d="M392 196V64l92 132V64" />
        </g>
        <g stroke="#ffffff" strokeWidth="12" opacity="0.35">
          <path d="M62 96a60 60 0 0 1 46-30" />
          <path d="M268 92a58 58 0 0 1 30-26" />
          <path d="M392 90v-18" />
          <path d="M484 90v-18" />
        </g>
      </g>
    </svg>
  );
}
