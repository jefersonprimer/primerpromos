export function slugify(text: string) {
  return text
    .toString()
    .toLowerCase()
    .normalize("NFD") // split accented characters into their base characters and diacritical marks
    .replace(/[\u0300-\u036f]/g, "") // remove all the accent marks
    .replace(/[^\w\s-]/g, "") // remove non-alphanumeric (except spaces and hyphens)
    .replace(/\s+/g, "-") // replace spaces with hyphens
    .replace(/-+/g, "-") // collapse multiple hyphens
    .trim();
}
