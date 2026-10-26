export function hasDatabase(): boolean {
  const url = process.env.DATABASE_URL;
  return Boolean(url && !url.includes("YOUR-PASSWORD"));
}
