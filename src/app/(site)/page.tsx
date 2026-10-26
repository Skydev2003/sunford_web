import { Hero } from "@/features/home/components/hero";
import { CategoryNavigation } from "@/features/catalog/components/category-navigation";
import { ProductCatalog } from "@/features/catalog/components/product-catalog";
import { BrandStory, BusinessSolutions, SupportSection } from "@/features/home/components/sections";
import { getProducts } from "@/features/catalog/server/product-repository";

export default async function Home() {
  const products = await getProducts();
  return (
    <main id="main-content">
      <Hero products={products} />
      <CategoryNavigation />
      <ProductCatalog products={products} />
      <BusinessSolutions />
      <BrandStory />
      <SupportSection />
    </main>
  );
}
