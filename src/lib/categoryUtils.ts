export function getDisplayCategory(product: any, activeTab?: string): string {
  if (!product || !product.categories || !product.categories.length) {
    return "Minimore";
  }

  const normTab = (activeTab || "").toLowerCase().trim();

  // 1. If activeTab is provided, prioritize a category that matches the activeTab
  if (normTab) {
    const tabMatch = product.categories.find((cat: any) => {
      const name = (cat.name || "").toLowerCase();
      const slug = (cat.slug || "").toLowerCase();
      if (normTab === "skin care" || normTab === "skincare") {
        return name.includes("skin") || name.includes("care") || slug.includes("skincare");
      }
      if (normTab === "cosmetic" || normTab === "cosmetics" || normTab === "make up" || normTab === "makeup") {
        return name.includes("cosmetic") || name.includes("make") || slug.includes("cosmetics") || slug.includes("make-up");
      }
      if (normTab === "perfume" || normTab === "perfumes" || normTab === "fragrance") {
        return name.includes("perfume") || name.includes("fragrance") || name.includes("scent") || slug.includes("perfume");
      }
      if (normTab === "gift set" || normTab === "gift sets") {
        return name.includes("gift") || name.includes("set") || slug.includes("gift-sets");
      }
      if (normTab === "limited edition" || normTab === "limited editions") {
        return name.includes("limited") || name.includes("edition") || slug.includes("limited-editions");
      }
      return name.includes(normTab) || slug.includes(normTab);
    });

    if (tabMatch && tabMatch.name) {
      return tabMatch.name;
    }
  }

  // 2. Otherwise, prefer primary meaningful categories over generic container tags (Miniature, Vials)
  const primaryOrder = ["skincare", "cosmetics", "make up", "perfumes", "gift sets", "limited editions"];
  for (const targetSlug of primaryOrder) {
    const primaryMatch = product.categories.find((cat: any) => {
      const slug = (cat.slug || "").toLowerCase();
      const name = (cat.name || "").toLowerCase();
      return slug === targetSlug || name === targetSlug;
    });
    if (primaryMatch && primaryMatch.name) {
      return primaryMatch.name;
    }
  }

  // 3. Fall back to the first available category name
  return product.categories[0]?.name || "Minimore";
}
