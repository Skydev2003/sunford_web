import overview from "../../../../public/images/home-categories/overview.webp";
import digital from "../../../../public/images/home-categories/digital.webp";
import smart from "../../../../public/images/home-categories/smart.webp";
import accessories from "../../../../public/images/home-categories/accessories.webp";
import software from "../../../../public/images/home-categories/software.webp";

// Static imports give each file a content-hashed URL. Replacing an image at the
// same public path must not reuse an older optimized image in the browser/cache.
export const categoryImages = {
  overview: overview.src,
  digital: digital.src,
  smart: smart.src,
  accessories: accessories.src,
  software: software.src,
} as const;
