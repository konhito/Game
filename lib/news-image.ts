export function resolveNewsImageUrl(
  featuredImage: string | null | undefined,
  apiBase: string
): string | null {
  if (!featuredImage) return null;

  const value = featuredImage.trim();
  if (!value) return null;

  if (
    value.startsWith("http://") ||
    value.startsWith("https://") ||
    value.startsWith("data:")
  ) {
    return value;
  }

  const normalized = value.replace(/\\/g, "/");
  const base = apiBase.replace(/\/$/, "");

  if (
    normalized.startsWith("/api/news/images/") ||
    normalized.startsWith("/uploads/news-images/")
  ) {
    return `${base}${normalized}`;
  }

  if (
    normalized.includes("/api/news/images/") ||
    normalized.includes("/uploads/news-images/")
  ) {
    const suffix = normalized.substring(normalized.indexOf("/"));
    return `${base}${suffix}`;
  }

  const fileName = normalized.includes("/")
    ? normalized.split("/").pop() || normalized
    : normalized;

  return `${base}/api/news/images/${fileName}`;
}

