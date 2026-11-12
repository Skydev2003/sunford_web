import "server-only";
import { cache } from "react";
import { clientProductData } from "../data/client-products";
import { getStorefrontProducts } from "./product-repository";

// Share object identities across the page and layout so RSC sends each product once.
export const getClientProducts = cache(async () =>
  (await getStorefrontProducts()).map(clientProductData),
);
