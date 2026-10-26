/* Íconos SVG en línea (decorativos: el texto accesible lo aporta el control que los contiene). */
function Svg({ children, size = 20, ...props }) {
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden="true"
      focusable="false"
      {...props}
    >
      {children}
    </svg>
  );
}

export function MenuIcon(props) {
  return <Svg {...props}><path d="M4 7h16M4 12h16M4 17h16" /></Svg>;
}

export function CloseIcon(props) {
  return <Svg {...props}><path d="M6 6l12 12M18 6L6 18" /></Svg>;
}

export function PlusIcon(props) {
  return <Svg {...props}><path d="M12 5v14M5 12h14" /></Svg>;
}

export function EditIcon(props) {
  return <Svg {...props}><path d="M4 20h4L19 9l-4-4L4 16v4z" /><path d="M13.5 6.5l4 4" /></Svg>;
}

export function TrashIcon(props) {
  return (
    <Svg {...props}>
      <path d="M4 7h16M9 7V4h6v3M6 7l1 13h10l1-13" />
      <path d="M10 11v6M14 11v6" />
    </Svg>
  );
}

export function ArrowLeftIcon(props) {
  return <Svg {...props}><path d="M19 12H5M11 18l-6-6 6-6" /></Svg>;
}

export function SearchIcon(props) {
  return <Svg {...props}><circle cx="11" cy="11" r="7" /><path d="M20 20l-3.5-3.5" /></Svg>;
}

export function AlertIcon(props) {
  return <Svg {...props}><circle cx="12" cy="12" r="9" /><path d="M12 7v6M12 16.5v.5" /></Svg>;
}

export function CheckIcon(props) {
  return <Svg {...props}><circle cx="12" cy="12" r="9" /><path d="M8 12.5l2.5 2.5L16 9.5" /></Svg>;
}

export function RefreshIcon(props) {
  return <Svg {...props}><path d="M20 11a8 8 0 1 0-2.3 5.7M20 4v7h-7" /></Svg>;
}

export function BoxIcon(props) {
  return (
    <Svg {...props}>
      <path d="M3 7.5L12 3l9 4.5v9L12 21l-9-4.5v-9z" />
      <path d="M3 7.5l9 4.5 9-4.5M12 12v9" />
    </Svg>
  );
}

export function StarIcon(props) {
  return (
    <Svg fill="currentColor" stroke="none" {...props}>
      <path d="M12 3.5l2.6 5.3 5.9.9-4.3 4.1 1 5.8L12 16.9l-5.2 2.7 1-5.8-4.3-4.1 5.9-.9z" />
    </Svg>
  );
}
