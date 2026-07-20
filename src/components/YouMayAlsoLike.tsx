import Link from "next/link";
import Image from "next/image";
import { getProductImage } from "@/utils/imageHelper";
import { wooApi } from "@/lib/woocommerce";

export default async function YouMayAlsoLike({ 
  currentProductId, 
  currentCategoryId 
}: { 
  currentProductId: number, 
  currentCategoryId?: number 
}) {
  let relatedProducts = [];
  try {
    const params: any = { per_page: 15 }; // Fetch enough to ensure we have 4 after filtering
    if (currentCategoryId) {
      params.category = currentCategoryId;
    }
    
    const { data } = await wooApi.get("products", params);
    
    relatedProducts = data
      .filter((p: any) => p.id !== currentProductId)
      .slice(0, 4); // Display up to 4 items
  } catch (err) {
    console.error("Error fetching related products", err);
    return null;
  }

  if (relatedProducts.length === 0) return null;

  return (
    <div className="you-may-also-like" style={{ marginTop: '5rem', borderTop: '1px solid var(--border-light)', paddingTop: '4rem', paddingBottom: '4rem' }}>
      <h2 style={{ fontFamily: 'var(--font-display)', fontSize: '2.5rem', textAlign: 'center', marginBottom: '3rem', color: 'var(--foreground)' }}>
        You May Also Like
      </h2>
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(260px, 1fr))', gap: '2rem' }}>
        {relatedProducts.map((product: any) => {
          const price = product.price || product.regular_price || 0;
          const isOnSale = product.on_sale || (product.regular_price && product.price && product.regular_price !== product.price);
          const savings = isOnSale ? (parseFloat(product.regular_price) - parseFloat(product.price)).toFixed(2) : 0;
          
          return (
            <Link key={product.id} href={`/products/${product.slug || product.id}`} className="product-card" style={{ background: '#f5f5f5', padding: '1rem', borderRadius: '12px', display: 'block', textDecoration: 'none', transition: 'transform 0.3s ease, box-shadow 0.3s ease' }}>
              <div className="product-image-container" style={{ position: 'relative', aspectRatio: '1/1', marginBottom: '1rem', borderRadius: '8px', overflow: 'hidden' }}>
                <Image
                  src={getProductImage(product)}
                  alt={product.name}
                  fill
                  sizes="(max-width: 768px) 100vw, 25vw"
                  style={{ objectFit: 'contain' }}
                />
                {isOnSale && Number(savings) > 0 && (
                  <div className="product-badge" style={{ background: '#d32f2f', color: '#fff', padding: '4px 8px', borderRadius: '4px', position: 'absolute', top: '8px', left: '8px', fontSize: '0.75rem', fontWeight: 'bold' }}>
                    Save RM{savings} MYR
                  </div>
                )}
              </div>
              <div className="product-info">
                <span className="brand" style={{ color: 'var(--foreground-dim)', fontSize: '0.85rem' }}>
                  {product.categories?.[0]?.name || "Merchandise"}
                </span>
                <h3 className="product-name" style={{ fontSize: '1.1rem', marginTop: '0.5rem', marginBottom: '0.5rem', fontWeight: '500', color: 'var(--foreground)' }}>
                  {product.name}
                </h3>
                <div className="price-container" style={{ display: 'flex', gap: '0.5rem', alignItems: 'center' }}>
                  <span className="price" style={{ color: '#d32f2f', fontWeight: 600 }}>RM{price} MYR</span>
                  {isOnSale && (
                    <span className="original-price" style={{ textDecoration: 'line-through', color: 'var(--foreground-dim)', fontSize: '0.9rem' }}>
                      RM{product.regular_price} MYR
                    </span>
                  )}
                </div>
              </div>
            </Link>
          );
        })}
      </div>
    </div>
  );
}
