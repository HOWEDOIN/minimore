const PICSUM_FILE_RE = /\/800(?:-\d+)?\.(?:jpg|jpeg|png|webp)(?:$|[?#])/i;

/**
 * Returns true if the image URL is missing or matches a known dummy/placeholder marker.
 */
export function isDummyImageUrl(src?: string): boolean {
  if (!src) return true;
  return (
    src.includes("picsum.photos") ||
    src.includes("woocommerce_product_image_upload_error") ||
    PICSUM_FILE_RE.test(src)
  );
}

/**
 * Returns true if a product has a real image uploaded in WooCommerce
 * (i.e. not missing and not a dummy/placeholder image).
 */
export function hasRealImage(product: any): boolean {
  return !isDummyImageUrl(product?.images?.[0]?.src);
}

export function getProductImage(product: any) {
  const originalSrc = product.images?.[0]?.src;
  if (!originalSrc) return "/images/skincare.png";

  // WooCommerce downloaded the picsum images and saved them as 800.jpg, 800-1.jpg, etc.
  if (isDummyImageUrl(originalSrc)) {
    const cats = product.categories?.map((c: any) => c.name.toLowerCase()) || [];
    
    if (cats.includes('cosmetics')) return "/images/dummy/cosmetics.png";
    if (cats.includes('skincare')) return "/images/dummy/skincare.png";
    if (cats.includes('make up')) return "/images/dummy/makeup.png";
    if (cats.includes('merchandise')) return "/images/dummy/merchandise.png";
    if (cats.includes('limited editions') || cats.includes('miniature') || cats.includes('vials') || cats.includes('gift sets')) {
      return "/images/dummy/fragrance.png";
    }
    // Fallback if it's one of the dummy ones without category match
    return "/images/dummy/cosmetics.png";
  }

  return originalSrc;
}
