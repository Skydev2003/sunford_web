import type { PrismaClient } from "../src/generated/prisma/client";
import { getSnapshotProducts } from "../src/features/content/data/catalog-snapshot";

export async function importCatalog(prisma: PrismaClient) {
  const snapshot = getSnapshotProducts();
  return prisma.$transaction(async (tx) => {
    const existing = await tx.product.findMany({ select: { id: true, slug: true } });
    for (const product of snapshot) {
      if (existing.some((row) => row.id !== product.id && row.slug === product.slug)) {
        throw new Error("CATALOG_SLUG_CONFLICT");
      }
    }
    const result = await tx.product.createMany({
      data: snapshot.map((product) => ({
        id: product.id,
        slug: product.slug,
        name: product.name,
        category: product.category,
        subtitle: product.subtitle,
        description: product.description,
        image: product.image,
        capacity: product.capacity,
        readability: product.readability,
        connection: product.connection,
        badge: product.badge,
        featured: product.featured,
        sortOrder: product.sortOrder,
        published: true,
        catalogManaged: true,
      })),
      // Existing edits, drafts, deleted rows, IDs, and timestamps remain untouched.
      skipDuplicates: true,
    });
    return {
      imported: result.count,
      total: await tx.product.count({ where: { deletedAt: null } }),
    };
  });
}
