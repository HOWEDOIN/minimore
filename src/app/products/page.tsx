import Image from "next/image";
import Link from "next/link";
import Navbar from "@/components/Navbar";
import "./products.css";
import { sdk } from "@/lib/medusa";

export default async function ProductsPage({ searchParams }: { searchParams: Promise<{ category?: string }> }) {
  const { category } = await searchParams;

  const { product_categories } = await sdk.store.category.list({
    limit: 100
  }).catch(() => ({ product_categories: [] }));

  let query: any = { limit: 20 };
  
  if (category) {
    const selectedCategory = product_categories.find(c => c.handle === category);
    if (selectedCategory) {
      query.category_id = [selectedCategory.id];
    }
  }

  // Fetch real products from Medusa
  const { products } = await sdk.store.product.list(query).catch((err) => {
    console.error("Failed to fetch products", err);
    return { products: [] };
  });

  return (
    <div className="page-wrapper">
      <Navbar isStatic={true} />
      
      <main className="container shop-layout">
        <aside className="shop-sidebar">
          <h3>Categories</h3>
          <ul className="category-list">
            <li><Link href="/products" className={!category ? "active" : ""}>All Products</Link></li>
            {product_categories?.map((cat) => (
              <li key={cat.id}>
                <Link href={`/products?category=${cat.handle}`} className={category === cat.handle ? "active" : ""}>
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
              products.map((product) => {
                // Get lowest price or first variant price
                const price = product.variants?.[0]?.calculated_price?.calculated_amount 
                  || product.variants?.[0]?.prices?.[0]?.amount 
                  || 0;
                
                return (
                  <Link href={`/products/${product.id}`} className="product-card" key={product.id}>
                    <div className="product-image-container">
                      <Image 
                        src={product.thumbnail || "/images/skincare.png"} 
                        alt={product.title} 
                        fill 
                        className="product-image" 
                      />
                      {product.metadata?.condition && (
                        <div className="product-badge">{product.metadata.condition as string}</div>
                      )}
                    </div>
                    <div className="product-info">
                      <span className="brand">{product.collection?.title || "MINIMORE"}</span>
                      <h3 className="product-name">{product.title}</h3>
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
