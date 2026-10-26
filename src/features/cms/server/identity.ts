import "server-only";
import { createHash } from "node:crypto";
export function sourcePageId(path: string) {
  return `page:${createHash("sha256").update(path).digest("hex").slice(0, 32)}`;
}
