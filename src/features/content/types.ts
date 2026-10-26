export type SourceProduct = {
  sourceId: string;
  name: string;
  sourceUrl: string;
  path: string;
  descriptionHtml: string;
  detailsHtml: string;
  description: string;
  details: string;
  images: string[];
  imageAlt: string[];
  collectionIds: string[];
  collections?: { path: string; title: string }[];
  specificationHtml: string;
  price: number | null;
  specifications?: { label: string; value: string }[];
};

export type SourcePage = {
  path: string;
  title: string;
  sourceUrl: string;
  html: string;
  text: string;
  images: string[];
  productHandles: string[];
  collectionIds: string[];
  kind: "product" | "collection" | "article" | "page";
  hasSourcePlaceholder?: boolean;
  videos?: { id: string; image: string }[];
};

export type SearchPage = Pick<SourcePage, "path" | "title" | "kind">;
