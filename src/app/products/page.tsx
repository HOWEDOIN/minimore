import Image from "next/image";
import Link from "next/link";
import Navbar from "@/components/Navbar";
import "./products.css";
import { wooApi } from "@/lib/woocommerce";
import { getProductImage } from "@/utils/imageHelper";
import { getDisplayCategory } from "@/lib/categoryUtils";
import ProductSortSelect from "@/components/ProductSortSelect";

export default async function ProductsPage({
  searchParams,
}: {
  searchParams: Promise<{ category?: string; search?: string; sort?: string }>;
}) {
  const { category, search, sort } = await searchParams;

  // 1. Fetch categories for the filter bar
  const { data: product_categories } = await wooApi.get("products/categories", { hide_empty: true }).catch(() => ({ data: [] }));

  // 2. Determine params
  const query: any = { per_page: 50 };
  let selectedCategory: any = null;

  if (search) {
    query.search = search;
  } else if (category) {
    selectedCategory = product_categories.find((c: any) => {
      const target = category.toLowerCase().replace(/-/g, ' ').replace(/&/g, 'and').trim();
      const catSlug = (c.slug || '').toLowerCase().replace(/-/g, ' ').replace(/&/g, 'and').trim();
      const catName = (c.name || '').toLowerCase().replace(/-/g, ' ').replace(/&/g, 'and').trim();
      return (
        (c.slug || '').toLowerCase() === category.toLowerCase() ||
        catSlug === target ||
        catName === target ||
        catName.includes(target) ||
        target.includes(catName)
      );
    });
    if (selectedCategory) {
      query.category = selectedCategory.id.toString();
    }
  }

  // Fetch real products from WooCommerce
  const { data: products } = await wooApi.get("products", query).catch((err: any) => {
    console.error("Failed to fetch products", err);
    return { data: [] };
  });

  // Sort products based on sort searchParam
  if (Array.isArray(products)) {
    if (sort === "price-low-high") {
      products.sort((a: any, b: any) => {
        const pA = parseFloat(a.price || a.regular_price || "0");
        const pB = parseFloat(b.price || b.regular_price || "0");
        return pA - pB;
      });
    } else if (sort === "price-high-low") {
      products.sort((a: any, b: any) => {
        const pA = parseFloat(a.price || a.regular_price || "0");
        const pB = parseFloat(b.price || b.regular_price || "0");
        return pB - pA;
      });
    } else if (sort === "newest") {
      products.sort((a: any, b: any) => {
        const dateA = new Date(a.date_created || a.date_created_gmt || 0).getTime();
        const dateB = new Date(b.date_created || b.date_created_gmt || 0).getTime();
        return dateB - dateA;
      });
    } else {
      products.sort((a: any, b: any) => {
        if (a.featured && !b.featured) return -1;
        if (!a.featured && b.featured) return 1;
        return 0;
      });
    }
  }

  return (
    <div className="page-wrapper">
      <Navbar isStatic={true} />
      
      <main className="container shop-layout">
        <aside className="shop-sidebar">
          <h3>Categories</h3>
          <ul className="category-list">
            <li><Link href="/products" className={!category ? "active" : ""}>All Products</Link></li>
            {product_categories?.map((cat: any) => (
              <li key={cat.id}>
                <Link href={`/products?category=${cat.slug}`} className={category === cat.slug || selectedCategory?.id === cat.id ? "active" : ""}>
                  {cat.name}
                </Link>
              </li>
            ))}
          </ul>
        </aside>

        <section className="shop-content">
          <div className="shop-header">
            <h1>{selectedCategory ? `Shop ${selectedCategory.name}` : "Shop All Miniatures"}</h1>
            <ProductSortSelect />
          </div>

          <div className="product-grid">
            {products.length === 0 ? (
              <p>No products found.</p>
            ) : (
              products.map((product: any) => {
                const price = product.price || product.regular_price || 0;
                
                return (
                  <Link href={`/products/${product.slug || product.id}`} className="product-card" key={product.id}>
                    <div className="product-image-container">
                      <Image 
                        src={getProductImage(product)} 
                        alt={product.name} 
                        fill
                        className="product-image"
                        sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
                      />
                      {product.on_sale && (
                        <div className="product-badge">Sale</div>
                      )}
                    </div>
                    <div className="product-info">
                      <span className="brand">{getDisplayCategory(product, category)}</span>
                      <h3 className="product-name">{product.name}</h3>
                      <span className="price">RM {price}</span>
                    </div>
                  </Link>
                );
              })
            )}
          </div>
        </section>
      </main>
    </div>
  );
}
