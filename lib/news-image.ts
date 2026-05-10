export function resolveNewsImageUrl(
  featuredImage: string | null | undefined,
  apiBase: string
): string | null {
  if (!featuredImage) return null;

  const value = featuredImage.trim().replace(/^['"]|['"]$/g, "");
  if (!value) return null;

  if (
    value.startsWith("http://") ||
    value.startsWith("https://") ||
    value.startsWith("data:")
  ) {
    return value;
  }

  const normalized = value.replace(/\\/g, "/");
  const pathOnly = normalized.split(/[?#]/)[0];
  const base = apiBase.replace(/\/$/, "");
  const apiNewsImagesMarker = "/api/news/images/";
  const uploadsMarker = "/uploads/news-images/";

  if (pathOnly.startsWith(apiNewsImagesMarker) || pathOnly.startsWith(uploadsMarker)) {
    return `${base}${pathOnly}`;
  }

  const apiPathIndex = pathOnly.indexOf(apiNewsImagesMarker);
  if (apiPathIndex >= 0) {
    return `${base}${pathOnly.substring(apiPathIndex)}`;
  }

  const uploadsPathIndex = pathOnly.indexOf(uploadsMarker);
  if (uploadsPathIndex >= 0) {
    return `${base}${pathOnly.substring(uploadsPathIndex)}`;
  }

  const fileName = pathOnly.includes("/")
    ? pathOnly.split("/").pop() || pathOnly
    : pathOnly;

  return `${base}${apiNewsImagesMarker}${encodeURIComponent(fileName)}`;
}
