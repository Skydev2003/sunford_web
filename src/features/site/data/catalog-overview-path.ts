export function isCatalogOverviewPath(pathname: string) {
  return /^\/products(?:\/category\/(?:scales|indicators|platforms|pos|accessories))?$/.test(
    pathname,
  );
}
