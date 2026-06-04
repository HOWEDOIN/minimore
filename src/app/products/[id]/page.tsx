import Image from "next/image";
import Link from "next/link";
import { notFound } from "next/navigation";
import Navbar from "@/components/Navbar";
import AddToCartButton from "@/components/AddToCartButton";
import "./product-detail.css";
import { sdk } from "@/lib/medusa";

export default async function ProductDetail({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  
  const { product } = await sdk.store.product.retrieve(id).catch((err) => {
    console.error("Error fetching product", err);
    return { product: null };
  });

  if (!product) {
    notFound();
  }

  const price = product.variants?.[0]?.calculated_price?.calculated_amount 
    || product.variants?.[0]?.prices?.[0]?.amount 
    || 0;
  
  const brand = product.collection?.title || "MINIMORE";
  
  // Custom Metadata
  const metadata = product.metadata || {};
  const sizeMl = metadata.size_ml as string | undefined;
  const condition = metadata.condition as string | undefined;
  const expiryDate = metadata.expiry_date as string | undefined;
  const gwpNotes = metadata.gwp_notes as string | undefined;

  const whatsappMessage = encodeURIComponent(`Hi Minimore! I'm interested in ordering: ${product.title}`);
  const whatsappUrl = `https://wa.me/60123456789?text=${whatsappMessage}`;

  return (
    <div className="page-wrapper">
      <Navbar isStatic={true} />
      
      <main className="container product-detail-layout">
        <div className="breadcrumb">
          <Link href="/">Home</Link> / <Link href="/products">Products</Link> / <span>{product.title}</span>
        </div>

        <div className="product-showcase">
          <div className="product-image-section">
            <div className="main-image-container">
              <Image 
                src={product.thumbnail || "/images/skincare.png"} 
                alt={product.title} 
                fill 
                className="detail-image"
                priority
              />
            </div>
          </div>

          <div className="product-info-section">
            <span className="brand-tag">{brand}</span>
            <h1 className="product-title">{product.title}</h1>
            <div className="product-price">RM {price}</div>
            
            <p className="product-desc">{product.description}</p>
            
            <ul className="product-bullets">
              {sizeMl && <li><strong>Size/Weight:</strong> {sizeMl}</li>}
              {condition && <li><strong>Condition:</strong> {condition}</li>}
              {expiryDate && <li><strong>Expiry Date:</strong> {expiryDate}</li>}
              {gwpNotes && <li><strong>GWP Notes:</strong> {gwpNotes}</li>}
              <li>100% Authentic Guarantee</li>
            </ul>

            <div className="actions-group">
              <div className="quantity-selector">
                <button>-</button>
                <span>1</span>
                <button>+</button>
              </div>
              <div className="dual-cta">
                <AddToCartButton variantId={product.variants?.[0]?.id || ""} />
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
