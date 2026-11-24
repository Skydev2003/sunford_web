export const legacyContactPath = "/contact-us";
export const contactPath = "/service?section=contact";

export function isContactSection({
  pathname,
  search,
  hash,
}: Pick<URL, "pathname" | "search" | "hash">) {
  return (
    pathname === "/service" &&
    (new URLSearchParams(search).get("section") === "contact" || hash === "#service-panel-contact")
  );
}
