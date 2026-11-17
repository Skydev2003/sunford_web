import type { OverlayProduct } from "../types";

export function normalizeSearchText(value: string): string {
  return value.normalize("NFC").toLowerCase().trim().replace(/\s+/g, " ");
}

function identifierKey(value: string): string | undefined {
  return /^[a-z0-9 -]+$/.test(value) && /[a-z]/.test(value) && /\d/.test(value)
    ? value.replace(/[ -]/g, "")
    : undefined;
}

function identifier(value: string) {
  const text = normalizeSearchText(value);
  return { text, key: identifierKey(text) };
}

type Identifier = ReturnType<typeof identifier>;

function matchesIdentifier(source: Identifier, query: Identifier, prefix = false): boolean {
  if (!source.text || !query.text) return false;
  const matches = (value: string, term: string) =>
    prefix ? value.startsWith(term) : value === term;
  return (
    matches(source.text, query.text) ||
    Boolean(source.key && query.key && matches(source.key, query.key))
  );
}

export function prepareCatalogSearch(
  products: readonly OverlayProduct[],
  categories: readonly { id: string; label: string }[],
) {
  const labels = new Map(categories.map(({ id, label }) => [id, label]));
  return products.map((product, index) => {
    const sku = identifier(product.warehouseSku ?? "");
    const models = (product.warehouseModelCodes ?? []).map(identifier);
    const names = [product.name, product.warehouseName ?? ""].map(normalizeSearchText);
    return {
      product,
      index,
      sku,
      models,
      names,
      nameWords: names.flatMap((name) => name.split(" ")).filter(Boolean),
      fields: [
        sku.text,
        ...models.map(({ text }) => text),
        ...names,
        ...[product.subtitle, product.description, labels.get(product.category) ?? ""].map(
          normalizeSearchText,
        ),
      ],
    };
  });
}

export function searchCatalogProducts(
  prepared: ReturnType<typeof prepareCatalogSearch>,
  rawQuery: string,
): OverlayProduct[] {
  const query = identifier(rawQuery);
  if (!query.text) return prepared.map(({ product }) => product);
  const tokens = [...new Set(query.text.split(" "))];
  const terms = [query, ...tokens.map(identifier)];
  return prepared
    .flatMap((item) => {
      const identifiers = [item.sku, ...item.models];
      const wholeIdentifier = identifiers.some((source) => matchesIdentifier(source, query, true));
      const allTokens = tokens.every(
        (token) =>
          item.fields.some((field) => field.includes(token)) ||
          identifiers.some((source) => matchesIdentifier(source, identifier(token), true)),
      );
      if (!wholeIdentifier && !allTokens) return [];
      let rank = 5;
      if (terms.some((term) => matchesIdentifier(item.sku, term))) rank = 0;
      else if (
        item.models.some((model) => terms.some((term) => matchesIdentifier(model, term))) ||
        item.names.includes(query.text)
      )
        rank = 1;
      else if (
        identifiers.some((source) => terms.some((term) => matchesIdentifier(source, term, true)))
      )
        rank = 2;
      else if (
        [...item.names, ...item.nameWords].some((name) =>
          terms.some((term) => name.startsWith(term.text)),
        )
      )
        rank = 3;
      else if (tokens.every((token) => item.names.some((name) => name.includes(token)))) rank = 4;
      return [{ ...item, rank }];
    })
    .sort((a, b) => a.rank - b.rank || a.index - b.index)
    .map(({ product }) => product);
}

export function searchContentPages<T extends { title: string; path: string }>(
  pages: readonly T[],
  rawQuery: string,
): T[] {
  const query = normalizeSearchText(rawQuery);
  if (!query) return [];
  const tokens = [...new Set(query.split(" "))];
  return pages.filter((page) => {
    const fields = [page.title, page.path].map(normalizeSearchText);
    return tokens.every((token) => fields.some((field) => field.includes(token)));
  });
}
