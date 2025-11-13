export default function formatText(
  text: string,
  style: "lowercase" | "uppercase" | "capitalize" = "lowercase"
): string {
  if (!text) return "";

  const normalized = text
    .replace(/[_\-]+/g, " ")
    .replace(/\s+/g, " ")
    .trim();

  switch (style) {
    case "uppercase":
      return normalized.toUpperCase();

    case "capitalize":
      return normalized
        .toLowerCase()
        .replace(/\b\w/g, (char) => char.toUpperCase());

    case "lowercase":
    default:
      return normalized.toLowerCase();
  }
}
