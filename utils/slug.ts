// Lightweight Spanish-friendly slugifier without external deps
export function slugifyEs(input: string): string {
  return input
    .toString()
    .normalize('NFD') // split accented characters
    .replace(/[\u0300-\u036f]/g, '') // remove diacritics
    .toLowerCase()
    .replace(/[^a-z0-9\s-]/g, '') // keep alnum, space, dash
    .trim()
    .replace(/[\s_-]+/g, '-') // collapse whitespace/underscores
    .replace(/^-+|-+$/g, '');
}

