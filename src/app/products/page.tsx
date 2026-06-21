import Image from "next/image";
import Link from "next/link";
import Navbar from "@/components/Navbar";
import "./products.css";
import { wooApi } from "@/lib/woocommerce";
import { getProductImage } from "@/utils/imageHelper";

export default async function ProductsPage({
  searchParams,
}: {
  searchParams: Promise<{ category?: string; search?: string }>;
}) {
  const { category, search } = await searchParams;

  // 1. Fetch categories for the filter bar
  const { data: product_categories } = await wooApi.get("products/categories", { hide_empty: true }).catch(() => ({ data: [] }));

  // 2. Determine params
  const query: any = { per_page: 50 };
  if (search) {
    query.search = search;
  } else if (category) {
    const selectedCategory = product_categories.find((c: any) => c.slug === category);
    if (selectedCategory) {
      query.category = selectedCategory.id.toString();
    }
  }

  // Fetch real products from WooCommerce
  const { data: products } = await wooApi.get("products", query).catch((err: any) => {
    console.error("Failed to fetch products", err);
    return { data: [] };
  });

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
                <Link href={`/products?category=${cat.slug}`} className={category === cat.slug ? "active" : ""}>
                  {cat.name}
                </Link>
              </li>
            ))}
          </ul>
        </aside>

        <section className="shop-content">
          <div className="shop-header">
            <h1>Shop All Miniatures</h1>
            <select className="sort-select">
              <option>Sort by: Featured</option>
              <option>Price: Low to High</option>
              <option>Price: High to Low</option>
              <option>Newest Arrivals</option>
            </select>
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
                      <span className="brand">{product.categories?.[0]?.name || "Minimore"}</span>
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
