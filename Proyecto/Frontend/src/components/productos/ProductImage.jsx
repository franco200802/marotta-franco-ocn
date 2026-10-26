import { useState } from "react";
import PhotoPlaceholder from "../ui/PhotoPlaceholder.jsx";

/** Imagen del producto (URL cargada en el backend) con el placeholder del mockup como respaldo. */
export default function ProductImage({ src, alt, className = "", placeholderLabel = "Sin imagen" }) {
  const [failedSrc, setFailedSrc] = useState(null);
  const hasImage = typeof src === "string" && src.trim() !== "" && failedSrc !== src;

  if (!hasImage) {
    return <PhotoPlaceholder label={placeholderLabel} className={className} />;
  }

  return <img src={src} alt={alt} className={className} loading="lazy" onError={() => setFailedSrc(src)} />;
}
