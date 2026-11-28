export const mesSlug = "mes";

export const mesPaths = {
  overview: `/${mesSlug}`,
  batchControl: `/${mesSlug}/batch-control`,
  formulaControl: `/${mesSlug}/formula-control`,
} as const;

export const mesRedirects = [
  ...["/products/mes", "/solution/mes"].flatMap((prefix) => [
    { source: prefix, destination: mesPaths.overview },
    { source: `${prefix}/batch-control`, destination: mesPaths.batchControl },
    { source: `${prefix}/formula-control`, destination: mesPaths.formulaControl },
  ]),
  { source: "/product/mes", destination: mesPaths.overview },
  { source: "/product/mes/batch", destination: mesPaths.batchControl },
  { source: "/product/mes/formula", destination: mesPaths.formulaControl },
  { source: "/product/batch-control", destination: mesPaths.batchControl },
  { source: "/product/formula-control", destination: mesPaths.formulaControl },
];
