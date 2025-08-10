const MEDIA = process.env.NEXT_PUBLIC_MEDIA_URL || "";

export function resolveStrapiMediaUrl(input: any): string | undefined {
  if (!input) return undefined;

  const base = MEDIA.replace(/\/$/, "");

  if (Array.isArray(input)) {
    return resolveStrapiMediaUrl(input[0]);
  }

  if (typeof input === "object") {
    if ("url" in input && typeof (input as any).url === "string") {
      const url = (input as any).url as string;
      return url.startsWith("http") ? url : base ? `${base}${url}` : url;
    }
  }

  if (typeof input === "string") {
    if (input.startsWith("http") || input.startsWith("data:")) {
      return input;
    }
    const path = input.startsWith("/") ? input : `/${input}`;
    return base ? `${base}${path}` : path;
  }

  return undefined;
}