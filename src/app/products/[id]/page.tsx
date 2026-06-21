import Image from "next/image";
import Link from "next/link";
import { notFound } from "next/navigation";
import Navbar from "@/components/Navbar";
import { getProductImage } from "@/utils/imageHelper";
import AddToCartButton from "@/components/AddToCartButton";
import QuantitySelector from "@/components/QuantitySelector";
import FomoBanner from "@/components/FomoBanner";
import "./product-detail.css";
import { wooApi } from "@/lib/woocommerce";

export default async function ProductDetail({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  
  // Try fetching by slug first, otherwise by ID
  let product = null;
  try {
    const { data: productsBySlug } = await wooApi.get("products", { slug: id });
    if (productsBySlug && productsBySlug.length > 0) {
      product = productsBySlug[0];
    } else {
      const { data: productById } = await wooApi.get(`products/${id}`);
      product = productById;
    }
  } catch (err) {
    console.error("Error fetching product", err);
  }

  if (!product) {
    notFound();
  }

  const price = product.price || product.regular_price || 0;
  const regularPrice = parseFloat(product.regular_price || product.price || "0");
  const salePrice = parseFloat(product.sale_price || "0");
  
  const brand = product.categories?.[0]?.name || "MINIMORE";
  
  // Custom Metadata (In WooCommerce, this would use ACF or custom meta_data array)
  const metaObj: any = {};
  if (product.meta_data) {
    product.meta_data.forEach((meta: any) => {
      metaObj[meta.key] = meta.value;
    });
  }
  
  const sizeMl = metaObj.size_ml as string | undefined;
  const condition = metaObj.condition as string | undefined;
  const expiryDate = metaObj.expiry_date as string | undefined;
  const gwpNotes = metaObj.gwp_notes as string | undefined;

  // Extract the countdown timer date from WooCommerce
  const dateOnSaleTo = product.date_on_sale_to_gmt ? product.date_on_sale_to_gmt + "Z" : product.date_on_sale_to;
  const customLimitedOffer = metaObj._limited_offer_end as string | undefined;
  const countdownDate = customLimitedOffer || dateOnSaleTo;

  // ⚠️ TODO: Replace with real WhatsApp number before going live
  const WHATSAPP_NUMBER = process.env.NEXT_PUBLIC_WHATSAPP_NUMBER || "60123456789";
  const whatsappMessage = encodeURIComponent(`Hi Minimore! I'm interested in ordering: ${product.name}`);
  const whatsappUrl = `https://wa.me/${WHATSAPP_NUMBER}?text=${whatsappMessage}`;

  return (
    <div className="page-wrapper">
      <Navbar isStatic={true} />
      
      <main className="container product-detail-layout">
        <div className="breadcrumb">
          <Link href="/">Home</Link> / <Link href="/products">Products</Link> / <span>{product.name}</span>
        </div>

        <div className="product-showcase">
          <div className="product-image-section">
            <div className="main-image-container">
              <Image 
                src={getProductImage(product)} 
                alt={product.name} 
                fill 
                className="detail-image"
                priority
              />
            </div>
          </div>

          <div className="product-info-section">
            <div className="product-badges-top">
              {salePrice > 0 && salePrice < regularPrice && (
                <span className="sale-badge">Save {Math.round(((regularPrice - salePrice) / regularPrice) * 100)}%</span>
              )}
            </div>
            
            <span className="brand-tag">{brand}</span>
            <h1 className="product-title">{product.name}</h1>
            
            <div className="pricing-group">
              <span className="product-price">
                RM {salePrice > 0 ? salePrice.toFixed(2) : regularPrice > 0 ? regularPrice.toFixed(2) : price} MYR
              </span>
              {salePrice > 0 && salePrice < regularPrice && (
                <span className="product-regular-price">RM {regularPrice.toFixed(2)} MYR</span>
              )}
            </div>
            <p className="shipping-notice"><u>Shipping</u> calculated at checkout.</p>

            <div className="stock-indicator">
              <span className="pulse-dot"></span>
              In stock
            </div>
            
            <p className="product-desc" dangerouslySetInnerHTML={{ __html: product.description || product.short_description || "" }}></p>
            
            <ul className="product-bullets">
              {sizeMl && <li><strong>Size/Weight:</strong> {sizeMl}</li>}
              {condition && <li><strong>Condition:</strong> {condition}</li>}
              {expiryDate && <li><strong>Expiry Date:</strong> {expiryDate}</li>}
              {gwpNotes && <li><strong>GWP Notes:</strong> {gwpNotes}</li>}
            </ul>

            {countdownDate && <FomoBanner targetDate={countdownDate} />}

            <div className="actions-group">
              <QuantitySelector />
              <div className="dual-cta">
                <AddToCartButton product={product} />
                <a href={whatsappUrl} target="_blank" rel="noopener noreferrer" className="btn-secondary whatsapp-btn" style={{ display: 'block', textAlign: 'center', width: '100%', padding: '0.8rem', border: '1px solid #c9a473', color: '#c9a473', borderRadius: '4px', textDecoration: 'none' }}>
                  Order via WhatsApp
                </a>
              </div>
            </div>

            <div className="trust-badges">
              <div className="trust-badge">
                <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="12" r="10"></circle><path d="M16 8h-6a2 2 0 1 0 0 4h4a2 2 0 1 1 0 4H8"></path><path d="M12 18V6"></path></svg>
                <span>Money-back Guarantee</span>
              </div>
              <div className="trust-badge">
                <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M21 16V8a2 2 0 0 0-1-1.73l-7-4a2 2 0 0 0-2 0l-7 4A2 2 0 0 0 3 8v8a2 2 0 0 0 1 1.73l7 4a2 2 0 0 0 2 0l7-4A2 2 0 0 0 21 16z"></path><polyline points="3.27 6.96 12 12.01 20.73 6.96"></polyline><line x1="12" y1="22.08" x2="12" y2="12"></line></svg>
                <span>Worldwide Shipping</span>
              </div>
            </div>
            
          </div>
        </div>
      </main>
    </div>
  );
}
