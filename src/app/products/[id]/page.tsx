import Image from "next/image";
import Link from "next/link";
import { notFound } from "next/navigation";
import Navbar from "@/components/Navbar";
import AddToCartButton from "@/components/AddToCartButton";
import QuantitySelector from "@/components/QuantitySelector";
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
                src={product.images?.[0]?.src || "/images/skincare.png"} 
                alt={product.name} 
                fill 
                className="detail-image"
                priority
              />
            </div>
          </div>

          <div className="product-info-section">
            <span className="brand-tag">{brand}</span>
            <h1 className="product-title">{product.name}</h1>
            <div className="product-price">RM {price}</div>
            
            <p className="product-desc" dangerouslySetInnerHTML={{ __html: product.description || product.short_description || "" }}></p>
            
            <ul className="product-bullets">
              {sizeMl && <li><strong>Size/Weight:</strong> {sizeMl}</li>}
              {condition && <li><strong>Condition:</strong> {condition}</li>}
              {expiryDate && <li><strong>Expiry Date:</strong> {expiryDate}</li>}
              {gwpNotes && <li><strong>GWP Notes:</strong> {gwpNotes}</li>}
              <li>100% Authentic Guarantee</li>
            </ul>

            <div className="actions-group">
              <QuantitySelector />
              <div className="dual-cta">
                <AddToCartButton product={product} />
                <a href={whatsappUrl} target="_blank" rel="noopener noreferrer" className="btn-secondary whatsapp-btn" style={{ display: 'block', textAlign: 'center', width: '100%', padding: '0.8rem', border: '1px solid #c9a473', color: '#c9a473', borderRadius: '4px', textDecoration: 'none' }}>
                  Order via WhatsApp
                </a>
              </div>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}
