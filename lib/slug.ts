export function slugify(text: string) {
  return text
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9\u4e00-\u9fff]+/g, "-")
    .replace(/^-+|-+$/g, "")
    .slice(0, 60) || "item";
}

export function uniqueSlug(base: string, taken: Iterable<string>) {
  const existing = new Set([...taken].map((value) => String(value).toLowerCase()));
  if (!existing.has(base.toLowerCase())) return base;
  let index = 2;
  while (existing.has(`${base}-${index}`.toLowerCase())) index += 1;
  return `${base}-${index}`;
}
