import "server-only";
import { getPrisma } from "@/lib/prisma";
import { requireAdmin } from "./auth";

export async function listHomeImages() {
  await requireAdmin();
  return (await getPrisma().homepageImage.findMany()).map((image) => ({
    ...image,
    updatedAt: image.updatedAt.toISOString(),
  }));
}
