import Link from "next/link";
import Image from "next/image";
import { getProductImage } from "@/utils/imageHelper";
import { wooApi } from "@/lib/woocommerce";
import { getDisplayCategory } from "@/lib/categoryUtils";

export default async function YouMayAlsoLike({ 
  currentProductId, 
  currentCategoryId,
  hidePrices = true
}: { 
  currentProductId: number, 
  currentCategoryId?: number,
  hidePrices?: boolean
}) {
  let relatedProducts = [];
  try {
    // 1. Fetch newest items from the primary category
    let primaryProducts = [];
    if (currentCategoryId) {
      const { data } = await wooApi.get("products", { 
        category: currentCategoryId, 
        per_page: 10,
        orderby: 'date',
        order: 'desc'
      });
      primaryProducts = data;
    }
    
    // Filter out the current product
    relatedProducts = primaryProducts.filter((p: any) => p.id !== currentProductId);

    // 2. If we have fewer than 4 items, backfill with the newest items from ANY category
    if (relatedProducts.length < 4) {
      const { data: otherProducts } = await wooApi.get("products", {
        per_page: 10,
        orderby: 'date',
        order: 'desc'
      });
      
      // Track IDs we already have so we don't duplicate
      const existingIds = new Set(relatedProducts.map((p: any) => p.id));
      existingIds.add(currentProductId);

      const fillProducts = otherProducts.filter((p: any) => !existingIds.has(p.id));
      relatedProducts = [...relatedProducts, ...fillProducts];
    }

    // Finally, slice to strictly 4 items
    relatedProducts = relatedProducts.slice(0, 4);
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
      <div className="product-grid">
        {relatedProducts.map((product: any) => {
          const price = product.price || product.regular_price || 0;
          const isOnSale = product.on_sale || (product.regular_price && product.price && product.regular_price !== product.price);
          const savings = isOnSale ? (parseFloat(product.regular_price) - parseFloat(product.price)).toFixed(2) : 0;

          return (
            <Link key={product.id} href={`/products/${product.slug || product.id}`} className="product-card">
              <div className="product-image-container">
                <Image
                  src={getProductImage(product)}
                  alt={product.name}
                  fill
                  className="product-image"
                  sizes="(max-width: 768px) 100vw, 25vw"
                />
                {!hidePrices && isOnSale && Number(savings) > 0 && (
                  <div className="product-badge">Sale</div>
                )}
              </div>
              <div className="product-info">
                <span className="brand">{getDisplayCategory(product)}</span>
                <h3 className="product-name">{product.name}</h3>
                {!hidePrices && (
                  <div className="price-container" style={{ display: 'flex', gap: '0.5rem', alignItems: 'center' }}>
                    <span className="price">RM {price}</span>
                    {isOnSale && product.regular_price && product.regular_price !== product.price && (
                      <span style={{ textDecoration: 'line-through', color: 'var(--foreground-dim)', fontSize: '0.9rem' }}>
                        RM {product.regular_price}
                      </span>
                    )}
                  </div>
                )}
              </div>
            </Link>
          );
        })}
      </div>
    </div>
  );
}
