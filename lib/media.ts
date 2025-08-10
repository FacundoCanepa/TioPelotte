import { toMediaURL } from "@/utils/media";

type MediaLike = { url: string };

export function resolveStrapiMediaUrl(
  input: number | MediaLike | MediaLike[] | null | undefined
): string | undefined {
  if (!input) return undefined;

  if (Array.isArray(input)) {
    return resolveStrapiMediaUrl(input[0]);
  }

  if (typeof input === "object" && "url" in input && typeof input.url === "string") {
    const url = toMediaURL(input.url);
    return url || undefined;
  }

  return undefined;
}