// utils/media.ts
export function toMediaURL(src?: string | null) {
  if (!src) return "";
  // Si ya es absoluto, devolver tal cual
  if (/^https?:\/\//i.test(src)) return src;

  // Armar con la base de media de Strapi
  const base = (process.env.NEXT_PUBLIC_MEDIA_URL || "").replace(/\/$/, "");
  const path = src.replace(/^\//, "");
  return base ? `${base}/${path}` : `/${path}`;
}
