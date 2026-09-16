const DUMMY_IMAGE_MARKERS = ['picsum.photos', '/800', 'woocommerce_product_image_upload_error'];

/**
 * Returns true if a product has a real image uploaded in WooCommerce
 * (i.e. not missing and not a dummy/placeholder image).
 */
export function hasRealImage(product: any): boolean {
  const src = product.images?.[0]?.src;
  if (!src) return false;
  return !DUMMY_IMAGE_MARKERS.some((marker) => src.includes(marker));
}

export function getProductImage(product: any) {
  const originalSrc = product.images?.[0]?.src;
  if (!originalSrc) return "/images/skincare.png";

  // WooCommerce downloaded the picsum images and saved them as 800.jpg, 800-1.jpg, etc.
  if (originalSrc.includes('picsum.photos') || originalSrc.includes('/800') || originalSrc.includes('woocommerce_product_image_upload_error')) {
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
