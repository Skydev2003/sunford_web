export function hasDatabase(): boolean {
  const url = process.env.QUOTATION_DATABASE_URL?.trim();
  return Boolean(url && !url.includes("YOUR-PASSWORD"));
}
