/*
 * Datos institucionales del local, relevados en la Ficha Técnica de OCN Villa Urquiza
 * y utilizados en el mockup "OCN Diseño Web". Son contenido estático de la interfaz.
 */
const WHATSAPP_NUMERO_INTERNACIONAL = "5491161066755";

export const NEGOCIO = {
  nombre: "OCN Villa Urquiza",
  direccion: "Bauness 2395 esq. Monroe, C1431, Villa Urquiza, CABA",
  horario: "Lun a Sáb 10:30–19:30 hs",
  whatsapp: "011 6106-6755",
  instagram: "@ocn.villaurquiza",
  instagramUrl: "https://www.instagram.com/ocn.villaurquiza/",
  rating: "4.6 en Google · 24 opiniones",
};

export function whatsappUrl(mensaje) {
  const base = `https://wa.me/${WHATSAPP_NUMERO_INTERNACIONAL}`;
  return mensaje ? `${base}?text=${encodeURIComponent(mensaje)}` : base;
}

/** Categorías de productos que menciona la Ficha Técnica; se ofrecen como sugerencias. */
export const CATEGORIAS_SUGERIDAS = [
  "Remeras",
  "Buzos",
  "Camisas",
  "Jeans",
  "Chinos",
  "Gorras",
  "Billeteras",
  "Cintos",
  "Perfumes",
  "Skates",
];
