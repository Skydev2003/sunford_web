import { ChevronRight } from "lucide-react";
import { notFound } from "next/navigation";
import { CatalogNavigationLink } from "@/features/catalog/components/catalog-navigation-link";
import {
  categoryApplicationsLink,
  type CategoryApplicationId,
} from "@/features/catalog/data/category-applications";
import {
  defaultNavigation,
  defaultNavigationExtras,
  resolveNavigationItems,
} from "@/features/site/data/navigation";
import { getPrimaryNavigationItems } from "@/features/site/data/primary-navigation";
import { getSettings } from "@/features/site/server/documents";
import styles from "./scales/applications/scale-applications.module.css";

export async function CategoryApplicationsPage({
  categoryId,
}: {
  categoryId: Exclude<CategoryApplicationId, "scales">;
}) {
  const href = `/products/category/${categoryId}`;
  const { label: title, shortLabel } = categoryApplicationsLink(categoryId);
  const navigation = await getSettings("navigation", {
    items: defaultNavigation,
    ...defaultNavigationExtras,
  });
  const menu = getPrimaryNavigationItems(resolveNavigationItems(navigation.items)).find(
    (item) => item.href === href,
  );
  if (!menu) notFound();

  const groups = [
    { label: menu.submenuLabel ?? "สินค้า", links: menu.links },
    ...(menu.groups?.slice(0, 1) ?? []),
  ].map(({ label, links }) => ({ label, links: links.filter((link) => !link.disabled) }));

  return (
    <main id="main-content" className={styles.page}>
      <nav className={styles.breadcrumb} aria-label="เส้นทางนำทาง">
        <CatalogNavigationLink href={href}>{menu.label}</CatalogNavigationLink>
        <ChevronRight size={14} aria-hidden="true" />
        <span aria-current="page">{shortLabel}</span>
      </nav>
      <h1 className={styles.heading}>{title}</h1>
      <div className={styles.applicationGroups}>
        {groups.map(({ label, links }) =>
          links.length ? (
            <section key={label} aria-label={label}>
              <h2 className={styles.applicationGroupHeading}>{label}</h2>
              <ul className={styles.list}>
                {links.map((link) => (
                  <li key={link.href}>
                    <CatalogNavigationLink className={styles.groupLink} href={link.href}>
                      {link.label}
                      <ChevronRight size={18} aria-hidden="true" />
                    </CatalogNavigationLink>
                  </li>
                ))}
              </ul>
            </section>
          ) : null,
        )}
      </div>
    </main>
  );
}
